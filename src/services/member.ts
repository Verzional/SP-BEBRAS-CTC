"use server";

import prisma from "@/lib/prisma";
import { MemberSchema } from "@/types/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

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

export async function createMember(data: z.infer<typeof MemberSchema>) {
  const result = MemberSchema.safeParse(data);

  if (!result.success) {
    return { error: "Invalid member data submitted." };
  }

  try {
    const member = await prisma.member.create({
      data: result.data,
    });

    revalidatePath("/admin/members");

    return { success: true, member: member };
  } catch (err) {
    return { error: "Failed to create member: " + (err as Error).message };
  }
}

export async function updateMember(
  memberId: string,
  data: z.infer<typeof MemberSchema>
) {
  const result = MemberSchema.safeParse(data);

  if (!result.success) {
    throw new Error("Invalid member data submitted.");
  }

  const member = await prisma.member.update({
    where: { id: memberId },
    data: result.data,
  });

  revalidatePath("/admin/members");

  return member;
}

export async function deleteMember(memberId: string) {
  try {
    const deleted = await prisma.member.delete({
      where: { id: memberId },
    });

    revalidatePath("/admin/members");

    return { success: true, deleted };
  } catch (err) {
    console.error("Failed to delete member:", err);
    return { success: false, error: "Failed to delete member." };
  }
}
