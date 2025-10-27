import z from "zod";
import { Prisma } from "@/generated/client/client";
import { Difficulty } from "@/generated/client/enums";

// Team
export const teamInclude = {
  school: true,
} satisfies Prisma.TeamInclude;

export type FullTeam = Prisma.TeamGetPayload<{
  include: typeof teamInclude;
}>;

// Question Schema
export const QuestionSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be less than 255 characters"),
  description: z.string().min(1, "Description is required"),
  image: z.url("Image must be a valid URL").nullable().optional(),
  difficulty: z.enum(Difficulty, "Difficulty is required and must be valid"),
});

export type Question = z.infer<typeof QuestionSchema>;

// Answer Schema
export const AnswerSchema = z.object({
  questionId: z.cuid2("Question is required"),
  content: z.string().min(1, "Content is required"),
});

export type Answer = z.infer<typeof AnswerSchema>;

// Team Schema
export const TeamSchema = z.object({
  schoolId: z.cuid2("School is required"),
  name: z
    .string()
    .min(1, "Team name is required")
    .max(100, "Team name must be less than 100 characters"),
});

export type Team = z.infer<typeof TeamSchema>;

// Member Schema
export const MemberSchema = z.object({
  teamId: z.cuid2("Team is required"),
  name: z
    .string()
    .min(1, "Member name is required")
    .max(100, "Member name must be less than 100 characters"),
});

export type Member = z.infer<typeof MemberSchema>;

// School Schema
export const SchoolSchema = z.object({
  name: z
    .string()
    .min(1, "School name is required")
    .max(100, "School name must be less than 100 characters"),
  picName: z
    .string()
    .max(100, "PIC Name must be less than 100 characters")
    .optional()
    .nullable(),
  picEmail: z
    .string()
    .max(100, "PIC Email must be less than 100 characters")
    .optional()
    .nullable(),
  address: z
    .string()
    .max(255, "Address must be less than 255 characters")
    .optional()
    .nullable(),
});

export type School = z.infer<typeof SchoolSchema>;
