<template>
  <div class="d-flex">
    <v-sheet>
      <mathBoard v-show="loaded" :svgId="svgId" :loaded="loaded" />
    </v-sheet>
  </div>
</template>

<script setup lang="ts">
import { watch, ref } from "vue";
import mathBoard from "./MathBoard.vue";
import { useQuestionStore } from "../store/pinia/questionStore";
import { useBoardContextStore } from "../store/pinia/boardContextStore";
import { useNotationStore } from "../store/pinia/notationStore";
import { useEditModeStore } from "../store/pinia/editModeStore";
import { useRoute, useRouter } from "vue-router";
import { useLessonStore } from "../store/pinia/lessonStore";

const questionStore = useQuestionStore();
const notationStore = useNotationStore();
const editModeStore = useEditModeStore();
const boardContext = useBoardContextStore();
const lessonStore = useLessonStore();

const route = useRoute();
const router = useRouter();
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
  loaded.value = false;
  editModeStore.setDefaultEditMode();
  notationStore.setParent(questionUUId, "QUESTION");

  const loadedQuestion = await questionStore.loadQuestion(questionUUId);

  if (!loadedQuestion) {
    throw Error(`questionUUId: ${questionUUId} does not exist`);
  }

  if (loadedQuestion.practice) {
    await router.replace({
      name: "practiceQuestion",
      params: { questionUUId: loadedQuestion.uuid },
    });
    return;
  }

  questionStore.setCurrentQuestion(loadedQuestion.uuid);

  if (loadedQuestion.lesson) {
    lessonStore.setCurrentLesson(loadedQuestion.lesson.uuid);
    boardContext.setQuestion(
      loadedQuestion.lesson.name,
      loadedQuestion.lesson.uuid,
      loadedQuestion.name,
      loadedQuestion.uuid,
    );
  }

  loaded.value = true;
}

function markQuestionAsResolved() {}
</script>
