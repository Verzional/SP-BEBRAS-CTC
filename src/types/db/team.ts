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

// EXTENDED SCHEMA //
export const TeamWithMembersSchema = z.object({
  schoolId: z.cuid2("School is required"),
  name: z
    .string()
    .min(1, "Team name is required")
    .max(100, "Team name must be less than 100 characters"),
  members: z.array(z.object({
    name: z
      .string()
      .min(1, "Member name is required")
      .max(100, "Member name must be less than 100 characters"),
  })).min(1, "At least 1 member is required"),
});

export type TeamWithMembers = z.infer<typeof TeamWithMembersSchema>;

// INCLUDE //
export const teamInclude = {
  school: true,
  members: true,
} satisfies Prisma.TeamInclude;

export type FullTeam = Prisma.TeamGetPayload<{
  include: typeof teamInclude;
}>;
