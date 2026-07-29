/**
 * In-memory daily rate limit for practice AI (check + coach).
 * Applies to guests and registered users until paid plans exist.
 */

import {
  GUEST_AI_DAILY_LIMIT,
  PRACTICE_AI_LIMIT_ERROR,
  USER_AI_DAILY_LIMIT,
} from "../../../math-common/build/globals";

type Bucket = { day: string; count: number };

const buckets = new Map<string, Bucket>();

export type PracticeAiSubjectKind = "guest" | "user";

function utcDayKey(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

function pruneIfNeeded(key: string, day: string): Bucket {
  const existing = buckets.get(key);
  if (!existing || existing.day !== day) {
    const fresh = { day, count: 0 };
    buckets.set(key, fresh);
    return fresh;
  }
  return existing;
}

function limitMessage(kind: PracticeAiSubjectKind, limit: number): string {
  if (kind === "guest") {
    return `Guest AI limit reached (${limit} free Check/Coach uses per day). Sign in for a higher daily limit.`;
  }
  return `Daily AI limit reached (${limit} Check/Coach uses). Try again tomorrow.`;
}

export type PracticeAiLimitResult =
  | { allowed: true; remaining: number; limit: number }
  | {
      allowed: false;
      remaining: 0;
      limit: number;
      error: typeof PRACTICE_AI_LIMIT_ERROR;
      message: string;
    };

export function dailyLimitForKind(kind: PracticeAiSubjectKind): number {
  return kind === "user" ? USER_AI_DAILY_LIMIT : GUEST_AI_DAILY_LIMIT;
}

export function checkPracticeAiLimit(
  key: string,
  kind: PracticeAiSubjectKind,
): PracticeAiLimitResult {
  const day = utcDayKey();
  const bucket = pruneIfNeeded(key, day);
  const limit = dailyLimitForKind(kind);
  if (bucket.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      limit,
      error: PRACTICE_AI_LIMIT_ERROR,
      message: limitMessage(kind, limit),
    };
  }
  return {
    allowed: true,
    remaining: limit - bucket.count,
    limit,
  };
}

/** Call after a successful practice AI request. */
export function consumePracticeAiLimit(
  key: string,
  kind: PracticeAiSubjectKind,
): { remaining: number; limit: number } {
  const day = utcDayKey();
  const bucket = pruneIfNeeded(key, day);
  bucket.count += 1;
  buckets.set(key, bucket);
  const limit = dailyLimitForKind(kind);
  return {
    remaining: Math.max(0, limit - bucket.count),
    limit,
  };
}

/** @deprecated Prefer checkPracticeAiLimit */
export const checkGuestAiLimit = (key: string) =>
  checkPracticeAiLimit(key, "guest");

/** @deprecated Prefer consumePracticeAiLimit */
export const consumeGuestAiLimit = (key: string) =>
  consumePracticeAiLimit(key, "guest");
