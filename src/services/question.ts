"use server";

import prisma from "@/lib/prisma";
import { QuestionSchema } from "@/types/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export async function getAllQuestions() {
  return await prisma.question.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      images: true,
      answers: true,
    },
  });
}

export async function getQuestionById(questionId: string) {
  return await prisma.question.findUnique({
    where: { id: questionId },
    include: {
      images: true,
      answers: true,
    },
  });
}

export async function createQuestion(data: z.infer<typeof QuestionSchema>) {
  const result = QuestionSchema.safeParse(data);

  if (!result.success) {
    throw new Error("Invalid question data submitted");
  }

  try {
    const question = await prisma.question.create({
      data: result.data,
    });

    revalidatePath("/admin/questions");

    return { success: true, question: question };
  } catch (err) {
    return { error: "Failed to create question: " + (err as Error).message };
  }
}

export async function updateQuestion(
  questionId: string,
  data: z.infer<typeof QuestionSchema>
) {
  const result = QuestionSchema.safeParse(data);

  if (!result.success) {
    throw new Error("Invalid question data submitted.");
  }

  const question = await prisma.question.update({
    where: { id: questionId },
    data: result.data,
  });

  revalidatePath("/admin/questions");

  return question;
}

export async function deleteQuestion(questionId: string) {
  try {
    const deleted = await prisma.question.delete({
      where: { id: questionId },
    });

    revalidatePath("/admin/questions");

    return { success: true, deleted };
  } catch (err) {
    console.error("Failed to delete question:", err);
    return { success: false, error: "Failed to delete question." };
  }
}

async function getRandomUnsolvedQuestion(teamId: string) {
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
  } catch (err) {
    console.error("Error fetching question for team: ", err);
    return { error: "An unexpected server error occurred." };
  }
}

