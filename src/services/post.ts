"use server";

import prisma from "@/lib/prisma";
import { PostSchema } from "@/types/db/post";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export async function getAllPosts() {
  return await prisma.post.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getPostById(postId: string) {
  return await prisma.post.findUnique({
    where: { id: postId },
  });
}

export async function createPost(data: z.infer<typeof PostSchema>) {
  const result = PostSchema.safeParse(data);

  if (!result.success) {
    return { error: "Invalid post data submitted." };
  }

  try {
    const post = await prisma.post.create({
      data: result.data,
    });

    revalidatePath("/admin/posts");

    return { success: true, post };
  } catch (err) {
    return { error: "Failed to create post: " + (err as Error).message };
  }
}

export async function updatePost(
  postId: string,
  data: z.infer<typeof PostSchema>
) {
  const result = PostSchema.safeParse(data);

  if (!result.success) {
    throw new Error("Invalid post data submitted.");
  }

  const post = await prisma.post.update({
    where: { id: postId },
    data: result.data,
  });

  revalidatePath("/admin/posts");

  return post;
}

export async function deletePost(postId: string) {
  const deleted = await prisma.post.delete({
    where: { id: postId },
  });

  revalidatePath("/admin/posts");

  return deleted;
}
