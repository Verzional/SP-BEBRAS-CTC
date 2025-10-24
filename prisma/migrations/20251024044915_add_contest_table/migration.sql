-- CreateEnum
CREATE TYPE "ContestStatus" AS ENUM ('PENDING', 'RUNNING', 'FROZEN', 'PAUSED', 'FINISHED');

-- CreateTable
CREATE TABLE "Contest" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "pausedTime" TIMESTAMP(3),
    "totalPausedDuration" INTEGER NOT NULL DEFAULT 0,
    "frozenLeaderboard" JSONB,
    "statusBeforePause" "ContestStatus",
    "status" "ContestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contest_pkey" PRIMARY KEY ("id")
);
