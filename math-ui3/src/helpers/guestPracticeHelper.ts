import { useCookies } from "vue3-cookies";
import {
  GUEST_AI_DAILY_LIMIT,
  GUEST_ID_COOKIE,
  PRACTICE_AI_LIMIT_ERROR,
  USER_AI_DAILY_LIMIT,
} from "common/globals";

const { cookies } = useCookies();

export function getOrCreateGuestId(): string {
  const existing = cookies.get(GUEST_ID_COOKIE);
  if (
    existing &&
    existing !== "null" &&
    existing !== "undefined" &&
    existing.length >= 8
  ) {
    return existing;
  }
  const id =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `guest-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  cookies.set(GUEST_ID_COOKIE, id, "30d");
  return id;
}

export type PracticeAiLimitErrorBody = {
  error?: string;
  message?: string;
  limit?: number;
  remaining?: number;
};

export function isPracticeAiLimitError(
  status: number | undefined,
  data: PracticeAiLimitErrorBody | undefined,
): boolean {
  return (
    status === 429 &&
    (data?.error === PRACTICE_AI_LIMIT_ERROR || data?.error === "guest_ai_limit")
  );
}

/** @deprecated Use isPracticeAiLimitError */
export const isGuestAiLimitError = isPracticeAiLimitError;

export function practiceAiLimitMessage(
  data?: PracticeAiLimitErrorBody,
  signedIn = false,
): string {
  if (data?.message) return data.message;
  const limit = data?.limit ?? (signedIn ? USER_AI_DAILY_LIMIT : GUEST_AI_DAILY_LIMIT);
  return signedIn
    ? `Daily AI limit reached (${limit} Check uses). Try again tomorrow.`
    : `You've used your ${limit} free AI Check uses for today. Sign in for a higher daily limit.`;
}

/** Map server/AI failures to a short user-facing reason (not quota). */
export function formatPracticeAiFailureMessage(
  action: "check" | "coach",
  serverMessage?: string,
  fallback?: string,
): string {
  const raw = (serverMessage ?? fallback ?? "").trim();
  const lower = raw.toLowerCase();
  const label = action === "check" ? "Check answer" : "AI tutor";

  if (
    lower.includes("gemini_api_key") ||
    lower.includes("google_api_key") ||
    lower.includes("not configured")
  ) {
    return `${label} is unavailable: Gemini is not configured on the server.`;
  }
  if (
    lower.includes("429") ||
    lower.includes("resource_exhausted") ||
    lower.includes("quota")
  ) {
    return `${label} is temporarily unavailable (Gemini quota/rate limit). Try again later.`;
  }
  if (
    lower.includes("network") ||
    lower.includes("timeout") ||
    lower.includes("econnrefused") ||
    lower.includes("failed to fetch")
  ) {
    return `${label} could not reach the server. Check your connection and try again.`;
  }
  if (raw) {
    return `${label} failed: ${raw}`;
  }
  return `${label} failed. Please try again.`;
}

/** @deprecated Use practiceAiLimitMessage */
export const guestAiLimitMessage = (data?: PracticeAiLimitErrorBody) =>
  practiceAiLimitMessage(data, false);

export {
  GUEST_AI_DAILY_LIMIT,
  GUEST_ID_COOKIE,
  PRACTICE_AI_LIMIT_ERROR,
  USER_AI_DAILY_LIMIT,
};
