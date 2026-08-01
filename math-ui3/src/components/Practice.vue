<template>
  <v-sheet class="practice-host">
    <mathBoard v-show="loaded" :svgId="svgId" :loaded="loaded" />

    <div v-if="loaded && isBlank" class="practice-check-bar">
      <div class="practice-check-bar__actions">
        <input
          ref="imageFileInput"
          type="file"
          accept="image/*"
          class="d-none"
          @change="onImageFileChosen"
        />
        <v-btn
          v-if="voiceCoachEnabled"
          :color="voiceMuted ? 'grey' : 'secondary'"
          variant="tonal"
          :prepend-icon="voiceMuted ? 'mdi-volume-off' : 'mdi-volume-high'"
          data-cy="practice-voice-mute"
          @click="toggleVoiceMute"
        >
          {{ voiceMuted ? "Voice off" : "Voice on" }}
        </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          :loading="checking"
          :disabled="checking || !!aiLimitMessage || !hasProblemImage"
          prepend-icon="mdi-check-decagram"
          data-cy="practice-blank-check"
          @click="runCheck"
        >
          Check answer
        </v-btn>
        <v-btn
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
        class="practice-check-bar__result"
        density="compact"
        variant="tonal"
        type="info"
        title="Blank sheet"
      >
        {{
          hasProblemImage
            ? "Worksheet image is the problem. Write your solution on the board, then use Check."
            : "Paste (Ctrl+V) or upload a worksheet image to use as the problem, then write your solution."
        }}
      </v-alert>
      <v-alert
        v-if="!aiLimitMessage && !aiUnavailableMessage"
        class="practice-check-bar__result"
        density="compact"
        variant="tonal"
        type="info"
        title="AI tutor quota"
      >
        {{ aiQuotaHint }}
      </v-alert>
      <v-alert
        v-if="voiceCoachEnabled && voiceMuted && !aiLimitMessage"
        class="practice-check-bar__result"
        density="compact"
        variant="tonal"
        type="info"
        title="Voice coach off"
      >
        Turn Voice on to hear AI tutor tips while you write.
      </v-alert>
      <v-alert
        v-if="aiLimitMessage"
        class="practice-check-bar__result"
        density="compact"
        variant="tonal"
        type="warning"
        title="Daily AI limit reached"
        closable
        @click:close="aiLimitMessage = ''"
      >
        <div>{{ aiLimitMessage }}</div>
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
        class="practice-check-bar__result"
        density="compact"
        variant="tonal"
        type="error"
        title="AI tutor unavailable"
        closable
        @click:close="aiUnavailableMessage = ''"
      >
        {{ aiUnavailableMessage }}
      </v-alert>
      <v-alert
        v-if="voiceCoachEnabled && coachTip && !voiceMuted && !aiLimitMessage"
        class="practice-check-bar__result"
        density="compact"
        variant="tonal"
        type="info"
        title="Coach"
        closable
        @click:close="coachTip = ''"
      >
        {{ coachTip }}
      </v-alert>
      <v-alert
        v-if="result"
        class="practice-check-bar__result"
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
        class="practice-check-bar__result"
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
        class="practice-check-bar__result"
        density="compact"
        variant="tonal"
        type="error"
        closable
        @click:close="uploadError = ''"
      >
        {{ uploadError }}
      </v-alert>
    </div>

    <div v-else-if="loaded" class="practice-check-bar">
      <div class="practice-check-bar__actions">
        <v-btn
          v-if="voiceCoachEnabled"
          :color="voiceMuted ? 'grey' : 'secondary'"
          variant="tonal"
          :prepend-icon="voiceMuted ? 'mdi-volume-off' : 'mdi-volume-high'"
          data-cy="practice-voice-mute"
          @click="toggleVoiceMute"
        >
          {{ voiceMuted ? "Voice off" : "Voice on" }}
        </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          :loading="checking"
          :disabled="checking || !!aiLimitMessage"
          prepend-icon="mdi-check-decagram"
          data-cy="practice-check"
          @click="runCheck"
        >
          Check answer
        </v-btn>
      </div>

      <v-alert
        v-if="!aiLimitMessage && !aiUnavailableMessage"
        class="practice-check-bar__result"
        density="compact"
        variant="tonal"
        type="info"
        title="AI tutor quota"
      >
        {{ aiQuotaHint }}
      </v-alert>

      <v-alert
        v-if="voiceCoachEnabled && voiceMuted && !aiLimitMessage"
        class="practice-check-bar__result"
        density="compact"
        variant="tonal"
        type="info"
        title="Voice coach off"
      >
        Turn Voice on to hear AI tutor tips while you write.
      </v-alert>

      <v-alert
        v-if="aiLimitMessage"
        class="practice-check-bar__result"
        density="compact"
        variant="tonal"
        type="warning"
        title="Daily AI limit reached"
        closable
        @click:close="aiLimitMessage = ''"
      >
        <div>{{ aiLimitMessage }}</div>
        <div v-if="quotaLimit != null" class="text-medium-emphasis mt-1">
          Used {{ quotaLimit }} of {{ quotaLimit }} Check uses today
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
        class="practice-check-bar__result"
        density="compact"
        variant="tonal"
        type="error"
        title="AI tutor unavailable"
        closable
        @click:close="aiUnavailableMessage = ''"
      >
        {{ aiUnavailableMessage }}
      </v-alert>

      <v-alert
        v-if="voiceCoachEnabled && coachTip && !voiceMuted && !aiLimitMessage"
        class="practice-check-bar__result"
        density="compact"
        variant="tonal"
        type="info"
        title="Coach"
        closable
        @click:close="coachTip = ''"
      >
        {{ coachTip }}
      </v-alert>

      <v-alert
        v-if="result"
        class="practice-check-bar__result"
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
        class="practice-check-bar__result"
        density="compact"
        variant="tonal"
        type="error"
        title="Check failed"
        closable
        @click:close="checkError = ''"
      >
        {{ checkError }}
      </v-alert>
    </div>
  </v-sheet>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import mathBoard from "./MathBoard.vue";
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
import {
  PRACTICE_BLANK_UUID,
} from "../helpers/practiceBoardAdapter";
import useImageHelper from "../helpers/imageHelper";
import useNotationMutationHelper from "../helpers/notationMutateHelper";
import useSelectionHelper from "../helpers/selectionHelper";
import {
  GUEST_AI_DAILY_LIMIT,
  USER_AI_DAILY_LIMIT,
} from "../helpers/guestPracticeHelper";
import { PRACTICE_VOICE_COACH_ENABLED } from "common/globals";
import {
  isPracticeVoiceMuted,
  resetPracticeVoiceCoach,
  schedulePracticeVoiceCoach,
  setPracticeVoiceMuted,
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
const voiceCoachEnabled = PRACTICE_VOICE_COACH_ENABLED;
const voiceMuted = ref(isPracticeVoiceMuted());
const imageFileInput = ref<HTMLInputElement | null>(null);
const quotaRemaining = ref<number | null>(null);
const quotaLimit = ref<number | null>(null);

const isGuest = computed(() => !userStore.getCurrentUser());
const aiQuotaHint = computed(() => {
  if (quotaRemaining.value != null && quotaLimit.value != null) {
    const who = isGuest.value ? "Guest" : "Signed-in";
    return `${who}: ${quotaRemaining.value} of ${quotaLimit.value} AI Check uses left today (resets midnight UTC).`;
  }
  return isGuest.value
    ? `Guest mode: ${GUEST_AI_DAILY_LIMIT} free Check uses per day. Sign in for ${USER_AI_DAILY_LIMIT}/day.`
    : `${USER_AI_DAILY_LIMIT} Check uses per day.`;
});

function applyQuota(remaining?: number, limit?: number) {
  if (typeof remaining === "number") quotaRemaining.value = remaining;
  if (typeof limit === "number") quotaLimit.value = limit;
  if (remaining === 0 && limit != null) {
    aiLimitMessage.value = isGuest.value
      ? `You've used your ${limit} free AI Check uses for today. Sign in for a higher daily limit.`
      : `Daily AI limit reached (${limit} Check uses). Try again tomorrow.`;
  }
}

async function refreshAiQuota() {
  try {
    const quota = await api.getPracticeAiQuota();
    applyQuota(quota.remaining, quota.limit);
    if (quota.remaining === 0) {
      aiLimitMessage.value = isGuest.value
        ? `You've used your ${quota.limit} free AI Check uses for today. Sign in for a higher daily limit.`
        : `Daily AI limit reached (${quota.limit} Check uses). Try again tomorrow.`;
    }
  } catch {
    /* ignore — hint falls back to static copy */
  }
}

const practiceWorkSignature = computed(() =>
  serializePracticeStudentWork(notationStore.getNotations()),
);

const hasProblemImage = computed(
  () => !!getPracticeProblemImageBase64(notationStore.getNotations()),
);

function currentProblemImage(): string | undefined {
  return getPracticeProblemImageBase64(notationStore.getNotations()) ?? undefined;
}

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
  if (voiceMuted.value || checking.value) return;
  if (aiLimitMessage.value) return;

  schedulePracticeVoiceCoach({
    questionUUId: currentQuestionUUId.value,
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
    if (question.lesson?.uuid) {
      throw new Error("this question belongs to a lesson; use the answer flow");
    }
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

function toggleVoiceMute() {
  voiceMuted.value = !voiceMuted.value;
  setPracticeVoiceMuted(voiceMuted.value);
  if (voiceMuted.value) {
    coachTip.value = "";
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

async function runCheck() {
  if (!currentQuestionUUId.value || checking.value) return;
  if (isBlank.value && !hasProblemImage.value) {
    checkError.value =
      "Paste or upload a worksheet image first, then check your answer.";
    return;
  }

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
    if (result.value.feedback && !voiceMuted.value) {
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

.practice-check-bar {
  position: fixed;
  right: 230px;
  bottom: 72px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  max-width: min(420px, calc(100vw - 260px));
}

.practice-check-bar__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.practice-check-bar__result {
  width: 100%;
}

@media (max-width: 1023px) {
  .practice-check-bar {
    right: 12px;
    bottom: max(72px, env(safe-area-inset-bottom));
    max-width: calc(100vw - 72px);
  }
}
</style>
