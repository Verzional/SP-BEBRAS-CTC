"use client";

import { useState, useEffect } from "react";
import { Clock, Play, Pause, Square } from "lucide-react";
import { pusherClient } from "@/lib/pusher";
import { ContestStatus } from "@/generated/client/enums";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ContestState {
  status: ContestStatus;
  startTime: string;
  endTime: string;
  serverTime: string;
}

const TimerBox = ({ value, label }: { value: string; label: string }) => (
  <div className="flex flex-col items-center p-3 bg-muted rounded-lg min-w-20">
    <span className="text-2xl md:text-3xl font-bold text-foreground">
      {value}
    </span>
    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
      {label}
    </span>
  </div>
);

export function ContestTimer() {
  const [contestState, setContestState] = useState<ContestState | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch initial contest status
    const fetchContestStatus = async () => {
      try {
        const response = await fetch("/api/contest/status");
        const data = await response.json();
        setContestState(data);
      } catch (error) {
        console.error("Failed to fetch contest status:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContestStatus();

    // Subscribe to real-time updates
    const channel = pusherClient.subscribe("contest-channel");
    channel.bind("status-update", (updatedContest: ContestState) => {
      setContestState(updatedContest);
    });

    return () => {
      pusherClient.unsubscribe("contest-channel");
    };
  }, []);

  useEffect(() => {
    if (!contestState || !contestState.endTime || !contestState.serverTime) {
      return;
    }

    const serverTime = new Date(contestState.serverTime).getTime();
    if (isNaN(serverTime)) {
      return;
    }

    const clientTime = Date.now();
    const timeOffset = serverTime - clientTime;

    const interval = setInterval(() => {
      if (
        contestState.status === ContestStatus.RUNNING ||
        contestState.status === ContestStatus.FROZEN
      ) {
        const endTime = new Date(contestState.endTime).getTime();

        if (isNaN(endTime)) {
          setTimeLeft(0);
          return;
        }

        const now = new Date(Date.now() + timeOffset);
        const remaining = Math.round((endTime - now.getTime()) / 1000);
        setTimeLeft(Math.max(0, remaining));
      } else if (contestState.status === ContestStatus.PAUSED) {
        // When paused, do not update the timer.
      } else {
        setTimeLeft(0);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [contestState]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
      .toString()
      .padStart(2, "0");
    const m = Math.floor((seconds % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const s = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");
    return { h, m, s };
  };

  const getStatusConfig = () => {
    if (loading || !contestState) {
      return {
        icon: <Clock className="h-6 w-6 animate-pulse" />,
        title: "Loading...",
        badge: { text: "LOADING", variant: "secondary" as const },
        showTimer: false,
      };
    }

    switch (contestState.status) {
      case ContestStatus.PENDING:
        return {
          icon: <Clock className="h-6 w-6" />,
          title: "Contest Not Started",
          badge: { text: "PENDING", variant: "secondary" as const },
          showTimer: false,
        };
      case ContestStatus.RUNNING:
        return {
          icon: <Play className="h-6 w-6" />,
          title: "Contest Running",
          badge: { text: "LIVE", variant: "default" as const },
          showTimer: true,
        };
      case ContestStatus.FROZEN:
        return {
          icon: <Pause className="h-6 w-6" />,
          title: "Contest Frozen",
          badge: { text: "FROZEN", variant: "destructive" as const },
          showTimer: true,
        };
      case ContestStatus.PAUSED:
        return {
          icon: <Pause className="h-6 w-6" />,
          title: "Contest Paused",
          badge: { text: "PAUSED", variant: "destructive" as const },
          showTimer: false,
        };
      case ContestStatus.FINISHED:
        return {
          icon: <Square className="h-6 w-6" />,
          title: "Contest Finished",
          badge: { text: "FINISHED", variant: "outline" as const },
          showTimer: false,
        };
      default:
        return {
          icon: <Clock className="h-6 w-6" />,
          title: "Unknown Status",
          badge: { text: "UNKNOWN", variant: "secondary" as const },
          showTimer: false,
        };
    }
  };

  const config = getStatusConfig();
  const { h, m, s } = formatTime(timeLeft);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center pb-4">
        <div className="flex items-center justify-center gap-3 mb-2">
          {config.icon}
          <CardTitle className="text-xl font-semibold">
            {config.title}
          </CardTitle>
        </div>
        <Badge variant={config.badge.variant} className="w-fit mx-auto">
          {config.badge.text}
        </Badge>
      </CardHeader>

      {config.showTimer && (
        <CardContent className="pt-0">
          <div className="flex items-center justify-center gap-2">
            <TimerBox value={h} label="Hours" />
            <span className="text-2xl font-bold text-muted-foreground">:</span>
            <TimerBox value={m} label="Minutes" />
            <span className="text-2xl font-bold text-muted-foreground">:</span>
            <TimerBox value={s} label="Seconds" />
          </div>

          <p className="text-center text-sm text-muted-foreground mt-4">
            Time remaining in the contest
          </p>
        </CardContent>
      )}
    </Card>
  );
}
