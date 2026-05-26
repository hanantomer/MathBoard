<template>
  <div
    v-if="showDock && videoDockVisible"
    class="lesson-video-dock"
    :class="{ 'lesson-video-dock--collapsed': !videoDockOpen }"
  >
    <div class="lesson-video-dock__panel">
      <div class="lesson-video-dock__header">
        <span class="lesson-video-dock__title">Video</span>
        <div class="lesson-video-dock__header-actions">
          <v-btn
            icon
            size="x-small"
            variant="text"
            color="white"
            :aria-label="
              videoDockOpen ? 'Collapse video panel' : 'Expand video panel'
            "
            @click="videoDockOpen = !videoDockOpen"
          >
            <v-icon>{{
              videoDockOpen ? "mdi-chevron-down" : "mdi-chevron-up"
            }}</v-icon>
          </v-btn>
          <v-btn
            icon
            size="x-small"
            variant="text"
            color="white"
            aria-label="Hide video panel"
            @click="videoDockVisible = false"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
      </div>

      <div v-show="videoDockOpen" class="lesson-video-dock__body">
        <LessonVideoTile
          v-if="localMediaStream"
          :stream="localMediaStream"
          :label="localLabel"
          :has-video="localCamEnabled"
          :featured="!isTeacher && remoteTiles.length === 0"
          muted
        />

        <LessonVideoTile
          v-for="tile in remoteTiles"
          :key="tile.userUUId"
          :stream="tile.stream"
          :label="tile.label"
          :has-video="tile.hasVideo"
          :featured="tile.featured"
          muted
        />

        <p
          v-if="!localMediaStream && remoteTiles.length === 0"
          class="lesson-video-dock__empty text-caption"
        >
          Waiting for others to join…
        </p>
      </div>

      <div
        v-show="!videoDockOpen"
        class="lesson-video-dock__collapsed-chips"
      >
        <v-chip
          v-if="localMediaStream"
          size="x-small"
          color="primary"
          variant="flat"
        >
          You
        </v-chip>
        <v-chip
          v-for="tile in remoteTiles"
          :key="tile.userUUId"
          size="x-small"
          variant="tonal"
        >
          {{ tile.label }}
        </v-chip>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { storeToRefs } from "pinia";
import { useLessonMediaStore } from "../store/pinia/lessonMediaStore";
import { useUserStore } from "../store/pinia/userStore";
import { useStudentStore } from "../store/pinia/studentStore";
import LessonVideoTile from "./LessonVideoTile.vue";

const route = useRoute();
const userStore = useUserStore();
const studentStore = useStudentStore();
const lessonMediaStore = useLessonMediaStore();

const {
  connected,
  videoDockVisible,
  videoDockOpen,
  localMediaStream,
  localCamEnabled,
  remoteParticipants,
} = storeToRefs(lessonMediaStore);

const showDock = computed(
  () => route.name === "lesson" && connected.value,
);

const isTeacher = computed(() => userStore.isTeacher());

const localLabel = computed(() => {
  const user = userStore.getCurrentUser();
  if (!user) {
    return "You";
  }
  const name = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
  return name ? `${name} (You)` : "You";
});

function isKnownStudent(userUUId: string): boolean {
  return studentStore
    .getStudents()
    .some((student) => student.uuid === userUUId);
}

function participantLabel(userUUId: string): string {
  const student = studentStore
    .getStudents()
    .find((s) => s.uuid === userUUId);
  if (student) {
    const name = `${student.firstName ?? ""} ${student.lastName ?? ""}`.trim();
    if (name) {
      return name;
    }
  }
  if (!isTeacher.value) {
    return "Teacher";
  }
  return "Student";
}

type RemoteTile = {
  userUUId: string;
  stream: MediaStream;
  hasVideo: boolean;
  label: string;
  featured: boolean;
};

const remoteTiles = computed((): RemoteTile[] => {
  const remotes = [...remoteParticipants.value];

  remotes.sort((a, b) => {
    if (isTeacher.value) {
      return participantLabel(a.userUUId).localeCompare(
        participantLabel(b.userUUId),
      );
    }
    const aStudent = isKnownStudent(a.userUUId);
    const bStudent = isKnownStudent(b.userUUId);
    if (aStudent !== bStudent) {
      return aStudent ? 1 : -1;
    }
    return 0;
  });

  const featuredUUId =
    !isTeacher.value && remotes.length > 0
      ? (remotes.find((r) => !isKnownStudent(r.userUUId))?.userUUId ??
        remotes[0].userUUId)
      : null;

  return remotes.map((remote) => ({
    userUUId: remote.userUUId,
    stream: remote.stream,
    hasVideo: remote.hasVideo,
    label: participantLabel(remote.userUUId),
    featured: !isTeacher.value && remote.userUUId === featuredUUId,
  }));
});
</script>

<style scoped>
.lesson-video-dock {
  position: fixed;
  top: calc(64px + 8px);
  right: 8px;
  width: 196px;
  max-height: calc(100vh - 64px - 56px - 16px);
  z-index: 1010;
  pointer-events: none;
}

.lesson-video-dock__panel {
  pointer-events: auto;
  background: rgba(18, 22, 48, 0.94);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
  overflow: hidden;
}

.lesson-video-dock__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 8px 6px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.lesson-video-dock__header-actions {
  display: flex;
  align-items: center;
  gap: 2px;
}

.lesson-video-dock__title {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.85);
}

.lesson-video-dock__body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
  max-height: min(52vh, 420px);
  overflow-y: auto;
}

.lesson-video-dock__collapsed-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 8px;
}

.lesson-video-dock__empty {
  color: rgba(255, 255, 255, 0.55);
  text-align: center;
  margin: 8px 0;
}

/* Narrow viewports: stay on the right; scroll inside the panel, not over the matrix. */
@media (max-width: 1023px) {
  .lesson-video-dock {
    top: calc(64px + max(4px, env(safe-area-inset-top)));
    right: max(4px, env(safe-area-inset-right));
    width: min(168px, calc(100vw - 60px));
    max-height: calc(100dvh - 64px - max(16px, env(safe-area-inset-bottom)));
  }

  .lesson-video-dock__body {
    flex-direction: column;
    flex-wrap: nowrap;
    overflow-x: hidden;
    overflow-y: auto;
    max-height: min(45vh, 360px);
  }
}
</style>
