import { z } from "zod";

export const createWordSchema = z.object({
  word: z
    .string()
    .trim()
    .min(1, "Word is required")
    .max(64, "Word must be at most 64 characters"),
});

export const increaseSchema = z.object({
  amount: z.number().int().min(1),
});
