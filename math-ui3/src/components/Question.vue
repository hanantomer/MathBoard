<template>
  <v-row class="fill-height">
    <v-col cols="12">
      <mathBoard :svgId="svgId" :loaded="loaded">
        <template #title
          ><p class="title">{{ questionTitle }}</p></template
        >
      </mathBoard>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { watch, computed, ref } from "vue";
import mathBoard from "./MathBoard.vue";
import { useQuestionStore } from "../store/pinia/questionStore";
import { useLessonStore } from "../store/pinia/lessonStore";
import { useNotationStore } from "../store/pinia/notationStore";
import { useRoute } from "vue-router";

const questionStore = useQuestionStore();
const notationStore = useNotationStore();
const lessonStore = useLessonStore();

const route = useRoute();
const svgId = "questionSvg";
let loaded = ref(false);

/*const props = defineProps({
  questionUUId: { type: String },
});

const students = computed(() => {
  return Array.from(answerStore.getAnswers()).map(([uuid, answer]) => {
    return {
      text: `${answer.user.firstName} ${answer.user.lastName}`,
      value: answer.user.uuid,
    };
  });
});*/

const questionTitle = computed(() => {
  if (!questionStore.getCurrentQuestion()) return;
  return questionStore.getCurrentQuestion()!.name;
});

watch(
  route,
  (to) => {
    loadQuestion(to.params.questionUUId as string);
  },
  { immediate: true },
);

async function loadQuestion(questionUUId: string) {
  const question = await questionStore.loadQuestion(questionUUId);

  if (!question) {
    throw Error(`questionUUId: ${questionUUId} does not exist`);
  }

  questionStore.setCurrentQuestion(question.uuid);

  lessonStore.setCurrentLesson(questionStore.getCurrentQuestion()!.lesson.uuid);

  notationStore.setParent(questionStore.getCurrentQuestion()!.uuid, "QUESTION");

  loaded.value = true; // signal child
}

function markQuestionAsResolved() {}
</script>
