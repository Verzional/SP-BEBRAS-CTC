import prisma from "@/lib/prisma";
import { Role, Difficulty } from "@/generated/client/enums";
import { hashSync } from "@node-rs/bcrypt";

const adminAccounts = [
  {
    name: "Valen",
    username: "valen",
    password: "12345678",
    role: Role.MASTER,
  },
];

const schools = [
  {
    name: "Tech Academy",
    picName: "Principal Tech",
    picEmail: "principal@techacademy.com",
    address: "123 Tech St",
  },
  {
    name: "Innovation High",
    picName: "Principal Innovate",
    picEmail: "principal@innovationhigh.com",
    address: "456 Innovate Ave",
  },
  {
    name: "Future Leaders School",
    picName: "Principal Future",
    picEmail: "principal@futureleaders.com",
    address: "789 Future Blvd",
  },
];

const teams = [
  { name: "Cyber Warriors" },
  { name: "Code Crusaders" },
  { name: "Digital Dynamos" },
  { name: "AI Avengers" },
  { name: "Quantum Questers" },
];

const userAccounts = [
  { name: "Cyber Warriors", username: "cyberwarrior", password: "password123" },
  { name: "Code Crusaders", username: "codecrusader", password: "password123" },
  {
    name: "Digital Dynamos",
    username: "digitaldynamo",
    password: "password123",
  },
  { name: "AI Avengers", username: "aiavenger", password: "password123" },
  {
    name: "Quantum Questers",
    username: "quantumquester",
    password: "password123",
  },
];

const members = [
  // Cyber Warriors
  { name: "Neo Hacker" },
  { name: "Byte Buster" },
  { name: "Code Ninja" },
  // Code Crusaders
  { name: "Script Sultan" },
  { name: "Debug Duke" },
  { name: "Algo Ace" },
  // Digital Dynamos
  { name: "Pixel Prince" },
  { name: "Data Dragon" },
  { name: "Web Wizard" },
  // AI Avengers
  { name: "Neural Knight" },
  { name: "Bot Baron" },
  { name: "AI Archer" },
  // Quantum Questers
  { name: "Quantum Quill" },
  { name: "Bit Bard" },
  { name: "Logic Lord" },
];

const questions = [
  {
    title: "Question 1",
    description: "What is 2 + 2?",
    difficulty: Difficulty.EASY,
  },
  {
    title: "Question 2",
    description: "What is the capital of France?",
    difficulty: Difficulty.MEDIUM,
  },
  {
    title: "Question 3",
    description: "Explain quantum physics.",
    difficulty: Difficulty.HARD,
  },
  {
    title: "Question 4",
    description: "What is the square root of 16?",
    difficulty: Difficulty.EASY,
  },
  {
    title: "Question 5",
    description: "Who wrote Romeo and Juliet?",
    difficulty: Difficulty.MEDIUM,
  },
];

const answers = [
  // Question 1
  { content: "3", correct: false },
  { content: "4", correct: true },
  { content: "5", correct: false },
  // Question 2
  { content: "London", correct: false },
  { content: "Paris", correct: true },
  { content: "Berlin", correct: false },
  // Question 3
  { content: "It's simple", correct: false },
  { content: "Complex theory", correct: true },
  { content: "I don't know", correct: false },
  // Question 4
  { content: "2", correct: false },
  { content: "4", correct: true },
  { content: "8", correct: false },
  // Question 5
  { content: "Shakespeare", correct: true },
  { content: "Dickens", correct: false },
  { content: "Austen", correct: false },
];

async function seedAccounts(userData: {
  name: string;
  username: string;
  password: string;
  role?: Role;
  teamId?: string;
}) {
  try {
    const hashedPassword = hashSync(userData.password, 10);

    await prisma.account.create({
      data: {
        username: userData.username,
        name: userData.name,
        password: hashedPassword,
        role: userData.role || Role.USER,
        teamId: userData.teamId,
      },
    });

    console.log(`Created account: ${userData.name} (${userData.username})`);
  } catch (error) {
    console.error(`Failed to create account ${userData.username}:`, error);
  }
}

async function seedSchool(schoolData: {
  name: string;
  picName?: string;
  picEmail?: string;
  address?: string;
}) {
  try {
    const school = await prisma.school.create({
      data: schoolData,
    });
    console.log(`Created school: ${school.name}`);
    return school;
  } catch (error) {
    console.error(`Failed to create school ${schoolData.name}:`, error);
    throw error;
  }
}

async function seedTeam(teamData: { name: string }, schoolId: string) {
  try {
    const team = await prisma.team.create({
      data: {
        name: teamData.name,
        schoolId,
      },
    });
    console.log(`Created team: ${team.name}`);
    return team;
  } catch (error) {
    console.error(`Failed to create team ${teamData.name}:`, error);
    throw error;
  }
}

async function seedMember(memberData: { name: string }, teamId: string) {
  try {
    const member = await prisma.member.create({
      data: {
        name: memberData.name,
        teamId,
      },
    });
    console.log(`Created member: ${member.name}`);
    return member;
  } catch (error) {
    console.error(`Failed to create member ${memberData.name}:`, error);
    throw error;
  }
}

async function seedQuestion(questionData: {
  title: string;
  description: string;
  difficulty: Difficulty;
}) {
  try {
    const question = await prisma.question.create({
      data: questionData,
    });
    console.log(`Created question: ${question.title}`);
    return question;
  } catch (error) {
    console.error(`Failed to create question ${questionData.title}:`, error);
    throw error;
  }
}

async function seedAnswer(
  answerData: { content: string; correct: boolean },
  questionId: string
) {
  try {
    const answer = await prisma.answer.create({
      data: {
        content: answerData.content,
        correct: answerData.correct,
        questionId,
      },
    });
    console.log(`Created answer: ${answer.content}`);
    return answer;
  } catch (error) {
    console.error(`Failed to create answer ${answerData.content}:`, error);
    throw error;
  }
}

export async function main() {
  console.log("\n" + "=".repeat(50));
  console.log("Seeding database...");
  console.log("=".repeat(50));

  // Seed Admin Accounts
  console.log("\n" + "=".repeat(50));
  console.log("Seeding admin accounts...");
  console.log("=".repeat(50));
  for (const account of adminAccounts) {
    await seedAccounts(account);
  }

  // Seed Schools
  console.log("\n" + "=".repeat(50));
  console.log("Seeding schools...");
  console.log("=".repeat(50));
  const schoolIds = [];
  for (const school of schools) {
    const s = await seedSchool(school);
    schoolIds.push(s.id);
  }

  // Seed Teams
  console.log("\n" + "=".repeat(50));
  console.log("Seeding teams...");
  console.log("=".repeat(50));
  const teamAssignments = [0, 0, 1, 1, 2];
  const createdTeams = [];
  for (let i = 0; i < teams.length; i++) {
    const schoolIndex = teamAssignments[i];
    const createdTeam = await seedTeam(teams[i], schoolIds[schoolIndex]);
    createdTeams.push(createdTeam);
  }

  // Seed User Accounts
  console.log("\n" + "=".repeat(50));
  console.log("Seeding user accounts...");
  console.log("=".repeat(50));
  for (let i = 0; i < userAccounts.length; i++) {
    await seedAccounts({
      ...userAccounts[i],
      teamId: createdTeams[i].id,
    });
  }

  // Seed Members
  console.log("\n" + "=".repeat(50));
  console.log("Seeding members...");
  console.log("=".repeat(50));
  for (let i = 0; i < createdTeams.length; i++) {
    const teamMembers = members.slice(i * 3, (i + 1) * 3);
    for (const member of teamMembers) {
      await seedMember(member, createdTeams[i].id);
    }
  }

  // Seed Questions
  console.log("\n" + "=".repeat(50));
  console.log("Seeding questions...");
  console.log("=".repeat(50));
  const createdQuestions = [];
  for (const question of questions) {
    const createdQuestion = await seedQuestion(question);
    createdQuestions.push(createdQuestion);
  }

  // Seed Answers
  console.log("\n" + "=".repeat(50));
  console.log("Seeding answers...");
  console.log("=".repeat(50));
  for (let i = 0; i < createdQuestions.length; i++) {
    const questionAnswers = answers.slice(i * 3, (i + 1) * 3);
    for (const answer of questionAnswers) {
      await seedAnswer(answer, createdQuestions[i].id);
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log("Seeding completed!");
  console.log("=".repeat(50));
}

main()
  .then(async () => {
    process.exit(0);
  })
  .catch(async (e) => {
    console.error(e);
    process.exit(1);
  });
