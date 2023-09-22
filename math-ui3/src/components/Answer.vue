<template>
  <v-row>
    <v-col cols="12">
      <mathBoard :svgId="svgId" :loaded="loaded">
        <template #title
          ><p>{{ answerTitle }}</p></template
        >1
      </mathBoard>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import mathBoard from "./MathBoard.vue";
import useMatrixHelper from "../helpers/matrixHelper";
import useActivateObjectHelper from "../helpers/activateObjectHelper";
import useNotationLoadingHelper from "../helpers/notationLoadingHelper";
import { computed, ref } from "vue"
import { useUserStore } from "../store/pinia/userStore";
import { useAnswerStore } from "../store/pinia/answerStore";
import { watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute();
const matrixHelper = useMatrixHelper();
const activateObjectHelper = useActivateObjectHelper();
const userStore = useUserStore();
const answerStore = useAnswerStore();
const notationLoadingHelper = useNotationLoadingHelper();


let loaded = ref(false);
const svgId = "answerSvg";

let answerTitle = computed (() => {
  return userStore.isTeacher() ?
    answerStore.getCurrentAnswer()?.user?.firstName +
    " " +
    answerStore.getCurrentAnswer()?.user?.lastName
    : answerStore.getCurrentAnswer()?.name;
});

watch(route, (to) => {
    loadAnswer(to.params.answerUUId[0]);
  },{ flush: 'pre', immediate: true, deep: true });


async function markAnswerAsChecked() { }; // not implemented yet

async function loadAnswer(answerUUId: string) {
  activateObjectHelper.reset();
  matrixHelper.setMatrix(svgId);

  // load from db to store
  answerStore.loadAnswer(answerUUId);

  // load notations
  notationLoadingHelper.loadQuestionNotations();
  notationLoadingHelper.loadAnswerNotations();

  loaded.value = true; // signal child
};

</script>
