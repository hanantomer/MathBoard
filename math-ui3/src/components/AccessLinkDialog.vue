<template>
  <v-dialog
    v-model="dialog"
    max-width="520"
    scrollable
    transition="dialog-bottom-transition"
    @keydown.esc="closeDialog"
  >
    <v-card class="access-link-card" rounded="lg">
      <v-card-title class="access-link-card__header d-flex align-center ga-2 pa-4">
        <v-icon color="primary" size="28">mdi-link-variant</v-icon>
        <div class="flex-grow-1 min-width-0">
          <div class="text-h6">Invite students</div>
          <div class="text-caption text-medium-emphasis">
            Share this link so they can open your lesson
          </div>
        </div>
        <v-btn
          icon
          variant="text"
          size="small"
          aria-label="Close"
          @click="closeDialog"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-4">
        <p class="text-body-2 text-medium-emphasis mb-3">
          Students sign in (or register), then land on this lesson board.
        </p>

        <v-text-field
          :model-value="link"
          label="Lesson link"
          readonly
          density="comfortable"
          variant="outlined"
          hide-details
          class="access-link-field"
        >
          <template #append-inner>
            <v-btn
              icon
              variant="text"
              size="small"
              :color="copied ? 'success' : undefined"
              aria-label="Copy link"
              @click="copy"
            >
              <v-icon>{{ copied ? "mdi-check" : "mdi-content-copy" }}</v-icon>
            </v-btn>
          </template>
        </v-text-field>

        <v-chip
          v-if="copied"
          color="success"
          variant="tonal"
          size="small"
          class="mt-2"
          prepend-icon="mdi-check-circle-outline"
        >
          Link copied to clipboard
        </v-chip>

        <div class="access-link-locator mt-4">
          <p class="text-body-2 font-weight-medium mb-2">
            Where to see online students
          </p>
          <p class="text-caption text-medium-emphasis mb-3">
            Top bar on the right — look for the
            <v-icon size="small" class="mx-1">mdi-account-school-outline</v-icon>
            school icon (green badge shows how many joined).
          </p>

          <div class="access-link-locator__mock" aria-hidden="true">
            <div class="access-link-locator__mock-bar">
              <span class="access-link-locator__mock-brand">Math Whiteboard</span>
              <span class="access-link-locator__mock-spacer" />
              <span class="access-link-locator__mock-icon muted">
                <v-icon size="18">mdi-archive-edit-outline</v-icon>
              </span>
              <span class="access-link-locator__mock-icon muted">
                <v-icon size="18">mdi-message-question-outline</v-icon>
              </span>
              <span
                class="access-link-locator__mock-icon access-link-locator__mock-icon--target"
              >
                <v-icon size="20">mdi-account-school-outline</v-icon>
                <span class="access-link-locator__mock-badge">2</span>
              </span>
            </div>
            <div class="access-link-locator__callout">
              <v-icon size="small" color="warning">mdi-arrow-up-left</v-icon>
              Online Students
            </div>
          </div>

          <div class="d-flex flex-wrap ga-2 mt-3">
            <v-btn
              color="primary"
              variant="tonal"
              size="small"
              prepend-icon="mdi-account-school-outline"
              @click="openStudents"
            >
              Open Online Students
            </v-btn>
            <v-btn
              variant="outlined"
              size="small"
              prepend-icon="mdi-gesture-tap"
              @click="highlightStudentsButton"
            >
              Show me in the top bar
            </v-btn>
          </div>
        </div>

        <v-expansion-panels variant="accordion" class="mt-4 access-link-panels">
          <v-expansion-panel elevation="0" rounded="lg">
            <v-expansion-panel-title class="text-body-2 font-weight-medium">
              Allow students to edit
            </v-expansion-panel-title>
            <v-expansion-panel-text class="text-body-2">
              <p class="mb-0">
                In the Online Students list, tap a student row to toggle
                <strong>Can edit the board</strong> (view-only by default).
              </p>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn variant="text" @click="closeDialog">Close</v-btn>
        <v-btn color="primary" variant="flat" @click="copy">
          <v-icon start>mdi-content-copy</v-icon>
          Copy link
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useLessonStore } from "../store/pinia/lessonStore";
import { useQuestionStore } from "../store/pinia/questionStore";

const lessonStore = useLessonStore();
const questionStore = useQuestionStore();
const emit = defineEmits(["close", "open-students", "highlight-students"]);

const props = defineProps({
  show: { type: Boolean },
});

const dialog = ref(false);
const copied = ref(false);

watch(
  () => props.show,
  (newVal) => {
    dialog.value = !!newVal;
    if (newVal) {
      copied.value = false;
    }
  },
);

watch(dialog, (open) => {
  if (!open) {
    emit("close");
    copied.value = false;
  }
});

const link = computed(() => {
  const lessonUuid =
    lessonStore.getCurrentLesson()?.uuid ??
    questionStore.getCurrentQuestion()?.lesson?.uuid;

  if (!lessonUuid) {
    return "";
  }

  return `${window.location.origin}/lesson/sl_${lessonUuid}`;
});

async function copy() {
  if (!link.value) {
    return;
  }
  try {
    await navigator.clipboard.writeText(link.value);
    copied.value = true;
  } catch {
    copied.value = false;
  }
}

function closeDialog() {
  dialog.value = false;
}

function openStudents() {
  emit("open-students");
  closeDialog();
}

function highlightStudentsButton() {
  emit("highlight-students");
  closeDialog();
}
</script>

<style scoped>
.access-link-card {
  overflow: hidden;
}

.access-link-card__header {
  background: rgb(var(--v-theme-surface));
}

.access-link-field :deep(.v-field__input) {
  font-size: 0.875rem;
  word-break: break-all;
}

.access-link-panels {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 8px;
}

.access-link-panels :deep(.v-expansion-panel) {
  background: transparent;
}

.access-link-tips li + li {
  margin-top: 0.5rem;
}

.min-width-0 {
  min-width: 0;
}

.access-link-locator {
  padding: 12px;
  border-radius: 10px;
  background: rgba(var(--v-theme-primary), 0.06);
  border: 1px solid rgba(var(--v-theme-primary), 0.15);
}

.access-link-locator__mock {
  position: relative;
  padding-bottom: 28px;
}

.access-link-locator__mock-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  border-radius: 8px;
  background: rgb(var(--v-theme-primary));
  color: #fff;
}

.access-link-locator__mock-brand {
  font-size: 0.7rem;
  font-weight: 700;
  opacity: 0.9;
  white-space: nowrap;
}

.access-link-locator__mock-spacer {
  flex: 1;
}

.access-link-locator__mock-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  opacity: 0.55;
}

.access-link-locator__mock-icon.muted {
  opacity: 0.45;
}

.access-link-locator__mock-icon--target {
  opacity: 1;
  padding: 4px;
  border-radius: 50%;
  background: rgba(255, 193, 7, 0.35);
  box-shadow: 0 0 0 2px rgba(255, 193, 7, 0.9);
}

.access-link-locator__mock-badge {
  position: absolute;
  top: -4px;
  right: -6px;
  min-width: 14px;
  height: 14px;
  padding: 0 3px;
  border-radius: 999px;
  background: #4caf50;
  color: #fff;
  font-size: 0.6rem;
  font-weight: 700;
  line-height: 14px;
  text-align: center;
}

.access-link-locator__callout {
  position: absolute;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  color: rgb(var(--v-theme-primary));
}
</style>
