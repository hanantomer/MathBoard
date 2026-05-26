<template>
  <div class="lesson-page d-flex">
    <v-sheet class="lesson-sheet">
      <v-overlay
        :model-value="!loaded"
        contained
        persistent
        class="lesson-loading-overlay"
      >
        <v-progress-circular indeterminate color="primary" size="48" />
        <div class="text-body-2 mt-3">Loading lesson…</div>
      </v-overlay>
      <mathBoard :svgId="svgId" :loaded="loaded"> </mathBoard>
    </v-sheet>
  </div>
</template>

<script setup lang="ts">
import mathBoard from "./MathBoard.vue";
import useUserOutgoingOperations from "../helpers/userOutgoingOperationsHelper";
import useUserIncomingOperations from "../helpers/userIncomingOperationsHelper";
import useSelectionHelper from "../helpers/selectionHelper";

import { ref, onMounted, onUnmounted, watch } from "vue";
import { useUserStore } from "../store/pinia/userStore";
import { useLessonStore } from "../store/pinia/lessonStore";
import { useNotationStore } from "../store/pinia/notationStore";
import { useRoute } from "vue-router";
import { heartBeatInterval } from "common/globals";
import { useTitleStore } from "../store/pinia/titleStore";
import { useCellStore } from "../store/pinia/cellStore";
import { useEditModeStore } from "../store/pinia/editModeStore";
import { useLessonMediaStore } from "../store/pinia/lessonMediaStore";
import { FeathersHelper } from "../helpers/feathersHelper";
import { UserType } from "common/unions";
import { LessonMediaPolicy } from "common/lessonMediaTypes";
import {
  initLessonMediaSession,
  leaveLessonMedia,
} from "../helpers/lessonWebRtcHelper";

const selectionHelper = useSelectionHelper();
const route = useRoute();
const userStore = useUserStore();
const lessonStore = useLessonStore();
const notationStore = useNotationStore();
const titleStore = useTitleStore();
const cellStore = useCellStore();
const editModeStore = useEditModeStore();
const lessonMediaStore = useLessonMediaStore();
const userOutgoingOperations = useUserOutgoingOperations();
const userIncomingOperations = useUserIncomingOperations();

let loaded = ref(false);
const svgId = "lessonSvg";
let loadSeq = 0;

onMounted(() => {
  cellStore.setSvgBoundingRect(svgId);
});

onUnmounted(async () => {
  await leaveLessonMedia();
  lessonMediaStore.reset();
  userStore.setLessonLoginAsStudent(false);
});

async function fetchInitialMediaPolicy(
  lessonUUId: string,
): Promise<LessonMediaPolicy> {
  const feathersClient = FeathersHelper.getInstance();
  const policy = await feathersClient
    .service("lessonMediaSync")
    .find({ query: { lessonUUId } });
  return policy as LessonMediaPolicy;
}

async function prepareLessonMedia(lessonUUId: string) {
  const user = userStore.getCurrentUser();
  if (!user) {
    return;
  }

  lessonMediaStore.reset(lessonUUId);

  try {
    const policy = await fetchInitialMediaPolicy(lessonUUId);
    lessonMediaStore.setPolicy(policy);
    await initLessonMediaSession(lessonUUId, user.uuid, userStore.isTeacher());
  } catch (error) {
    console.error("[LessonMedia] Failed to prepare:", error);
  }
}

watch(
  route,
  async (to) => {
    await loadLesson(to.params.lessonUUId as string);
  },
  { immediate: true },
);

function normalizeLessonUUId(lessonUUId: string): string {
  if (lessonUUId.indexOf("sl_") === 0) {
    return lessonUUId.substring(3);
  }
  return lessonUUId;
}

function canTeach(userType: UserType | undefined): boolean {
  return userType === "TEACHER" || userType === "BOTH";
}

function applyLessonRole(lesson: { user?: { uuid: string } }) {
  const user = userStore.getCurrentUser();
  if (!user) {
    return;
  }

  const isOwner = lesson.user?.uuid === user.uuid;
  userStore.setLessonLoginAsStudent(canTeach(user.userType) && !isOwner);

  if (FeathersHelper.isConnected()) {
    FeathersHelper.rejoinLessonChannel();
  }
}

function isStaleLoad(seq: number, lessonUUId: string): boolean {
  if (seq !== loadSeq) {
    return true;
  }
  const routeId = route.params.lessonUUId as string | undefined;
  if (!routeId) {
    return true;
  }
  return normalizeLessonUUId(routeId) !== lessonUUId;
}

async function loadLesson(rawLessonUUId: string) {
  const lessonUUId = normalizeLessonUUId(rawLessonUUId);
  const seq = ++loadSeq;
  loaded.value = false;

  await leaveLessonMedia();
  lessonMediaStore.reset();

  editModeStore.setDefaultEditMode();
  selectionHelper.setSelectedCell({ col: 1, row: 1 }, true);

  if (!lessonStore.getLessons().get(lessonUUId)) {
    await lessonStore.loadLesson(lessonUUId);
  }
  if (isStaleLoad(seq, lessonUUId)) {
    return;
  }

  if (!lessonStore.getLessons().get(lessonUUId)) {
    lessonStore.finishOpeningLesson();
    throw Error("invalid lesson:" + lessonUUId);
  }

  await lessonStore.setCurrentLesson(lessonUUId);
  if (isStaleLoad(seq, lessonUUId)) {
    return;
  }

  applyLessonRole(lessonStore.getCurrentLesson()!);

  notationStore.setParent(lessonUUId, "LESSON");

  if (!userStore.isTeacher()) {
    setInterval(
      userOutgoingOperations.syncOutgoingHeartBeat,
      heartBeatInterval,
      userStore.getCurrentUser()!.uuid,
      lessonStore.getCurrentLesson()!.uuid,
    );
  }
  userIncomingOperations.syncIncomingUserOperations();

  await prepareLessonMedia(lessonUUId);
  if (isStaleLoad(seq, lessonUUId)) {
    return;
  }

  if (!userStore.isTeacher()) {
    await lessonStore.addLessonToSharedLessons();
  }
  if (isStaleLoad(seq, lessonUUId)) {
    return;
  }

  titleStore.setTitle(lessonStore.getCurrentLesson()!.name);
  lessonStore.finishOpeningLesson();
  loaded.value = true;
}
</script>

<style scoped>
.lesson-page {
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
}

.lesson-sheet {
  position: relative;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  background: transparent;
}

.lesson-loading-overlay {
  align-items: center;
  justify-content: center;
  flex-direction: column;
}
</style>
