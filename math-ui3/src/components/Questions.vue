<template>
  <v-container>
    <v-dialog v-model="noLessonDialog" max-width="290">
      <v-card>
        <v-card-title class="text-h5">Attention </v-card-title>

        <v-card-text>
          Please select a lesson for which you can add a question
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn color="green darken-1" @click="navToLessons"> OK </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <NewQuestionDialog
      :dialog="questionDialog"
      @close="questionDialog = false"
    ></NewQuestionDialog>
    <v-card class="mx-auto" max-width="800" min-height="600">
      <v-toolbar color="primary" dark>
        <v-toolbar-title>Questions</v-toolbar-title>

        <v-spacer></v-spacer>

        <v-btn
          icon
          v-on:click="openQuestionDialog"
          v-show="userStore.isTeacher()"
        >
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </v-toolbar>
      <v-autocomplete
        label="Select Lesson"
        :items="lessons"
        v-model="selectedLesson"
        item-title="title"
        item-value="value"
        @update:modelValue="onSelectedLesson"
      >
      </v-autocomplete>
      <v-data-table
        v-model:items-per-page="itemsPerPage"
        :items="questions"
        :headers="headers"
        item-value="name"
        class="elevation-1"
        :hide-no-data="true"
        :hover="true"
        @click:row="selectQuestion"
      ></v-data-table>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import NewQuestionDialog from "./NewQuestionDialog.vue";
import { watch, computed, ref, onMounted } from "vue";
import { useQuestionStore } from "../store/pinia/questionStore";
import { useLessonStore } from "../store/pinia/lessonStore";
import { useAnswerStore } from "../store/pinia/answerStore";
import { useUserStore } from "../store/pinia/userStore";
import { useEditModeStore } from "../store/pinia/editModeStore";
import { useGlobalAlertStore } from "../store/pinia/globalAlertStore";
import { useRouter } from "vue-router";
import { useRoute } from "vue-router";
import useEventBus from "../helpers/eventBusHelper";

const questionStore = useQuestionStore();
const lessonStore = useLessonStore();
const answerStore = useAnswerStore();
const userStore = useUserStore();
const editModeStore = useEditModeStore();
const globalAlertStore = useGlobalAlertStore();

const router = useRouter();
const route = useRoute();
const eventBus = useEventBus();


function onSelectedLesson(newVal: string) {
  selectedLesson.value = newVal;
  // Blur the active element to force the menu to close (works across Vuetify versions)
  setTimeout(() => {
    (document.activeElement as HTMLElement | null)?.blur();
  }, 0);
}

const noLessonDialog = ref(false);
const questionDialog = ref(false);
let itemsPerPage = 10;

let selectedLesson = ref();

onMounted(async () => {
  await lessonStore.loadLessons();
  const currentLesson = lessonStore.getCurrentLesson();
  if (currentLesson) {
    selectedLesson.value = currentLesson.uuid;
    return;
  }

  if (lessonStore.getLessons().size > 0) {
    const currentLesson = Array.from(lessonStore.getLessons().values())[0];
    lessonStore.setCurrentLesson(currentLesson.uuid);
    selectedLesson.value = currentLesson.uuid;
    return;
  }

   globalAlertStore.open(
      "Attention",
      "Please create a lesson first to be able to add questions. ",
      "info",
     () => { },
    );
});

watch(
  route,
  async () => {
    editModeStore.setEditMode("QUESTIONS_SELECTION");
  },
  { immediate: true },
);

watch(
  () => selectedLesson.value,
  (lessonUUId: string) => {
    lessonStore.setCurrentLesson(lessonUUId);
    loadQuestions();
  },
);

watch(
  () => eventBus.get("QUESTIONS_SELECTION", "EV_QUESTION_SAVED"),
  (questionName: string) => {
    closeQuestionDialog();
    addQuestion(questionName);
  },
);

const headers = computed(() => [
  {
    title: "Lesson Name",
    key: "lessonName",
    sortable: false,
  },
  {
    title: "Question Name",
    key: "name",
    sortable: false,
  },
  {
    title: "Created on",
    key: "createdAt",
    sortable: false,
  },
]);

const lessons = computed(() => {
  return Array.from(lessonStore.getLessons().values()).map((lesson) => {
    return {
      value: lesson.uuid,
      title: lesson.name,
    };
  });
});

const questions = computed(() => {
  return Array.from(questionStore.getQuestions().values())
    .filter((question) => question.lesson.uuid === selectedLesson.value)
    .map((question) => {
      return {
        uuid: question.uuid,
        name: question.name,
        lessonName: question.lesson!.name,
        createdAt: question.createdAt,
      };
    });
});

function navToLessons(e: any) {
  e.stopPropagation();
  noLessonDialog.value = false;
  router.push({
    path: "/lessons/",
  });
}

async function loadQuestions() {
  await lessonStore.loadLessons();
  if (!lessonStore.getLessons().size && userStore.isTeacher()) {
    noLessonDialog.value = true;
    return;
  }

  await questionStore.loadQuestions();

  if (questionStore.getQuestions().size === 0 && userStore.isTeacher()) {
    openQuestionDialog();
    return;
  }

  if (lessonStore.getCurrentLesson()) {
    selectedLesson.value = lessonStore.getCurrentLesson()?.uuid;
  }
}

function openQuestionDialog() {
  questionDialog.value = true;
}

function closeQuestionDialog() {
  questionDialog.value = false;
}

async function addQuestion(name: string) {
  await questionStore.addQuestion(name);
  router.push({
    path: "/question/" + questionStore.getCurrentQuestion()!.uuid,
  });
}

async function selectQuestion(e: any, row: any) {
  const questionUUId = row.item.uuid;

  if (userStore.isTeacher()) {
    router.push({
      path: "/question/" + row.item.uuid,
    });
  } else {
    // check if already has answer for current queestion
    let answer = answerStore.getQuestionAnswer(questionUUId);

    // add student answer when question is first selected
    if (answer) {
      answerStore.setCurrentAnswer(answer.uuid);
    } else {
      await answerStore.addAnswer(questionUUId);
    }

    router.push({
      path: "/answer/" + answerStore.getCurrentAnswer()?.uuid,
    });
  }
}
</script>

<style>
.question_title {
  justify-content: left !important;
}
</style>
