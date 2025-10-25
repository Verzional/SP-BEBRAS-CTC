import prisma from "@/lib/core/prisma";
import { MemberSchema } from "@/types/db";
import { revalidatePath } from "next/cache";

export async function getAllMembers() {
  return await prisma.member.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      team: true,
    },
  });
}

export async function getMemberById(memberId: string) {
  return await prisma.member.findUnique({
    where: { id: memberId },
    include: { team: true },
  });
}

export async function createMember(formData: FormData) {
  const rawData = {
    name: formData.get("name") as string,
    teamId: formData.get("teamId") as string,
  };

  const result = MemberSchema.safeParse(rawData);

  if (!result.success) {
    throw new Error("Invalid member data");
  }

  const member = await prisma.member.create({
    data: result.data,
  });

  revalidatePath("/admin/members");

  return member;
}

export async function updateMember(memberId: string, formData: FormData) {
  const rawData = {
    name: formData.get("name") as string,
    teamId: formData.get("teamId") as string,
  };

  const result = MemberSchema.safeParse(rawData);

  if (!result.success) {
    throw new Error("Invalid member data");
  }

  const member = await prisma.member.update({
    where: { id: memberId },
    data: result.data,
  });

  revalidatePath("/admin/members");

  return member;
}

export async function deleteMember(memberId: string) {
  const deleted = await prisma.member.delete({
    where: { id: memberId },
  });

  revalidatePath("/admin/members");

  return deleted;
}
