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
import useNotationLoadingHelper from "../helpers/notationLoadingHelper";
import useUserOutgoingOperations from "../helpers/userOutgoingOperationsHelper";
import { computed, ref } from "vue";
import { useUserStore } from "../store/pinia/userStore";
import { useLessonStore } from "../store/pinia/lessonStore";
import { useNotationStore } from "../store/pinia/notationStore";
import { watch, onMounted } from "vue";
import { useRoute } from "vue-router";
import { heartBeatInterval } from "../../../math-common/src/globals";
import lessonStudents from "./LessonStudents.vue";

const route = useRoute();

const userStore = useUserStore();
const lessonStore = useLessonStore();
const notationStore = useNotationStore();
const notationLoadingHelper = useNotationLoadingHelper();
const userOutgoingOperations = useUserOutgoingOperations();

let loaded = ref(false);
const svgId = "lessonSvg";
const isTeacher = computed(() => {
  return userStore.isTeacher();
});
const lessonTitle = computed(() => {
  return lessonStore.getCurrentLesson().name;
});
let lessonUUID = ref("");

/// TODO deal with mutations which originate from user incoming synchronisation
onMounted(() => {
  notationStore.$subscribe((mutation, state) => {
    console.log("a change happened");
    console.log(mutation, state);
  });
});


watch(
  route,
  (to) => {
    lessonUUID.value = to.params.lessonUUId as string;
  },
  { immediate: true },
);

onMounted(() => {
  loadLesson(lessonUUID.value);
  loaded.value = true;
});

async function loadLesson(lessonUUID: string) {
  notationStore.setParent(lessonUUID, "LESSON");

  await lessonStore.setCurrentLesson(lessonUUID);

  // if student, send heartbeat to teacher
  if (!userStore.isTeacher()) {
    setInterval(
      userOutgoingOperations.syncOutgoingHeartBeat,
      heartBeatInterval,
      lessonStore.getCurrentLesson().uuid,
    );
  }

  // load notations
  await notationLoadingHelper.loadNotations();
}
</script>
