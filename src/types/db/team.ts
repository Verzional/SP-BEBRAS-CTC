import { z } from "zod";
import { Prisma } from "@/generated/client/client";

// SCHEMA //
export const TeamSchema = z.object({
  schoolId: z.cuid2("School is required"),
  name: z
    .string()
    .min(1, "Team name is required")
    .max(100, "Team name must be less than 100 characters"),
});

export type Team = z.infer<typeof TeamSchema>;

// INCLUDE //
export const teamInclude = {
  school: true,
  members: true,
} satisfies Prisma.TeamInclude;

export type FullTeam = Prisma.TeamGetPayload<{
  include: typeof teamInclude;
}>;
