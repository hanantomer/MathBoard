<template>
  <v-row class="fill-height">
    <v-col cols="10">
      <mathBoard :svgId="svgId" :loaded="loaded">
        <template #title
          ><p>{{ lessonTitle }}</p></template
        >
      </mathBoard>
    </v-col>
    <v-col cols="2" v-if="isTeacher">
      <lessonStudents></lessonStudents>
    </v-col>
  </v-row>
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
import lessonStudents from "./LessonStudents.vue";

const route = useRoute();

const userStore = useUserStore();
const lessonStore = useLessonStore();
const notationStore = useNotationStore();
const userOutgoingOperations = useUserOutgoingOperations();
const userIncomingOperations = useUserIncomingOperations();

let loaded = ref(false);
const svgId = "lessonSvg";
const isTeacher = computed(() => {
  return userStore.isTeacher();
});
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
  userIncomingOperations.syncIncomingUserOperations();

  if (!userStore.isTeacher()) {
    lessonStore.addLessonToSharedLessons();
  }

  loaded.value = true;
}
</script>
