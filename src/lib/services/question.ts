"use server";

import prisma from "@/lib/core/prisma";
import { QuestionSchema } from "@/types/db";
import { revalidatePath } from "next/cache";

export async function getAllQuestions() {
  return await prisma.question.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      answers: true,
    },
  });
}

export async function getQuestionById(questionId: string) {
  return await prisma.question.findUnique({
    where: { id: questionId },
    include: { answers: true },
  });
}

export async function createQuestion(formData: FormData) {
  const rawData = {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    image: formData.get("image") as string,
  };

  const result = QuestionSchema.safeParse(rawData);

  if (!result.success) {
    throw new Error("Invalid question data");
  }

  const question = await prisma.question.create({
    data: result.data,
  });

  revalidatePath("/admin/questions");

  return question;
}

export async function updateQuestion(questionId: string, formData: FormData) {
  const rawData = {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    image: formData.get("image") as string,
  };

  const result = QuestionSchema.safeParse(rawData);

  if (!result.success) {
    throw new Error("Invalid question data");
  }

  const question = await prisma.question.update({
    where: { id: questionId },
    data: result.data,
  });

  revalidatePath("/admin/questions");
  revalidatePath(`/admin/questions/${questionId}`);

  return question;
}

export async function deleteQuestion(questionId: string) {
  const deleted = await prisma.question.delete({
    where: { id: questionId },
  });

  revalidatePath("/admin/questions");

  return deleted;
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
