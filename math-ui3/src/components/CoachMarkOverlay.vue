<template>
  <Teleport to="body">
    <div
      v-if="mark && targetRect"
      class="coach-mark"
      role="dialog"
      aria-modal="true"
      :aria-label="mark.title"
    >
      <div
        class="coach-mark__spotlight"
        :style="spotlightStyle"
        aria-hidden="true"
        @click="dismiss"
      />

      <v-card
        class="coach-mark__card pa-4"
        :style="cardStyle"
        elevation="8"
        rounded="lg"
        max-width="320"
      >
        <div
          v-if="tipProgress"
          class="text-caption text-primary font-weight-medium mb-1"
        >
          Quick tip {{ tipProgress.current }} of {{ tipProgress.total }}
        </div>
        <div class="text-subtitle-1 font-weight-bold mb-1">{{ mark.title }}</div>
        <p class="text-body-2 text-medium-emphasis mb-3">{{ mark.body }}</p>
        <div class="d-flex justify-end ga-2">
          <v-btn
            variant="text"
            size="small"
            data-cy="coach-mark-skip"
            @click="dismiss"
          >
            Skip
          </v-btn>
          <v-btn color="primary" variant="flat" size="small" data-cy="coach-mark-got-it" @click="dismiss">
            Got it
          </v-btn>
        </div>
      </v-card>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, watch, onUnmounted, type CSSProperties } from "vue";
import { useOnboardingStore } from "../store/pinia/onboardingStore";

const onboarding = useOnboardingStore();
const targetRect = ref<DOMRect | null>(null);
let rafId = 0;

const mark = computed(() => onboarding.activeCoachMark);

const tipProgress = computed(() =>
  onboarding.quickTipsProgress(mark.value?.id),
);

function measureTarget() {
  if (!mark.value) {
    targetRect.value = null;
    return;
  }
  const el = document.querySelector(mark.value.targetSelector);
  targetRect.value = el?.getBoundingClientRect() ?? null;
}

function scheduleMeasure() {
  cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(measureTarget);
}

watch(mark, () => scheduleMeasure(), { immediate: true });

if (typeof window !== "undefined") {
  window.addEventListener("resize", scheduleMeasure);
  window.addEventListener("scroll", scheduleMeasure, true);
}

onUnmounted(() => {
  cancelAnimationFrame(rafId);
  window.removeEventListener("resize", scheduleMeasure);
  window.removeEventListener("scroll", scheduleMeasure, true);
});

const spotlightStyle = computed(() => {
  if (!targetRect.value) return {};
  const pad = 6;
  const r = targetRect.value;
  return {
    top: `${r.top - pad}px`,
    left: `${r.left - pad}px`,
    width: `${r.width + pad * 2}px`,
    height: `${r.height + pad * 2}px`,
    boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.5)",
  };
});

const cardStyle = computed((): CSSProperties => {
  if (!targetRect.value) return { display: "none" };
  const r = targetRect.value;
  const top = Math.min(r.bottom + 12, window.innerHeight - 180);
  const left = Math.min(Math.max(12, r.left), window.innerWidth - 332);
  return {
    position: "fixed",
    top: `${top}px`,
    left: `${left}px`,
    zIndex: 10002,
  };
});

function dismiss() {
  onboarding.dismissActiveCoachMark(true);
}
</script>

<style scoped>
.coach-mark {
  position: fixed;
  inset: 0;
  z-index: 10000;
  pointer-events: none;
}

.coach-mark__spotlight {
  position: fixed;
  border-radius: 8px;
  pointer-events: auto;
  z-index: 10001;
  background: transparent;
}

.coach-mark__card {
  pointer-events: auto;
  z-index: 10002;
}
</style>
