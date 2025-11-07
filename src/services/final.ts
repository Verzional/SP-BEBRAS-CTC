"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { FinalScoringFormSchema } from "@/types/db/final";
import { revalidatePath } from "next/cache";

export async function getAllScores() {
  return await prisma.finalScore.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function getTopTeamScoresByLevel(level: "SMP" | "SMA") {
  const topTeams = await prisma.team.findMany({
    where: { level },
    orderBy: { score: "desc" },
    take: 5,
    select: { id: true },
  });

  const teamIds = topTeams.map((team) => team.id);

  const teams = await prisma.team.findMany({
    where: { id: { in: teamIds } },
    select: {
      id: true,
      name: true,
      score: true,
      level: true,
      finalScores: {
        select: {
          id: true,
          score: true,
          round: {
            select: {
              id: true,
              name: true,
            },
          },
          judge: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
    orderBy: {
      score: "desc",
    },
  });

  const result = teams.map((team) => {
    const scores = [
      {
        round: "Preliminary",
        score: team.score,
        judge: "App",
      },
      ...team.finalScores.map((finalScore) => ({
        round: finalScore.round.name,
        score: finalScore.score,
        judge: finalScore.judge.name,
      })),
    ];

    const totalScore = scores.reduce((sum, score) => sum + score.score, 0);

    return {
      teamId: team.id,
      teamName: team.name,
      level: team.level,
      scores,
      totalScore,
    };
  });

  return result;
}

export async function submitFinalScores(data: {
  level: "SMP" | "SMA";
  roundId: string;
  scores: { teamId: string; score: number }[];
}) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "You must be logged in to submit scores" };
  }

  const result = FinalScoringFormSchema.safeParse(data);

  if (!result.success) {
    return {
      error:
        "Invalid final scores data: " +
        result.error.issues.map((e) => e.message).join(", "),
    };
  }

  try {
    const existingScores = await prisma.finalScore.findMany({
      where: {
        roundId: result.data.roundId,
        teamId: { in: result.data.scores.map((s) => s.teamId) },
        judgeId: session.user.id,
      },
      select: {
        teamId: true,
        team: {
          select: { name: true },
        },
      },
    });

    if (existingScores.length > 0) {
      const teamNames = existingScores.map((es) => es.team.name).join(", ");
      return {
        error: `You have already submitted scores for the following teams in this round: ${teamNames}. You cannot submit scores for the same teams in the same round again.`,
      };
    }

    const finalScores = await prisma.$transaction(
      result.data.scores.map((scoreData) =>
        prisma.finalScore.create({
          data: {
            judgeId: session.user.id,
            roundId: result.data.roundId,
            teamId: scoreData.teamId,
            score: scoreData.score,
          },
        })
      )
    );

    revalidatePath("judge/scores");

    return { success: true, finalScores };
  } catch (err) {
    console.error("Failed to submit bulk final scores:", err);
    return {
      error: "Failed to submit final scores: " + (err as Error).message,
    };
  }
}
