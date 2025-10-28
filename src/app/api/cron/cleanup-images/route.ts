import { NextResponse } from "next/server";
import { cleanupAllOrphanedImages } from "@/services/cleanup";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await cleanupAllOrphanedImages();

    console.log(
      `Cron cleanup completed: ${result.deletedCount} images deleted`
    );

    return NextResponse.json({
      success: true,
      deletedCount: result.deletedCount,
      errors: result.errors,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Cron cleanup failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
