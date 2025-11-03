"use server";

import prisma from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  timeout: 60000, // 60 seconds timeout
});

interface CloudinaryResource {
  public_id: string;
  secure_url: string;
  created_at: string;
  bytes: number;
}

interface CleanupResult {
  success: boolean;
  deletedCount: number;
  errors: string[];
}

export async function cleanupOrphanedImages(
  folder: string
): Promise<CleanupResult> {
  const errors: string[] = [];
  let deletedCount = 0;

  try {
    const cloudinaryImages = await cloudinary.api.resources({
      type: "upload",
      prefix: folder,
      max_results: 500,
      timeout: 60000,
    });

    const dbImages = await prisma.image.findMany({
      select: { publicId: true },
    });

    const dbPublicIds = new Set(dbImages.map((img) => img.publicId));

    const orphanedImages = cloudinaryImages.resources.filter(
      (resource: CloudinaryResource) => !dbPublicIds.has(resource.public_id)
    );

    const batchSize = 10;
    for (let i = 0; i < orphanedImages.length; i += batchSize) {
      const batch = orphanedImages.slice(i, i + batchSize);

      await Promise.all(
        batch.map(async (orphan: CloudinaryResource) => {
          try {
            await cloudinary.uploader.destroy(orphan.public_id);
            deletedCount++;
            console.log(`Deleted orphaned image: ${orphan.public_id}`);
          } catch (error) {
            const errorMsg = `Failed to delete ${orphan.public_id}: ${
              error instanceof Error ? error.message : "Unknown error"
            }`;
            errors.push(errorMsg);
            console.error(errorMsg);
          }
        })
      );

      if (i + batchSize < orphanedImages.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    return {
      success: true,
      deletedCount,
      errors,
    };
  } catch (error) {
    console.error("Cleanup failed:", error);

    let errorMessage = "Unknown cleanup error";
    if (error instanceof Error) {
      if (error.message.includes("ETIMEDOUT")) {
        errorMessage =
          "Request timed out during cleanup. Please check your internet connection and try again.";
      } else if (error.message.includes("ENOTFOUND")) {
        errorMessage =
          "Network error during cleanup. Please check your internet connection.";
      } else {
        errorMessage = error.message;
      }
    }

    return {
      success: false,
      deletedCount,
      errors: [errorMessage],
    };
  }
}

export async function cleanupAllOrphanedImages(): Promise<CleanupResult> {
  const folders = ["bebras/questions", "bebras/answers"];
  let totalDeleted = 0;
  const allErrors: string[] = [];

  for (const folder of folders) {
    const result = await cleanupOrphanedImages(folder);
    totalDeleted += result.deletedCount;
    allErrors.push(...result.errors);
  }

  return {
    success: allErrors.length === 0,
    deletedCount: totalDeleted,
    errors: allErrors,
  };
}

export async function getOrphanedImages(folder: string) {
  try {
    const cloudinaryImages = await cloudinary.api.resources({
      type: "upload",
      prefix: folder,
      max_results: 500,
      timeout: 60000,
    });

    const dbImages = await prisma.image.findMany({
      select: { publicId: true },
    });

    const dbPublicIds = new Set(dbImages.map((img) => img.publicId));

    const orphanedImages = cloudinaryImages.resources.filter(
      (resource: CloudinaryResource) => !dbPublicIds.has(resource.public_id)
    );

    return {
      success: true,
      orphanedImages: orphanedImages.map((img: CloudinaryResource) => ({
        publicId: img.public_id,
        url: img.secure_url,
        createdAt: img.created_at,
        bytes: img.bytes,
      })),
    };
  } catch (error) {
    console.error("Failed to get orphaned images:", error);

    let errorMessage = "Unknown error";
    if (error instanceof Error) {
      if (error.message.includes("ETIMEDOUT")) {
        errorMessage =
          "Request timed out. Please check your internet connection and try again.";
      } else if (error.message.includes("ENOTFOUND")) {
        errorMessage = "Network error. Please check your internet connection.";
      } else {
        errorMessage = error.message;
      }
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}
