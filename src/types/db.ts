import z from "zod";
import { Difficulty } from "@/generated/client/enums";

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

// Team Creation Schema (includes first member)
export const TeamCreationSchema = TeamSchema.extend({
  memberName: z
    .string()
    .min(1, "At least one member is required")
    .max(100, "Member name must be less than 100 characters"),
});

export type TeamCreation = z.infer<typeof TeamCreationSchema>;

// Member Schema
export const MemberSchema = z.object({
  teamId: z.cuid2("Team is required"),
  name: z
    .string()
    .min(1, "Member name is required")
    .max(100, "Member name must be less than 100 characters"),
});
