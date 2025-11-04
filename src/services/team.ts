"use server";

import prisma from "@/lib/prisma";
import { TeamSchema, TeamWithMembersSchema, teamInclude } from "@/types/db/team";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export async function getAllTeams() {
  return await prisma.team.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      school: true,
      members: true,
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

export async function createTeamWithMembers(
  data: z.infer<typeof TeamWithMembersSchema>
) {
  const result = TeamWithMembersSchema.safeParse(data);

  if (!result.success) {
    return {
      error: "Invalid team data: " + result.error.issues.map((e) => e.message).join(", ")
    };
  }

  try {
    const { schoolId, name, members } = result.data;

    // Create team with members in a transaction
    const team = await prisma.$transaction(async (tx) => {
      // Create the team
      const newTeam = await tx.team.create({
        data: {
          schoolId,
          name,
        },
      });

      // Create members for the team
      if (members.length > 0) {
        await tx.member.createMany({
          data: members.map(member => ({
            name: member.name,
            teamId: newTeam.id,
          })),
        });
      }

      // Fetch the complete team with all relations
      return await tx.team.findUnique({
        where: { id: newTeam.id },
        include: teamInclude,
      });
    });

    revalidatePath("/admin/teams");
    revalidatePath("/admin/members");

    return { success: true, team };
  } catch (err) {
    console.error("Failed to create team with members:", err);
    return {
      error: "Failed to create team: " + (err as Error).message
    };
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
  try {
    const deleted = await prisma.team.delete({
      where: { id: teamId },
    });

    revalidatePath("/admin/teams");

    return { success: true, deleted };
  } catch (err) {
    console.error("Failed to delete team:", err);
    return { success: false, error: "Failed to delete team." };
  }
}
