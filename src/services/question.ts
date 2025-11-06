"use server";

import prisma from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";
import {
  QuestionWithAnswersSchema,
  QuestionUpdateSchema,
  questionInclude,
} from "@/types/db/question";
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

export async function createQuestion(
  data: z.infer<typeof QuestionWithAnswersSchema>
) {
  const result = QuestionWithAnswersSchema.safeParse(data);

  if (!result.success) {
    return {
      error:
        "Invalid question data: " +
        result.error.issues.map((e) => e.message).join(", "),
    };
  }

  try {
    const { title, level, difficulty, questionImages, answers } = result.data;

    const question = await prisma.$transaction(async (tx) => {
      const newQuestion = await tx.question.create({
        data: {
          title,
          level,
          difficulty,
        },
      });

      if (questionImages.length > 0) {
        await tx.image.createMany({
          data: questionImages.map((img) => ({
            url: img.url,
            publicId: img.publicId,
            questionId: newQuestion.id,
          })),
        });
      }

      for (const answer of answers) {
        const newAnswer = await tx.answer.create({
          data: {
            content: answer.content,
            correct: answer.correct,
            questionId: newQuestion.id,
          },
        });

        if (answer.images.length > 0) {
          await tx.image.createMany({
            data: answer.images.map((img) => ({
              url: img.url,
              publicId: img.publicId,
              answerId: newAnswer.id,
            })),
          });
        }
      }

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
      error: "Failed to create question: " + (err as Error).message,
    };
  }
}

export async function updateQuestion(
  questionId: string,
  data: z.infer<typeof QuestionUpdateSchema>
) {
  const result = QuestionUpdateSchema.safeParse(data);

  if (!result.success) {
    throw new Error("Invalid question data submitted.");
  }

  const question = await prisma.$transaction(async (tx) => {
    // Update the question
    await tx.question.update({
      where: { id: questionId },
      data: {
        title: result.data.title,
        level: result.data.level,
        difficulty: result.data.difficulty,
      },
    });

    // Handle answers
    const existingAnswers = await tx.answer.findMany({
      where: { questionId },
      include: { images: true },
    });

    const existingAnswerIds = new Set(existingAnswers.map(a => a.id));
    const formAnswerIds = new Set(result.data.answers.filter(a => a.id).map(a => a.id!));

    // Answers to delete
    const toDeleteIds = [...existingAnswerIds].filter(id => !formAnswerIds.has(id));

    // Delete answers and their images
    for (const id of toDeleteIds) {
      await tx.image.deleteMany({ where: { answerId: id } });
      await tx.answer.delete({ where: { id } });
    }

    // Update existing answers
    for (const answerData of result.data.answers.filter(a => a.id)) {
      await tx.answer.update({
        where: { id: answerData.id! },
        data: {
          content: answerData.content,
          correct: answerData.correct,
        },
      });

      // Handle images for this answer
      const existingImages = existingAnswers.find(a => a.id === answerData.id)?.images || [];
      const existingImageIds = new Set(existingImages.map(img => img.publicId));
      const formImageIds = new Set(answerData.images.map(img => img.publicId));

      // Delete removed images
      const imagesToDelete = [...existingImageIds].filter(id => !formImageIds.has(id));
      for (const publicId of imagesToDelete) {
        await tx.image.deleteMany({ where: { publicId, answerId: answerData.id } });
      }

      // Add new images
      const imagesToAdd = answerData.images.filter(img => !existingImageIds.has(img.publicId));
      if (imagesToAdd.length > 0) {
        await tx.image.createMany({
          data: imagesToAdd.map(img => ({
            url: img.url,
            publicId: img.publicId,
            answerId: answerData.id,
          })),
        });
      }
    }

    // Create new answers
    for (const answerData of result.data.answers.filter(a => !a.id)) {
      const newAnswer = await tx.answer.create({
        data: {
          content: answerData.content,
          correct: answerData.correct,
          questionId,
        },
      });

      if (answerData.images.length > 0) {
        await tx.image.createMany({
          data: answerData.images.map(img => ({
            url: img.url,
            publicId: img.publicId,
            answerId: newAnswer.id,
          })),
        });
      }
    }

    return await tx.question.findUnique({
      where: { id: questionId },
      include: questionInclude,
    });
  });

  revalidatePath("/admin/questions");
  revalidatePath("/admin/answers/create");

  return question;
}

export async function deleteQuestion(questionId: string) {
  const deleted = await prisma.question.delete({
    where: { id: questionId },
  });

  revalidatePath("/admin/questions");
  revalidatePath("/admin/answers/create");

  return deleted;
}

async function getRandomUnsolvedQuestion(
  teamId: string,
  level?: "SMP" | "SMA",
  difficulty?: "EASY" | "MEDIUM" | "HARD"
) {
  const submissions = await prisma.submission.findMany({
    where: { teamId: teamId },
    select: { questionId: true },
  });

  const solvedQuestionIds = submissions.map((q) => q.questionId);

  const whereClause: {
    id: { notIn: string[] };
    level?: "SMP" | "SMA";
    difficulty?: "EASY" | "MEDIUM" | "HARD";
    roundType: "PRELIMINARY";
  } = {
    id: { notIn: solvedQuestionIds },
    roundType: "PRELIMINARY",
  };

  if (level) {
    whereClause.level = level;
  }

  if (difficulty) {
    whereClause.difficulty = difficulty;
  }

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

export async function getQuestionForTeam(
  teamId: string,
  level?: "SMP" | "SMA",
  difficulty?: "EASY" | "MEDIUM" | "HARD"
) {
  try {
    const team = await prisma.team.findUnique({ where: { id: teamId } });

    if (!team) {
      return { error: "Invalid QR Code: Team not found." };
    }

    const question = await getRandomUnsolvedQuestion(teamId, level, difficulty);

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

    revalidatePath("/leaderboard");
    revalidatePath("/dashboard");

    return { success: true, correct };
  } catch (err) {
    console.error("Error checking team submission: ", err);
    return { error: "An unexpected server error occurred." };
  }
}

export async function hasTeamRecentlyAnswered(teamId: string, questionId: string, maxAgeMs: number = 10000) {
  try {
    const recentSubmission = await prisma.submission.findFirst({
      where: {
        teamId: teamId,
        questionId: questionId,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!recentSubmission) {
      return { hasAnswered: false, isRecent: false };
    }

    const timeSinceSubmission = new Date().getTime() - recentSubmission.createdAt.getTime();
    const isRecent = timeSinceSubmission < maxAgeMs;

    return { hasAnswered: true, isRecent };
  } catch (err) {
    console.error("Error checking if team has recently answered: ", err);
    return { error: "An unexpected server error occurred." };
  }
}
