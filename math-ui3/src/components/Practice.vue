<template>
  <v-sheet class="practice-host">
    <PracticeProblemPane
      v-if="loaded && !loadError"
      :session="session"
      :is-blank="isBlank"
      :extracting="extractingParts"
      :uploading="uploading"
      :order-hint="partOrderHint"
      @submit-text="submitProblemText"
      @submit-image="submitProblemImageFile"
      @select-part="onSelectPart"
      @change-problem="onChangeProblem"
    >
      <template #assist>
        <div class="practice-pane-assist">
          <v-btn-toggle
            v-model="assistMode"
            mandatory
            density="compact"
            color="primary"
            variant="outlined"
            divided
            data-cy="practice-assist-mode"
          >
            <v-btn
              value="check"
              title="Grade when you ask"
              data-cy="practice-assist-check"
            >
              Check
            </v-btn>
            <v-btn
              value="text"
              title="Tips while you write"
              data-cy="practice-assist-text"
            >
              Text
            </v-btn>
            <v-btn
              value="voice"
              title="Spoken tips while you write"
              data-cy="practice-assist-voice"
            >
              Voice
            </v-btn>
          </v-btn-toggle>

          <v-tooltip
            :text="checkDisabledReason"
            :disabled="!checkDisabledReason"
            location="bottom"
          >
            <template #activator="{ props: tipProps }">
              <div v-bind="tipProps" class="practice-pane-assist__check-wrap">
                <v-btn
                  color="primary"
                  variant="flat"
                  :loading="checking"
                  :disabled="!!checkDisabledReason"
                  prepend-icon="mdi-check-decagram"
                  :data-cy="isBlank ? 'practice-blank-check' : 'practice-check'"
                  @click="runCheck"
                >
                  Check answer
                </v-btn>
              </div>
            </template>
          </v-tooltip>

          <v-btn
            v-if="isLiveCoach && !aiQuotaExhausted"
            :color="coachPaused ? 'grey' : 'secondary'"
            variant="tonal"
            :prepend-icon="coachPaused ? 'mdi-play' : 'mdi-pause'"
            data-cy="practice-coach-pause"
            @click="toggleCoachPause"
          >
            {{ coachPaused ? "Resume tips" : "Pause tips" }}
          </v-btn>

          <div
            v-if="isLiveCoach && !aiQuotaExhausted"
            class="practice-pane-assist__status"
            data-cy="practice-coach-status"
          >
            <v-icon size="16" :icon="coachStatusIcon" />
            <span>{{ coachStatusText }}</span>
          </div>

          <v-btn
            v-if="showGuestLowQuotaCta"
            color="primary"
            size="small"
            variant="flat"
            data-cy="practice-guest-signin"
            @click="goSignIn"
          >
            Sign in for a higher limit
          </v-btn>

          <button
            type="button"
            class="practice-quota-chip"
            data-cy="practice-quota-chip"
            @click="quotaExpanded = !quotaExpanded"
          >
            {{ quotaChipText }}
          </button>

          <v-alert
            v-if="uploadError"
            density="compact"
            variant="tonal"
            type="error"
            closable
            @click:close="uploadError = ''"
          >
            {{ uploadError }}
          </v-alert>

          <v-alert
            v-if="quotaExpanded && !aiLimitMessage && !aiUnavailableMessage"
            density="compact"
            variant="tonal"
            type="info"
            title="AI tutor quota"
            closable
            @click:close="quotaExpanded = false"
          >
            {{ quotaDetailText }}
          </v-alert>

          <v-alert
            v-if="aiLimitMessage"
            density="compact"
            variant="tonal"
            type="warning"
            title="Daily AI limit reached"
            closable
            @click:close="dismissAiLimitMessage"
          >
            <div>{{ aiLimitMessage }}</div>
            <div v-if="quotaLimit != null" class="text-medium-emphasis mt-1">
              Used {{ quotaLimit }} of {{ quotaLimit }} AI uses today (resets at
              midnight UTC).
            </div>
            <v-btn
              v-if="isGuest"
              class="mt-2"
              color="primary"
              size="small"
              variant="flat"
              @click="goSignIn"
            >
              Sign in for a higher limit
            </v-btn>
          </v-alert>

          <v-alert
            v-else-if="aiUnavailableMessage"
            density="compact"
            variant="tonal"
            type="error"
            title="AI tutor unavailable"
            closable
            @click:close="aiUnavailableMessage = ''"
          >
            {{ aiUnavailableMessage }}
          </v-alert>
        </div>
      </template>
    </PracticeProblemPane>

    <mathBoard
      v-show="loaded && !loadError"
      :svgId="svgId"
      :loaded="loaded"
      :practice-gutter="session.submitted"
      :practice-gutter-marks="practiceGutterMarks"
      @select-practice-part="onSelectPart"
    />

    <div v-if="loadError" class="practice-load-error">
      <v-alert type="error" variant="tonal" title="Couldn't load this practice question">
        <div>{{ loadError }}</div>
        <v-btn class="mt-3" color="primary" variant="flat" @click="goPracticeList">
          Back to practice
        </v-btn>
      </v-alert>
    </div>

    <PracticeCoachBalloon
      v-if="showCoachBalloon"
      :tip="coachTip"
      :svg-id="svgId"
      :notations="liveNotations"
      :title="coachBalloonTitle"
      :variant="coachBalloonVariant"
      :speaking="assistMode === 'voice'"
      @close="dismissCoachTip"
    >
      <v-btn
        v-if="showCoachMisreadAction"
        color="secondary"
        size="small"
        variant="text"
        data-cy="practice-wrong-problem"
        @click="reportMisreadImage"
      >
        Wrong problem?
      </v-btn>
    </PracticeCoachBalloon>

    <PracticeCoachBalloon
      v-if="showResultBalloon"
      :tip="resultBalloonText"
      :svg-id="svgId"
      :notations="liveNotations"
      :title="resultBalloonTitle"
      :variant="resultBalloonVariant"
      @close="result = null"
    >
      <v-btn
        v-if="result?.correct && nextQuestionUUId && allPartsComplete"
        color="primary"
        size="small"
        variant="flat"
        data-cy="practice-next-question"
        @click="goNextQuestion"
      >
        Next question
      </v-btn>
      <v-btn
        v-else-if="showResultMisreadAction"
        color="secondary"
        size="small"
        variant="text"
        data-cy="practice-wrong-problem"
        @click="reportMisreadImage"
      >
        Wrong problem?
      </v-btn>
    </PracticeCoachBalloon>

    <v-dialog
      v-model="showClearProblemDialog"
      max-width="400"
      persistent
    >
      <v-card rounded="lg">
        <v-card-title class="pt-4 px-4 text-wrap">
          Clear this problem?
        </v-card-title>
        <v-card-text class="px-4">
          The question and your writing on the board will be removed. You can paste a new problem after that.
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-spacer />
          <v-btn
            variant="text"
            data-cy="practice-clear-problem-cancel"
            @click="showClearProblemDialog = false"
          >
            Keep problem
          </v-btn>
          <v-btn
            color="error"
            variant="flat"
            data-cy="practice-clear-problem-confirm"
            @click="confirmClearProblem"
          >
            Clear problem
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-sheet>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import mathBoard from "./MathBoard.vue";
import PracticeCoachBalloon from "./PracticeCoachBalloon.vue";
import PracticeProblemPane from "./PracticeProblemPane.vue";
import { useQuestionStore } from "../store/pinia/questionStore";
import { usePracticeQuestionStore } from "../store/pinia/practiceQuestionStore";
import { useBoardContextStore } from "../store/pinia/boardContextStore";
import { useNotationStore } from "../store/pinia/notationStore";
import { useEditModeStore } from "../store/pinia/editModeStore";
import { useOnboardingStore } from "../store/pinia/onboardingStore";
import useApiHelper, { PracticeAiLimitError } from "../helpers/apiHelper";
import { useCellStore } from "../store/pinia/cellStore";
import { useUserStore } from "../store/pinia/userStore";
import { usePracticeStore } from "../store/pinia/practiceStore";
import {
  serializePracticeStudentWork,
} from "../helpers/practiceCheckHelper";
import {
  PRACTICE_IMAGE_MISREAD_TIP,
  PRACTICE_IMAGE_UNREADABLE_TIP,
  isPracticeImageReadTip,
} from "../helpers/practiceImagePrep";
import { PRACTICE_BLANK_UUID } from "../helpers/practiceBoardAdapter";
import {
  practiceWorkFromCol,
  ensurePartRow,
  overlayGutterMarks,
} from "../helpers/practicePartLabelHelper";
import {
  canActivatePart,
  lockedPartHint,
  partIdForRow,
  partStatus,
  startedPartIdsFromSession,
} from "../helpers/practicePartOrderHelper";
import { activePartLooksComplete } from "common/practiceAlgebra";
import useImageHelper from "../helpers/imageHelper";
import useEventBus from "../helpers/eventBusHelper";
import useSelectionHelper from "../helpers/selectionHelper";
import {
  ensureNumberedParts,
  partLabelText,
  workForActivePartReview,
} from "common/practiceParts";
import {
  GUEST_AI_DAILY_LIMIT,
  USER_AI_DAILY_LIMIT,
  markPracticeAiLimitAlertShown,
  wasPracticeAiLimitAlertShown,
} from "../helpers/guestPracticeHelper";
import type { PracticeAssistMode } from "common/globals";
import {
  getPracticeAssistMode,
  isLiveCoachMode,
  isPracticeCoachPaused,
  notePracticeCoachUtterance,
  invalidatePracticeVoiceCoach,
  resetPracticeVoiceCoach,
  schedulePracticeVoiceCoach,
  setPracticeAssistMode,
  setPracticeCoachPaused,
  speakPracticeTip,
  stopPracticeVoice,
  wasPracticeTipSpokenRecently,
} from "../helpers/practiceVoiceCoachHelper";
import type { PracticeCheckResult } from "common/practiceQuestionTypes";

const questionStore = useQuestionStore();
const practiceQuestionStore = usePracticeQuestionStore();
const boardContext = useBoardContextStore();
const notationStore = useNotationStore();
const editModeStore = useEditModeStore();
const onboardingStore = useOnboardingStore();
const cellStore = useCellStore();
const userStore = useUserStore();
const practiceStore = usePracticeStore();
const api = useApiHelper();
const imageHelper = useImageHelper();
const eventBus = useEventBus();
const selectionHelper = useSelectionHelper();

const route = useRoute();
const router = useRouter();

const svgId = "practiceSvg";
const loaded = ref(false);
const isBlank = ref(false);
const checking = ref(false);
const uploading = ref(false);
const extractingParts = ref(false);
const coachingBusy = ref(false);
const result = ref<PracticeCheckResult | null>(null);
const checkError = ref("");
const aiLimitMessage = ref("");
const aiUnavailableMessage = ref("");
const uploadError = ref("");
const loadError = ref("");
const partOrderHint = ref("");
const coachTip = ref("");
const coachNoteKind = ref<"tip" | "preliminary" | "image">("tip");
const currentQuestionUUId = ref("");
const assistMode = ref<PracticeAssistMode>(getPracticeAssistMode());
const coachPaused = ref(isPracticeCoachPaused());
const quotaRemaining = ref<number | null>(null);
const quotaLimit = ref<number | null>(null);
const quotaExpanded = ref(false);
const suppressBalloon = ref(false);
const preliminaryArmed = ref(false);
const showClearProblemDialog = ref(false);
let practiceTourTimer: ReturnType<typeof setTimeout> | undefined;
let unsuppressBalloonTimer: ReturnType<typeof setTimeout> | undefined;
let autoCheckTimer: ReturnType<typeof setTimeout> | undefined;
let armPreliminaryTimer: ReturnType<typeof setTimeout> | undefined;
let preliminaryInFlight = false;

const isGuest = computed(() => !userStore.getCurrentUser());
const isLiveCoach = computed(() => isLiveCoachMode(assistMode.value));

const liveNotations = computed(() => notationStore.getNotations());

const session = computed(() => {
  void practiceStore.sessions;
  return practiceStore.getSession(
    currentQuestionUUId.value || PRACTICE_BLANK_UUID,
  );
});

const practiceGutterMarks = computed(() => {
  const s = session.value;
  if (!s.submitted) return [];
  const notations = liveNotations.value;
  const started = startedPartIdsFromSession(s);
  const active = (s.activePartId || s.parts[0]?.id || "1").trim();
  const marks = overlayGutterMarks(notations, active, s.partLabelRows).filter(
    (m) => started.includes(m.id),
  );
  const withMeta = marks.map((m) => ({
    ...m,
    label: partLabelText(m.id),
    status: partStatus(m.id, started, s.completedPartIds),
  }));
  if (withMeta.length) return withMeta;
  if (!started.includes(active)) return [];
  return [
    {
      row: 0,
      id: active,
      label: partLabelText(active),
      status: partStatus(active, started, s.completedPartIds),
    },
  ];
});

const hasProblemImage = computed(() => !!session.value.problemImageBase64);

const checkDisabledReason = computed(() => {
  if (checking.value) return "";
  if (aiQuotaExhausted.value) return "Daily AI limit reached";
  if (!session.value.submitted) return "Paste the problem first";
  return "";
});

const quotaChipText = computed(() => {
  if (quotaRemaining.value != null) {
    return `${quotaRemaining.value} left`;
  }
  return isGuest.value
    ? `${GUEST_AI_DAILY_LIMIT} guest uses / day`
    : `${USER_AI_DAILY_LIMIT} uses / day`;
});

const quotaDetailText = computed(() => {
  const who = isGuest.value ? "Guest" : "Signed-in";
  if (quotaRemaining.value != null && quotaLimit.value != null) {
    return `${who}: ${quotaRemaining.value} of ${quotaLimit.value} AI uses left today. Resets at midnight UTC.`;
  }
  return isGuest.value
    ? `Guest mode: ${GUEST_AI_DAILY_LIMIT} free AI uses per day. Sign in for ${USER_AI_DAILY_LIMIT}/day.`
    : `${USER_AI_DAILY_LIMIT} AI uses per day.`;
});

const showGuestLowQuotaCta = computed(() => {
  if (!isGuest.value || aiQuotaExhausted.value) return false;
  if (quotaRemaining.value == null) return false;
  return quotaRemaining.value > 0 && quotaRemaining.value < 5;
});

const coachStatusIcon = computed(() => {
  if (coachPaused.value) return "mdi-pause-circle-outline";
  if (coachingBusy.value) return "mdi-progress-clock";
  return "mdi-eye-outline";
});

const coachStatusText = computed(() => {
  const left =
    quotaRemaining.value != null ? ` · ${quotaRemaining.value} left` : "";
  if (!session.value.submitted) return `Paste the problem${left}`;
  if (coachPaused.value) return `Tips paused${left}`;
  if (coachingBusy.value) return `Thinking…${left}`;
  return `Coach is watching${left}`;
});

const showCoachBalloon = computed(
  () =>
    !!coachTip.value &&
    !aiQuotaExhausted.value &&
    !suppressBalloon.value &&
    !result.value &&
    (isLiveCoach.value ||
      coachNoteKind.value === "preliminary" ||
      coachNoteKind.value === "image"),
);

const coachBalloonTitle = computed(() => {
  if (coachNoteKind.value === "preliminary") return "Getting started";
  if (coachNoteKind.value === "image") return "Worksheet image";
  return "Coach";
});

const coachBalloonVariant = computed(() =>
  coachNoteKind.value === "image" || isPracticeImageReadTip(coachTip.value)
    ? "warning"
    : "tip",
);

const showCoachMisreadAction = computed(
  () => hasProblemImage.value && !isPracticeImageReadTip(coachTip.value),
);

const showResultMisreadAction = computed(
  () =>
    hasProblemImage.value &&
    !!result.value &&
    !result.value.correct &&
    !isPracticeImageReadTip(result.value.feedback),
);

const showResultBalloon = computed(
  () => !!result.value && !suppressBalloon.value,
);

const resultBalloonText = computed(() => {
  if (!result.value) return "";
  const extra = result.value.correct
    ? result.value.warning
    : result.value.hint;
  return extra
    ? `${result.value.feedback} ${extra}`.trim()
    : result.value.feedback;
});

const resultBalloonTitle = computed(() => {
  if (!result.value) return "";
  if (isPracticeImageReadTip(result.value.feedback)) return "Worksheet image";
  if (result.value.correct && result.value.warning) {
    return "Correct, with a note";
  }
  return result.value.correct ? "Correct" : "Not quite";
});

const resultBalloonVariant = computed(() =>
  result.value?.correct ? "success" : "warning",
);

const nextQuestionUUId = computed(() => {
  if (isBlank.value) return "";
  const items = Array.from(practiceQuestionStore.getItems().values());
  if (items.length < 2) return "";
  const idx = items.findIndex((q) => q.uuid === currentQuestionUUId.value);
  if (idx < 0) return items[0]?.uuid ?? "";
  return items[idx + 1]?.uuid ?? "";
});

const allPartsComplete = computed(() => {
  const s = session.value;
  if (!s.submitted || s.parts.length === 0) return false;
  return s.parts.every((p) => s.completedPartIds.includes(p.id));
});

const aiQuotaExhausted = computed(() => quotaRemaining.value === 0);

function dismissAiLimitMessage() {
  aiLimitMessage.value = "";
  if (quotaLimit.value != null) {
    markPracticeAiLimitAlertShown(quotaLimit.value, !isGuest.value);
  }
}

function applyQuota(remaining?: number, limit?: number) {
  if (typeof remaining === "number") quotaRemaining.value = remaining;
  if (typeof limit === "number") quotaLimit.value = limit;
  if (remaining !== 0 || limit == null) return;
  if (wasPracticeAiLimitAlertShown(limit, !isGuest.value)) return;
  markPracticeAiLimitAlertShown(limit, !isGuest.value);
  aiLimitMessage.value = isGuest.value
    ? `You've used your ${limit} free AI uses for today. Sign in for a higher daily limit.`
    : `Daily AI limit reached (${limit} uses). Try again tomorrow.`;
}

async function refreshAiQuota() {
  try {
    const quota = await api.getPracticeAiQuota();
    applyQuota(quota.remaining, quota.limit);
  } catch {
    /* ignore — chip falls back to static copy */
  }
}

function currentStudentWork() {
  const s = session.value;
  return serializePracticeStudentWork(
    notationStore.getNotations(),
    practiceStore.textDraft,
    s.submitted
      ? { groupByParts: true, activePartId: s.activePartId }
      : undefined,
  );
}

const practiceWorkSignature = computed(() => currentStudentWork());

function currentProblemImage(): string | undefined {
  return session.value.problemImageBase64 ?? undefined;
}

function currentProblemText(): string | undefined {
  return session.value.problemText ?? undefined;
}

function currentParts() {
  return session.value.submitted ? session.value.parts : undefined;
}

function currentActivePartId() {
  return session.value.activePartId ?? undefined;
}

function dismissCoachTip() {
  coachTip.value = "";
  coachNoteKind.value = "tip";
}

function reportMisreadImage() {
  result.value = null;
  coachNoteKind.value = "image";
  coachTip.value = PRACTICE_IMAGE_MISREAD_TIP;
  suppressBalloon.value = false;
  stopPracticeVoice();
  if (assistMode.value === "voice") {
    speakPracticeTip(PRACTICE_IMAGE_MISREAD_TIP);
  }
}

function handleCoachError(error: unknown) {
  coachingBusy.value = false;
  if (error instanceof PracticeAiLimitError) {
    applyQuota(error.remaining ?? 0, error.limit);
    coachTip.value = "";
    return;
  }
  aiUnavailableMessage.value =
    error instanceof Error
      ? error.message
      : "AI tutor failed. Please try again.";
  coachTip.value = "";
}

async function raisePreliminaryCoachNote() {
  if (!currentQuestionUUId.value || !loaded.value) return;
  if (aiQuotaExhausted.value || coachPaused.value) return;
  if (checking.value || preliminaryInFlight) return;

  await nextTick();
  preliminaryInFlight = true;
  coachingBusy.value = true;
  try {
    const image = currentProblemImage();
    const result = await api.coachPracticeWork(
      currentQuestionUUId.value,
      currentStudentWork(),
      image,
      currentProblemText(),
      "preliminary",
      currentParts(),
      currentActivePartId(),
    );
    applyQuota(result.remaining, result.limit);
    let tip = result.speak ? result.tip.trim() : "";
    if (!tip && image) {
      tip = PRACTICE_IMAGE_UNREADABLE_TIP;
    }
    if (!tip) return;
    coachNoteKind.value = isPracticeImageReadTip(tip)
      ? "image"
      : "preliminary";
    coachTip.value = tip;
    suppressBalloon.value = false;
    aiUnavailableMessage.value = "";
    checkError.value = "";
    notePracticeCoachUtterance(tip);
    if (assistMode.value === "voice") {
      speakPracticeTip(tip);
    }
  } catch (error) {
    handleCoachError(error);
  } finally {
    preliminaryInFlight = false;
    coachingBusy.value = false;
  }
}

watch(
  () => session.value.submitted,
  (submitted, wasSubmitted) => {
    if (!preliminaryArmed.value) return;
    if (submitted && !wasSubmitted) {
      void raisePreliminaryCoachNote();
    }
  },
);

watch(
  () => cellStore.getSelectedCell()?.row,
  (row) => {
    const s = session.value;
    if (!s.submitted || typeof row !== "number") return;
    const bandId = partIdForRow(row, s.partLabelRows);
    if (!bandId || bandId === s.activePartId) return;
    const started = startedPartIdsFromSession(s);
    if (!started.includes(bandId)) return;
    practiceStore.setActivePart(
      currentQuestionUUId.value || PRACTICE_BLANK_UUID,
      bandId,
    );
  },
);

function toggleCoachPause() {
  coachPaused.value = !coachPaused.value;
  setPracticeCoachPaused(coachPaused.value);
  if (coachPaused.value) {
    dismissCoachTip();
  }
}

watch(assistMode, (mode, prev) => {
  setPracticeAssistMode(mode);
  coachTip.value = "";
  coachNoteKind.value = "tip";
  resetPracticeVoiceCoach();
  if (prev === "check" && mode !== "check") {
    result.value = null;
  }
});

watch(
  route,
  (to) => {
    if (to.name === "practiceBlank") {
      void loadBlankPractice();
      return;
    }
    void loadPractice(to.params.questionUUId as string);
  },
  { immediate: true },
);

watch(practiceWorkSignature, (work, prev) => {
  if (!loaded.value || !currentQuestionUUId.value) return;
  if (work === prev) return;
  const active = currentActivePartId();
  const slice = workForActivePartReview(work, active);
  const prevSlice = workForActivePartReview(prev ?? "", active);
  if (result.value && slice !== prevSlice && slice.trim()) {
    result.value = null;
  }
  invalidatePracticeVoiceCoach();
  dismissCoachTip();
  suppressBalloon.value = true;
  clearTimeout(unsuppressBalloonTimer);
  unsuppressBalloonTimer = setTimeout(() => {
    if (result.value) suppressBalloon.value = false;
  }, 1800);
  clearTimeout(autoCheckTimer);
  if (!work.trim()) return;
  if (!session.value.submitted) return;
  if (checking.value) return;

  const looksDone = activePartLooksComplete(
    currentProblemText(),
    work,
    currentActivePartId(),
  );
  if (looksDone) {
    autoCheckTimer = setTimeout(() => {
      void maybeAutoCheckPart();
    }, 1800);
    return;
  }

  if (!isLiveCoach.value) return;
  if (aiQuotaExhausted.value || coachPaused.value) return;

  schedulePracticeVoiceCoach({
    questionUUId: currentQuestionUUId.value,
    mode: assistMode.value,
    source: practiceStore.textDraft?.value.trim() ? "text" : "board",
    getStudentWork: () => currentStudentWork(),
    requestCoach: async (questionUUId, studentWork) => {
      return await api.coachPracticeWork(
        questionUUId,
        studentWork,
        currentProblemImage(),
        currentProblemText(),
        undefined,
        currentParts(),
        currentActivePartId(),
      );
    },
    onBusy: (busy) => {
      coachingBusy.value = busy;
    },
    onTip: (tip) => {
      if (checking.value || result.value) return;
      coachNoteKind.value = isPracticeImageReadTip(tip) ? "image" : "tip";
      coachTip.value = tip;
      suppressBalloon.value = false;
      aiUnavailableMessage.value = "";
      checkError.value = "";
    },
    onQuota: (remaining, limit) => {
      applyQuota(remaining, limit);
    },
    onError: handleCoachError,
  });
});

function onCheckShortcut(e: KeyboardEvent) {
  if (!(e.ctrlKey || e.metaKey) || e.key !== "Enter") return;
  const target = e.target as HTMLElement | null;
  const inFreeText =
    target?.id === "textAreaEl" ||
    editModeStore.getEditMode() === "TEXT_WRITING";
  if (
    (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA") &&
    !inFreeText
  ) {
    return;
  }
  if (editModeStore.getEditMode() === "ANNOTATION_WRITING") return;
  e.preventDefault();
  void runCheck();
}

const PROBLEM_PANE_WIDTH_VAR = "--practice-problem-pane-width";
const PROBLEM_PANE_TOP_VAR = "--practice-problem-pane-top";
let problemPaneObserver: ResizeObserver | undefined;

function clearProblemPaneOffset() {
  const host = document.querySelector(".practice-host") as HTMLElement | null;
  host?.style.removeProperty(PROBLEM_PANE_WIDTH_VAR);
  host?.style.removeProperty(PROBLEM_PANE_TOP_VAR);
  document.documentElement.style.removeProperty(PROBLEM_PANE_WIDTH_VAR);
  document.documentElement.style.removeProperty(PROBLEM_PANE_TOP_VAR);
}

function paneOffsetTarget(): HTMLElement {
  return (
    (document.querySelector(".practice-host") as HTMLElement | null) ??
    document.documentElement
  );
}

function syncProblemPaneOffset() {
  const el = document.querySelector(
    "[data-cy=practice-problem-pane]",
  ) as HTMLElement | null;
  const target = paneOffsetTarget();
  if (!el) {
    clearProblemPaneOffset();
    return;
  }
  const narrow = window.matchMedia("(max-width: 1023px)").matches;
  if (narrow) {
    target.style.setProperty(PROBLEM_PANE_WIDTH_VAR, "0px");
    target.style.setProperty(
      PROBLEM_PANE_TOP_VAR,
      `${Math.ceil(el.getBoundingClientRect().height)}px`,
    );
  } else {
    target.style.setProperty(PROBLEM_PANE_WIDTH_VAR, "320px");
    target.style.setProperty(PROBLEM_PANE_TOP_VAR, "0px");
  }
}

function observeProblemPane() {
  problemPaneObserver?.disconnect();
  problemPaneObserver = undefined;
  const el = document.querySelector(
    "[data-cy=practice-problem-pane]",
  ) as HTMLElement | null;
  if (!el) {
    clearProblemPaneOffset();
    return;
  }
  problemPaneObserver = new ResizeObserver(() => syncProblemPaneOffset());
  problemPaneObserver.observe(el);
  syncProblemPaneOffset();
}

watch(
  loaded,
  (isLoaded) => {
    if (isLoaded) void nextTick(observeProblemPane);
  },
  { immediate: true },
);

watch(
  () => session.value.submitted,
  () => void nextTick(observeProblemPane),
  { immediate: true },
);

function onProblemPaste(payload: { text?: string; imageBase64?: string }) {
  if (payload?.text) {
    submitProblemText(payload.text);
    return;
  }
  if (payload?.imageBase64) {
    void submitProblemImageBase64(payload.imageBase64);
  }
}

onMounted(() => {
  window.addEventListener("keydown", onCheckShortcut);
  window.addEventListener("resize", syncProblemPaneOffset);
  eventBus.on("EV_PRACTICE_PROBLEM_PASTE", onProblemPaste);
  void nextTick(observeProblemPane);
});

onUnmounted(() => {
  window.removeEventListener("keydown", onCheckShortcut);
  window.removeEventListener("resize", syncProblemPaneOffset);
  eventBus.off("EV_PRACTICE_PROBLEM_PASTE", onProblemPaste);
  problemPaneObserver?.disconnect();
  clearProblemPaneOffset();
  clearTimeout(practiceTourTimer);
  clearTimeout(unsuppressBalloonTimer);
  clearTimeout(armPreliminaryTimer);
  clearTimeout(autoCheckTimer);
  resetPracticeVoiceCoach();
});

function schedulePracticeTour() {
  clearTimeout(practiceTourTimer);
  practiceTourTimer = setTimeout(() => {
    onboardingStore.tryStartPracticeTour();
  }, 900);
}

function prepareBoardShell(questionUUId: string) {
  loaded.value = false;
  loadError.value = "";
  result.value = null;
  checkError.value = "";
  aiUnavailableMessage.value = "";
  uploadError.value = "";
  coachTip.value = "";
  coachNoteKind.value = "tip";
  coachingBusy.value = false;
  currentQuestionUUId.value = questionUUId;
  practiceStore.clearTextDraft();
  preliminaryArmed.value = false;
  clearTimeout(armPreliminaryTimer);
  resetPracticeVoiceCoach();
  editModeStore.setDefaultEditMode();
  cellStore.resetCellDimensions();
  cellStore.resetSelectedCell();
  notationStore.setParent(questionUUId, "PRACTICE");
  selectionHelper.setSelectedCell({ col: practiceWorkFromCol(), row: 1 }, true);
  void refreshAiQuota();
}

function armPreliminaryCoach() {
  clearTimeout(armPreliminaryTimer);
  armPreliminaryTimer = setTimeout(() => {
    preliminaryArmed.value = true;
    if (practiceStore.getSession(currentQuestionUUId.value).submitted) {
      void raisePreliminaryCoachNote();
    }
  }, 600);
}

async function loadBlankPractice() {
  isBlank.value = true;
  prepareBoardShell(PRACTICE_BLANK_UUID);
  boardContext.setPracticeBlankSession();
  loaded.value = true;
  schedulePracticeTour();
  armPreliminaryCoach();
}

async function loadPractice(questionUUId: string) {
  isBlank.value = false;
  try {
    prepareBoardShell(questionUUId);

    const listItem = practiceQuestionStore.getItem(questionUUId);
    const question = await questionStore.loadQuestion(questionUUId);

    if (!question) {
      throw new Error("This practice question does not exist.");
    }

    let practice =
      question.practice ??
      (listItem
        ? { uuid: listItem.practiceUUId, subject: listItem.subject }
        : null);

    if (!practice) {
      const row = await api.getPracticeQuestion(questionUUId);
      if (row) {
        practice = { uuid: row.practiceUUId, subject: row.subject };
      }
    }

    if (!practice) {
      throw new Error("This is not a practice question.");
    }

    const enriched = { ...question, practice, lesson: null };
    questionStore.getQuestions().set(question.uuid, enriched);
    questionStore.setCurrentQuestion(question.uuid);

    boardContext.setPracticeSession(
      practice.subject,
      question.name,
      question.uuid,
    );

    loaded.value = true;
    schedulePracticeTour();
    armPreliminaryCoach();
  } catch (error) {
    loaded.value = false;
    loadError.value =
      error instanceof Error
        ? error.message
        : "Couldn't load this practice question.";
  }
}

function submitProblemText(text: string) {
  const trimmed = text.trim();
  if (!trimmed || session.value.submitted) return;
  const uuid = currentQuestionUUId.value || PRACTICE_BLANK_UUID;
  practiceStore.submitProblem(uuid, {
    problemText: trimmed,
    parts: ensureNumberedParts(trimmed),
  });
  pinActivePartRow();
}

async function submitProblemImageFile(file: File) {
  uploading.value = true;
  uploadError.value = "";
  try {
    const base64 = await imageHelper.prepareImageFileForUpload(file);
    await submitProblemImageBase64(base64);
  } catch (error) {
    uploadError.value =
      error instanceof Error ? error.message : "Image upload failed";
    uploading.value = false;
  }
}

async function submitProblemImageBase64(imageBase64: string) {
  if (session.value.submitted) return;
  extractingParts.value = true;
  uploadError.value = "";
  let parts = ensureNumberedParts("");
  try {
    if (!aiQuotaExhausted.value) {
      const extracted = await api.extractPracticeParts(
        currentQuestionUUId.value || PRACTICE_BLANK_UUID,
        imageBase64,
      );
      applyQuota(extracted.remaining, extracted.limit);
      if (extracted.parts?.length) parts = extracted.parts;
    }
  } catch (error) {
    if (error instanceof PracticeAiLimitError) {
      applyQuota(error.remaining ?? 0, error.limit);
    }
  } finally {
    extractingParts.value = false;
    uploading.value = false;
  }
  const uuid = currentQuestionUUId.value || PRACTICE_BLANK_UUID;
  practiceStore.submitProblem(uuid, {
    problemImageBase64: imageBase64,
    parts,
  });
  pinActivePartRow();
}

function pinActivePartRow() {
  const uuid = currentQuestionUUId.value || PRACTICE_BLANK_UUID;
  const id = practiceStore.getSession(uuid).activePartId;
  if (id) ensurePartRow(id);
}

function onSelectPart(id: string) {
  const uuid = currentQuestionUUId.value || PRACTICE_BLANK_UUID;
  const s = practiceStore.getSession(uuid);
  const started = startedPartIdsFromSession(s);
  if (!canActivatePart(s.parts, started, id)) {
    partOrderHint.value = lockedPartHint(s.parts, started, id) ?? "";
    return;
  }
  partOrderHint.value = "";
  if (!practiceStore.setActivePart(uuid, id)) return;
  ensurePartRow(id);
}

function onChangeProblem() {
  showClearProblemDialog.value = true;
}

function confirmClearProblem() {
  showClearProblemDialog.value = false;
  const uuid = currentQuestionUUId.value || PRACTICE_BLANK_UUID;
  practiceStore.resetSession(uuid);
  notationStore.clearNotations();
  practiceStore.clearTextDraft();
  result.value = null;
  checkError.value = "";
  aiUnavailableMessage.value = "";
  uploadError.value = "";
  partOrderHint.value = "";
  coachTip.value = "";
  coachNoteKind.value = "tip";
  clearTimeout(autoCheckTimer);
  preliminaryArmed.value = false;
  clearTimeout(armPreliminaryTimer);
  resetPracticeVoiceCoach();
  cellStore.resetSelectedCell();
  editModeStore.setDefaultEditMode();
}

function goSignIn() {
  router.push({
    name: "login",
    query: { userType: "STUDENT", from: route.fullPath },
  });
}

function goPracticeList() {
  router.push({ name: "practice" });
}

function goNextQuestion() {
  if (!nextQuestionUUId.value) return;
  result.value = null;
  router.push({
    name: "practiceQuestion",
    params: { questionUUId: nextQuestionUUId.value },
  });
}

function advanceAfterCorrectCheck() {
  const uuid = currentQuestionUUId.value || PRACTICE_BLANK_UUID;
  const active = practiceStore.getSession(uuid).activePartId;
  if (active) practiceStore.markPartComplete(uuid, active);
  const nextId = practiceStore.nextUnansweredPartId(uuid);
  if (!nextId || !result.value) {
    if (result.value) {
      result.value = { ...result.value, partComplete: true };
    }
    return;
  }
  const nextPart = practiceStore
    .getSession(uuid)
    .parts.find((p) => p.id === nextId);
  practiceStore.setActivePart(uuid, nextId);
  ensurePartRow(nextId);
  if (!nextPart) return;
  result.value = {
    ...result.value,
    partComplete: true,
    feedback:
      `${result.value.feedback} Next: (${nextPart.id}) ${nextPart.text}`.trim(),
  };
}

function maybeAutoCheckPart() {
  if (checking.value || checkDisabledReason.value) return;
  const s = session.value;
  const active = s.activePartId;
  if (!active || s.completedPartIds.includes(active)) return;
  if (
    !activePartLooksComplete(
      currentProblemText(),
      currentStudentWork(),
      active,
    )
  ) {
    return;
  }
  void runCheck();
}

async function runCheck() {
  if (!currentQuestionUUId.value || checking.value) return;
  if (checkDisabledReason.value) return;

  if (editModeStore.getEditMode() === "TEXT_WRITING") {
    editModeStore.setDefaultEditMode();
    await nextTick();
  }

  resetPracticeVoiceCoach();
  dismissCoachTip();
  checking.value = true;
  result.value = null;
  checkError.value = "";
  aiUnavailableMessage.value = "";
  stopPracticeVoice();

  try {
    const studentWork = currentStudentWork();
    result.value = await api.checkPracticeWork(
      currentQuestionUUId.value,
      studentWork,
      currentProblemImage(),
      currentProblemText(),
      currentParts(),
      currentActivePartId(),
    );
    suppressBalloon.value = false;
    applyQuota(result.value.remaining, result.value.limit);
    if (result.value.correct) {
      advanceAfterCorrectCheck();
    }
    const shouldSpeak =
      assistMode.value === "voice" &&
      !!result.value.feedback &&
      !wasPracticeTipSpokenRecently();
    if (shouldSpeak) {
      speakPracticeTip(
        result.value.correct
          ? result.value.feedback
          : `${result.value.feedback}${result.value.hint ? ` ${result.value.hint}` : ""}`,
      );
    }
  } catch (error) {
    if (error instanceof PracticeAiLimitError) {
      applyQuota(error.remaining ?? 0, error.limit);
    } else {
      checkError.value =
        error instanceof Error ? error.message : "Practice check failed";
      aiUnavailableMessage.value = checkError.value;
    }
  } finally {
    checking.value = false;
  }
}
</script>

<style scoped>
.practice-host {
  --practice-problem-pane-width: 320px;
  --practice-problem-pane-top: 0px;
  position: relative;
  min-height: 100%;
}

@media (max-width: 1023px) {
  .practice-host {
    --practice-problem-pane-width: 0px;
  }
}

.practice-load-error {
  position: fixed;
  top: 88px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1100;
  width: min(480px, calc(100vw - 32px));
}

.practice-pane-assist {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 8px;
  width: 100%;
}

.practice-pane-assist :deep(.v-btn-toggle) {
  width: 100%;
  overflow: hidden;
}

.practice-pane-assist :deep(.v-slide-group__prev),
.practice-pane-assist :deep(.v-slide-group__next) {
  display: none !important;
}

.practice-pane-assist :deep(.v-slide-group__container) {
  overflow: hidden !important;
}

.practice-pane-assist :deep(.v-slide-group__content) {
  display: flex !important;
  width: 100% !important;
  transform: none !important;
}

.practice-pane-assist :deep(.v-btn-toggle .v-btn) {
  flex: 1 1 0;
  min-width: 0;
  padding-inline: 2px;
  font-size: 0.75rem;
}

.practice-pane-assist__check-wrap,
.practice-pane-assist__check-wrap :deep(.v-btn),
.practice-pane-assist > :deep(.v-btn) {
  width: 100%;
}

.practice-pane-assist__status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  color: rgba(0, 0, 0, 0.65);
}

.practice-quota-chip {
  align-self: flex-start;
  border: 1px solid rgba(0, 0, 0, 0.12);
  background: rgba(255, 255, 255, 0.85);
  border-radius: 999px;
  padding: 2px 10px;
  font-size: 0.75rem;
  color: rgba(0, 0, 0, 0.7);
  cursor: pointer;
}
</style>
