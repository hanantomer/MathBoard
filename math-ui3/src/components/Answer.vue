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
import useMatrixHelper from "../Helpers/matrixHelper";
import useActivateObjectHelper from "../Helpers/activateObjectHelper";
import { computed, ref } from "vue"
import { useUserStore } from "../store/pinia/userStore";
import { useAnswerStore } from "../store/pinia/answerStore";
import { useNotationStore } from "../store/pinia/notationStore";
import { watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute();
const matrixHelper = useMatrixHelper();
const activateObjectHelper = useActivateObjectHelper();
const userStore = useUserStore();
const answerStore = useAnswerStore();
const notationsStore = useNotationStore();

let loaded = ref(false);
const svgId = "answerSvg";

let answerTitle = computed (() => {
  return userStore.isTeacher() ?
    answerStore.currentAnswer?.user?.firstName +
    " " +
    answerStore.currentAnswer?.user?.lastName
    : answerStore.currentAnswer?.name;
});

watch(route, (to) => {
  loadAnswer(to.params.answerUUId[0]);
  },
  { flush: 'pre', immediate: true, deep: true }
);

// watch(
//   () => route.meta.layout,
//   (layout) => {
//     loadAnswer(route.params.get(""));
//   }
// )

//onMounted(() => {
//  loadAnswer();
//});

async function markAnswerAsChecked() { };

async function loadAnswer(answerUUId: string) {
  activateObjectHelper.reset();
  matrixHelper.setMatrix(svgId);

  // load from db to store
  answerStore.loadAnswer(answerUUId);
  // await this.loadAnswer(
  //   this.$route.params.answerUUId || this.getCurrentAnswer().uuid
  // );
  notationsStore.loadQuestionNotations();
  notationsStore.loadAnswerNotations();

  loaded.value = true; // signal child
};

</script>
