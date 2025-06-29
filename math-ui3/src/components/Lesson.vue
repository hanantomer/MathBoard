<template>
  <div class="d-flex">
    <v-sheet>
      <mathBoard :svgId="svgId" :loaded="loaded"> </mathBoard>
    </v-sheet>
    <v-sheet class="mt-10">
      <lessonStudents></lessonStudents>
    </v-sheet>
  </div>
</template>

<script setup lang="ts">
import mathBoard from "./MathBoard.vue";
import useUserOutgoingOperations from "../helpers/userOutgoingOperationsHelper";
import useUserIncomingOperations from "../helpers/userIncomingOperationsHelper";
import { ref, onMounted } from "vue";
import { useUserStore } from "../store/pinia/userStore";
import { useLessonStore } from "../store/pinia/lessonStore";
import { useNotationStore } from "../store/pinia/notationStore";
import { watch } from "vue";
import { useRoute } from "vue-router";
import { heartBeatInterval } from "../../../math-common/src/globals";
import { useEditModeStore } from "../store/pinia/editModeStore";
import { useTitleStore } from "../store/pinia/titleStore";
import { useCellStore } from "../store/pinia/cellStore";
import lessonStudents from "./LessonStudents.vue";
import useSelectionHelper from "../helpers/selectionHelper";
const selectionHelper = useSelectionHelper();

const route = useRoute();

const userStore = useUserStore();
const lessonStore = useLessonStore();
const notationStore = useNotationStore();
const editModeStore = useEditModeStore();
const titleStore = useTitleStore();
const cellStore = useCellStore();
const userOutgoingOperations = useUserOutgoingOperations();
const userIncomingOperations = useUserIncomingOperations();


let loaded = ref(false);
const svgId = "lessonSvg";

onMounted(() => {
  cellStore.setSvgBoundingRect(svgId);
});

watch(
  route,
  async (to) => {
    await loadLesson(to.params.lessonUUId as string);
  },
  { immediate: true },
);

async function loadLesson(lessonUUId: string) {
  // for student link remove the prefix "sl_"
  if (lessonUUId.indexOf("sl_") == 0) {
    lessonUUId = lessonUUId.substring(3);
  }

  selectionHelper.setSelectedCell({ col: 1, row: 1 }, true);

  // store might not be loaded yet
  if (!lessonStore.getLessons().get(lessonUUId)) {
    await lessonStore.loadLesson(lessonUUId);
  }

  if (!lessonStore.getLessons().get(lessonUUId)) {
    throw Error("invalid lesson:" + lessonUUId);
  }

  await lessonStore.setCurrentLesson(lessonUUId);

  notationStore.setParent(lessonUUId, "LESSON");

  // if student, send heartbeat to teacher
  if (!userStore.isTeacher()) {
    setInterval(
      userOutgoingOperations.syncOutgoingHeartBeat,
      heartBeatInterval,
      userStore.getCurrentUser()!.uuid,
      lessonStore.getCurrentLesson()!.uuid,
    );
  }
  userIncomingOperations.syncIncomingUserOperations(svgId);

  if (!userStore.isTeacher()) {
    lessonStore.addLessonToSharedLessons();
  }

  titleStore.setTitle(lessonStore.getCurrentLesson()!.name);
  loaded.value = true;
}
</script>
