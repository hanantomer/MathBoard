<template>
  <v-row class="fill-height">
    <v-col cols="12">
      <mathBoard :svgId="svgId" :loaded="loaded"> </mathBoard>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { watch, computed, ref } from "vue";
import mathBoard from "./MathBoard.vue";
import { useQuestionStore } from "../store/pinia/questionStore";
import { useTitleStore } from "../store/pinia/titleStore";
import { useNotationStore } from "../store/pinia/notationStore";
import { useEditModeStore } from "../store/pinia/editModeStore";
import { useRoute } from "vue-router";
import { useLessonStore } from "../store/pinia/lessonStore";

const questionStore = useQuestionStore();
const notationStore = useNotationStore();
const editModeStore = useEditModeStore();
const titleStore = useTitleStore();
const lessonStore = useLessonStore();

const route = useRoute();
const svgId = "questionSvg";
let loaded = ref(false);

watch(
  route,
  (to) => {
    loadQuestion(to.params.questionUUId as string);
  },
  { immediate: true },
);

async function loadQuestion(questionUUId: string) {
  editModeStore.setDefaultEditMode();
  const question = await questionStore.loadQuestion(questionUUId);

  if (!question) {
    throw Error(`questionUUId: ${questionUUId} does not exist`);
  }

  questionStore.setCurrentQuestion(question.uuid);

  lessonStore.setCurrentLesson(questionStore.getCurrentQuestion()!.lesson.uuid);

  notationStore.setParent(questionStore.getCurrentQuestion()!.uuid, "QUESTION");

  const title = `${questionStore.getCurrentQuestion()!.lesson.name} -
  ${questionStore.getCurrentQuestion()!.name}`;

  titleStore.setTitle(title);

  loaded.value = true; // signal child
}

function markQuestionAsResolved() {}
</script>
