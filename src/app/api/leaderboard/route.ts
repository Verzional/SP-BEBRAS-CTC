import prisma from "@/lib/prisma";
import { ContestStatus } from "@/generated/client/enums";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "5", 10);

  if (isNaN(page) || page < 1 || isNaN(limit) || limit < 1) {
    return NextResponse.json(
      { error: "Invalid pagination parameters" },
      { status: 400 }
    );
  }

  const skip = (page - 1) * limit;

  try {
    const contest = await prisma.contest.findFirst();

    if (contest?.status === ContestStatus.FROZEN && contest.frozenLeaderboard) {
      const frozenData = contest.frozenLeaderboard as Array<{
        id: string;
        name: string | null;
        score: number;
      }>;

      const paginatedData = frozenData.slice(skip, skip + limit);
      const totalUsers = frozenData.length;

      return NextResponse.json({
        data: paginatedData,
        meta: {
          totalUsers,
          page,
          limit,
          totalPages: Math.ceil(totalUsers / limit),
          isFrozen: true,
        },
      });
    }

    const [users, totalUsers] = await prisma.$transaction([
      prisma.account.findMany({
        where: {
          role: "USER",
          teamId: { not: null },
        },
        orderBy: [{ team: { score: "desc" } }, { createdAt: "asc" }],
        skip: skip,
        take: limit,
        select: {
          id: true,
          username: true,
          teamId: true,
          team: {
            select: {
              id: true,
              teamName: true,
              score: true,
            },
          },
        },
      }),
      prisma.account.count({
        where: {
          role: "USER",
          teamId: { not: null },
        },
      }),
    ]);

    const leaderboardData = users.map((account) => ({
      accountId: account.id,
      username: account.username,
      teamId: account.teamId,
      teamName: account.team?.teamName,
      score: account.team?.score || 0,
    }));

    return NextResponse.json({
      data: leaderboardData,
      meta: {
        totalUsers,
        page,
        limit,
        totalPages: Math.ceil(totalUsers / limit),
        isFrozen: false,
      },
    });
  } catch (error) {
    console.error("Error fetching leaderboard: ", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
