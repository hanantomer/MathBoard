<template>
  <v-container>
    <v-dialog v-model="noLessonDialog" max-width="290">
      <v-card>
        <v-card-title class="text-h5">Attention </v-card-title>

        <v-card-text>
          Please add a lesson for which you can add a question
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn color="green darken-1" @click="navToLessons"> OK </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <NewQuestionDialog
      :dialog="questionDialog"
      v-on="{ save: addQuestion }"
    ></NewQuestionDialog>
    <v-card class="mx-auto" max-width="800" min-height="600">
      <v-toolbar color="primary" dark>
        <v-toolbar-title>Questions</v-toolbar-title>

        <v-spacer></v-spacer>

        <v-btn icon v-on:click="openQuestionDialog">
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </v-toolbar>
      <v-data-table
        :v-bind:headers="headers"
        :items="questions"
        :items-per-page="10"
        class="elevation-1"
        click:row="seletctQuestion"
      ></v-data-table>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import NewQuestionDialog from "./NewQuestionDialog.vue";
import { QuestionAttributes } from "../../../math-common/build/questionTypes";
import { watch, onMounted, computed, ref, reactive } from "vue";
import { useQuestionStore } from "../store/pinia/questionStore";
import { useLessonStore } from "../store/pinia/lessonStore";
import { useAnswerStore } from "../store/pinia/answerStore";
import { useUserStore } from "../store/pinia/userStore";
import { useRoute, useRouter } from "vue-router";
import useEventBus from "../helpers/eventBusHelper";

const questionStore = useQuestionStore();
const lessonStore = useLessonStore();
const answerStore = useAnswerStore();
const userStore = useUserStore();
const route = useRoute();
const router = useRouter();
const eventBus = useEventBus();

const noLessonDialog = ref(false);

let questionDialog = ref(false);

let dialog = ref(true);

const menu = [
  { icon: "plus", title: "Add" },
  { icon: "remove", title: "Remove" },
];

onMounted(() => {
  loadQuestions();
});

watch(
  () => eventBus.bus.value.get("newQuestionSave"),
  (questionName: string) => {
    addQuestion(questionName);
  },
);

// watch(
//   route,
//   () => {
//     loadQuestions();
//   },
//   { flush: "pre", immediate: true, deep: true },
// );

const headers = [
  {
    text: "Lesson Name",
    value: "lessonName",
  },
  {
    text: "Question Name",
    value: "name",
  },
  {
    text: "Created At",
    value: "createdAt",
  },
];

const questions = computed(() => {
  return Array.from(questionStore.getQuestions().entries()).map(
    ([key, question]) => {
      return {
        uuid: question.uuid,
        name: question.name,
        lessonName: question.lesson!.name,
        createdAt: question.createdAt,
      };
    },
  );
});

function navToLessons() {
  noLessonDialog.value = false;
  router.push({
    path: "/lessons/",
  });
}

function loadQuestions() {
  if (!lessonStore.getLessons().value) {
    noLessonDialog.value = true;
    return;
  }

  questionStore.loadQuestions();
  if (!questionStore.getQuestions().size) {
    openQuestionDialog();
  }
}

function openQuestionDialog() {
  questionDialog.value = true;
}

async function addQuestion(name: string) {
  await questionStore.addQuestion(name);
  router.push({
    path: "/question/" + questionStore.getCurrentQuestion().uuid,
  });
}

function seletctQuestion(question: QuestionAttributes) {
  if (userStore.isTeacher()) {
    questionStore.setCurrentQuestion(question.uuid);
    router.push({
      path: "/question/" + question.uuid,
    });
  } else {
    questionStore.setCurrentQuestion(question.uuid);
    // add student answer when question is first selected
    answerStore.addAnswer();
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
