"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Clock, CheckCircle, Play, Pause } from "lucide-react";
import { pusherClient } from "@/lib/pusher";
import { ContestStatus } from "@/generated/client/enums";
import { Button } from "@/components/ui/button";

interface HomeProps {
  status?: ContestStatus;
}

export function Home({ status = ContestStatus.PENDING }: HomeProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [currentStatus, setCurrentStatus] = useState(status);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch("/api/contest/status");
        const data = await response.json();
        if (data.status) {
          setCurrentStatus(data.status);
        }
      } catch (error) {
        console.error("Failed to fetch contest status:", error);
      }
    };

    const channel = pusherClient.subscribe("contest-channel");

    channel.bind("status-update", (data: { status: ContestStatus }) => {
      setCurrentStatus(data.status);
    });

    fetchStatus();

    return () => {
      pusherClient.unsubscribe("contest-channel");
    };
  }, [router]);

  useEffect(() => {
    if (!session?.user?.teamId) return;

    const teamChannel = pusherClient.subscribe(`team-${session.user.teamId}`);

    teamChannel.bind("question-assigned", (data: { questionId: string }) => {
      router.push(`/question/${data.questionId}`);
    });

    return () => {
      pusherClient.unsubscribe(`team-${session.user.teamId}`);
    };
  }, [session?.user?.teamId, router]);

  const isPending = currentStatus === ContestStatus.PENDING;
  const isPaused = currentStatus === ContestStatus.PAUSED;
  const isFinished = currentStatus === ContestStatus.FINISHED;

  const getStatusConfig = () => {
    if (isPending) {
      return {
        icon: <Clock className="h-20 w-20 animate-pulse" />,
        title: "Contest Starting Soon",
        subtitle: "Get ready for the competition!",
        subheader: "Please wait for the administrator to start the contest.",
        gradient:
          "from-blue-50 to-indigo-100 dark:from-blue-950/20 dark:to-indigo-900/20",
        iconColor: "text-blue-600 dark:text-blue-400",
      };
    }
    if (isPaused) {
      return {
        icon: <Pause className="h-20 w-20" />,
        title: "Contest Paused",
        subtitle: "Competition temporarily halted",
        subheader: "The contest has been paused. Please wait for it to resume.",
        gradient:
          "from-orange-50 to-red-100 dark:from-orange-950/20 dark:to-red-900/20",
        iconColor: "text-orange-600 dark:text-orange-400",
      };
    }
    if (isFinished) {
      return {
        icon: <CheckCircle className="h-20 w-20" />,
        title: "Contest Completed",
        subtitle: "Thank you for participating!",
        subheader: "The contest has concluded. Check the leaderboard for final results.",
        gradient:
          "from-green-50 to-emerald-100 dark:from-green-950/20 dark:to-emerald-900/20",
        iconColor: "text-green-600 dark:text-green-400",
      };
    }
    return {
      icon: <Play className="h-20 w-20" />,
      title: "Contest in Progress",
      subtitle: "The challenge is live!",
      subheader: "The contest is currently running. Navigate to your dashboard to start solving challenges.",
      gradient:
        "from-green-50 to-teal-100 dark:from-green-950/20 dark:to-teal-900/20",
      iconColor: "text-green-600 dark:text-green-400",
    };
  };

  const config = getStatusConfig();

  const dashboardHref =
    session?.user?.role === "USER" ? "/dashboard" : "/admin";

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        {/* Hero Section */}
        <div
          className={`relative overflow-hidden rounded-2xl bg-linear-to-br ${config.gradient} border shadow-lg`}
        >
          <div className="absolute inset-0 bg-white/50 dark:bg-black/20 backdrop-blur-sm" />

          <div className="relative p-8 md:p-12">
            <div className="text-center space-y-8">
              {/* Main Title Section */}
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground">
                  C-THINK COMPETITION
                </h1>
                <div className="text-base md:text-lg text-muted-foreground space-y-1">
                  <p>School of Information Technology</p>
                  <p>Universitas Ciputra Surabaya</p>
                </div>
              </div>

              {/* Icon */}
              <div className={`flex justify-center ${config.iconColor}`}>
                {config.icon}
              </div>

              {/* Status Title and Subtitle */}
              <div className="space-y-3">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
                  {config.title}
                </h2>
                <p className="text-lg md:text-xl text-muted-foreground font-medium">
                  {config.subtitle}
                </p>
              </div>

              {/* Subheader */}
              <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                {config.subheader}
              </p>

              {/* Dashboard Button */}
              {session && (
                <div className="flex justify-center pt-4">
                  <Button asChild size="lg">
                    <a href={dashboardHref}>Go to Dashboard</a>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
