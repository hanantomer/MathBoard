<template>
  <v-sheet class="practice-host">
    <mathBoard v-show="loaded && !loadError" :svgId="svgId" :loaded="loaded" />

    <div v-if="loadError" class="practice-load-error">
      <v-alert type="error" variant="tonal" title="Couldn't load this practice question">
        <div>{{ loadError }}</div>
        <v-btn class="mt-3" color="primary" variant="flat" @click="goPracticeList">
          Back to practice
        </v-btn>
      </v-alert>
    </div>

    <div
      v-if="loaded && isBlank && isCrafting && !hasBoardWork && !craftStarted"
      class="practice-empty"
      data-cy="practice-blank-empty"
    >
      <div class="practice-empty__card">
        <v-icon size="36" color="teal-darken-1">mdi-file-document-edit-outline</v-icon>
        <div class="text-subtitle-1 mt-2">Add the problem</div>
        <div class="text-body-2 text-medium-emphasis mt-1">
          Write the question on the board, paste it as text (Ctrl+V), or
          paste/upload a worksheet image. Then press Question ready and solve.
        </div>
        <div class="d-flex flex-column ga-2 mt-3">
          <v-btn
            color="primary"
            variant="flat"
            prepend-icon="mdi-pencil"
            data-cy="practice-blank-write"
            @click="startCraftingOnBoard"
          >
            Write the question
          </v-btn>
          <v-btn
            color="teal-darken-1"
            variant="tonal"
            :loading="uploading"
            prepend-icon="mdi-image-plus"
            data-cy="practice-blank-upload"
            @click="pickImageFile"
          >
            Upload image
          </v-btn>
        </div>
      </div>
    </div>

    <div
      v-if="loaded"
      ref="assistPanelEl"
      class="practice-assist-panel"
    >
      <div class="practice-assist-panel__modes">
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
      </div>

      <div class="practice-assist-panel__actions">
        <input
          v-if="isBlank"
          ref="imageFileInput"
          type="file"
          accept="image/*"
          class="d-none"
          @change="onImageFileChosen"
        />
        <v-tooltip
          :text="checkDisabledReason"
          :disabled="!checkDisabledReason"
          location="bottom"
        >
          <template #activator="{ props: tipProps }">
            <div v-bind="tipProps" class="practice-assist-panel__check-wrap">
              <v-btn
                v-if="isCrafting"
                color="primary"
                variant="flat"
                :disabled="!canLockQuestion"
                prepend-icon="mdi-flag-checkered"
                data-cy="practice-blank-lock-question"
                @click="lockCraftedQuestion"
              >
                Question ready
              </v-btn>
              <v-btn
                v-else
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
          v-if="isBlank && (hasProblemImage || (isCrafting && (craftStarted || hasBoardWork)))"
          color="teal-darken-1"
          variant="tonal"
          :loading="uploading"
          icon="mdi-image-plus"
          aria-label="Upload worksheet image"
          data-cy="practice-blank-upload"
          @click="pickImageFile"
        />
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
      </div>

      <div
        v-if="(isLiveCoach || isCrafting) && !aiQuotaExhausted"
        class="practice-assist-panel__status"
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
        class="practice-assist-panel__result"
        density="compact"
        variant="tonal"
        type="error"
        closable
        @click:close="uploadError = ''"
      >
        {{ uploadError }}
      </v-alert>
    </div>

    <div
      v-if="loaded && (quotaExpanded || aiLimitMessage || aiUnavailableMessage)"
      class="practice-quota-panel"
    >
      <v-alert
        v-if="quotaExpanded && !aiLimitMessage && !aiUnavailableMessage"
        class="practice-quota-panel__result"
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
        class="practice-quota-panel__result"
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
        class="practice-quota-panel__result"
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
      :variant="result?.correct ? 'success' : 'warning'"
      @close="result = null"
    >
      <v-btn
        v-if="result?.correct && nextQuestionUUId"
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
  </v-sheet>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import mathBoard from "./MathBoard.vue";
import PracticeCoachBalloon from "./PracticeCoachBalloon.vue";
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
  getPracticeProblemImageBase64,
  getPracticeProblemImageForTutor,
  getPracticeProblemText,
  hasCraftedPracticeProblem,
} from "../helpers/practiceCheckHelper";
import {
  PRACTICE_IMAGE_MISREAD_TIP,
  PRACTICE_IMAGE_UNREADABLE_TIP,
  isPracticeImageReadTip,
} from "../helpers/practiceImagePrep";
import {
  PRACTICE_BLANK_UUID,
  markCurrentPracticeNotationsAsProblem,
} from "../helpers/practiceBoardAdapter";
import useImageHelper from "../helpers/imageHelper";
import useNotationMutationHelper from "../helpers/notationMutateHelper";
import useSelectionHelper from "../helpers/selectionHelper";
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
const notationMutateHelper = useNotationMutationHelper();
const selectionHelper = useSelectionHelper();

const route = useRoute();
const router = useRouter();

const svgId = "practiceSvg";
const loaded = ref(false);
const isBlank = ref(false);
const checking = ref(false);
const uploading = ref(false);
const coachingBusy = ref(false);
const result = ref<PracticeCheckResult | null>(null);
const checkError = ref("");
const aiLimitMessage = ref("");
const aiUnavailableMessage = ref("");
const uploadError = ref("");
const loadError = ref("");
const coachTip = ref("");
const coachNoteKind = ref<"tip" | "preliminary" | "image">("tip");
const currentQuestionUUId = ref("");
const assistMode = ref<PracticeAssistMode>(getPracticeAssistMode());
const coachPaused = ref(isPracticeCoachPaused());
const craftStarted = ref(false);
const imageFileInput = ref<HTMLInputElement | null>(null);
const assistPanelEl = ref<HTMLElement | null>(null);
const quotaRemaining = ref<number | null>(null);
const quotaLimit = ref<number | null>(null);
const quotaExpanded = ref(false);
const suppressBalloon = ref(false);
const preliminaryArmed = ref(false);
let practiceTourTimer: ReturnType<typeof setTimeout> | undefined;
let unsuppressBalloonTimer: ReturnType<typeof setTimeout> | undefined;
let armPreliminaryTimer: ReturnType<typeof setTimeout> | undefined;
let preliminaryInFlight = false;

const isGuest = computed(() => !userStore.getCurrentUser());
const isLiveCoach = computed(() => isLiveCoachMode(assistMode.value));

const liveNotations = computed(() => notationStore.getNotations());

const hasProblemImage = computed(
  () => !!getPracticeProblemImageBase64(notationStore.getNotations()),
);

const hasProblemText = computed(
  () =>
    !!getPracticeProblemText(
      notationStore.getNotations(),
      practiceStore.textDraft,
    ),
);

const hasProblem = computed(
  () =>
    hasProblemImage.value ||
    hasProblemText.value ||
    hasCraftedPracticeProblem(notationStore.getNotations()),
);

const isCrafting = computed(() => isBlank.value && !hasProblem.value);

const hasBoardWork = computed(() => {
  if (practiceStore.textDraft?.value.trim()) return true;
  return notationStore
    .getNotations()
    .some((n) => n.boardType === "PRACTICE");
});

const canLockQuestion = computed(() => isCrafting.value && hasBoardWork.value);

const checkDisabledReason = computed(() => {
  if (checking.value) return "";
  if (aiQuotaExhausted.value) return "Daily AI limit reached";
  if (isCrafting.value) {
    return canLockQuestion.value ? "" : "Write or paste the question first";
  }
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
  if (isCrafting.value) return `Write the question${left}`;
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
  const hint = result.value.hint ? ` ${result.value.hint}` : "";
  return `${result.value.feedback}${result.value.correct ? "" : hint}`.trim();
});

const resultBalloonTitle = computed(() => {
  if (!result.value) return "";
  if (isPracticeImageReadTip(result.value.feedback)) return "Worksheet image";
  return result.value.correct ? "Correct" : "Not quite";
});

const nextQuestionUUId = computed(() => {
  if (isBlank.value) return "";
  const items = Array.from(practiceQuestionStore.getItems().values());
  if (items.length < 2) return "";
  const idx = items.findIndex((q) => q.uuid === currentQuestionUUId.value);
  if (idx < 0) return items[0]?.uuid ?? "";
  return items[idx + 1]?.uuid ?? "";
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
  return serializePracticeStudentWork(
    notationStore.getNotations(),
    practiceStore.textDraft,
  );
}

const practiceWorkSignature = computed(() => currentStudentWork());

async function currentProblemImage(): Promise<string | undefined> {
  if (!isBlank.value) return undefined;
  return (
    (await getPracticeProblemImageForTutor(notationStore.getNotations())) ??
    undefined
  );
}

function currentProblemText(): string | undefined {
  if (!isBlank.value) return undefined;
  return (
    getPracticeProblemText(
      notationStore.getNotations(),
      practiceStore.textDraft,
    ) ?? undefined
  );
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
    const image = await currentProblemImage();
    const result = await api.coachPracticeWork(
      currentQuestionUUId.value,
      currentStudentWork(),
      image,
      currentProblemText(),
      "preliminary",
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

watch(isCrafting, (crafting, wasCrafting) => {
  if (!preliminaryArmed.value) return;
  if (wasCrafting === true && crafting === false) {
    void raisePreliminaryCoachNote();
  }
});

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
  suppressBalloon.value = true;
  clearTimeout(unsuppressBalloonTimer);
  unsuppressBalloonTimer = setTimeout(() => {
    if (coachTip.value || result.value) suppressBalloon.value = false;
  }, 1800);
  if (!work.trim()) return;
  if (isCrafting.value) return;
  if (!isLiveCoach.value || checking.value) return;
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
        await currentProblemImage(),
        currentProblemText(),
      );
    },
    onBusy: (busy) => {
      coachingBusy.value = busy;
    },
    onTip: (tip) => {
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

const ASSIST_RAIL_VAR = "--practice-assist-rail-height";
let assistPanelObserver: ResizeObserver | undefined;

function clearAssistRailOffset() {
  document.documentElement.style.removeProperty(ASSIST_RAIL_VAR);
}

function syncAssistRailOffset() {
  const el = assistPanelEl.value;
  if (!el || window.matchMedia("(max-width: 1023px)").matches) {
    clearAssistRailOffset();
    return;
  }
  document.documentElement.style.setProperty(
    ASSIST_RAIL_VAR,
    `${Math.ceil(el.getBoundingClientRect().height)}px`,
  );
}

watch(assistPanelEl, (el) => {
  assistPanelObserver?.disconnect();
  assistPanelObserver = undefined;
  if (!el) {
    clearAssistRailOffset();
    return;
  }
  assistPanelObserver = new ResizeObserver(() => syncAssistRailOffset());
  assistPanelObserver.observe(el);
  void nextTick(syncAssistRailOffset);
});

onMounted(() => {
  window.addEventListener("keydown", onCheckShortcut);
  window.addEventListener("resize", syncAssistRailOffset);
});

onUnmounted(() => {
  window.removeEventListener("keydown", onCheckShortcut);
  window.removeEventListener("resize", syncAssistRailOffset);
  assistPanelObserver?.disconnect();
  clearAssistRailOffset();
  clearTimeout(practiceTourTimer);
  clearTimeout(unsuppressBalloonTimer);
  clearTimeout(armPreliminaryTimer);
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
  craftStarted.value = false;
  preliminaryArmed.value = false;
  clearTimeout(armPreliminaryTimer);
  resetPracticeVoiceCoach();
  editModeStore.setDefaultEditMode();
  cellStore.resetCellDimensions();
  cellStore.resetSelectedCell();
  notationStore.setParent(questionUUId, "PRACTICE");
  selectionHelper.setSelectedCell({ col: 1, row: 1 }, true);
  void refreshAiQuota();
}

async function loadBlankPractice() {
  isBlank.value = true;
  prepareBoardShell(PRACTICE_BLANK_UUID);
  boardContext.setPracticeBlankSession();
  loaded.value = true;
  schedulePracticeTour();
  clearTimeout(armPreliminaryTimer);
  armPreliminaryTimer = setTimeout(() => {
    preliminaryArmed.value = true;
  }, 600);
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
  } catch (error) {
    loaded.value = false;
    loadError.value =
      error instanceof Error
        ? error.message
        : "Couldn't load this practice question.";
  }
}

function pickImageFile() {
  imageFileInput.value?.click();
}

async function onImageFileChosen(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = "";
  if (!file) return;

  uploading.value = true;
  uploadError.value = "";
  try {
    selectionHelper.setSelectedCell(
      cellStore.getSelectedCell() ?? { col: 1, row: 1 },
      true,
    );
    const base64 = await imageHelper.prepareImageFileForUpload(file);
    await notationMutateHelper.addImageNotation(base64);
  } catch (error) {
    uploadError.value =
      error instanceof Error ? error.message : "Image upload failed";
  } finally {
    uploading.value = false;
  }
}

function goSignIn() {
  router.push({
    name: "login",
    query: { userType: "STUDENT", from: route.fullPath },
  });
}

function startCraftingOnBoard() {
  craftStarted.value = true;
}

async function lockCraftedQuestion() {
  if (!canLockQuestion.value) return;
  if (editModeStore.getEditMode() === "TEXT_WRITING") {
    editModeStore.setDefaultEditMode();
    await nextTick();
  }
  markCurrentPracticeNotationsAsProblem();
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

async function runCheck() {
  if (!currentQuestionUUId.value || checking.value) return;
  if (checkDisabledReason.value) return;
  if (isCrafting.value) {
    await lockCraftedQuestion();
    return;
  }

  if (editModeStore.getEditMode() === "TEXT_WRITING") {
    editModeStore.setDefaultEditMode();
    await nextTick();
  }

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
      await currentProblemImage(),
      currentProblemText(),
    );
    suppressBalloon.value = false;
    applyQuota(result.value.remaining, result.value.limit);
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
  position: relative;
  min-height: 100%;
}

.practice-load-error {
  position: fixed;
  top: 88px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1100;
  width: min(480px, calc(100vw - 32px));
}

.practice-empty {
  position: fixed;
  inset: 110px 210px 56px 80px;
  z-index: 900;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 48px;
  pointer-events: none;
}

.practice-empty__card {
  pointer-events: auto;
  max-width: 360px;
  padding: 20px 22px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.12);
  text-align: center;
}

.practice-assist-panel {
  position: fixed;
  top: 64px;
  right: 0;
  z-index: 1001;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 8px;
  width: 210px;
  max-width: 210px;
  padding: 10px;
  border-radius: 0 0 12px 12px;
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(6px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  pointer-events: none;
}

.practice-assist-panel > * {
  pointer-events: auto;
}

.practice-assist-panel__modes,
.practice-assist-panel__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: stretch;
  gap: 8px;
  width: 100%;
}

.practice-assist-panel__modes {
  overflow: hidden;
}

.practice-assist-panel__modes :deep(.v-btn-toggle) {
  width: 100%;
  overflow: hidden;
}

.practice-assist-panel__modes :deep(.v-slide-group__prev),
.practice-assist-panel__modes :deep(.v-slide-group__next) {
  display: none !important;
}

.practice-assist-panel__modes :deep(.v-slide-group__container) {
  overflow: hidden !important;
}

.practice-assist-panel__modes :deep(.v-slide-group__content) {
  display: flex !important;
  width: 100% !important;
  transform: none !important;
}

.practice-assist-panel__actions :deep(.v-btn),
.practice-assist-panel__check-wrap,
.practice-assist-panel__check-wrap :deep(.v-btn) {
  width: 100%;
}

.practice-assist-panel__modes :deep(.v-btn-toggle .v-btn) {
  flex: 1 1 0;
  min-width: 0;
  padding-inline: 2px;
  font-size: 0.75rem;
}

.practice-assist-panel__status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  color: rgba(0, 0, 0, 0.65);
}

.practice-assist-panel__result {
  width: 100%;
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

.practice-quota-panel {
  position: fixed;
  right: 8px;
  bottom: 72px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  max-width: min(320px, calc(100vw - 24px));
  pointer-events: none;
}

.practice-quota-panel > * {
  pointer-events: auto;
}

.practice-quota-panel__result {
  width: 100%;
  opacity: 0.95;
}

@media (max-width: 1023px) {
  .practice-empty {
    inset: 64px 8px 96px 56px;
  }

  .practice-assist-panel {
    top: auto;
    right: 8px;
    left: 56px;
    bottom: max(12px, env(safe-area-inset-bottom));
    width: auto;
    max-width: none;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
  }

  .practice-assist-panel__modes,
  .practice-assist-panel__actions {
    width: auto;
    flex: 1 1 auto;
  }

  .practice-quota-panel {
    right: 12px;
    bottom: max(96px, env(safe-area-inset-bottom));
  }
}
</style>
