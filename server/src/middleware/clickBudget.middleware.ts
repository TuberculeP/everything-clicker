import type { RequestHandler } from "express";
import { AppError } from "../utils/AppError";

// Matches the front batch: at most 250 clicks every 2s (webapp useClickBatch.ts)
export const MAX_CLICKS_PER_BATCH = 250;
const BATCH_INTERVAL_MS = 2000;
const CLICKS_PER_MS = MAX_CLICKS_PER_BATCH / BATCH_INTERVAL_MS;
const CLEANUP_INTERVAL_MS = 60 * 1000;

type Bucket = { tokens: number; updatedAt: number };

// Token bucket per IP: holds up to MAX_CLICKS_PER_BATCH clicks, refills at
// the front's max rate, and each request spends its amount. Caps the total
// clicks per IP however many requests are sent.
const buckets = new Map<string, Bucket>();

const refill = (bucket: Bucket, now: number) =>
  Math.min(
    MAX_CLICKS_PER_BATCH,
    bucket.tokens + (now - bucket.updatedAt) * CLICKS_PER_MS,
  );

// Full buckets carry no state, drop them so the map does not grow forever
setInterval(() => {
  const now = Date.now();
  for (const [ip, bucket] of buckets) {
    if (refill(bucket, now) >= MAX_CLICKS_PER_BATCH) buckets.delete(ip);
  }
}, CLEANUP_INTERVAL_MS).unref();

// Must run after validateBody(increaseSchema): reads a valid req.body.amount
export const clickBudget: RequestHandler = (req, _res, next) => {
  const amount: number = req.body.amount;
  if (amount > MAX_CLICKS_PER_BATCH) {
    return next(new AppError("no_auto_click", 400));
  }
  const ip = req.ip ?? "unknown";
  const now = Date.now();
  const bucket = buckets.get(ip);
  const tokens = bucket ? refill(bucket, now) : MAX_CLICKS_PER_BATCH;
  if (amount > tokens) {
    buckets.set(ip, { tokens, updatedAt: now });
    return next(new AppError("no_auto_click", 429));
  }
  buckets.set(ip, { tokens: tokens - amount, updatedAt: now });
  next();
};
