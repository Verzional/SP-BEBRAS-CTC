"use server";

import prisma from "../lib/prisma";
import { AnswerSchema } from "@/types/db";
import { revalidatePath } from "next/cache";

export async function createAnswer(formData: FormData) {
  const rawData = {
    content: formData.get("content") as string,
    questionId: formData.get("questionId") as string,
  };

  const result = AnswerSchema.safeParse(rawData);

  if (!result.success) {
    throw new Error("Invalid answer data");
  }

  const answer = await prisma.answer.create({
    data: result.data,
  });

  revalidatePath("/admin/questions");
  revalidatePath(`/admin/questions/${formData.get("questionId") as string}`);

  return answer;
}

export async function updateAnswer(answerId: string, formData: FormData) {
  const rawData = {
    content: formData.get("content") as string,
    questionId: formData.get("questionId") as string,
  };

  const result = AnswerSchema.safeParse(rawData);
  if (!result.success) {
    throw new Error("Invalid answer data");
  }

  const answer = await prisma.answer.update({
    where: { id: answerId },
    data: result.data,
  });

  revalidatePath("/admin/questions");
  revalidatePath(`/admin/questions/${formData.get("questionId") as string}`);

  return answer;
}

export async function deleteAnswer(answerId: string) {
  const deleted = await prisma.answer.delete({
    where: { id: answerId },
  });

  revalidatePath("/admin/questions");

  return deleted;
}
