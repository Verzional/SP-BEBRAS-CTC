"use server";

import prisma from "@/lib/prisma";
import { TeamSchema } from "@/types/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export async function getAllTeams() {
  return await prisma.team.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      school: true,
    },
  });
}

export async function getTeamById(teamId: string) {
  return await prisma.team.findUnique({
    where: { id: teamId },
    include: { members: true, school: true },
  });
}

export async function createTeam(data: z.infer<typeof TeamSchema>) {
  const result = TeamSchema.safeParse(data);

  if (!result.success) {
    return { error: "Invalid team data submitted." };
  }

  try {
    const team = await prisma.team.create({
      data: result.data,
    });

    revalidatePath("/admin/teams");

    return { success: true, team };
  } catch (err) {
    return { error: "Failed to create team: " + (err as Error).message };
  }
}

export async function updateTeam(
  teamId: string,
  data: z.infer<typeof TeamSchema>
) {
  const result = TeamSchema.safeParse(data);

  if (!result.success) {
    throw new Error("Invalid team data submitted.");
  }

  const team = await prisma.team.update({
    where: { id: teamId },
    data: result.data,
  });

  revalidatePath("/admin/teams");

  return team;
}

export async function deleteTeam(teamId: string) {
  const deleted = await prisma.team.delete({
    where: { id: teamId },
  });

  revalidatePath("/admin/teams");

  return deleted;
}
