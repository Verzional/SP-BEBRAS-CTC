import { z } from "zod";
import { Level } from "@/generated/client/enums";

export const PostSchema = z.object({
  postNumber: z
    .string()
    .min(1, "Post number is required")
    .max(100, "Post number must be at most 100 characters long"),
  picName: z
    .string()
    .min(1, "PIC name is required")
    .max(255, "PIC name must be at most 255 characters long"),
  level: z.enum(Level, "Level is required and must be valid"),
});

export type Post = z.infer<typeof PostSchema>;
