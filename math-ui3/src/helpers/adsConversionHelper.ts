import { seoConfig } from "../config/seoConfig";

export const ADS_TAG_ID =
  import.meta.env.VITE_AW_ID?.trim() || seoConfig.analytics.conversionTrackingId;

/** Subscribe conversion from Google Ads — same event for teacher and student sign-up. */
const SUBSCRIBE_LABEL =
  import.meta.env.VITE_AW_CONV_SUBSCRIBE?.trim() || "wRJ4COLFnPscEPvTqYpD";
const SUBSCRIBE_VALUE = 1;
const SUBSCRIBE_CURRENCY = "ILS";

/** Dummy values for GA4 until paid plans exist. */
export const ADS_CONVERSION_VALUES = {
  start_practice: 1,
  teacher_signup: 10,
  student_signup: 3,
} as const;

export type AdsConversionKind = keyof typeof ADS_CONVERSION_VALUES;

const PRACTICE_SESSION_KEY = "mathboard_start_practice_tracked";

const LABELS: Record<AdsConversionKind, string | undefined> = {
  start_practice: import.meta.env.VITE_AW_CONV_START_PRACTICE?.trim(),
  teacher_signup: SUBSCRIBE_LABEL,
  student_signup: SUBSCRIBE_LABEL,
};

function gtag(...args: unknown[]): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") {
    return;
  }
  window.gtag(...args);
}

function adsConversionPayload(
  kind: AdsConversionKind,
): { send_to: string; value: number; currency: string } | null {
  if (kind === "start_practice") {
    const label = LABELS.start_practice;
    if (!label) return null;
    return {
      send_to: `${ADS_TAG_ID}/${label}`,
      value: ADS_CONVERSION_VALUES.start_practice,
      currency: "USD",
    };
  }
  return {
    send_to: `${ADS_TAG_ID}/${SUBSCRIBE_LABEL}`,
    value: SUBSCRIBE_VALUE,
    currency: SUBSCRIBE_CURRENCY,
  };
}

/**
 * GA4 event plus an Ads conversion. Sign-up uses the Subscribe snippet
 * (AW-18006829563/wRJ4COLFnPscEPvTqYpD, 1 ILS) for teacher and student.
 */
export function trackAdsConversion(
  kind: AdsConversionKind,
  extra: Record<string, string> = {},
): void {
  if (kind === "start_practice") {
    gtag("event", "start_practice", {
      value: ADS_CONVERSION_VALUES.start_practice,
      currency: "USD",
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

  const payload = adsConversionPayload(kind);
  if (payload) gtag("event", "conversion", payload);
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
