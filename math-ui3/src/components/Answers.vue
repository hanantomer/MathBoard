<template>
  <v-container>
    <v-card class="mx-auto" max-width="600" min-height="600">
      <v-toolbar color="primary" dark>
        <v-toolbar-title>Answers</v-toolbar-title>
      </v-toolbar>
      <v-data-table
        :v-bind.headers="headers"
        :items="answers"
        :items-per-page="10"
        class="elevation-1"
        click:row="selectAnswer"
      ></v-data-table>
    </v-card>
  </v-container>
</template>
<script setup lang="ts">
import { watch } from 'vue'
import { useRoute, useRouter  } from 'vue-router'
import { computed } from "vue"
import { useLessonStore } from "../store/pinia/lessonStore";
import { useQuestionStore } from "../store/pinia/questionStore";
import { useAnswerStore } from "../store/pinia/answerStore";
import { AnswerAttributes } from '../../../math-common/build/answerTypes';

const route = useRoute();
const router = useRouter();
const lessonStore = useLessonStore();
const questionStore = useQuestionStore();
const answerStore = useAnswerStore();


watch(route, (to) => {
   load();
},{ flush: 'pre', immediate: true, deep: true });

let headers = computed(() => [
  {
    text: "Lesson",
    value: "lesson",
  },
  {
    text: "Question",
    value: "question",
  },
  {
    text: "Student",
    value: "student",
  },
  {
    text: "Created At",
    value: "createdAt",
  },
]);

const lessons = computed(() => {
  return lessonStore.getLessons()
});

const questions = computed(() => {
  return questionStore.getQuestions();
});


const answers = computed(() => {
  return Array.from(answerStore.getAnswers()).map(([key, answer]) => {
    return {
      uuid: answer.uuid,
      lesson: answer.question!.lesson!.name,
      question: answer.question.name,
      student: answer.user.firstName + " " + answer.user.lastName,
    };
  });
});

async function load() {
      await this.loadLessons(this.isTeacher());
      await this.loadQuestions();
      await this.loadAnswers();
};
async function selectAnswer(answer: AnswerAttributes) {
  answerStore.setCurrentAnswer(answer);
  router.push({ path: "/answer/" + answer.uuid });
};

</script>

<style>
.answer_title {
  justify-content: left !important;
}
</style>
