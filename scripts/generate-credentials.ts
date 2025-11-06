import 'dotenv/config';
import prisma from '../src/lib/prisma';

async function generateCredentials() {
  try {
    const teams = await prisma.team.findMany({
      include: {
        school: true,
      },
    });

    teams.forEach((team) => {
      const username = team.name.replace(/\s+/g, "").toLowerCase();
      const teamNameFirst3 = team.name
        .replace(/\s+/g, "")
        .toLowerCase()
        .substring(0, 3);
      const schoolNameFirst3 = team.school.name
        .replace(/\s+/g, "")
        .toLowerCase()
        .substring(0, 3);
      const password = teamNameFirst3 + schoolNameFirst3 + "2025";

      console.log(`Team Name: ${team.name}`);
      console.log(`username: ${username}`);
      console.log(`password: ${password}`);
      console.log(""); // Empty line for separation
    });
  } catch (error) {
    console.error("Error generating credentials:", error);
  } finally {
    await prisma.$disconnect();
  }
}

generateCredentials();
