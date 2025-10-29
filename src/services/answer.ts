"use server";

import prisma from "../lib/prisma";
import { AnswerSchema } from "@/types/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export async function getAnswerById(answerId: string) {
  return await prisma.answer.findUnique({
    where: { id: answerId },
  });
}

export async function getAnswersByQuestionId(questionId: string) {
  return await prisma.answer.findMany({
    where: { questionId },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function createAnswer(data: z.infer<typeof AnswerSchema>) {
  const result = AnswerSchema.safeParse(data);

  if (!result.success) {
    throw new Error("Invalid answer data submitted");
  }

  try {
    const answer = await prisma.answer.create({
      data: result.data,
    });

    revalidatePath("/admin/questions");

    return { success: true, answer: answer };
  } catch (err) {
    return { error: "Failed to create answer: " + (err as Error).message };
  }
}

export async function updateAnswer(
  answerId: string,
  data: z.infer<typeof AnswerSchema>
) {
  const result = AnswerSchema.safeParse(data);

  if (!result.success) {
    return { error: "Invalid answer data submitted." };
  }

  try {
    const answer = await prisma.answer.update({
      where: { id: answerId },
      data: result.data,
    });

    revalidatePath("/admin/answers");

    return { success: true, answer };
  } catch (err) {
    return { error: "Failed to update answer: " + (err as Error).message };
  }
}

export async function deleteAnswer(answerId: string) {
  try {
    const deleted = await prisma.answer.delete({
      where: { id: answerId },
    });

    revalidatePath("/admin/questions");

    return { success: true, deleted };
  } catch (err) {
    console.error("Failed to delete answer:", err);
    return { success: false, error: "Failed to delete answer." };
  }
}