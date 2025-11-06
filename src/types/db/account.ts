import { z } from "zod";

// SCHEMA //
export const AccountSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be less than 50 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    ),
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be less than 100 characters"),
  role: z.enum(["USER", "ADMIN", "MASTER"]),
  teamId: z.string().optional(),
});

export type AccountFormData = z.infer<typeof AccountSchema>;
