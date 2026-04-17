<template>
  <div class="video-wrapper">
    <div class="video-container">
      <video
        ref="videoRef"
        class="video-player"
        width="100%"
        height="auto"
        controls
        playsinline
        :class="{ hidden: !hasStarted }"
      ></video>

      <!-- Overlay with Vuetify Button (shown before playing) -->
      <div v-if="!hasStarted" class="play-overlay">
        <v-btn
          color="primary"
          size="x-large"
          variant="elevated"
          prepend-icon="mdi-play"
          @click="startPlayback"
          class="play-btn"
        >
          {{ title || "Play Tutorial" }}
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onBeforeUnmount } from "vue";
import Hls from "hls.js";
import { useDisplay } from "vuetify"; // optional: for responsive tweaks

const props = defineProps<{
  videoSrc: string;
  title?: string;
}>();

const videoRef = ref<HTMLVideoElement | null>(null);
const hlsInstance = ref<Hls | null>(null);
const hasStarted = ref(false);

const { mobile } = useDisplay(); // optional

const startPlayback = async () => {
  const video = videoRef.value;
  if (!video) return;

  hasStarted.value = true;

  // Small delay so the video element becomes visible in DOM
  await nextTick();

  try {
    // 1. Native HLS support (Safari, iOS)
    const canNativeHls =
      video.canPlayType("application/vnd.apple.mpegurl") === "probably" ||
      video.canPlayType("application/x-mpegURL") === "probably";

    if (canNativeHls) {
      video.src = props.videoSrc;
      await video.play();
      return;
    }

    // 2. hls.js fallback
    if (Hls.isSupported()) {
      hlsInstance.value = new Hls({
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        enableWorker: true,
        lowLatencyMode: false,
      });

      hlsInstance.value.attachMedia(video);
      hlsInstance.value.loadSource(props.videoSrc);

      hlsInstance.value.on(Hls.Events.ERROR, (event, data) => {
        console.error("HLS error:", event, data);
      });

      video.addEventListener("loadedmetadata", async () => {
        try {
          await video.play();
        } catch (err) {
          console.warn("Autoplay prevented:", err);
        }
      });
    } else {
      console.error("HLS is not supported in this browser");
    }
  } catch (err) {
    console.error("Failed to start video playback:", err);
  }
};

// Cleanup on component destroy
onBeforeUnmount(() => {
  if (hlsInstance.value) {
    hlsInstance.value.destroy();
    hlsInstance.value = null;
  }
});
</script>

<style scoped>

.video-wrapper {
  position: relative;
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
}

.video-container {
  position: relative;
  background: #000;
  border-radius: 12px;
  overflow: hidden;
  aspect-ratio: 16 / 9; /* Keeps good aspect ratio */
}

.video-player {
  width: 100%;
  height: 100%;
  display: block;
}

.video-player.hidden {
  display: none;
}

.play-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.play-btn {
  font-size: 1.3rem;
  padding: 12px 32px;
  min-width: 220px;
}
</style>
