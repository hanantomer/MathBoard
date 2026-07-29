<template>
   <v-sheet>
      <mathBoard :svgId="svgId" :loaded="loaded"> </mathBoard>
    </v-sheet>
</template>

<script setup lang="ts">
import mathBoard from "./MathBoard.vue";
import { ref } from "vue";
import { useUserStore } from "../store/pinia/userStore";
import { useAnswerStore } from "../store/pinia/answerStore";
import { watch } from "vue";
import { useRoute } from "vue-router";
import { useNotationStore } from "../store/pinia/notationStore";
import { useEditModeStore } from "../store/pinia/editModeStore";
import { useBoardContextStore } from "../store/pinia/boardContextStore";

const route = useRoute();
const userStore = useUserStore();
const answerStore = useAnswerStore();
const editModeStore = useEditModeStore();
const boardContext = useBoardContextStore();
const notationStore = useNotationStore();

let loaded = ref(false);
const svgId = "answerSvg";

watch(
  route,
  (to) => {
    loadAnswer(to.params.answerUUId as string);
  },
  { immediate: true },
);

async function markAnswerAsChecked() {} // not implemented yet

async function loadAnswer(answerUUId: string) {
  editModeStore.setDefaultEditMode();
  // load from db to store
  await answerStore.loadAnswer(answerUUId);

  if (!answerStore.getAnswers().get(answerUUId)) {
    throw Error(`answerUUId: ${answerUUId} does not exist`);
  }

  answerStore.setCurrentAnswer(answerUUId);

  const answer = answerStore.getCurrentAnswer()!;
  const lesson = answer.question.lesson;
  const question = answer.question;

  if (userStore.isTeacher()) {
    const studentName =
      `${answer.user?.firstName ?? ""} ${answer.user?.lastName ?? ""}`.trim() ||
      "Student";
    if (lesson) {
      boardContext.setAnswerForTeacher(
        lesson.name,
        lesson.uuid,
        question.name,
        question.uuid,
        studentName,
        answer.uuid,
      );
    }
  } else if (lesson) {
    boardContext.setAnswerForStudent(
      lesson.name,
      lesson.uuid,
      question.name,
      question.uuid,
      answer.uuid,
    );
  }

  notationStore.setParent(answerUUId, "ANSWER");

  loaded.value = true; // signal child
}
</script>
