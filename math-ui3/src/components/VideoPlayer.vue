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
import Hls, { HlsConfig } from "hls.js";
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
  await nextTick();

  const hlsConfig: Partial<HlsConfig> = {
    // === Key settings for low bandwidth ===
    maxBufferLength: 30, // smaller buffer reduces initial wait time on slow networks
    maxMaxBufferLength: 60,
    maxBufferSize: 20 * 1024 * 1024, // lower memory footprint and less initial buffering
    maxLoadingDelay: 4,
    minAutoBitrate: 150000,
    abrEwmaDefaultEstimate: 200000, // assume ~200 kbps to start lower
    abrBandWidthFactor: 0.7,
    abrBandWidthUpFactor: 0.6,
    capLevelToPlayerSize: true,

    // Retry logic for flaky connections
    fragLoadingMaxRetry: 8,
    fragLoadingRetryDelay: 1000,
    fragLoadingMaxRetryTimeout: 20000,
    levelLoadingMaxRetry: 6,

    enableWorker: true,
    lowLatencyMode: false,
    testBandwidth: true,

    // Start at lowest quality available on weak networks
    startLevel: 0,
  };

  // Native HLS first (Safari/iOS)
  if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = props.videoSrc;
    video.load();
    try {
      await video.play();
    } catch (e) {}
    return;
  }

  // hls.js with low-bandwidth config
  if (Hls.isSupported()) {
    hlsInstance.value = new Hls(hlsConfig);

    hlsInstance.value.attachMedia(video);

    hlsInstance.value.on(Hls.Events.MANIFEST_PARSED, async () => {
      try {
        await video.play();
      } catch (err) {
        console.error("Play failed:", err);
      }
    });

    hlsInstance.value.on(Hls.Events.ERROR, (event, data) => {
      console.error("HLS error:", event, data);
      if (data?.fatal) {
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            console.warn("HLS network error, trying to recover...");
            hlsInstance.value?.startLoad();
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            console.warn("HLS media error, recovering media...");
            hlsInstance.value?.recoverMediaError();
            break;
          default:
            console.error("HLS fatal error, destroying instance.");
            hlsInstance.value?.destroy();
            break;
        }
      }
    });

    // Log ABR changes for debugging
    hlsInstance.value.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
      console.log(`Switched to quality level ${data.level}`);
    });

    hlsInstance.value.loadSource(props.videoSrc);
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
