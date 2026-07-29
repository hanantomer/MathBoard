<template>
  <v-alert
    v-if="message"
    :type="alertType"
    variant="tonal"
    density="compact"
    class="board-role-banner"
    :icon="icon"
    closable
    @click:close="dismissed = true"
  >
    {{ message }}
  </v-alert>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useBoardContextStore } from "../store/pinia/boardContextStore";
import { useUserStore } from "../store/pinia/userStore";
import authorizationHelper from "../helpers/authorizationHelper";
import { BOARD_ROLE_BANNERS } from "../constants/helpCopy";

const boardContext = useBoardContextStore();
const userStore = useUserStore();
const auth = authorizationHelper();
const dismissed = ref(false);
const canEdit = computed(() => auth.canEdit());

watch(
  () => boardContext.level,
  () => {
    dismissed.value = false;
  },
);

const message = computed(() => {
  if (dismissed.value) {
    return "";
  }
  const level = boardContext.level;
  const isTeacher = userStore.isTeacher();
  const previewAsStudent = userStore.isPreviewingLessonAsStudent();

  if (level === "lesson") {
    if (previewAsStudent) {
      return BOARD_ROLE_BANNERS.lessonTeacherAsStudent;
    }
    if (isTeacher) {
      return "";
    }
    return canEdit.value
      ? BOARD_ROLE_BANNERS.lessonCanEdit
      : BOARD_ROLE_BANNERS.lessonViewOnly;
  }
  if (level === "practice") {
    if (boardContext.breadcrumbs.some((b) => b.to?.name === "practiceBlank")) {
      return BOARD_ROLE_BANNERS.practiceBlank;
    }
    if (!userStore.getCurrentUser()) {
      return BOARD_ROLE_BANNERS.practiceGuest;
    }
    return BOARD_ROLE_BANNERS.practiceStudent;
  }
  if (level === "question") {
    return isTeacher
      ? BOARD_ROLE_BANNERS.questionTeacher
      : BOARD_ROLE_BANNERS.questionStudent;
  }
  if (level === "answer") {
    return isTeacher
      ? BOARD_ROLE_BANNERS.answerTeacher
      : BOARD_ROLE_BANNERS.answerStudent;
  }
  return "";
});

const alertType = computed(() => {
  if (boardContext.level === "practice") {
    return "info";
  }
  if (boardContext.level === "lesson" && !canEdit.value) {
    return "info";
  }
  return "warning";
});

const icon = computed(() => {
  if (boardContext.level === "practice") {
    return "mdi-robot-outline";
  }
  if (boardContext.level === "lesson" && userStore.isTeacher()) {
    return "mdi-information-outline";
  }
  return undefined;
});
</script>

<style scoped>
.board-role-banner {
  position: fixed;
  top: 64px;
  left: 70px;
  right: 12px;
  z-index: 998;
  max-width: 720px;
  margin: 0 auto;
}

@media (max-width: 1023px) {
  .board-role-banner {
    left: 56px;
    right: 8px;
  }
}

</style>
