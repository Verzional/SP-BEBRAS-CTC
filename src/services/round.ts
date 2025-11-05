import prisma from "@/lib/prisma";
import { FinalScoreSchema, RoundSchema } from "@/types/db/round";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export async function getAllRounds() {
  return await prisma.round.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getRoundById(roundId: string) {
  return await prisma.round.findUnique({
    where: { id: roundId },
  });
}

export async function createRound(data: z.infer<typeof RoundSchema>) {
  const result = RoundSchema.safeParse(data);

  if (!result.success) {
    return { error: "Invalid round data submitted." };
  }

  try {
    const round = await prisma.round.create({
      data: result.data,
    });

    revalidatePath("/admin/rounds");

    return { success: true, round };
  } catch (err) {
    return { error: "Failed to create round: " + (err as Error).message };
  }
}

export async function updateRound(
  roundId: string,
  data: z.infer<typeof RoundSchema>
) {
  const result = RoundSchema.safeParse(data);

  if (!result.success) {
    throw new Error("Invalid round data submitted.");
  }

  const round = await prisma.round.update({
    where: { id: roundId },
    data: result.data,
  });

  revalidatePath("/admin/rounds");

  return round;
}

export async function deleteRound(roundId: string) {
  await prisma.round.delete({
    where: { id: roundId },
  });

  revalidatePath("/admin/rounds");

  return;
}

export async function submitFinalScore(data: z.infer<typeof FinalScoreSchema>) {
  const result = FinalScoreSchema.safeParse(data);

  if (!result.success) {
    throw new Error("Invalid final score data submitted.");
  }

  const finalScore = await prisma.finalScore.create({
    data: result.data,
  });

  return finalScore;
}
