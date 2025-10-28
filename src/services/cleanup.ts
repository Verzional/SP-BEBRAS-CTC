"use server";

import prisma from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
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
    });

    const dbImages = await prisma.image.findMany({
      select: { publicId: true },
    });

    const dbPublicIds = new Set(dbImages.map((img) => img.publicId));

    const orphanedImages = cloudinaryImages.resources.filter(
      (resource: CloudinaryResource) => !dbPublicIds.has(resource.public_id)
    );

    for (const orphan of orphanedImages) {
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
    }

    return {
      success: true,
      deletedCount,
      errors,
    };
  } catch (error) {
    console.error("Cleanup failed:", error);
    return {
      success: false,
      deletedCount,
      errors: [
        error instanceof Error ? error.message : "Unknown cleanup error",
      ],
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
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
