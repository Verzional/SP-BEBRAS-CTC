import { z } from "zod";

// SCHEMA //
export const SchoolSchema = z.object({
  name: z
    .string()
    .min(1, "School name is required")
    .max(100, "School name must be less than 100 characters"),
  picName: z
    .string()
    .max(100, "PIC Name must be less than 100 characters")
    .optional()
    .nullable(),
  picEmail: z
    .string()
    .max(100, "PIC Email must be less than 100 characters")
    .optional()
    .nullable(),
  address: z
    .string()
    .max(255, "Address must be less than 255 characters")
    .optional()
    .nullable(),
});

export type School = z.infer<typeof SchoolSchema>;
