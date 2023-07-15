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

import { watch, onMounted, computed, ref } from "vue"
import mathBoard from "./MathBoard.vue";
import { useAnswerStore } from "../store/pinia/answerStore";
import { useQuestionStore } from "../store/pinia/questionStore";
import { useRoute } from 'vue-router'

const answerStore = useAnswerStore();
const questionStore = useQuestionStore();
const route = useRoute();

const svgId = "questionsSvg";
let loaded = ref(false);

const props = defineProps({
  questionUUId: {type: String}
});


onMounted(() => {
  questionStore.setCurrentQuestion(props.questionUUId!);
  loaded.value = true; // signal child
});


const students = computed(() => {
  return Array.from(answerStore.answers).map(([uuid, answer]) => {
    return {
      text: `${answer.user.firstName} ${answer.user.lastName}`,
      value: answer.user.id,
    };
  });
});

const questionTitle = computed(() => {
  return questionStore.currentQuestion.name;
});

watch(route, (to) => {
  questionStore.setCurrentQuestion(to.params["questionUUId"][0]);
    //loadQuestion();
  },{ flush: 'pre', immediate: true, deep: true });



function markQuestionAsResolved() { };


</script>
