<template>
  <v-row>
    <v-col cols="10">
      <mathBoard :svgId="svgId" :loaded="loaded">
        <template #title
          ><p>{{ lessonTitle }}</p></template
        >1
      </mathBoard>
    </v-col>
    <v-col cols="2" v-if="isTeacher">
      <lesson-students></lesson-students>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">

import mathBoard from "./MathBoard.vue";
import useMatrixHelper from "../helpers/matrixHelper";
import useActivateObjectHelper from "../helpers/activateObjectHelper";
import useNotationLoadingHelper from "../helpers/notationLoadingHelper";
import useUserOutgoingOperations from "../helpers/userOutgoingOperationsHelper";
import { computed, ref } from "vue"
import { useUserStore } from "../store/pinia/userStore";
import { useLessonStore } from "../store/pinia/lessonStore";
import { watch } from 'vue'
import { useRoute } from 'vue-router'
import { heartBeatInterval } from "../../../math-common/src/globals";

const route = useRoute();
const matrixHelper = useMatrixHelper();
const activateObjectHelper = useActivateObjectHelper();
const userStore = useUserStore();
const lessonStore = useLessonStore();
const notationLoadingHelper = useNotationLoadingHelper();
const userOutgoingOperations = useUserOutgoingOperations();


let loaded = ref(false);
const svgId = "lessonSvg";
const isTeacher = computed(() => { return userStore.isTeacher() });
const lessonTitle = computed(() => { return lessonStore.getCurrentLesson().name });

watch(route, (to) => {
  loadLesson(to.params.lessonUUId as string);
  loaded.value = true;
}, {immediate: true });

async function loadLesson (lessonUUID: string) {

  activateObjectHelper.reset();
  matrixHelper.setMatrix(svgId);
  await lessonStore.setCurrentLesson(lessonUUID);

  // if student, send heartbeat to teacher
  if (!userStore.isTeacher()) {
    setInterval(
      userOutgoingOperations.syncOutgoingHeartBeat,
      heartBeatInterval,
      lessonStore.getCurrentLesson().uuid
    );
  }

  // load notations
  await notationLoadingHelper.loadLessonNotations();
};
</script>
