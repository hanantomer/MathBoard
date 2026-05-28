<template>
  <div class="d-flex">
    <v-sheet>
      <mathBoard :svgId="svgId" :loaded="loaded"> </mathBoard>
    </v-sheet>
  </div>
</template>

<script setup lang="ts">
import { watch, computed, ref } from "vue";
import mathBoard from "./MathBoard.vue";
import { useQuestionStore } from "../store/pinia/questionStore";
import { useBoardContextStore } from "../store/pinia/boardContextStore";
import { useNotationStore } from "../store/pinia/notationStore";
import { useEditModeStore } from "../store/pinia/editModeStore";
import { useRoute } from "vue-router";
import { useLessonStore } from "../store/pinia/lessonStore";

const questionStore = useQuestionStore();
const notationStore = useNotationStore();
const editModeStore = useEditModeStore();
const boardContext = useBoardContextStore();
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
  const loadedQuestion = await questionStore.loadQuestion(questionUUId);

  if (!loadedQuestion) {
    throw Error(`questionUUId: ${questionUUId} does not exist`);
  }

  questionStore.setCurrentQuestion(loadedQuestion.uuid);

  lessonStore.setCurrentLesson(questionStore.getCurrentQuestion()!.lesson.uuid);

  notationStore.setParent(questionStore.getCurrentQuestion()!.uuid, "QUESTION");

  const current = questionStore.getCurrentQuestion()!;
  boardContext.setQuestion(
    current.lesson.name,
    current.lesson.uuid,
    current.name,
    current.uuid,
  );

  loaded.value = true; // signal child
}

function markQuestionAsResolved() {}
</script>
