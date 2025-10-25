import prisma from "@/lib/core/prisma";
import { TeamSchema, TeamCreationSchema } from "@/types/db";
import { revalidatePath } from "next/cache";

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

export async function createTeam(formData: FormData) {
  const rawData = {
    name: formData.get("name") as string,
    schoolId: formData.get("schoolId") as string,
    memberName: formData.get("memberName") as string,
  };

  const result = TeamCreationSchema.safeParse(rawData);

  if (!result.success) {
    throw new Error("Invalid team data");
  }

  const team = await prisma.team.create({
    data: {
      name: result.data.name,
      schoolId: result.data.schoolId,
      members: {
        create: [
          {
            name: result.data.memberName,
          },
        ],
      },
    },
    include: {
      members: true,
    },
  });

  revalidatePath("/admin/teams");

  return team;
}

export async function updateTeam(teamId: string, formData: FormData) {
  const rawData = {
    name: formData.get("name") as string,
    schoolId: formData.get("schoolId") as string,
  };

  const result = TeamSchema.safeParse(rawData);

  if (!result.success) {
    throw new Error("Invalid team data");
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
