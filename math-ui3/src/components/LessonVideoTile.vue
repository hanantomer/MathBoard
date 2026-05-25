<template>
  <div
    class="lesson-video-tile"
    :class="{ 'lesson-video-tile--featured': featured }"
  >
    <video
      ref="videoRef"
      class="lesson-video-tile__video"
      :class="{ 'lesson-video-tile__video--hidden': !hasVideo }"
      playsinline
      autoplay
      :muted="muted"
    />
    <div v-if="!hasVideo" class="lesson-video-tile__placeholder">
      <v-icon color="grey-lighten-1" size="large">mdi-account</v-icon>
    </div>
    <span class="lesson-video-tile__label">{{ label }}</span>
    <v-icon
      v-if="!hasVideo && !muted"
      class="lesson-video-tile__cam-off"
      size="small"
      color="grey-lighten-2"
    >
      mdi-video-off
    </v-icon>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted } from "vue";

const props = defineProps<{
  stream: MediaStream;
  label: string;
  hasVideo: boolean;
  featured?: boolean;
  muted?: boolean;
}>();

const videoRef = ref<HTMLVideoElement | null>(null);

function bindStream() {
  const el = videoRef.value;
  if (!el) {
    return;
  }
  if (el.srcObject !== props.stream) {
    el.srcObject = props.stream;
  }
  void el.play().catch(() => {
    // autoplay may be blocked until user gesture
  });
}

watch(
  () => props.stream,
  () => bindStream(),
  { immediate: true },
);

watch(
  () => props.hasVideo,
  () => bindStream(),
);

watch(videoRef, () => bindStream());

onUnmounted(() => {
  const el = videoRef.value;
  if (el) {
    el.srcObject = null;
  }
});
</script>

<style scoped>
.lesson-video-tile {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  border-radius: 8px;
  overflow: hidden;
  background: #0d1030;
  flex-shrink: 0;
}

.lesson-video-tile--featured {
  aspect-ratio: 16 / 11;
}

.lesson-video-tile__video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.lesson-video-tile__video--hidden {
  opacity: 0;
  pointer-events: none;
}

.lesson-video-tile__placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(145deg, #1a2048 0%, #0d1030 100%);
}

.lesson-video-tile__label {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 4px 6px;
  font-size: 0.65rem;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.75));
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lesson-video-tile__cam-off {
  position: absolute;
  top: 4px;
  right: 4px;
}
</style>
