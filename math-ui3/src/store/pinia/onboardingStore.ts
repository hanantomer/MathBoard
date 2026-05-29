import { defineStore } from "pinia";
import { ref, computed } from "vue";
import {
  COACH_MARKS,
  type CoachMarkDef,
} from "../../constants/helpCopy";

const STORAGE_KEY = "mathboard-onboarding-v1";

type StoredState = {
  dismissedHints: Record<string, boolean>;
  teacherChecklistDismissed: boolean;
  emptyLessonOverlayDismissed: boolean;
};

function loadState(): StoredState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as StoredState;
    }
  } catch {
    /* ignore */
  }
  return {
    dismissedHints: {},
    teacherChecklistDismissed: false,
    emptyLessonOverlayDismissed: false,
  };
}

function saveState(state: StoredState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export const useOnboardingStore = defineStore("onboarding", () => {
  const stored = loadState();
  const dismissedHints = ref<Record<string, boolean>>({
    ...stored.dismissedHints,
  });
  const teacherChecklistDismissed = ref(stored.teacherChecklistDismissed);
  const emptyLessonOverlayDismissed = ref(stored.emptyLessonOverlayDismissed);
  const helpDrawerOpen = ref(false);
  const activeCoachMark = ref<CoachMarkDef | null>(null);
  const coachMarkQueue = ref<string[]>([]);

  function persist() {
    saveState({
      dismissedHints: dismissedHints.value,
      teacherChecklistDismissed: teacherChecklistDismissed.value,
      emptyLessonOverlayDismissed: emptyLessonOverlayDismissed.value,
    });
  }

  function isHintDismissed(id: string): boolean {
    return !!dismissedHints.value[id];
  }

  function dismissHint(id: string) {
    dismissedHints.value = { ...dismissedHints.value, [id]: true };
    persist();
  }

  function dismissTeacherChecklist() {
    teacherChecklistDismissed.value = true;
    persist();
  }

  function dismissEmptyLessonOverlay() {
    emptyLessonOverlayDismissed.value = true;
    persist();
  }

  function openHelpDrawer() {
    helpDrawerOpen.value = true;
  }

  function closeHelpDrawer() {
    helpDrawerOpen.value = false;
  }

  function findCoachMark(id: string): CoachMarkDef | undefined {
    return COACH_MARKS.find((m) => m.id === id);
  }

  function isTargetVisible(selector: string): boolean {
    const el = document.querySelector(selector);
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  function showCoachMark(id: string) {
    if (isHintDismissed(id)) return;
    const mark = findCoachMark(id);
    if (!mark || !isTargetVisible(mark.targetSelector)) return;
    activeCoachMark.value = mark;
  }

  function queueCoachMarks(ids: string[]) {
    coachMarkQueue.value = ids.filter(
      (id) => !isHintDismissed(id) && findCoachMark(id),
    );
    showNextCoachMark();
  }

  function showNextCoachMark() {
    activeCoachMark.value = null;
    while (coachMarkQueue.value.length > 0) {
      const id = coachMarkQueue.value.shift()!;
      if (isHintDismissed(id)) continue;
      const mark = findCoachMark(id);
      if (!mark) continue;
      if (!isTargetVisible(mark.targetSelector)) continue;
      activeCoachMark.value = mark;
      return;
    }
  }

  function dismissActiveCoachMark(andNext = true) {
    if (activeCoachMark.value) {
      dismissHint(activeCoachMark.value.id);
    }
    activeCoachMark.value = null;
    if (andNext) {
      setTimeout(showNextCoachMark, 300);
    }
  }

  function tryShowToolCoachMark(toolKey: string) {
    const id = toolKey === "selection" ? "tool-selection" : undefined;
    const fromMap =
      toolKey === "Line"
        ? "tool-line"
        : toolKey === "FreeText"
          ? "tool-text"
          : id;
    if (fromMap) {
      showCoachMark(fromMap);
    }
  }

  function startLessonTour() {
    queueCoachMarks(["invite-app-bar", "online-students"]);
  }

  const shouldShowTeacherChecklist = computed(
    () => !teacherChecklistDismissed.value,
  );

  return {
    dismissedHints,
    teacherChecklistDismissed,
    emptyLessonOverlayDismissed,
    helpDrawerOpen,
    activeCoachMark,
    isHintDismissed,
    dismissHint,
    dismissTeacherChecklist,
    dismissEmptyLessonOverlay,
    shouldShowTeacherChecklist,
    openHelpDrawer,
    closeHelpDrawer,
    showCoachMark,
    queueCoachMarks,
    dismissActiveCoachMark,
    tryShowToolCoachMark,
    startLessonTour,
  };
});
