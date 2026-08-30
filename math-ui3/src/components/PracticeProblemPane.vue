<template>
  <aside
    class="practice-problem-pane"
    :class="{ 'practice-problem-pane--collapsed': collapsed }"
    data-cy="practice-problem-pane"
  >
    <button
      v-if="session.submitted && isNarrow"
      type="button"
      class="practice-problem-pane__collapse"
      :aria-expanded="!collapsed"
      data-cy="practice-problem-collapse"
      @click="collapsed = !collapsed"
    >
      <span class="practice-problem-pane__collapse-title">
        {{ activeTitle }}
      </span>
      <v-icon size="20">
        {{ collapsed ? "mdi-chevron-down" : "mdi-chevron-up" }}
      </v-icon>
    </button>

    <div
      v-show="!session.submitted || !collapsed"
      class="practice-problem-pane__body"
    >
      <template v-if="!session.submitted">
        <div
          class="practice-problem-pane__dropzone"
          data-cy="practice-problem-dropzone"
          @dragover.prevent
          @drop.prevent="onDrop"
        >
          <v-icon size="32" color="teal-darken-1">mdi-clipboard-text-outline</v-icon>
          <div class="text-subtitle-2 mt-2">Paste the problem</div>
          <div class="text-body-2 text-medium-emphasis mt-1">
            Ctrl+V for text or a worksheet image, or upload a picture.
          </div>
          <textarea
            v-model="draftText"
            class="practice-problem-pane__textarea"
            rows="6"
            placeholder="Or type the question here…"
            data-cy="practice-problem-textarea"
            @keydown="onDraftKeydown"
          />
          <div class="d-flex flex-column ga-2 mt-2">
            <v-btn
              color="primary"
              variant="flat"
              :disabled="!draftText.trim()"
              data-cy="practice-problem-start"
              @click="submitDraft"
            >
              Start
            </v-btn>
            <v-btn
              v-if="draftText.trim()"
              color="grey"
              variant="text"
              data-cy="practice-problem-clear-draft"
              @click="draftText = ''"
            >
              Clear
            </v-btn>
            <v-btn
              color="teal-darken-1"
              variant="tonal"
              :loading="uploading || extracting"
              prepend-icon="mdi-image-plus"
              data-cy="practice-blank-upload"
              @click="pickImageFile"
            >
              Upload image
            </v-btn>
          </div>
          <input
            ref="imageFileInput"
            type="file"
            accept="image/*"
            class="d-none"
            @change="onImageFileChosen"
          />
        </div>
        <div v-if="extracting" class="practice-problem-pane__reading mt-2">
          Reading the worksheet…
        </div>
      </template>

      <template v-else>
        <img
          v-if="session.problemImageBase64"
          class="practice-problem-pane__image"
          :src="imageSrc"
          alt="Worksheet"
        />
        <div
          v-if="stemPreamble"
          class="practice-problem-pane__stem"
        >
          {{ stemPreamble }}
        </div>
        <PracticeSectionList
          v-if="showParsedParts"
          class="mt-3"
          :parts="session.parts"
          :active-part-id="session.activePartId"
          :completed-part-ids="session.completedPartIds"
          @select="$emit('select-part', $event)"
        />
        <p class="practice-problem-pane__label-hint">
          Click a task, then write. The number is added for you.
        </p>
        <v-btn
          v-if="isBlank"
          class="mt-3"
          block
          color="grey-darken-1"
          variant="tonal"
          size="small"
          prepend-icon="mdi-clipboard-remove-outline"
          data-cy="practice-change-problem"
          @click="$emit('change-problem')"
        >
          Clear problem
        </v-btn>
      </template>
    </div>

    <div v-if="session.submitted" class="practice-problem-pane__assist">
      <slot name="assist" />
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import type { PracticeSession } from "../store/pinia/practiceStore";
import { practiceProblemPreamble } from "common/practiceParts";
import PracticeSectionList from "./PracticeSectionList.vue";

const props = defineProps<{
  session: PracticeSession;
  isBlank: boolean;
  extracting: boolean;
  uploading: boolean;
}>();

const emit = defineEmits<{
  "submit-text": [text: string];
  "submit-image": [file: File];
  "select-part": [id: string];
  "change-problem": [];
}>();

const draftText = ref("");
const imageFileInput = ref<HTMLInputElement | null>(null);
const collapsed = ref(false);
const isNarrow = ref(false);

const imageSrc = computed(() => {
  const raw = props.session.problemImageBase64 ?? "";
  if (!raw) return "";
  return raw.startsWith("data:") ? raw : `data:image/png;base64,${raw}`;
});

const showParsedParts = computed(() => {
  const parts = props.session.parts;
  if (parts.length >= 2) return true;
  return (
    parts.length === 1 &&
    parts[0].text.trim().toLowerCase() !== "whole problem"
  );
});

const stemPreamble = computed(() => {
  const text = props.session.problemText ?? "";
  if (!showParsedParts.value) return text;
  return practiceProblemPreamble(text, props.session.parts);
});

const activeTitle = computed(() => {
  const id = props.session.activePartId;
  const part = props.session.parts.find((p) => p.id === id);
  if (part) return `(${part.id}) ${part.text}`;
  return "Problem";
});

function syncNarrow() {
  isNarrow.value = window.matchMedia("(max-width: 1023px)").matches;
  if (!isNarrow.value) collapsed.value = false;
}

function pickImageFile() {
  imageFileInput.value?.click();
}

function onImageFileChosen(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = "";
  if (!file) return;
  emit("submit-image", file);
}

function onDrop(event: DragEvent) {
  const file = event.dataTransfer?.files?.[0];
  if (file && file.type.startsWith("image/")) {
    emit("submit-image", file);
    return;
  }
  const text = event.dataTransfer?.getData("text/plain")?.trim();
  if (text) emit("submit-text", text);
}

function submitDraft() {
  const text = draftText.value.trim();
  if (!text) return;
  emit("submit-text", text);
}

function onDraftKeydown(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
    e.preventDefault();
    submitDraft();
  }
}

watch(
  () => props.session.submitted,
  (submitted) => {
    if (submitted && isNarrow.value) collapsed.value = true;
    if (!submitted) {
      collapsed.value = false;
      draftText.value = "";
    }
  },
);

onMounted(() => {
  syncNarrow();
  window.addEventListener("resize", syncNarrow);
  if (props.session.submitted && isNarrow.value) collapsed.value = true;
});

onUnmounted(() => {
  window.removeEventListener("resize", syncNarrow);
});
</script>

<style scoped>
.practice-problem-pane {
  position: fixed;
  top: 64px;
  left: 70px;
  bottom: 0;
  z-index: 900;
  width: 320px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #f7f8fc;
  border-right: 1px solid rgba(32, 39, 80, 0.12);
}

.practice-problem-pane__body {
  flex: 1 1 auto;
  overflow: auto;
  padding: 16px 14px 24px;
}

.practice-problem-pane__dropzone {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 16px 12px;
  border: 1.5px dashed rgba(32, 39, 80, 0.28);
  border-radius: 12px;
  background: #fff;
  text-align: center;
}

.practice-problem-pane__textarea {
  width: 100%;
  margin-top: 12px;
  padding: 8px 10px;
  border: 1px solid rgba(0, 0, 0, 0.16);
  border-radius: 8px;
  resize: vertical;
  font: inherit;
  font-size: 0.85rem;
  line-height: 1.4;
}

.practice-problem-pane__stem {
  white-space: pre-wrap;
  font-size: 0.88rem;
  line-height: 1.45;
}

.practice-problem-pane__image {
  display: block;
  width: 100%;
  max-height: 220px;
  object-fit: contain;
  margin-bottom: 12px;
  background: #fff;
  border-radius: 8px;
}

.practice-problem-pane__reading {
  font-size: 0.8rem;
  color: rgba(0, 0, 0, 0.6);
}

.practice-problem-pane__label-hint {
  margin: 8px 0 0;
  font-size: 0.75rem;
  line-height: 1.35;
  color: rgba(0, 0, 0, 0.55);
}

.practice-problem-pane__collapse {
  display: none;
  width: 100%;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border: 0;
  border-bottom: 1px solid rgba(32, 39, 80, 0.12);
  background: #f7f8fc;
  text-align: left;
  cursor: pointer;
  font: inherit;
}

.practice-problem-pane__collapse-title {
  flex: 1 1 auto;
  font-size: 0.85rem;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.practice-problem-pane__assist {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 14px 16px;
  border-top: 1px solid rgba(32, 39, 80, 0.12);
  background: #eef0f7;
}

@media (max-width: 1023px) {
  .practice-problem-pane {
    top: 64px;
    left: 56px;
    right: 0;
    bottom: auto;
    width: auto;
    max-height: 40vh;
    border-right: 0;
    border-bottom: 1px solid rgba(32, 39, 80, 0.12);
  }

  .practice-problem-pane--collapsed {
    max-height: none;
  }

  .practice-problem-pane__collapse {
    display: flex;
  }
}
</style>
