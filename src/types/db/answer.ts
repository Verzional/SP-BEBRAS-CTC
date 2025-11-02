import z from "zod";

// SCHEMA //
export const AnswerSchema = z.object({
  questionId: z.cuid2("Question is required"),
  content: z.string().min(1, "Content is required"),
  correct: z.boolean(),
});

export type Answer = z.infer<typeof AnswerSchema>;
