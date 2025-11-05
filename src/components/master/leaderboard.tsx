"use client";

import useSWR, { useSWRConfig } from "swr";
import { useEffect, useState } from "react";
import { pusherClient } from "@/lib/pusher";
import { LeaderboardResponse } from "@/types/leaderboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, Milestone } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const getMedalCategory = (rank: number) => {
  if (rank >= 1 && rank <= 5) return "GOLD";
  if (rank >= 6 && rank <= 10) return "SILVER";
  if (rank >= 11 && rank <= 15) return "BRONZE";
  return "WOOD";
};

const getMedalBgClass = (category: string) => {
  switch (category) {
    case "GOLD":
      return "bg-yellow-500 text-white";
    case "SILVER":
      return "bg-gray-400 text-white";
    case "BRONZE":
      return "bg-amber-600 text-white";
    default:
      return "bg-amber-800 text-white";
  }
};

const getMedalIcon = (category: string) => {
  switch (category) {
    case "GOLD":
      return Trophy;
    case "SILVER":
      return Medal;
    case "BRONZE":
      return Award;
    default:
      return Milestone;
  }
};

export function Leaderboard() {
  const [currentPage, setCurrentPage] = useState(1);
  const { mutate } = useSWRConfig();
  const limit = 5;
  const { data, error, isLoading } = useSWR<LeaderboardResponse>(
    `/api/leaderboard?page=${currentPage}&limit=${limit}`,
    fetcher,
    {
      refreshInterval: 5000,
    }
  );

  const isFrozen = data?.meta?.isFrozen ?? false;

  useEffect(() => {
    pusherClient.subscribe("leaderboard-channel");
    pusherClient.subscribe("contest-channel");

    const handleLeaderboardUpdate = () => {
      mutate(`/api/leaderboard?page=${currentPage}&limit=${limit}`);
    };

    const handleContestStatusUpdate = () => {
      mutate(`/api/leaderboard?page=${currentPage}&limit=${limit}`);
    };

    pusherClient.bind("leaderboard-update", handleLeaderboardUpdate);
    pusherClient.bind("status-update", handleContestStatusUpdate);

    return () => {
      pusherClient.unbind("leaderboard-update", handleLeaderboardUpdate);
      pusherClient.unbind("status-update", handleContestStatusUpdate);
      pusherClient.unsubscribe("leaderboard-channel");
      pusherClient.unsubscribe("contest-channel");
    };
  }, [mutate, currentPage]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Loading leaderboard...
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="py-8 text-center text-destructive">
            Failed to load leaderboard.
          </CardContent>
        </Card>
      </div>
    );
  }

  const users = data?.data || [];
  const totalPages = data?.meta?.totalPages || 1;
  const startRank = (currentPage - 1) * limit + 1;

  const currentCategory = getMedalCategory(startRank);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Leaderboard</h1>
        {isFrozen && (
          <Badge variant="secondary" className="text-sm">
            LEADERBOARD FROZEN
          </Badge>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Rankings
            <Badge
              variant="default"
              className={getMedalBgClass(currentCategory)}
            >
              {currentCategory}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!users || users.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              No participants yet.
            </p>
          ) : (
            <div className="space-y-3">
              {users.map((user, index) => {
                const rank = startRank + index;
                const Icon = getMedalIcon(getMedalCategory(rank));

                return (
                  <div
                    key={user.id}
                    className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="shrink-0">
                      <Icon className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-lg font-semibold truncate">
                        {user.name || "Anonymous"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Score: {user.score}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination Controls */}
      {users.length > 0 && (
        <div className="flex justify-between items-center">
          <Button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            variant="outline"
          >
            Previous
          </Button>

          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>

          <Button
            onClick={handleNextPage}
            disabled={currentPage >= totalPages}
            variant="outline"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
