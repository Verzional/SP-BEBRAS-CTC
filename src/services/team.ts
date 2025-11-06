"use server";

import prisma from "@/lib/prisma";
import {
  TeamWithMembersSchema,
  teamInclude,
} from "@/types/db/team";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { hashSync } from "@node-rs/bcrypt";

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

export async function getTop5TeamsByScoreAndLevel(level: "SMP" | "SMA") {
  return await prisma.team.findMany({
    where: { level },
    orderBy: { score: "desc" },
    take: 5,
    select: {
      id: true,
      name: true,
    },
  });
}
export async function createTeamWithMembers(
  data: z.infer<typeof TeamWithMembersSchema>
) {
  const result = TeamWithMembersSchema.safeParse(data);

  if (!result.success) {
    return {
      error:
        "Invalid team data: " +
        result.error.issues.map((e) => e.message).join(", "),
    };
  }

  try {
    const { schoolId, name, level, members } = result.data;

    const team = await prisma.$transaction(async (tx) => {
      const newTeam = await tx.team.create({
        data: {
          schoolId,
          name,
          level,
        },
      });

      if (members.length > 0) {
        await tx.member.createMany({
          data: members.map((member) => ({
            name: member.name,
            teamId: newTeam.id,
          })),
        });
      }

      const school = await tx.school.findUnique({
        where: { id: schoolId },
        select: { name: true },
      });

      if (!school) {
        throw new Error("School not found");
      }

      const username = name.replace(/\s+/g, '').toLowerCase();
      const teamNameFirst3 = name.replace(/\s+/g, '').toLowerCase().substring(0, 3);
      const schoolNameFirst3 = school.name.replace(/\s+/g, '').toLowerCase().substring(0, 3);
      const password = teamNameFirst3 + schoolNameFirst3 + '2025';

      const existingAccount = await tx.account.findUnique({
        where: { username },
      });

      if (existingAccount) {
        throw new Error("Username already exists. Please choose a different team name.");
      }

      await tx.account.create({
        data: {
          username,
          password: hashSync(password, 10),
          name,
          teamId: newTeam.id,
          role: 'USER',
        },
      });

      return await tx.team.findUnique({
        where: { id: newTeam.id },
        include: teamInclude,
      });
    });

    revalidatePath("/admin/teams");
    revalidatePath("/admin/accounts");
    revalidatePath("/admin/accounts/create");

    return { success: true, team };
  } catch (err) {
    console.error("Failed to create team with members:", err);
    return {
      error: "Failed to create team: " + (err as Error).message,
    };
  }
}

export async function updateTeamWithMembers(
  teamId: string,
  data: z.infer<typeof TeamWithMembersSchema>
) {
  const result = TeamWithMembersSchema.safeParse(data);

  if (!result.success) {
    return {
      error:
        "Invalid team data: " +
        result.error.issues.map((e) => e.message).join(", "),
    };
  }

  try {
    const { schoolId, name, level, members } = result.data;

    const team = await prisma.$transaction(async (tx) => {
      await tx.team.update({
        where: { id: teamId },
        data: {
          schoolId,
          name,
          level,
        },
      });

      await tx.member.deleteMany({
        where: { teamId },
      });

      if (members.length > 0) {
        await tx.member.createMany({
          data: members.map((member) => ({
            name: member.name,
            teamId,
          })),
        });
      }

      return await tx.team.findUnique({
        where: { id: teamId },
        include: teamInclude,
      });
    });

    revalidatePath("/admin/teams");
    revalidatePath("/admin/accounts");
    revalidatePath("/admin/accounts/create");

    return { success: true, team };
  } catch (err) {
    console.error("Failed to update team with members:", err);
    return {
      error: "Failed to update team: " + (err as Error).message,
    };
  }
}

export async function deleteTeam(teamId: string) {
  const deleted = await prisma.team.delete({
    where: { id: teamId },
  });

  revalidatePath("/admin/teams");

  return deleted;
}

export async function getTeamRank(teamId: string): Promise<number | null> {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    select: { score: true, createdAt: true },
  });

  if (!team) {
    return null;
  }

  const rank = await prisma.team.count({
    where: {
      OR: [
        { score: { gt: team.score } },
        {
          score: team.score,
          createdAt: { lt: team.createdAt },
        },
      ],
    },
  });

  return rank + 1;
}
