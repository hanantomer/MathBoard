<template>
  <v-row class="fill-height">
    <v-col cols="12">
      <mathBoard :svgId="svgId" :loaded="loaded">
        <template #title
          ><p class="title">{{ answerTitle }}</p></template
        >
      </mathBoard>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import mathBoard from "./MathBoard.vue";
import { computed, ref } from "vue";
import { useUserStore } from "../store/pinia/userStore";
import { useAnswerStore } from "../store/pinia/answerStore";
import { watch } from "vue";
import { useRoute } from "vue-router";
import { useNotationStore } from "../store/pinia/notationStore";

const route = useRoute();
const userStore = useUserStore();
const answerStore = useAnswerStore();
const notationStore = useNotationStore();

let loaded = ref(false);
const svgId = "answerSvg";

let answerTitle = computed(() => {
  return userStore.isTeacher()
    ? answerStore.getCurrentAnswer()?.user?.firstName +
        " " +
        answerStore.getCurrentAnswer()?.user?.lastName
    : answerStore.getCurrentAnswer()?.name;
});

watch(
  route,
  (to) => {
    loadAnswer(to.params.answerUUId as string);
  },
  { immediate: true },
);

async function markAnswerAsChecked() {} // not implemented yet

async function loadAnswer(answerUUId: string) {
  // load from db to store
  await answerStore.loadAnswer(answerUUId);

  if (!answerStore.getAnswers().get(answerUUId)) {
    throw Error(`answerUUId: ${answerUUId} does not exist`);
  }

  answerStore.setCurrentAnswer(answerUUId);

  notationStore.setParent(answerUUId, "ANSWER");

  loaded.value = true; // signal child
}
</script>
