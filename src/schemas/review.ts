import { z } from "zod";

// Validates the incoming prompt from the frontend for the AI review endpoint.
export const aiRequestSchema = z.object({
  prompt: z
    .string()
    .trim()
    .min(20, "Prompt must be at least 20 characters.")
    .max(2000, "Prompt must be at most 2000 characters."),
});

// Schema for the structured AI review response.
export const reviewSchema = z.object({
  summary: z.string(),
  strengths: z.array(z.string()).min(1).max(3),
  improvements: z.array(z.string()).min(1).max(3),
  readiness: z.enum(["ready", "almost", "not-yet"]),
});

export type Review = z.infer<typeof reviewSchema>;

export const reviewJsonSchema = z.toJSONSchema(reviewSchema);
