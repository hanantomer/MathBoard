<template>
  <v-container>
    <v-card class="mx-auto" max-width="800" min-height="600">
      <v-toolbar color="primary" dark>
        <v-toolbar-title>Answers</v-toolbar-title>
      </v-toolbar>
      <v-autocomplete
        label="Select Lesson"
        :items="lessons"
        v-model="selectedLesson"
      >
      </v-autocomplete>
      <v-autocomplete
        label="Select Question"
        :items="questions"
        v-model="selectedQuestion"
      >
      </v-autocomplete>
      <v-data-table
        :items="answers"
        :items-per-page="10"
        class="elevation-1"
        :headers="headers"
        item-value="student"
        :hide-no-data="true"
        :hover="true"
        @click:row="selectAnswer"
      ></v-data-table>
    </v-card>
  </v-container>
</template>
<script setup lang="ts">
import { formatDate } from "../../../math-common/src/globals";
import { watch, ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { computed } from "vue";
import { useAnswerStore } from "../store/pinia/answerStore";
import { useQuestionStore } from "../store/pinia/questionStore";
import { useLessonStore } from "../store/pinia/lessonStore";
import { useEditModeStore } from "../store/pinia/editModeStore";

const router = useRouter();
const route = useRoute();
const editModeStore = useEditModeStore();
const answerStore = useAnswerStore();
const questionStore = useQuestionStore();
const lessonStore = useLessonStore();

onMounted(() => {
  lessonStore.loadLessons();
});

watch(
  route,
  async () => {
    editModeStore.setEditMode("ANSWERS_SELECTION");
  },
  { immediate: true },
);


let headers = computed(() => [
  {
    title: "Student",
    key: "student",
  },
  {
    title: "Created on",
    key: "createdAt",
  },
]);

let selectedLesson = ref();
let selectedQuestion = ref();

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
        value: question.uuid,
        title: question.name,
      };
    });
});

const answers = computed(() => {
  return Array.from(answerStore.getAnswers().values())
    .filter((answer) => answer.question.uuid === selectedQuestion.value )
    .map((answer) => {
      return {
        uuid: answer.uuid,
        student: answer.user.firstName + " " + answer.user.lastName,
        createdAt:formatDate(answer.createdAt) ,
      };
    });
});

watch(
  () => selectedLesson.value,
  (lessonUUId: string) => {
    lessonStore.setCurrentLesson(lessonUUId);
    questionStore.loadQuestions();
  },
);

watch(
  () => selectedQuestion.value,
  (questionUUId: string) => {
    questionStore.setCurrentQuestion(questionUUId);
    //loadAnswers();
    answerStore.loadAnswers();
  },
);

async function loadAnswers() {
  if (!questionStore.getQuestions().size) {
    await questionStore.loadQuestions();
  }

  if (!answerStore.getAnswers().size) {
    await answerStore.loadAnswers();
  }

  if (lessonStore.getCurrentLesson()) {
    selectedLesson.value = lessonStore.getCurrentLesson();
  }

  if (questionStore.getCurrentQuestion()) {
    selectedQuestion.value = questionStore.getCurrentQuestion();
  }
}

async function selectAnswer(e: any, row: any) {
  answerStore.setCurrentAnswer(row.item.uuid);
  router.push({ path: "/answer/" + row.item.uuid });
}
</script>

<style>
.answer_title {
  justify-content: left !important;
}
</style>
