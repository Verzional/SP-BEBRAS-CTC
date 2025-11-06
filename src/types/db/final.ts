import { z } from "zod";

// SCHEMA //
export const FinalScoringFormSchema = z.object({
  level: z.enum(["SMP", "SMA"]),
  roundId: z.cuid2("Invalid round ID"),
  scores: z.array(
    z.object({
      teamId: z.cuid2("Invalid team ID"),
      score: z.number().min(-10, "Score must be no lower than -10").max(10, "Score must be no higher than 10"),
    })
  ),
});

export type FinalScoringFormData = z.infer<typeof FinalScoringFormSchema>;
