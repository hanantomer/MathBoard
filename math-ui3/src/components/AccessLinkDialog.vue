<template>
  <v-row justify="center">
    <v-dialog
      v-model="dialog"
      max-width="600px"
      persistent
      @keydown.esc="closeDialog"
    >
      <v-card>
        <v-card-title class="text-h6 primary white--text">
          <v-icon left>mdi-link</v-icon>
          Lesson Access Link
        </v-card-title>
        <v-card-text class="pa-6">
          <v-text-field
            v-model="link"
            label="Access Link"
            readonly
            outlined
            prepend-inner-icon="mdi-link-variant"
            class="mb-4"
          ></v-text-field>
          <v-alert type="info" outlined class="mb-4">
            <h4 class="mb-2">Online Students Indicator and Management</h4>
            <ul class="mb-0">
              <li>
                When a student comes online, the counter above the Students
                button (at the top) increases by 1.
              </li>
              <li>Click the Students button to explore all students.</li>
              <li>
                To enable editing, click the student's row to let them edit and
                add notations.
              </li>
            </ul>
          </v-alert>
        </v-card-text>
        <v-card-actions class="pa-6 pt-0">
          <v-spacer></v-spacer>
          <v-btn @click="closeDialog" text>Close</v-btn>
          <v-btn color="primary" @click="copy" prepend-icon="mdi-content-copy">
            Copy to Clipboard
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useLessonStore } from "../store/pinia/lessonStore";
import { useQuestionStore } from "../store/pinia/questionStore";

const lessonStore = useLessonStore();
const questionStore = useQuestionStore();
const emit = defineEmits(["close"]);

const dialog = ref(false);

const props = defineProps({
  show: { type: Boolean },
});

//watchHelper.watchLoadedEvent

watch(
  () => props.show,
  (newVal) => {
    dialog.value = newVal;
  },
);

const link = computed(() => {
  if (lessonStore.getCurrentLesson()) {
    return `${window.location.origin}/lesson/sl_${
      lessonStore.getCurrentLesson()?.uuid
    }`;
  }
  return `${
    window.location.origin
  }/lesson/sl_${questionStore.getCurrentQuestion()?.lesson?.uuid}`;
});

function copy() {
  navigator.clipboard.writeText(link.value);
  closeDialog();
}

function closeDialog() {
  emit("close");
}
</script>
