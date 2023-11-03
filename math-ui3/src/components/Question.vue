<template>
  <v-row>
    <v-col cols="12">
      <mathBoard :svgId="svgId" :loaded="loaded">
        <template #title
          ><p>{{ questionTitle }}</p></template
        >1
      </mathBoard>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { watch, onMounted, computed, ref } from "vue";
import mathBoard from "./MathBoard.vue";
import { useQuestionStore } from "../store/pinia/questionStore";
import { useAnswerStore } from "../store/pinia/answerStore";
import { useNotationStore } from "../store/pinia/notationStore";
import useMatrixHelper from "../helpers/matrixHelper";
import useNotationLoadingHelper from "../helpers/notationLoadingHelper";
import { useRoute } from "vue-router";

const questionStore = useQuestionStore();
const notationStore = useNotationStore();
const answerStore = useAnswerStore();
const matrixHelper = useMatrixHelper();
const route = useRoute();
const notationLoadingHelper = useNotationLoadingHelper();
const svgId = "questionsSvg";
let loaded = ref(false);

const props = defineProps({
  questionUUId: { type: String },
});

onMounted(() => {
  questionStore.setCurrentQuestion(props.questionUUId!);
  loaded.value = true; // signal child
});

const students = computed(() => {
  return Array.from(answerStore.getAnswers()).map(([uuid, answer]) => {
    return {
      text: `${answer.user.firstName} ${answer.user.lastName}`,
      value: answer.user.uuid,
    };
  });
});

const questionTitle = computed(() => {
  return questionStore.getCurrentQuestion().name;
});

watch(
  route,
  (to) => {
    //questionStore.setCurrentQuestion(to.params["questionUUId"][0]);
    loadQuestion(to.params.questionUUId[0]);
  },
  { flush: "pre", immediate: true, deep: true },
);

async function loadQuestion(questionUUId: string) {
  notationStore.setParent(answerStore.getCurrentAnswer()?.uuid, "QUESTION");
  //matrixHelper.setMatrix(svgId);

  // load from db to store
  questionStore.loadQuestion(questionUUId);

  // load notations
  notationLoadingHelper.loadNotations();

  loaded.value = true; // signal child
}

function markQuestionAsResolved() {}
</script>
