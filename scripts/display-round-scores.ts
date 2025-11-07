import 'dotenv/config';
import prisma from '../src/lib/prisma';

type FinalScoreWithDetails = {
  score: number;
  team: {
    name: string;
    level: "SMP" | "SMA";
    school: {
      name: string;
    };
  };
  judge: {
    name: string;
  };
};

async function displayRoundScores() {
  try {
    // Get all rounds
    const rounds = await prisma.round.findMany({
      orderBy: { createdAt: "asc" },
    });

    console.log("=== ROUND SCORES REPORT ===\n");

    for (const round of rounds) {
      console.log(`Round: ${round.name}`);
      console.log("-".repeat(50));

      // Get final scores for this round where score is not 0
      const finalScores = await prisma.finalScore.findMany({
        where: {
          roundId: round.id,
          score: {
            not: 0,
          },
        },
        include: {
          team: {
            select: {
              name: true,
              level: true,
              school: {
                select: {
                  name: true,
                },
              },
            },
          },
          judge: {
            select: {
              name: true,
            },
          },
        },
        orderBy: [
          { team: { level: "asc" } },
          { team: { name: "asc" } },
        ],
      }) as FinalScoreWithDetails[];

      if (finalScores.length === 0) {
        console.log("No teams with scores in this round.\n");
        continue;
      }

      // Group by level for better display
      const smpScores = finalScores.filter(score => score.team.level === "SMP");
      const smaScores = finalScores.filter(score => score.team.level === "SMA");

      if (smpScores.length > 0) {
        console.log("SMP Teams:");
        smpScores.forEach(score => {
          console.log(`  ${score.team.name} (${score.team.school.name}) - Score: ${score.score} (Judge: ${score.judge.name})`);
        });
      }

      if (smaScores.length > 0) {
        console.log("SMA Teams:");
        smaScores.forEach(score => {
          console.log(`  ${score.team.name} (${score.team.school.name}) - Score: ${score.score} (Judge: ${score.judge.name})`);
        });
      }

      console.log(`Total teams with scores in this round: ${finalScores.length}\n`);
    }

    console.log("=== END REPORT ===");

  } catch (error) {
    console.error("Error displaying round scores:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
displayRoundScores();