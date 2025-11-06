"use client";

import useSWR from "swr";
import { useState, useEffect } from "react";
import {
  Play,
  Pause,
  Square,
  Snowflake,
  Zap,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { pusherClient } from "@/lib/pusher";
import { Contest } from "@/generated/client/client";
import { ContestStatus } from "@/generated/client/enums";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  startContest,
  pauseContest,
  resumeContest,
  freezeContest,
  unfreezeContest,
  endContest,
  setPendingContest,
} from "@/services/contest";

type Action =
  | "start"
  | "pause"
  | "resume"
  | "freeze"
  | "unfreeze"
  | "end"
  | "setPending";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface ContestButtonsProps {
  initialContestState?: Contest | null;
}

export function ContestButtons({ initialContestState }: ContestButtonsProps) {
  const { data: contest, mutate } = useSWR<Contest>(
    "/api/contest/status",
    fetcher,
    {
      fallbackData: initialContestState || undefined,
    }
  );

  const [isLoading, setIsLoading] = useState<Action | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [durationMinutes, setDurationMinutes] = useState(90);

  useEffect(() => {
    const channel = pusherClient.subscribe("contest-channel");

    channel.bind("status-update", () => {
      mutate();
    });

    return () => {
      pusherClient.unsubscribe("contest-channel");
    };
  }, [mutate]);

  const handleAction = async (action: Action) => {
    setIsLoading(action);
    setError(null);
    try {
      switch (action) {
        case "start":
          const formData = new FormData();
          formData.append("durationMinutes", durationMinutes.toString());
          await startContest(formData);
          break;
        case "pause":
          await pauseContest();
          break;
        case "resume":
          await resumeContest();
          break;
        case "freeze":
          await freezeContest();
          break;
        case "unfreeze":
          await unfreezeContest();
          break;
        case "end":
          await endContest();
          break;
        case "setPending":
          await setPendingContest();
          break;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(null);
    }
  };

  const status = contest?.status || ContestStatus.PENDING;

  const getStatusColor = (status: ContestStatus) => {
    switch (status) {
      case ContestStatus.PENDING:
        return "secondary";
      case ContestStatus.RUNNING:
        return "default";
      case ContestStatus.FROZEN:
        return "destructive";
      case ContestStatus.PAUSED:
        return "destructive";
      case ContestStatus.FINISHED:
        return "outline";
      default:
        return "secondary";
    }
  };

  const getActionButtons = () => {
    const buttons = [];

    if (status === ContestStatus.PENDING || status === ContestStatus.FINISHED) {
      buttons.push(
        <Button
          key="start"
          onClick={() => handleAction("start")}
          disabled={isLoading !== null}
          className="flex-1"
          size="lg"
        >
          {isLoading === "start" ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Play className="h-4 w-4 mr-2" />
          )}
          {status === ContestStatus.FINISHED ? "Restart" : "Start"}
        </Button>
      );
    }

    if (status === ContestStatus.RUNNING || status === ContestStatus.FROZEN) {
      buttons.push(
        <Button
          key="pause"
          onClick={() => handleAction("pause")}
          disabled={isLoading !== null}
          variant="outline"
          className="flex-1"
          size="lg"
        >
          {isLoading === "pause" ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Pause className="h-4 w-4 mr-2" />
          )}
          Pause
        </Button>
      );
    }

    if (status === ContestStatus.PAUSED) {
      buttons.push(
        <Button
          key="resume"
          onClick={() => handleAction("resume")}
          disabled={isLoading !== null}
          className="flex-1"
          size="lg"
        >
          {isLoading === "resume" ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Play className="h-4 w-4 mr-2" />
          )}
          Resume
        </Button>
      );
    }

    if (status === ContestStatus.RUNNING) {
      buttons.push(
        <Button
          key="freeze"
          onClick={() => handleAction("freeze")}
          disabled={isLoading !== null}
          variant="outline"
          className="flex-1"
          size="lg"
        >
          {isLoading === "freeze" ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Snowflake className="h-4 w-4 mr-2" />
          )}
          Freeze
        </Button>
      );
    }

    if (status === ContestStatus.FROZEN) {
      buttons.push(
        <Button
          key="unfreeze"
          onClick={() => handleAction("unfreeze")}
          disabled={isLoading !== null}
          className="flex-1"
          size="lg"
        >
          {isLoading === "unfreeze" ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Zap className="h-4 w-4 mr-2" />
          )}
          Unfreeze
        </Button>
      );
    }

    if (status !== ContestStatus.PENDING) {
      buttons.push(
        <Button
          key="end"
          onClick={() => handleAction("end")}
          disabled={isLoading !== null}
          variant="destructive"
          className="flex-1"
          size="lg"
        >
          {isLoading === "end" ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Square className="h-4 w-4 mr-2" />
          )}
          End
        </Button>
      );
    }

    if (status === ContestStatus.FINISHED) {
      buttons.push(
        <Button
          key="setPending"
          onClick={() => handleAction("setPending")}
          disabled={isLoading !== null}
          variant="outline"
          className="flex-1"
          size="lg"
        >
          {isLoading === "setPending" ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <RotateCcw className="h-4 w-4 mr-2" />
          )}
          Reset to Pending
        </Button>
      );
    }

    return buttons;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          Contest Controls
          <Badge variant={getStatusColor(status)}>{status}</Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Duration Input */}
        {(status === ContestStatus.PENDING ||
          status === ContestStatus.FINISHED) && (
          <div className="space-y-2">
            <Label htmlFor="duration">Contest Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              min={1}
              max={480}
              className="w-full"
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {getActionButtons()}
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive text-center">{error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
