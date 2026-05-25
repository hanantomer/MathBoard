<template>
  <div v-if="visible" class="lesson-media-bar">
    <v-btn
      v-if="!connected"
      size="small"
      variant="text"
      prepend-icon="mdi-video-plus"
      :loading="connecting"
      @click="onJoinMedia"
    >
      Join audio/video
    </v-btn>

    <template v-else>
      <v-tooltip text="Toggle microphone" location="bottom">
        <template #activator="{ props }">
          <v-btn
            icon
            size="small"
            variant="text"
            v-bind="props"
            :disabled="micToggleDisabled"
            @click="onToggleMic"
            aria-label="Toggle microphone"
          >
            <v-icon>{{
              localMicEnabled ? "mdi-microphone" : "mdi-microphone-off"
            }}</v-icon>
          </v-btn>
        </template>
      </v-tooltip>

      <v-tooltip text="Toggle camera" location="bottom">
        <template #activator="{ props }">
          <v-btn
            icon
            size="small"
            variant="text"
            v-bind="props"
            @click="onToggleCam"
            aria-label="Toggle camera"
          >
            <v-icon>{{ localCamEnabled ? "mdi-video" : "mdi-video-off" }}</v-icon>
          </v-btn>
        </template>
      </v-tooltip>

      <v-tooltip
        :text="videoDockVisible ? 'Hide video panel' : 'Show video panel'"
        location="bottom"
      >
        <template #activator="{ props }">
          <v-btn
            icon
            size="small"
            variant="text"
            v-bind="props"
            aria-label="Toggle video panel visibility"
            @click="onToggleVideoPanel"
          >
            <v-icon color="white">{{
              videoDockVisible ? "mdi-eye-off-outline" : "mdi-dock-window"
            }}</v-icon>
          </v-btn>
        </template>
      </v-tooltip>

      <v-tooltip text="Leave audio/video" location="bottom">
        <template #activator="{ props }">
          <v-btn
            icon
            size="small"
            variant="text"
            color="error"
            v-bind="props"
            @click="onLeaveMedia"
            aria-label="Leave audio/video"
          >
            <v-icon>mdi-phone-hangup</v-icon>
          </v-btn>
        </template>
      </v-tooltip>
    </template>

    <template v-if="isTeacher && policy">
      <v-divider vertical class="mx-1" />
      <v-tooltip
        :text="muteAllActive ? 'Unmute all' : 'Mute all'"
        location="bottom"
      >
        <template #activator="{ props }">
          <v-btn
            icon
            size="small"
            variant="text"
            v-bind="props"
            :color="muteAllActive ? 'success' : 'warning'"
            @click="muteAllActive ? unmuteAll() : muteAll()"
          >
            <v-icon>{{
              muteAllActive ? "mdi-microphone" : "mdi-microphone-off"
            }}</v-icon>
          </v-btn>
        </template>
      </v-tooltip>
    </template>

    <v-tooltip v-if="errorMessage" :text="errorMessage" location="bottom">
      <template #activator="{ props }">
        <v-icon v-bind="props" color="warning" size="small" class="ml-1">
          mdi-alert-circle-outline
        </v-icon>
      </template>
    </v-tooltip>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { storeToRefs } from "pinia";
import { useLessonMediaStore } from "../store/pinia/lessonMediaStore";
import { useUserStore } from "../store/pinia/userStore";
import { useLessonStore } from "../store/pinia/lessonStore";
import useUserOutgoingOperations from "../helpers/userOutgoingOperationsHelper";
import {
  requestLessonMedia,
  toggleLocalMic,
  toggleLocalCam,
  stopLocalMedia,
} from "../helpers/lessonWebRtcHelper";

const route = useRoute();
const lessonMediaStore = useLessonMediaStore();
const userStore = useUserStore();
const lessonStore = useLessonStore();
const userOutgoingOperations = useUserOutgoingOperations();

const {
  connected,
  connecting,
  localMicEnabled,
  localCamEnabled,
  errorMessage,
  muteAllActive,
  policy,
  videoDockVisible,
  videoDockOpen,
} = storeToRefs(lessonMediaStore);

const currentUser = computed(() => userStore.getCurrentUser());

const visible = computed(() => route.name === "lesson");

const isTeacher = computed(
  () => !!currentUser.value && userStore.isTeacher(),
);

const micToggleDisabled = computed(() => {
  if (isTeacher.value) {
    return false;
  }
  const userUUId = userStore.getCurrentUser()?.uuid;
  if (!userUUId || !policy.value) {
    return false;
  }
  return lessonMediaStore.isMicBlockedForStudent(userUUId);
});

async function onJoinMedia() {
  const user = userStore.getCurrentUser();
  if (!user || !policy.value) {
    return;
  }
  lessonMediaStore.errorMessage = null;
  await requestLessonMedia(policy.value, user.uuid, isTeacher.value);
}

async function onToggleMic() {
  const user = userStore.getCurrentUser();
  if (!user) {
    return;
  }
  await toggleLocalMic(!localMicEnabled.value, user.uuid, isTeacher.value);
}

async function onToggleCam() {
  await toggleLocalCam(!localCamEnabled.value);
}

function onToggleVideoPanel() {
  if (videoDockVisible.value) {
    videoDockVisible.value = false;
    return;
  }
  videoDockVisible.value = true;
  videoDockOpen.value = true;
}

async function onLeaveMedia() {
  await stopLocalMedia();
}

function muteAll() {
  const lessonUUId = lessonStore.getCurrentLesson()?.uuid;
  if (!lessonUUId) {
    return;
  }
  userOutgoingOperations.syncOutgoingLessonMediaAction(lessonUUId, "muteAll");
}

function unmuteAll() {
  const lessonUUId = lessonStore.getCurrentLesson()?.uuid;
  if (!lessonUUId) {
    return;
  }
  userOutgoingOperations.syncOutgoingLessonMediaAction(lessonUUId, "unmuteAll");
}
</script>

<style scoped>
.lesson-media-bar {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-right: 10px;
  flex-shrink: 0;
}
</style>
