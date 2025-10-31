<template>
  <v-row justify="center">
    <v-dialog
      v-model="dialog"
      max-width="850px"
      persistent
      @keydown.esc="closeDialog"
    >
      <v-card>
        <v-card-title>
          <span class="headline">Lesson Access Link</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="link"
                  label="Access Link"
                  readonly
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <div style="background-color: beige;"                >
                <h3>Online Students Indicator and Management</h3>
                <ul style="list-style-type: disc">
                  <li>
                    When a student comes online, The counter above the Students
                    button (at the top) increases by 1.
                  </li>

                  <li>
                    To view the list, Click the Students button to explore all
                    students.
                  </li>
                  <li>
                    To enable editing, Click the student's row
                    to let them edit and add notations.
                  </li>
                </ul>
                </div>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" @click="closeDialog"> Close </v-btn>
          <v-btn color="blue darken-1" @click="copy"> Copy To Clipboard </v-btn>
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
    return `${window.location.origin}/lesson/sl_${lessonStore.getCurrentLesson()
      ?.uuid}`;
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
