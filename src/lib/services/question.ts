"use server";

import prisma from "@/lib/core/prisma";
import { Question, Answer } from "@/generated/client/client";

async function getRandomUnsolvedQuestion(
  teamId: string
): Promise<(Question & { answers: Answer[] }) | null> {
  const solvedQuestionRecords = await prisma.solvedQuestion.findMany({
    where: { teamId: teamId },
    select: { questionId: true },
  });

  const solvedQuestionIds = solvedQuestionRecords.map((q) => q.questionId);

  const whereClause = {
    id: { notIn: solvedQuestionIds },
  };

  const unsolvedQuestionCount = await prisma.question.count({
    where: whereClause,
  });

  if (unsolvedQuestionCount === 0) {
    return null;
  }

  const randomSkip = Math.floor(Math.random() * unsolvedQuestionCount);

  const randomQuestion = await prisma.question.findFirst({
    where: whereClause,
    skip: randomSkip,
    include: {
      answers: true,
    },
  });

  return randomQuestion;
}

export async function getQuestionForTeam(teamId: string) {
  try {
    const team = await prisma.team.findUnique({ where: { id: teamId } });

    if (!team) {
      return { error: "Invalid QR Code: Team not found." };
    }

    const question = await getRandomUnsolvedQuestion(teamId);

    if (!question) {
      return { error: "This team has already solved all available questions!" };
    }

    return { questionId: question.id };
  } catch (error) {
    console.error("Error fetching question for team:", error);
    return { error: "An unexpected server error occurred." };
  }
}

export async function getQuestionById(questionId: string) {
  return await prisma.question.findUnique({
    where: { id: questionId },
    include: { answers: true },
  });
}
