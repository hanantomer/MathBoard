<template>
  <Teleport to="body">
    <div
      v-if="tip"
      class="practice-coach-balloon"
      role="status"
      :style="balloonStyle"
      data-cy="practice-coach-balloon"
    >
      <button
        type="button"
        class="practice-coach-balloon__close"
        aria-label="Dismiss tip"
        @click="$emit('close')"
      >
        ×
      </button>
      <div class="practice-coach-balloon__text">{{ tip }}</div>
      <div class="practice-coach-balloon__tail" aria-hidden="true" />
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import {
  computed,
  onUnmounted,
  ref,
  watch,
  type CSSProperties,
} from "vue";
import type { NotationAttributes } from "common/baseTypes";
import { getPracticeCoachAnchorRect } from "../helpers/practiceCoachAnchorHelper";

const props = defineProps<{
  tip: string;
  svgId: string;
  notations: NotationAttributes[];
}>();

defineEmits<{ close: [] }>();

const anchor = ref<DOMRect | null>(null);
let rafId = 0;

function measure() {
  anchor.value = getPracticeCoachAnchorRect(props.svgId, props.notations);
}

function scheduleMeasure() {
  cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(measure);
}

watch(
  () => [props.tip, props.notations] as const,
  () => scheduleMeasure(),
  { immediate: true, deep: true },
);

if (typeof window !== "undefined") {
  window.addEventListener("resize", scheduleMeasure);
  window.addEventListener("scroll", scheduleMeasure, true);
}

onUnmounted(() => {
  cancelAnimationFrame(rafId);
  window.removeEventListener("resize", scheduleMeasure);
  window.removeEventListener("scroll", scheduleMeasure, true);
});

const balloonStyle = computed((): CSSProperties => {
  const r = anchor.value;
  const width = 260;
  if (!r) {
    return {
      position: "fixed",
      top: "88px",
      right: "16px",
      width: `${width}px`,
      zIndex: 1001,
    };
  }

  const gap = 10;
  let left = r.right + gap;
  let top = r.top;
  if (left + width > window.innerWidth - 12) {
    left = Math.max(12, r.left - width - gap);
  }
  top = Math.min(Math.max(12, top), window.innerHeight - 120);

  return {
    position: "fixed",
    top: `${top}px`,
    left: `${left}px`,
    width: `${width}px`,
    zIndex: 1001,
  };
});
</script>

<style scoped>
.practice-coach-balloon {
  position: relative;
  background: rgba(255, 252, 245, 0.94);
  border: 1px solid rgba(60, 50, 30, 0.16);
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  padding: 12px 28px 12px 14px;
  pointer-events: auto;
}

.practice-coach-balloon__text {
  color: #2c2416;
  font-size: 0.9rem;
  line-height: 1.35;
}

.practice-coach-balloon__close {
  position: absolute;
  top: 4px;
  right: 8px;
  border: 0;
  background: transparent;
  color: rgba(0, 0, 0, 0.45);
  cursor: pointer;
  font-size: 1.1rem;
  line-height: 1;
  padding: 2px 4px;
}

.practice-coach-balloon__tail {
  position: absolute;
  left: -7px;
  top: 16px;
  width: 12px;
  height: 12px;
  background: rgba(255, 252, 245, 0.94);
  border-left: 1px solid rgba(60, 50, 30, 0.16);
  border-bottom: 1px solid rgba(60, 50, 30, 0.16);
  transform: rotate(45deg);
}
</style>
