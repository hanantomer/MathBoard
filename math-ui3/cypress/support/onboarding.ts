/** Matches math-ui3/src/store/pinia/onboardingStore.ts */
export const ONBOARDING_STORAGE_KEY = "mathboard-onboarding-v1";

const COACH_MARK_IDS = [
  "invite-app-bar",
  "online-students",
  "tool-selection",
  "tool-line",
  "tool-text",
];

export function seedOnboardingStorage(win: Window) {
  const dismissedHints: Record<string, boolean> = {};
  for (const id of COACH_MARK_IDS) {
    dismissedHints[id] = true;
  }
  win.localStorage.setItem(
    ONBOARDING_STORAGE_KEY,
    JSON.stringify({
      dismissedHints,
      teacherChecklistDismissed: true,
      emptyLessonOverlayDismissed: true,
    }),
  );
}
