import type { PracticeCoachResult } from "common/practiceQuestionTypes";

const MUTE_KEY = "mathboard-practice-voice-muted";
const DEBOUNCE_MS = 1600;
const MIN_SPEAK_INTERVAL_MS = 5000;

let debounceTimer: ReturnType<typeof setTimeout> | undefined;
let inFlight = false;
let lastSpokenWork = "";
let lastSpokenTip = "";
let lastSpeakAt = 0;
let requestId = 0;

export function isPracticeVoiceMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    return false;
  }
}

export function setPracticeVoiceMuted(muted: boolean) {
  try {
    localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
  } catch {
    /* ignore */
  }
  if (muted) {
    stopPracticeVoice();
  }
}

export function stopPracticeVoice() {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

export function speakPracticeTip(tip: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  if (!tip.trim() || isPracticeVoiceMuted()) return;

  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(tip.trim());
  utter.rate = 1.05;
  utter.pitch = 1;
  utter.volume = 1;
  window.speechSynthesis.speak(utter);
}

type CoachDeps = {
  questionUUId: string;
  getStudentWork: () => string;
  requestCoach: (
    questionUUId: string,
    studentWork: string,
  ) => Promise<PracticeCoachResult>;
  onTip?: (tip: string) => void;
  onError?: (error: unknown) => void;
  onQuota?: (remaining: number, limit: number) => void;
};

/**
 * Schedule a voice tip after the student pauses writing (sequence end).
 * Debounced + rate-limited so it does not talk after every symbol.
 */
export function schedulePracticeVoiceCoach(deps: CoachDeps) {
  clearTimeout(debounceTimer);
  const myRequest = ++requestId;

  debounceTimer = setTimeout(() => {
    void runCoach(deps, myRequest);
  }, DEBOUNCE_MS);
}

export function resetPracticeVoiceCoach() {
  clearTimeout(debounceTimer);
  debounceTimer = undefined;
  inFlight = false;
  lastSpokenWork = "";
  lastSpokenTip = "";
  lastSpeakAt = 0;
  requestId += 1;
  stopPracticeVoice();
}

async function runCoach(deps: CoachDeps, myRequest: number) {
  if (myRequest !== requestId) return;
  if (isPracticeVoiceMuted()) return;
  if (inFlight) return;

  const studentWork = deps.getStudentWork().trim();
  if (!studentWork) return;
  if (studentWork === lastSpokenWork) return;

  const now = Date.now();
  if (now - lastSpeakAt < MIN_SPEAK_INTERVAL_MS) return;

  inFlight = true;
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
      lastSpokenWork = studentWork;
      return;
    }
    if (result.tip === lastSpokenTip && studentWork === lastSpokenWork) {
      return;
    }

    lastSpokenWork = studentWork;
    lastSpokenTip = result.tip;
    lastSpeakAt = Date.now();
    deps.onTip?.(result.tip);
    speakPracticeTip(result.tip);
  } catch (error) {
    console.warn("Practice voice coach failed:", error);
    deps.onError?.(error);
  } finally {
    inFlight = false;
  }
}
