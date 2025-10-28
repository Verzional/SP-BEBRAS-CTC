import { NextRequest, NextResponse } from "next/server";
import {
  cleanupOrphanedImages,
  cleanupAllOrphanedImages,
  getOrphanedImages,
} from "@/services/cleanup";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const folder = searchParams.get("folder");

    if (!folder) {
      return NextResponse.json(
        { error: "Folder parameter is required" },
        { status: 400 }
      );
    }

    const result = await getOrphanedImages(folder);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Cleanup preview failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch orphaned images" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { folder } = body;

    let result;
    if (folder) {
      result = await cleanupOrphanedImages(folder);
    } else {
      result = await cleanupAllOrphanedImages();
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Cleanup failed:", error);
    return NextResponse.json(
      { error: "Failed to cleanup images" },
      { status: 500 }
    );
  }
}
