"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { pusherClient } from "@/lib/pusher";
import { QRCode } from "@/components/admin/core/qr-code";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Team {
  id: string;
  name: string;
  score: number;
  school: {
    id: string;
    name: string;
  };
  members: {
    id: string;
    name: string;
  }[];
}

interface DashboardProps {
  team: Team;
  rank?: number;
  contestStatus: string;
}

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

export function Dashboard({ team, rank, contestStatus }: DashboardProps) {
  const router = useRouter();
  const [isQRDialogOpen, setIsQRDialogOpen] = useState(false);
  const [qrSize] = useState(() =>
    typeof window !== "undefined" ? Math.min(250, window.innerWidth * 0.6) : 250
  );

  const medalCategory =
    rank && contestStatus !== "FROZEN" ? getMedalCategory(rank) : null;

  useEffect(() => {
    const channel = pusherClient.subscribe(`team-${team.id}`);

    channel.bind("question-assigned", (data: { questionId: string }) => {
      router.push(`/question/${data.questionId}`);
    });

    return () => {
      pusherClient.unsubscribe(`team-${team.id}`);
    };
  }, [team.id, router]);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-end">
        <h1 className="text-3xl font-bold">
          Team <br /> Dashboard
        </h1>
        <Button onClick={() => signOut()} variant="outline">
          Sign Out
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Team Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Team Information
              <Badge variant="secondary">Score: {team.score}</Badge>
              {medalCategory && (
                <Badge
                  variant="default"
                  className={getMedalBgClass(medalCategory)}
                >
                  {medalCategory}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">{team.name}</h3>
              <p className="text-muted-foreground">{team.school.name}</p>
            </div>

            <div>
              <h4 className="font-medium mb-2">Team Members:</h4>
              <div className="space-y-1">
                {team.members.map((member) => (
                  <div key={member.id} className="text-sm">
                    • {member.name}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* QR Code Card */}
        <Card>
          <CardHeader>
            <CardTitle>Team QR Code</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <div
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => setIsQRDialogOpen(true)}
            >
              <QRCode team={team} size={250} />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Click QR code to enlarge or show to admin to get questions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Play</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Show your QR code to the admin when prompted</li>
            <li>Answer the questions that appear</li>
            <li>
              Earn points for correct answers, lose points for incorrect ones
            </li>
            <li>Check your score here on the dashboard</li>
          </ol>
        </CardContent>
      </Card>

      {/* QR Code Zoom Dialog */}
      <Dialog
        open={isQRDialogOpen}
        onOpenChange={(open) => !open && setIsQRDialogOpen(false)}
      >
        <DialogContent className="w-[90vw] max-w-2xl">
          <DialogHeader>
            <DialogTitle>{team.name} - QR Code</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4 p-6">
            <QRCode team={team} size={qrSize} />
            <p className="text-xs sm:text-sm text-muted-foreground text-center">
              Show this QR code to the admin to receive questions
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
