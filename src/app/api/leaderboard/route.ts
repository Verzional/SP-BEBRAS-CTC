import prisma from "@/lib/prisma";
import { ContestStatus } from "@/generated/client/enums";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "5", 10);
  const level = searchParams.get("level") as "SMA" | "SMP" | null;

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
        level?: "SMA" | "SMP";
      }>;

      const filteredData = level ? frozenData.filter(team => team.level === level) : frozenData;
      const paginatedData = filteredData.slice(skip, skip + limit);
      const totalUsers = filteredData.length;

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

    const [teams, totalTeams] = await prisma.$transaction([
      prisma.team.findMany({
        where: level ? { level } : {},
        orderBy: [{ score: "desc" }, { createdAt: "asc" }],
        skip: skip,
        take: limit,
        select: {
          id: true,
          name: true,
          score: true,
          account: {
            select: {
              name: true,
            },
          },
        },
      }),
      prisma.team.count({
        where: level ? { level } : {},
      }),
    ]);

    const leaderboardData = teams.map((team) => ({
      id: team.id,
      name: team.account?.name || team.name,
      image: null,
      score: team.score,
    }));

    return NextResponse.json({
      data: leaderboardData,
      meta: {
        totalUsers: totalTeams,
        page,
        limit,
        totalPages: Math.ceil(totalTeams / limit),
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
