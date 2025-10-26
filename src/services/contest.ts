"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { pusherServer } from "@/lib/pusher";
import { Prisma } from "@/generated/client/client";
import { ContestStatus } from "@/generated/client/enums";
import { revalidatePath } from "next/cache";

export async function getActiveContest() {
  const contest = await prisma.contest.findFirst();

  if (!contest) {
    throw new Error("No active contest found.");
  }

  return contest;
}

export async function startContest(formData: FormData) {
  const session = await auth();

  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const durationHours = formData.get("durationHours") as string;
  const duration = Number(durationHours);

  if (!duration || duration <= 0) {
    throw new Error("Invalid contest duration.");
  }

  const contest = await getActiveContest();
  const now = new Date();

  if (contest.status !== ContestStatus.PENDING) {
    throw new Error("Contest has already started.");
  }

  const updatedContest = await prisma.contest.update({
    where: { id: contest.id },
    data: {
      status: ContestStatus.RUNNING,
      startTime: now,
      endTime: new Date(now.getTime() + duration * 60 * 60 * 1000),
      pausedTime: null,
      totalPausedDuration: 0,
    },
  });

  await pusherServer.trigger(
    "contest-channel",
    "status-update",
    updatedContest
  );

  revalidatePath("/admin");
}

export async function pauseContest() {
  const session = await auth();

  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const contest = await getActiveContest();
  const now = new Date();

  if (
    contest.status !== ContestStatus.RUNNING &&
    contest.status !== ContestStatus.FROZEN
  ) {
    throw new Error("Contest is not running or frozen.");
  }

  const updatedContest = await prisma.contest.update({
    where: { id: contest.id },
    data: {
      status: ContestStatus.PAUSED,
      statusBeforePause: contest.status,
      pausedTime: now,
    },
  });

  await pusherServer.trigger(
    "contest-channel",
    "status-update",
    updatedContest
  );

  revalidatePath("/admin");
}

export async function resumeContest() {
  const session = await auth();

  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const contest = await getActiveContest();
  const now = new Date();

  if (contest.status !== ContestStatus.PAUSED || !contest.pausedTime) {
    throw new Error("Contest is not paused.");
  }

  const pausedDuration = Math.round(
    (now.getTime() - contest.pausedTime.getTime()) / 1000
  );

  const updatedContest = await prisma.contest.update({
    where: { id: contest.id },
    data: {
      status: contest.statusBeforePause || ContestStatus.RUNNING,
      statusBeforePause: null,
      pausedTime: null,
      totalPausedDuration: contest.totalPausedDuration + pausedDuration,
      endTime: new Date(contest.endTime.getTime() + pausedDuration * 1000),
    },
  });

  await pusherServer.trigger(
    "contest-channel",
    "status-update",
    updatedContest
  );

  revalidatePath("/admin");
}

export async function freezeContest() {
  const session = await auth();

  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const contest = await getActiveContest();

  if (contest.status !== ContestStatus.RUNNING) {
    throw new Error("Contest is not running.");
  }

  const frozenLeaderboard = await prisma.account.findMany({
    where: {
      role: "USER",
      teamId: { not: null },
    },
    orderBy: [{ team: { score: "desc" } }, { createdAt: "asc" }],
    select: {
      id: true,
      teamId: true,
      team: {
        select: {
          id: true,
          teamName: true,
          score: true,
        },
      },
    },
  });

  const updatedContest = await prisma.contest.update({
    where: { id: contest.id },
    data: {
      status: ContestStatus.FROZEN,
      frozenLeaderboard: frozenLeaderboard,
    },
  });

  await pusherServer.trigger(
    "contest-channel",
    "status-update",
    updatedContest
  );

  revalidatePath("/admin");
}

export async function unfreezeContest() {
  const session = await auth();

  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const contest = await getActiveContest();

  if (contest.status !== ContestStatus.FROZEN) {
    throw new Error("Contest is not frozen.");
  }

  const updatedContest = await prisma.contest.update({
    where: { id: contest.id },
    data: {
      status: ContestStatus.RUNNING,
      frozenLeaderboard: Prisma.JsonNull,
    },
  });

  await pusherServer.trigger(
    "contest-channel",
    "status-update",
    updatedContest
  );

  revalidatePath("/admin");
}

export async function endContest() {
  const session = await auth();

  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  const contest = await getActiveContest();

  if (
    contest.status === ContestStatus.PENDING ||
    contest.status === ContestStatus.FINISHED
  ) {
    throw new Error("Contest cannot be ended in its current state.");
  }

  const updatedContest = await prisma.contest.update({
    where: { id: contest.id },
    data: { status: ContestStatus.FINISHED, endTime: new Date() },
  });

  await pusherServer.trigger(
    "contest-channel",
    "status-update",
    updatedContest
  );
  revalidatePath("/admin");
}
