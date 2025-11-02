import { z } from "zod";
import { Prisma } from "@/generated/client/client";

// SCHEMA //
export const MemberSchema = z.object({
  teamId: z.cuid2("Team is required"),
  name: z
    .string()
    .min(1, "Member name is required")
    .max(100, "Member name must be less than 100 characters"),
});

export type Member = z.infer<typeof MemberSchema>;

// INCLUDE //
export const memberInclude = {
  team: true,
} satisfies Prisma.MemberInclude;

export type FullMember = Prisma.MemberGetPayload<{
  include: typeof memberInclude;
}>;
