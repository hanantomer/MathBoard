import { seoConfig } from "../config/seoConfig";

export const ADS_TAG_ID =
  import.meta.env.VITE_AW_ID?.trim() || seoConfig.analytics.conversionTrackingId;

/** Subscribe conversion from Google Ads — teacher/student sign-up and first practice visit. */
const SUBSCRIBE_LABEL =
  import.meta.env.VITE_AW_CONV_SUBSCRIBE?.trim() || "wRJ4COLFnPscEPvTqYpD";
const SUBSCRIBE_VALUE = 1;
const SUBSCRIBE_CURRENCY = "ILS";

export type AdsConversionKind =
  | "start_practice"
  | "teacher_signup"
  | "student_signup";

const PRACTICE_SESSION_KEY = "mathboard_start_practice_tracked";

function gtag(...args: unknown[]): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") {
    return;
  }
  window.gtag(...args);
}

/**
 * GA4 event plus an Ads conversion. Subscribe snippet
 * (AW-18006829563/wRJ4COLFnPscEPvTqYpD, 1 ILS) for sign-up and practice.
 */
export function trackAdsConversion(
  kind: AdsConversionKind,
  extra: Record<string, string> = {},
): void {
  if (kind === "start_practice") {
    gtag("event", "start_practice", {
      value: SUBSCRIBE_VALUE,
      currency: SUBSCRIBE_CURRENCY,
      ...extra,
    });
  } else {
    gtag("event", "sign_up", {
      method: extra.method || "email",
      user_type: kind === "teacher_signup" ? "teacher" : "student",
      value: SUBSCRIBE_VALUE,
      currency: SUBSCRIBE_CURRENCY,
    });
  }

  gtag("event", "conversion", {
    send_to: `${ADS_TAG_ID}/${SUBSCRIBE_LABEL}`,
    value: SUBSCRIBE_VALUE,
    currency: SUBSCRIBE_CURRENCY,
  });
}

/** First practice visit this tab only — catalog then blank sheet should not count twice. */
export function trackStartPracticeOnce(surface: string): void {
  try {
    if (sessionStorage.getItem(PRACTICE_SESSION_KEY)) return;
    sessionStorage.setItem(PRACTICE_SESSION_KEY, "1");
  } catch {
    /* private mode */
  }
  trackAdsConversion("start_practice", { surface });
}
