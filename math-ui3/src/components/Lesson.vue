<template>
  <div class="d-flex">
    <v-sheet>
      <mathBoard :svgId="svgId" :loaded="loaded">
        <template #title
          ><p class="title">
            {{ lessonTitle }}
          </p></template
        >
      </mathBoard>
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
import { computed, ref } from "vue";
import { useUserStore } from "../store/pinia/userStore";
import { useLessonStore } from "../store/pinia/lessonStore";
import { useNotationStore } from "../store/pinia/notationStore";
import { watch } from "vue";
import { useRoute } from "vue-router";
import { heartBeatInterval } from "../../../math-common/src/globals";
import { useEditModeStore } from "../store/pinia/editModeStore";
import lessonStudents from "./LessonStudents.vue";

const route = useRoute();

const userStore = useUserStore();
const lessonStore = useLessonStore();
const notationStore = useNotationStore();
const editModeStore = useEditModeStore();
const userOutgoingOperations = useUserOutgoingOperations();
const userIncomingOperations = useUserIncomingOperations();

let loaded = ref(false);
const svgId = "lessonSvg";

const lessonTitle = computed(() => {
  if (!lessonStore.getCurrentLesson()) return;
  return lessonStore.getCurrentLesson()!.name;
});

watch(
  route,
  async (to) => {
    await loadLesson(to.params.lessonUUId as string);
  },
  { immediate: true },
);

async function loadLesson(lessonUUId: string) {
  editModeStore.setDefaultEditMode();
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
      lessonStore.getCurrentLesson()!.uuid,
    );
  }
  userIncomingOperations.syncIncomingUserOperations(svgId);

  if (!userStore.isTeacher()) {
    lessonStore.addLessonToSharedLessons();
  }

  loaded.value = true;
}
</script>
