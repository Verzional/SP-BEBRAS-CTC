import { z } from "zod";

// SCHEMA //
export const FinalScoringFormSchema = z.object({
  level: z.enum(["SMP", "SMA"]),
  roundId: z.cuid2("Invalid round ID"),
  scores: z.array(
    z.object({
      teamId: z.cuid2("Invalid team ID"),
      score: z.number().min(0).max(100),
    })
  ),
});

export type FinalScoringFormData = z.infer<typeof FinalScoringFormSchema>;
