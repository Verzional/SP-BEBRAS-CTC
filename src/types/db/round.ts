import z from "zod";

// SCHEMA //
export const RoundSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
});

export type Round = z.infer<typeof RoundSchema>;
