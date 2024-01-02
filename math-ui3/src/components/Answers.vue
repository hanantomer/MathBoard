<template>
  <v-container>
    <v-card class="mx-auto" max-width="600" min-height="600">
      <v-toolbar color="primary" dark>
        <v-toolbar-title>Answers</v-toolbar-title>
      </v-toolbar>
      <v-autocomplete
        label="Select Lesson"
        item-title="title"
        item-value="value"
        :items="lessons"
        v-model="selectedLesson"
      >
      </v-autocomplete>
      <v-autocomplete
        label="Select Question"
        item-title="title"
        item-value="value"
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
import { watch, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { computed } from "vue";
import { useAnswerStore } from "../store/pinia/answerStore";
import { useQuestionStore } from "../store/pinia/questionStore";
import { useLessonStore } from "../store/pinia/lessonStore";
import { AnswerAttributes } from "../../../math-common/build/answerTypes";

const router = useRouter();
const answerStore = useAnswerStore();
const questionStore = useQuestionStore();
const lessonStore = useLessonStore();

onMounted(() => loadAnswers());

let headers = computed(() => [
  {
    title: "Student",
    key: "student",
  },
  {
    title: "Created At",
    key: "createdAt",
  },
]);

const lessons = computed(() => {
  return Array.from(lessonStore.getLessons().values()).map((lesson) => {
    return {
      value: lesson.uuid,
      title: lesson.name,
    }
  })
});

let selectedLesson = ref();

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

let selectedQuestion = ref();

const answers = computed(() => {
  return Array.from(answerStore.getAnswers().values())
    .filter((answer) => answer.question.uuid === selectedQuestion.value)
    .map((answer) => {
      return {
        uuid: answer.uuid,
        student: answer.user.firstName + " " + answer.user.lastName,
        createdAt: answer.createdAt,
      };
    });
});

async function loadAnswers() {
  if (!questionStore.getQuestions().size) {
    await questionStore.loadQuestions();
  }

  if (!answerStore.getAnswers().size) {
    await answerStore.loadAnswers();
  }

  if (lessonStore.getCurrentLesson()) {
    selectedLesson.value = lessonStore.getCurrentLesson()?.uuid;
  }

  if (questionStore.getCurrentQuestion()) {
    selectedQuestion.value = questionStore.getCurrentQuestion()?.uuid;
  }

  watch(
    () => selectedLesson.value,
    (lessonUUId: string) => {
      lessonStore.setCurrentLesson(lessonUUId);
      loadAnswers();
    },
  );

  watch(
    () => selectedQuestion.value,
    (questionUUId: string) => {
      questionStore.setCurrentQuestion(questionUUId);
      loadAnswers();
    },
  );
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
