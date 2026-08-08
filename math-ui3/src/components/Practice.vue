<template>
  <v-sheet class="practice-host">
    <mathBoard v-show="loaded" :svgId="svgId" :loaded="loaded" />

    <div v-if="loaded" class="practice-assist-panel">
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
          <v-btn value="check" data-cy="practice-assist-check">
            <v-icon start icon="mdi-check-decagram" size="small" />
            Check
          </v-btn>
          <v-btn value="text" data-cy="practice-assist-text">
            <v-icon start icon="mdi-message-text-outline" size="small" />
            Text
          </v-btn>
          <v-btn value="voice" data-cy="practice-assist-voice">
            <v-icon start icon="mdi-volume-high" size="small" />
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
        <v-btn
          v-if="assistMode === 'check'"
          color="primary"
          variant="flat"
          :loading="checking"
          :disabled="checking || !!aiLimitMessage || (isBlank && !hasProblemImage)"
          prepend-icon="mdi-check-decagram"
          :data-cy="isBlank ? 'practice-blank-check' : 'practice-check'"
          @click="runCheck"
        >
          Check answer
        </v-btn>
        <v-btn
          v-if="isBlank"
          color="teal-darken-1"
          variant="flat"
          :loading="uploading"
          :disabled="uploading"
          prepend-icon="mdi-image-plus"
          data-cy="practice-blank-upload"
          @click="pickImageFile"
        >
          Upload image
        </v-btn>
      </div>

      <v-alert
        v-if="isBlank"
        class="practice-assist-panel__result"
        density="compact"
        variant="tonal"
        type="info"
        title="Blank sheet"
      >
        {{
          hasProblemImage
            ? blankHelpWithImage
            : "Paste (Ctrl+V) or upload a worksheet image to use as the problem, then write your solution."
        }}
      </v-alert>

      <v-alert
        v-if="result && assistMode === 'check'"
        class="practice-assist-panel__result"
        density="compact"
        variant="tonal"
        :type="result.correct ? 'success' : 'warning'"
        :title="result.correct ? 'Correct' : 'Not quite'"
        closable
        @click:close="result = null"
      >
        <div>{{ result.feedback }}</div>
        <div v-if="result.hint" class="text-medium-emphasis mt-1">
          Hint: {{ result.hint }}
        </div>
      </v-alert>

      <v-alert
        v-if="checkError"
        class="practice-assist-panel__result"
        density="compact"
        variant="tonal"
        type="error"
        title="Check failed"
        closable
        @click:close="checkError = ''"
      >
        {{ checkError }}
      </v-alert>

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

    <div v-if="loaded" class="practice-quota-panel">
      <v-alert
        v-if="!aiLimitMessage && !aiUnavailableMessage"
        class="practice-quota-panel__result"
        density="compact"
        variant="tonal"
        type="info"
        title="AI tutor quota"
      >
        {{ aiQuotaHint }}
      </v-alert>

      <v-alert
        v-if="aiLimitMessage"
        class="practice-quota-panel__result"
        density="compact"
        variant="tonal"
        type="warning"
        title="Daily AI limit reached"
        closable
        @click:close="aiLimitMessage = ''"
      >
        <div>{{ aiLimitMessage }}</div>
        <div v-if="quotaLimit != null" class="text-medium-emphasis mt-1">
          Used {{ quotaLimit }} of {{ quotaLimit }} AI uses today
          (resets at midnight UTC).
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
      v-if="assistMode === 'text' && coachTip && !aiLimitMessage"
      :tip="coachTip"
      :svg-id="svgId"
      :notations="liveNotations"
      @close="coachTip = ''"
    />
  </v-sheet>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import mathBoard from "./MathBoard.vue";
import PracticeCoachBalloon from "./PracticeCoachBalloon.vue";
import { useQuestionStore } from "../store/pinia/questionStore";
import { usePracticeQuestionStore } from "../store/pinia/practiceQuestionStore";
import { useBoardContextStore } from "../store/pinia/boardContextStore";
import { useNotationStore } from "../store/pinia/notationStore";
import { useEditModeStore } from "../store/pinia/editModeStore";
import useApiHelper, { PracticeAiLimitError } from "../helpers/apiHelper";
import { useCellStore } from "../store/pinia/cellStore";
import { useUserStore } from "../store/pinia/userStore";
import {
  serializePracticeStudentWork,
  getPracticeProblemImageBase64,
} from "../helpers/practiceCheckHelper";
import { PRACTICE_BLANK_UUID } from "../helpers/practiceBoardAdapter";
import useImageHelper from "../helpers/imageHelper";
import useNotationMutationHelper from "../helpers/notationMutateHelper";
import useSelectionHelper from "../helpers/selectionHelper";
import {
  GUEST_AI_DAILY_LIMIT,
  USER_AI_DAILY_LIMIT,
} from "../helpers/guestPracticeHelper";
import type { PracticeAssistMode } from "common/globals";
import {
  getPracticeAssistMode,
  isLiveCoachMode,
  resetPracticeVoiceCoach,
  schedulePracticeVoiceCoach,
  setPracticeAssistMode,
  speakPracticeTip,
  stopPracticeVoice,
} from "../helpers/practiceVoiceCoachHelper";
import type { PracticeCheckResult } from "common/practiceQuestionTypes";

const questionStore = useQuestionStore();
const practiceQuestionStore = usePracticeQuestionStore();
const boardContext = useBoardContextStore();
const notationStore = useNotationStore();
const editModeStore = useEditModeStore();
const cellStore = useCellStore();
const userStore = useUserStore();
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
const result = ref<PracticeCheckResult | null>(null);
const checkError = ref("");
const aiLimitMessage = ref("");
const aiUnavailableMessage = ref("");
const uploadError = ref("");
const coachTip = ref("");
const currentQuestionUUId = ref("");
const assistMode = ref<PracticeAssistMode>(getPracticeAssistMode());
const imageFileInput = ref<HTMLInputElement | null>(null);
const quotaRemaining = ref<number | null>(null);
const quotaLimit = ref<number | null>(null);

const isGuest = computed(() => !userStore.getCurrentUser());

const blankHelpWithImage = computed(() => {
  if (assistMode.value === "check") {
    return "Worksheet image is the problem. Write your solution on the board, then use Check.";
  }
  if (assistMode.value === "text") {
    return "Worksheet image is the problem. Write on the board for live text tips.";
  }
  return "Worksheet image is the problem. Write on the board for spoken tips.";
});

const aiQuotaHint = computed(() => {
  const action =
    assistMode.value === "check"
      ? "Check"
      : assistMode.value === "text"
        ? "Check/Text tip"
        : "Check/Voice tip";
  if (quotaRemaining.value != null && quotaLimit.value != null) {
    const who = isGuest.value ? "Guest" : "Signed-in";
    return `${who}: ${quotaRemaining.value} of ${quotaLimit.value} AI ${action} uses left today (resets midnight UTC).`;
  }
  return isGuest.value
    ? `Guest mode: ${GUEST_AI_DAILY_LIMIT} free AI uses per day. Sign in for ${USER_AI_DAILY_LIMIT}/day.`
    : `${USER_AI_DAILY_LIMIT} AI uses per day.`;
});

function applyQuota(remaining?: number, limit?: number) {
  if (typeof remaining === "number") quotaRemaining.value = remaining;
  if (typeof limit === "number") quotaLimit.value = limit;
  if (remaining === 0 && limit != null) {
    aiLimitMessage.value = isGuest.value
      ? `You've used your ${limit} free AI uses for today. Sign in for a higher daily limit.`
      : `Daily AI limit reached (${limit} uses). Try again tomorrow.`;
  }
}

async function refreshAiQuota() {
  try {
    const quota = await api.getPracticeAiQuota();
    applyQuota(quota.remaining, quota.limit);
    if (quota.remaining === 0) {
      aiLimitMessage.value = isGuest.value
        ? `You've used your ${quota.limit} free AI uses for today. Sign in for a higher daily limit.`
        : `Daily AI limit reached (${quota.limit} uses). Try again tomorrow.`;
    }
  } catch {
    /* ignore — hint falls back to static copy */
  }
}

const practiceWorkSignature = computed(() =>
  serializePracticeStudentWork(notationStore.getNotations()),
);

const liveNotations = computed(() => notationStore.getNotations());

const hasProblemImage = computed(
  () => !!getPracticeProblemImageBase64(notationStore.getNotations()),
);

function currentProblemImage(): string | undefined {
  return getPracticeProblemImageBase64(notationStore.getNotations()) ?? undefined;
}

watch(assistMode, (mode, prev) => {
  setPracticeAssistMode(mode);
  coachTip.value = "";
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
  if (!work.trim()) return;
  if (!isLiveCoachMode(assistMode.value) || checking.value) return;
  if (aiLimitMessage.value) return;

  schedulePracticeVoiceCoach({
    questionUUId: currentQuestionUUId.value,
    mode: assistMode.value,
    getStudentWork: () =>
      serializePracticeStudentWork(notationStore.getNotations()),
    requestCoach: async (questionUUId, studentWork) => {
      return await api.coachPracticeWork(
        questionUUId,
        studentWork,
        isBlank.value ? currentProblemImage() : undefined,
      );
    },
    onTip: (tip) => {
      coachTip.value = tip;
      aiUnavailableMessage.value = "";
    },
    onQuota: (remaining, limit) => {
      applyQuota(remaining, limit);
    },
    onError: (error) => {
      if (error instanceof PracticeAiLimitError) {
        aiLimitMessage.value = error.message;
        applyQuota(error.remaining ?? 0, error.limit);
        coachTip.value = "";
        return;
      }
      aiUnavailableMessage.value =
        error instanceof Error
          ? error.message
          : "AI tutor failed. Please try again.";
      coachTip.value = "";
    },
  });
});

onUnmounted(() => {
  resetPracticeVoiceCoach();
});

function prepareBoardShell(questionUUId: string) {
  loaded.value = false;
  result.value = null;
  checkError.value = "";
  aiLimitMessage.value = "";
  aiUnavailableMessage.value = "";
  uploadError.value = "";
  coachTip.value = "";
  currentQuestionUUId.value = questionUUId;
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
}

async function loadPractice(questionUUId: string) {
  isBlank.value = false;
  prepareBoardShell(questionUUId);

  const listItem = practiceQuestionStore.getItem(questionUUId);
  const question = await questionStore.loadQuestion(questionUUId);

  if (!question) {
    throw new Error(`practice question ${questionUUId} does not exist`);
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
    throw new Error("not a practice question");
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

async function runCheck() {
  if (!currentQuestionUUId.value || checking.value) return;
  checking.value = true;
  result.value = null;
  checkError.value = "";
  aiLimitMessage.value = "";
  aiUnavailableMessage.value = "";
  stopPracticeVoice();

  try {
    const studentWork = serializePracticeStudentWork(
      notationStore.getNotations(),
    );
    result.value = await api.checkPracticeWork(
      currentQuestionUUId.value,
      studentWork,
      isBlank.value ? currentProblemImage() : undefined,
    );
    applyQuota(result.value.remaining, result.value.limit);
    if (result.value.feedback && assistMode.value === "voice") {
      speakPracticeTip(
        result.value.correct
          ? result.value.feedback
          : `${result.value.feedback}${result.value.hint ? ` ${result.value.hint}` : ""}`,
      );
    }
  } catch (error) {
    if (error instanceof PracticeAiLimitError) {
      aiLimitMessage.value = error.message;
      applyQuota(error.remaining ?? 0, error.limit);
    } else {
      checkError.value =
        error instanceof Error ? error.message : "Practice check failed";
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

.practice-assist-panel {
  position: fixed;
  top: 56px;
  left: 216px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  max-width: min(420px, calc(100vw - 32px));
  padding: 10px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(6px);
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.08);
  /* Let clicks through empty panel chrome onto the board / lines beneath. */
  pointer-events: none;
}

.practice-assist-panel > * {
  pointer-events: auto;
}

.practice-assist-panel__modes,
.practice-assist-panel__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.practice-assist-panel__result {
  width: 100%;
  opacity: 0.95;
}

.practice-quota-panel {
  position: fixed;
  right: 16px;
  bottom: 72px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  max-width: min(420px, calc(100vw - 32px));
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
  .practice-assist-panel {
    right: 112px;
    top: max(56px, env(safe-area-inset-top));
    max-width: calc(100vw - 124px);
  }

  .practice-quota-panel {
    right: 12px;
    bottom: max(72px, env(safe-area-inset-bottom));
    max-width: calc(100vw - 24px);
  }
}
</style>
