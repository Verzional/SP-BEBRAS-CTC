"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { v2 as cloudinary } from "cloudinary";
import { Prisma } from "@/generated/client/client";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface UploadImageResult {
  success: boolean;
  error?: string;
  imageData?: {
    publicId: string;
    url: string;
  };
}

export async function saveImageMetadata(
  cloudinaryResult: { public_id: string; secure_url: string },
  parentId: string,
  parentType: "question" | "answer"
): Promise<UploadImageResult> {
  if (!cloudinaryResult || !parentId || !parentType) {
    return { success: false, error: "Missing required data." };
  }

  const { public_id, secure_url } = cloudinaryResult;

  try {
    const data: Prisma.ImageCreateInput = {
      publicId: public_id,
      url: secure_url,
      ...(parentType === "question" && {
        question: { connect: { id: parentId } },
      }),
      ...(parentType === "answer" && {
        answer: { connect: { id: parentId } },
      }),
    };

    if (parentType !== "question" && parentType !== "answer") {
      return { success: false, error: "Invalid parent type." };
    }

    const image = await prisma.image.create({ data });

    if (parentType === "question") {
      revalidatePath(`/admin/questions`);
      revalidatePath(`/admin/questions/${parentId}`);
    } else if (parentType === "answer") {
      revalidatePath(`/admin/questions/${image.questionId}`);
    }

    return {
      success: true,
      imageData: { publicId: image.publicId, url: image.url },
    };
  } catch (error) {
    console.error("Failed to save image metadata:", error);

    await cloudinary.uploader.destroy(public_id);
    return {
      success: false,
      error: "Failed to save image metadata to database.",
    };
  }
}

export async function deleteImage(
  publicId: string
): Promise<{ success: boolean; error?: string }> {
  if (!publicId) {
    return { success: false, error: "Public ID is required." };
  }

  try {
    await cloudinary.uploader.destroy(publicId);

    await prisma.image.delete({
      where: { publicId: publicId },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to delete image:", error);

    return { success: false, error: "Failed to delete image." };
  }
}
