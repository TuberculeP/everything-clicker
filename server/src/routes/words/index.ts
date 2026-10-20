import { Router } from "express";
import { QueryFailedError } from "typeorm";
import pg from "../../config/db.config";
import { Word } from "../../config/entities/Word";
import { validateBody } from "../../middleware/validate.middleware";
import {
  clickLimiter,
  createWordLimiter,
} from "../../middleware/rateLimiter.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import { AppError } from "../../utils/AppError";
import { sanitizeWord, wordKey } from "../../utils/word";
import {
  broadcastTopWords,
  getTopWords,
} from "../../services/topWords.service";
import { createWordSchema, increaseSchema } from "./words.schemas";

// 125 clicks/s over the 2s batch window of the front
const MAX_CLICKS_PER_BATCH = 250;
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const wordsRouter = Router();
const repo = () => pg.getRepository(Word);

// Postgres and SQLite codes for a unique index violation
const UNIQUE_VIOLATION_CODES = ["23505", "SQLITE_CONSTRAINT"];

const isUniqueViolation = (err: unknown) =>
  err instanceof QueryFailedError &&
  UNIQUE_VIOLATION_CODES.includes(err.driverError?.code);

const findWordOrFail = async (id: string) => {
  // Postgres rejects a malformed uuid with a 500, answer 404 instead
  const word = UUID_REGEX.test(id)
    ? await repo().findOne({ where: { id } })
    : null;
  if (!word) {
    throw new AppError("Word not found", 404);
  }
  return word;
};

wordsRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    res.json(await repo().find({ order: { createdAt: "ASC" } }));
  }),
);

wordsRouter.get(
  "/top",
  asyncHandler(async (_req, res) => {
    res.json(await getTopWords());
  }),
);

wordsRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    res.json(await findWordOrFail(req.params.id));
  }),
);

wordsRouter.post(
  "/",
  createWordLimiter,
  validateBody(createWordSchema),
  asyncHandler(async (req, res) => {
    const word = sanitizeWord(req.body.word);
    const key = wordKey(word);
    if (await repo().exists({ where: { key } })) {
      throw new AppError("word_exists", 409);
    }
    let id: string;
    try {
      ({ id } = await repo().save(repo().create({ word, key })));
    } catch (err) {
      // Same word created by a concurrent request
      if (isUniqueViolation(err)) throw new AppError("word_exists", 409);
      throw err;
    }
    broadcastTopWords();
    // Re-read so the response leaves out the key column
    res.status(201).json(await findWordOrFail(id));
  }),
);

wordsRouter.post(
  "/:id/increase",
  clickLimiter,
  validateBody(increaseSchema),
  asyncHandler(async (req, res) => {
    const { amount } = req.body;
    if (amount > MAX_CLICKS_PER_BATCH) {
      throw new AppError("no_auto_click", 400);
    }
    const { id } = await findWordOrFail(req.params.id);
    await repo().increment({ id }, "count", amount);
    broadcastTopWords();
    res.json(await findWordOrFail(id));
  }),
);

export default wordsRouter;
