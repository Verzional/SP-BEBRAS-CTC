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
