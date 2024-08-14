<template>
  <v-row justify="center">
    <v-dialog v-model="show" max-width="500px" min-height="500x">
      <v-form @submit.prevent="save" ref="newQuestionForm">
        <v-card>
          <v-card-title class="headline">
            <span>Add new question</span>
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-select
                    :rules="requiredRules"
                    item-value="uuid"
                    item-title="name"
                    label="pleeas select a lesson:"
                    dense
                    outlined
                    v-model="selectedLesson"
                    :items="lessons"
                  ></v-select>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    :rules="requiredRules"
                    autofocus
                    v-model="name"
                    label="Title*"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-container>
            <small>*indicates required field</small>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn data-cy="button-login" color="blue darken-1" type="submit">
              Save
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>
  </v-row>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useLessonStore } from "../store/pinia/lessonStore";
import useEventBus from "../helpers/eventBusHelper";

const lessonStore = useLessonStore();
const eventBus = useEventBus();
const show = ref(false);
const name = ref();
const newQuestionForm = ref(null);

const requiredRules = [(v: string) => !!v || "required field"];

const props = defineProps({
  dialog: {
    type: Boolean,
    default: false,
  },
});

watch(
  () => props.dialog,
  (val: boolean) => {
    show.value = val;
    lessonStore.loadLessons();
  },
);

const lessons = computed(() =>
  Array.from(lessonStore.getLessons()).map(([key, value]) => {
    return value;
  }),
);

const selectedLesson = computed({
  get() {
    if (!lessonStore.getCurrentLesson()) return "";
    return lessonStore.getCurrentLesson()!.name;
  },
  set(selectedLessonUUId: string) {
    lessonStore.setCurrentLesson(selectedLessonUUId);
  },
});

async function save() {
  const { valid, errors } = await (newQuestionForm.value as any).validate();
  if (valid) {
    show.value = false;
    eventBus.emit("EV_QUESTION_SAVED", name.value);
  }
}
</script>
