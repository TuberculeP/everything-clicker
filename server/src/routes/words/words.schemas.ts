import { z } from "zod";

export const createWordSchema = z.object({
  // Raw input cap only: sanitizeWord() does the real checks and returns
  // error codes the front can translate
  word: z.string().max(512, "Word is too long"),
});

export const increaseSchema = z.object({
  amount: z.number().int().min(1),
});
