"use server";

import prisma from "@/lib/prisma";
import { SchoolSchema } from "@/types/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export async function getAllSchools() {
  return await prisma.school.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getSchoolById(schoolId: string) {
  return await prisma.school.findUnique({
    where: { id: schoolId },
  });
}

export async function createSchool(data: z.infer<typeof SchoolSchema>) {
  const result = SchoolSchema.safeParse(data);

  if (!result.success) {
    return { error: "Invalid school data submitted." };
  }

  try {
    const school = await prisma.school.create({
      data: result.data,
    });

    revalidatePath("/admin/schools");

    return { success: true, school };
  } catch (err) {
    return { error: "Failed to create school: " + (err as Error).message };
  }
}

export async function updateSchool(
  schoolId: string,
  data: z.infer<typeof SchoolSchema>
) {
  const result = SchoolSchema.safeParse(data);

  if (!result.success) {
    throw new Error("Invalid school data submitted.");
  }

  const school = await prisma.school.update({
    where: { id: schoolId },
    data: result.data,
  });

  revalidatePath("/admin/schools");

  return school;
}

export async function deleteSchool(schoolId: string) {
  await prisma.school.delete({
    where: { id: schoolId },
  });

  revalidatePath("/admin/schools");

  return;
}
