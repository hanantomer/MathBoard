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
  const video = videoRef.value
  if (!video) return

  hasStarted.value = true
  await nextTick()

  const hlsConfig: Partial<Hls.Config> = {
    // === Key settings for low bandwidth ===
    maxBufferLength: 60,           // seconds - larger buffer absorbs slow downloads
    maxMaxBufferLength: 120,       // allow even more buffer when network is bad
    maxBufferSize: 60 * 1024 * 1024, // ~60MB max buffer (prevents memory issues)

    // ABR (Adaptive Bitrate) improvements
    abrEwmaDefaultEstimate: 500000, // start assuming ~500 kbps (low)
    abrBandWidthFactor: 0.8,        // be more conservative when switching up
    abrBandWidthUpFactor: 0.7,

    // Retry logic for flaky connections
    fragLoadingMaxRetry: 6,
    fragLoadingRetryDelay: 1000,      // 1 second between retries
    fragLoadingMaxRetryTimeout: 15000, // up to 15s total retry time

    enableWorker: true,
    lowLatencyMode: false,            // keep false for VOD (better stability)
    testBandwidth: true,              // important for ABR

    // Optional: start with lower quality
    startLevel: -1,                   // -1 = let ABR choose (recommended)
  }

  // Native HLS first (Safari/iOS)
  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = props.videoSrc
    video.load()
    try { await video.play() } catch (e) {}
    return
  }

  // hls.js with low-bandwidth config
  if (Hls.isSupported()) {
    hlsInstance.value = new Hls(hlsConfig)

    hlsInstance.value.loadSource(props.videoSrc)
    hlsInstance.value.attachMedia(video)

    // Auto-play after metadata
    video.addEventListener('loadedmetadata', async () => {
      try {
        await video.play()
      } catch (err) {
        console.error('Play failed:', err)
      }
    })

    // Log ABR changes for debugging
    hlsInstance.value.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
      console.log(`Switched to quality level ${data.level}`)
    })
  }
}

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
