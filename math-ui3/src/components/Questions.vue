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

    <NewQuestionDialog :dialog="questionDialog"></NewQuestionDialog>
    <v-card class="mx-auto" max-width="800" min-height="600">
      <v-toolbar color="primary" dark>
        <v-toolbar-title>Questions</v-toolbar-title>

        <v-spacer></v-spacer>

        <v-btn icon v-on:click="openQuestionDialog">
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </v-toolbar>
      <v-autocomplete
        label="Select Lesson"
        :items="lessons"
        v-model="selectedLesson"
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
import { useRouter } from "vue-router";
import useEventBus from "../helpers/eventBusHelper";

const questionStore = useQuestionStore();
const lessonStore = useLessonStore();
const answerStore = useAnswerStore();
const userStore = useUserStore();
const router = useRouter();
const eventBus = useEventBus();

const noLessonDialog = ref(false);
const questionDialog = ref(false);

let itemsPerPage = 10;

const menu = [
  { icon: "plus", title: "Add" },
  { icon: "remove", title: "Remove" },
];

watch(
  () => eventBus.bus.value.get("newQuestionSave"),
  (questionName: string) => {
    addQuestion(questionName);
  },
);

onMounted(() => loadQuestions());

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
    title: "Created At",
    key: "createdAt",
    sortable: false,
  },
]);

const questions = computed(() => {
  return Array.from(questionStore.getQuestions().entries())
    .filter(([key, question]) => question.lesson.uuid === selectedLesson.value)
    .map(([key, question]) => {
      return {
        uuid: question.uuid,
        name: question.name,
        lessonName: question.lesson!.name,
        createdAt: question.createdAt,
      };
    });
});

const lessons = computed(() => {
  return Array.from(lessonStore.getLessons().entries()).map(([key, lesson]) => {
    return {
      value: lesson.uuid,
      title: lesson.name,
    };
  });
});

let selectedLesson = ref();

function navToLessons() {
  noLessonDialog.value = false;
  router.push({
    path: "/lessons/",
  });
}

async function loadQuestions() {
  if (!lessonStore.getLessons().size) {
    noLessonDialog.value = true;
    return;
  }

  await questionStore.loadQuestions();

  if (questionStore.getQuestions().size === 0) {
    openQuestionDialog();
    return;
  }

  selectedLesson.value = lessonStore.getCurrentLesson()?.uuid;
}

function openQuestionDialog() {
  questionDialog.value = true;
}

async function addQuestion(name: string) {
  await questionStore.addQuestion(name);
  router.push({
    path: "/question/" + questionStore.getCurrentQuestion()!.uuid,
  });
}

async function selectQuestion(e: any, row: any) {
  //questionStore.setCurrentQuestion(question);
  if (userStore.isTeacher()) {
    router.push({
      path: "/question/" + row.item.uuid,
    });
  } else {
    // add student answer when question is first selected
    await answerStore.addAnswer(row.item.uuid);
    router.push({
      path: "/answer/" + answerStore.getCurrentAnswer().uuid,
    });
  }
}
</script>

<style>
.question_title {
  justify-content: left !important;
}
</style>
