import z from "zod";

// SCHEMA //
export const RoundSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
});

export type Round = z.infer<typeof RoundSchema>;

// EXTRA SCHEMA //
export const FinalScoreSchema = z.object({
  score: z
    .number()
    .min(0, "Score must be at least 0")
    .max(100, "Score cannot exceed 100"),
  judgeId: z.cuid2("Invalid judge ID"),
  teamId: z.cuid2("Invalid team ID"),
  roundId: z.cuid2("Invalid round ID"),
});
