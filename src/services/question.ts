"use server";

import prisma from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";
import { QuestionSchema, QuestionWithAnswersSchema, questionInclude } from "@/types/db/question";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export async function getAllQuestions() {
  return await prisma.question.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: questionInclude,
  });
}

export async function getQuestionById(questionId: string) {
  return await prisma.question.findUnique({
    where: { id: questionId },
    include: questionInclude,
  });
}

export async function createQuestion(data: z.infer<typeof QuestionSchema>) {
  const result = QuestionSchema.safeParse(data);

  if (!result.success) {
    throw new Error("Invalid question data submitted");
  }

  try {
    const question = await prisma.question.create({
      data: result.data,
    });

    revalidatePath("/admin/questions");
    revalidatePath("/admin/answers/create");

    return { success: true, question: question };
  } catch (err) {
    return { error: "Failed to create question: " + (err as Error).message };
  }
}

export async function createQuestionWithAnswers(
  data: z.infer<typeof QuestionWithAnswersSchema>
) {
  const result = QuestionWithAnswersSchema.safeParse(data);

  if (!result.success) {
    return { 
      error: "Invalid question data: " + result.error.issues.map((e) => e.message).join(", ") 
    };
  }

  try {
    const { title, description, difficulty, questionImages, answers } = result.data;

    // Create question with answers and images in a transaction
    const question = await prisma.$transaction(async (tx) => {
      // Create the question
      const newQuestion = await tx.question.create({
        data: {
          title,
          description,
          difficulty,
        },
      });

      // Create question images
      if (questionImages.length > 0) {
        await tx.image.createMany({
          data: questionImages.map(img => ({
            url: img.url,
            publicId: img.publicId,
            questionId: newQuestion.id,
          })),
        });
      }

      // Create answers with their images
      for (const answer of answers) {
        const newAnswer = await tx.answer.create({
          data: {
            content: answer.content,
            correct: answer.correct,
            questionId: newQuestion.id,
          },
        });

        // Create answer images if any
        if (answer.images.length > 0) {
          await tx.image.createMany({
            data: answer.images.map(img => ({
              url: img.url,
              publicId: img.publicId,
              answerId: newAnswer.id,
            })),
          });
        }
      }

      // Fetch the complete question with all relations
      return await tx.question.findUnique({
        where: { id: newQuestion.id },
        include: questionInclude,
      });
    });

    revalidatePath("/admin/questions");
    revalidatePath("/admin/answers/create");

    return { success: true, question };
  } catch (err) {
    console.error("Failed to create question with answers:", err);
    return { 
      error: "Failed to create question: " + (err as Error).message 
    };
  }
}

export async function updateQuestion(
  questionId: string,
  data: z.infer<typeof QuestionSchema>
) {
  const result = QuestionSchema.safeParse(data);

  if (!result.success) {
    throw new Error("Invalid question data submitted.");
  }

  const question = await prisma.question.update({
    where: { id: questionId },
    data: result.data,
  });

  revalidatePath("/admin/questions");
  revalidatePath("/admin/answers/create");

  return question;
}

export async function deleteQuestion(questionId: string) {
  try {
    const deleted = await prisma.question.delete({
      where: { id: questionId },
    });

    revalidatePath("/admin/questions");
    revalidatePath("/admin/answers/create");

    return { success: true, deleted };
  } catch (err) {
    console.error("Failed to delete question:", err);
    return { success: false, error: "Failed to delete question." };
  }
}

async function getRandomUnsolvedQuestion(teamId: string) {
  const submissions = await prisma.submission.findMany({
    where: { teamId: teamId },
    select: { questionId: true },
  });

  const solvedQuestionIds = submissions.map((q) => q.questionId);

  const whereClause = {
    id: { notIn: solvedQuestionIds },
  };

  const unsolvedQuestionCount = await prisma.question.count({
    where: whereClause,
  });

  if (unsolvedQuestionCount === 0) {
    return null;
  }

  const randomSkip = Math.floor(Math.random() * unsolvedQuestionCount);

  const randomQuestion = await prisma.question.findFirst({
    where: whereClause,
    skip: randomSkip,
    include: {
      answers: true,
    },
  });

  return randomQuestion;
}

export async function getQuestionForTeam(teamId: string) {
  try {
    const team = await prisma.team.findUnique({ where: { id: teamId } });

    if (!team) {
      return { error: "Invalid QR Code: Team not found." };
    }

    const question = await getRandomUnsolvedQuestion(teamId);

    if (!question) {
      return { error: "This team has already solved all available questions!" };
    }

    await pusherServer.trigger(`team-${teamId}`, "question-assigned", {
      questionId: question.id,
    });

    return { questionId: question.id };
  } catch (err) {
    console.error("Error fetching question for team: ", err);
    return { error: "An unexpected server error occurred." };
  }
}

export async function checkTeamSubmission(
  teamId: string,
  questionId: string,
  answerId: string
) {
  try {
    const team = await prisma.team.findUnique({ where: { id: teamId } });

    if (!team) {
      return { error: "Team not found." };
    }

    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      return { error: "Question not found." };
    }

    const correctAnswer = await prisma.answer.findFirst({
      where: { questionId: questionId, correct: true },
    });

    if (!correctAnswer) {
      return { error: "No correct answer found for this question." };
    }

    const correct = correctAnswer.id === answerId;

    await prisma.submission.create({
      data: {
        teamId: teamId,
        questionId: questionId,
        correct: correct,
      },
    });

    switch (question.difficulty) {
      case "EASY":
        team.score += correct ? 2 : -1;
        break;
      case "MEDIUM":
        team.score += correct ? 3 : -2;
        break;
      case "HARD":
        team.score += correct ? 5 : -3;
        break;
    }

    await prisma.team.update({
      where: { id: teamId },
      data: { score: team.score },
    });

    return { success: true, correct };
  } catch (err) {
    console.error("Error checking team submission: ", err);
    return { error: "An unexpected server error occurred." };
  }
}

export async function hasTeamAnswered(teamId: string, questionId: string) {
  try {
    const submission = await prisma.submission.findFirst({
      where: {
        teamId: teamId,
        questionId: questionId,
      },
    });

    return { hasAnswered: !!submission };
  } catch (err) {
    console.error("Error checking if team has answered: ", err);
    return { error: "An unexpected server error occurred." };
  }
}
