import z from "zod";
import { Prisma } from "@/generated/client/client";
import { Difficulty } from "@/generated/client/enums";

// SCHEMA //
export const QuestionSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be less than 255 characters"),
  description: z.string().min(1, "Description is required"),
  difficulty: z.enum(Difficulty, "Difficulty is required and must be valid"),
});

export type Question = z.infer<typeof QuestionSchema>;

// EXTENDED SCHEMA //
export const QuestionWithAnswersSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be less than 255 characters"),
  description: z.string().min(1, "Description is required"),
  difficulty: z.enum(Difficulty, "Difficulty is required and must be valid"),
  questionImages: z.array(z.object({
    url: z.string(),
    publicId: z.string(),
  })),
  answers: z.array(z.object({
    content: z.string().min(1, "Answer content is required"),
    correct: z.boolean(),
    images: z.array(z.object({
      url: z.string(),
      publicId: z.string(),
    })),
  })).min(2, "At least 2 answers are required")
    .refine(
      (answers) => answers.filter(a => a.correct).length === 1,
      "Exactly one answer must be marked as correct"
    ),
});

export type QuestionWithAnswers = z.infer<typeof QuestionWithAnswersSchema>;

// INCLUDE //
export const questionInclude = {
  images: true,
  answers: {
    include: {
      images: true,
    },
  },
} satisfies Prisma.QuestionInclude;

export type FullQuestion = Prisma.QuestionGetPayload<{
  include: typeof questionInclude;
}>;
