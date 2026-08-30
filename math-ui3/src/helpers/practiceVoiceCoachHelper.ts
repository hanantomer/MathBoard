import type { PracticeCoachResult } from "common/practiceQuestionTypes";
import {
  PRACTICE_ASSIST_MODE_KEY,
  PRACTICE_ASSIST_PAUSE_KEY,
  type PracticeAssistMode,
} from "common/globals";

const BOARD_DEBOUNCE_MS = 4500;
/** Longer pause so prose tips wait for a thought, not a mid-sentence keystroke. */
const TEXT_DEBOUNCE_MS = 6500;
const MIN_COACH_INTERVAL_MS = 22000;

let debounceTimer: ReturnType<typeof setTimeout> | undefined;
let inFlight = false;
let lastCoachedWork = "";
let lastCoachedTip = "";
let lastCoachAt = 0;
let requestId = 0;

export function getPracticeAssistMode(): PracticeAssistMode {
  try {
    const raw = localStorage.getItem(PRACTICE_ASSIST_MODE_KEY);
    if (raw === "text" || raw === "voice" || raw === "check") return raw;
  } catch {
    /* ignore */
  }
  return "check";
}

export function setPracticeAssistMode(mode: PracticeAssistMode) {
  try {
    localStorage.setItem(PRACTICE_ASSIST_MODE_KEY, mode);
  } catch {
    /* ignore */
  }
  if (mode !== "voice") {
    stopPracticeVoice();
  }
}

export function isLiveCoachMode(mode: PracticeAssistMode): boolean {
  return mode === "text" || mode === "voice";
}

export function isPracticeCoachPaused(): boolean {
  try {
    return localStorage.getItem(PRACTICE_ASSIST_PAUSE_KEY) === "1";
  } catch {
    return false;
  }
}

export function setPracticeCoachPaused(paused: boolean) {
  try {
    localStorage.setItem(PRACTICE_ASSIST_PAUSE_KEY, paused ? "1" : "0");
  } catch {
    /* ignore */
  }
  if (paused) {
    resetPracticeVoiceCoach();
  }
}

export function wasPracticeTipSpokenRecently(withinMs = 8000): boolean {
  return lastCoachAt > 0 && Date.now() - lastCoachAt < withinMs;
}

export function stopPracticeVoice() {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

/** Prefer natural-sounding English voices when the OS/browser provides them. */
function pickHumanVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  const english = voices.filter((v) =>
    v.lang.toLowerCase().startsWith("en"),
  );
  const pool = english.length ? english : voices;

  const preferredNamePatterns = [
    /neural/i,
    /natural/i,
    /google.*english.*(female|male)/i,
    /microsoft.*(aria|jenny|guy|sara|davis|tony|nancy)/i,
    /\bsamantha\b/i,
    /\ballison\b/i,
    /\bava\b/i,
    /\bsusan\b/i,
    /\bzira\b/i,
    /\bdavid\b/i,
  ];

  for (const pattern of preferredNamePatterns) {
    const match = pool.find((v) => pattern.test(v.name));
    if (match) return match;
  }

  // Chrome's remote Google voices usually sound less robotic than local ones.
  const remote = pool.find((v) => !v.localService);
  if (remote) return remote;

  return pool.find((v) => v.default) ?? pool[0] ?? null;
}

let cachedVoice: SpeechSynthesisVoice | null | undefined;
let voicesListenerAttached = false;

function ensureVoicesLoaded() {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  if (voicesListenerAttached) return;
  voicesListenerAttached = true;
  window.speechSynthesis.addEventListener("voiceschanged", () => {
    cachedVoice = undefined;
  });
}

export function speakPracticeTip(tip: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  if (!tip.trim()) return;

  ensureVoicesLoaded();
  window.speechSynthesis.cancel();

  const utter = new SpeechSynthesisUtterance(tip.trim());
  if (cachedVoice === undefined) {
    cachedVoice = pickHumanVoice();
  }
  if (cachedVoice) {
    utter.voice = cachedVoice;
    utter.lang = cachedVoice.lang;
  } else {
    utter.lang = "en-US";
  }
  // Slightly slower + neutral pitch reads more naturally for tutoring.
  utter.rate = 0.95;
  utter.pitch = 1;
  utter.volume = 1;
  window.speechSynthesis.speak(utter);
}

type CoachDeps = {
  questionUUId: string;
  mode: PracticeAssistMode;
  /** Live FreeText draft uses a longer debounce than grid/symbol work. */
  source?: "board" | "text";
  getStudentWork: () => string;
  requestCoach: (
    questionUUId: string,
    studentWork: string,
  ) => Promise<PracticeCoachResult>;
  onTip?: (tip: string) => void;
  onError?: (error: unknown) => void;
  onQuota?: (remaining: number, limit: number) => void;
  onBusy?: (busy: boolean) => void;
};

/**
 * Schedule a coaching tip after the student pauses writing.
 * Used for textual and vocal assist modes.
 */
export function schedulePracticeVoiceCoach(deps: CoachDeps) {
  if (!isLiveCoachMode(deps.mode)) return;
  if (isPracticeCoachPaused()) return;
  clearTimeout(debounceTimer);
  const myRequest = ++requestId;
  const delay =
    deps.source === "text" ? TEXT_DEBOUNCE_MS : BOARD_DEBOUNCE_MS;

  debounceTimer = setTimeout(() => {
    void runCoach(deps, myRequest);
  }, delay);
}

export function notePracticeCoachUtterance(tip: string) {
  lastCoachedTip = tip.trim();
  lastCoachAt = Date.now();
}

export function resetPracticeVoiceCoach() {
  clearTimeout(debounceTimer);
  debounceTimer = undefined;
  inFlight = false;
  lastCoachedWork = "";
  lastCoachedTip = "";
  lastCoachAt = 0;
  requestId += 1;
  stopPracticeVoice();
}

async function runCoach(deps: CoachDeps, myRequest: number) {
  if (!isLiveCoachMode(deps.mode)) return;
  if (isPracticeCoachPaused()) return;
  if (myRequest !== requestId) return;
  if (inFlight) return;

  const studentWork = deps.getStudentWork().trim();
  if (!studentWork) return;
  if (studentWork === lastCoachedWork) return;

  const wait = lastCoachAt > 0 ? MIN_COACH_INTERVAL_MS - (Date.now() - lastCoachAt) : 0;
  if (wait > 0) {
    debounceTimer = setTimeout(() => {
      void runCoach(deps, myRequest);
    }, wait);
    return;
  }

  inFlight = true;
  deps.onBusy?.(true);
  try {
    const result = await deps.requestCoach(deps.questionUUId, studentWork);
    if (myRequest !== requestId) return;
    if (
      typeof result.remaining === "number" &&
      typeof result.limit === "number"
    ) {
      deps.onQuota?.(result.remaining, result.limit);
    }
    if (!result.speak || !result.tip.trim()) {
      lastCoachedWork = studentWork;
      lastCoachedTip = "";
      deps.onTip?.("");
      return;
    }
    if (result.tip === lastCoachedTip && studentWork === lastCoachedWork) {
      return;
    }

    lastCoachedWork = studentWork;
    lastCoachedTip = result.tip;
    lastCoachAt = Date.now();
    deps.onTip?.(result.tip);
    if (deps.mode === "voice") {
      speakPracticeTip(result.tip);
    }
  } catch (error) {
    console.warn("Practice coach failed:", error);
    deps.onError?.(error);
  } finally {
    inFlight = false;
    deps.onBusy?.(false);
  }
}
