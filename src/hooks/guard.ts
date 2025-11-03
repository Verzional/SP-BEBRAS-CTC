"use client";

import useSWR from "swr";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { pusherClient } from "@/lib/pusher";
import { ContestStatus, Role } from "@/generated/client/enums";

interface ContestStatusData {
  status: ContestStatus;
  startTime: string;
  endTime: string;
  serverTime: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useContestGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();

  const { data: contestStatus, mutate } = useSWR<ContestStatusData>(
    "/api/contest/status",
    fetcher,
    {
      refreshInterval: 5000,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  useEffect(() => {
    const channel = pusherClient.subscribe("contest-channel");

    channel.bind("status-update", (data: ContestStatusData) => {
      mutate({
        status: data.status,
        startTime: data.startTime,
        endTime: data.endTime,
        serverTime: new Date().toISOString(),
      });
    });

    return () => {
      pusherClient.unsubscribe("contest-channel");
    };
  }, [mutate]);

  useEffect(() => {
    if (
      !contestStatus ||
      session?.user?.role === Role.ADMIN ||
      pathname === "/"
    ) {
      return;
    }

    const shouldRedirectToHome =
      contestStatus.status === ContestStatus.PENDING ||
      contestStatus.status === ContestStatus.FINISHED ||
      contestStatus.status === ContestStatus.PAUSED;

    if (shouldRedirectToHome) {
      router.push("/");
    }
  }, [contestStatus, session, router, pathname]);

  return { contestStatus };
}
