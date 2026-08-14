<template>
  <Teleport to="body">
    <div
      v-if="tip"
      class="practice-coach-balloon"
      :class="[
        `practice-coach-balloon--${variant}`,
        { 'practice-coach-balloon--tail-right': tailOnRight },
      ]"
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
      <div v-if="title || speaking" class="practice-coach-balloon__header">
        <v-icon
          v-if="speaking"
          size="16"
          icon="mdi-volume-high"
          class="mr-1"
        />
        <span v-if="title" class="practice-coach-balloon__title">{{
          title
        }}</span>
      </div>
      <div class="practice-coach-balloon__text">{{ tip }}</div>
      <div v-if="$slots.default" class="practice-coach-balloon__actions">
        <slot />
      </div>
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

const props = withDefaults(
  defineProps<{
    tip: string;
    svgId: string;
    notations: NotationAttributes[];
    title?: string;
    variant?: "tip" | "success" | "warning";
    speaking?: boolean;
  }>(),
  {
    title: "",
    variant: "tip",
    speaking: false,
  },
);

defineEmits<{ close: [] }>();

const anchor = ref<DOMRect | null>(null);
const tailOnRight = ref(false);
let rafId = 0;
let remasureTimer: ReturnType<typeof setTimeout> | undefined;

function measure() {
  const rect = getPracticeCoachAnchorRect(props.svgId, props.notations);
  if (!rect) {
    anchor.value = null;
    return;
  }
  const board = document.getElementById(props.svgId)?.getBoundingClientRect();
  if (board) {
    const visible = !(
      rect.bottom < board.top ||
      rect.top > board.bottom ||
      rect.right < board.left ||
      rect.left > board.right
    );
    anchor.value = visible ? rect : board;
  } else {
    anchor.value = rect;
  }
}

function scheduleMeasure() {
  cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(measure);
}

watch(
  () => [props.tip, props.notations] as const,
  () => {
    scheduleMeasure();
    clearTimeout(remeasureTimer);
    remasureTimer = setTimeout(scheduleMeasure, 50);
  },
  { immediate: true, deep: true },
);

if (typeof window !== "undefined") {
  window.addEventListener("resize", scheduleMeasure);
  window.addEventListener("scroll", scheduleMeasure, true);
}

onUnmounted(() => {
  cancelAnimationFrame(rafId);
  clearTimeout(remeasureTimer);
  window.removeEventListener("resize", scheduleMeasure);
  window.removeEventListener("scroll", scheduleMeasure, true);
});

const balloonStyle = computed((): CSSProperties => {
  const r = anchor.value;
  const width = 260;
  const heightGuess = 120;
  if (!r) {
    return {
      position: "fixed",
      top: "88px",
      left: "96px",
      width: `${width}px`,
      zIndex: 1001,
    };
  }

  const gap = 10;
  const minLeft = 12;
  const maxLeft = window.innerWidth - width - 12;
  let left = r.right + gap;
  if (left > maxLeft) {
    left = r.left - width - gap;
  }
  left = Math.min(Math.max(minLeft, left), Math.max(minLeft, maxLeft));

  const top = Math.min(
    Math.max(64, r.top),
    window.innerHeight - heightGuess,
  );

  return {
    position: "fixed",
    top: `${top}px`,
    left: `${left}px`,
    width: `${width}px`,
    zIndex: 1001,
  };
});

watch(
  balloonStyle,
  (style) => {
    const r = anchor.value;
    if (!r || !style.left) {
      tailOnRight.value = false;
      return;
    }
    const left = parseFloat(String(style.left));
    tailOnRight.value = left + 130 < r.left;
  },
  { immediate: true },
);
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

.practice-coach-balloon--success {
  background: rgba(232, 245, 233, 0.96);
  border-color: rgba(46, 125, 50, 0.28);
}

.practice-coach-balloon--warning {
  background: rgba(255, 243, 224, 0.96);
  border-color: rgba(239, 108, 0, 0.28);
}

.practice-coach-balloon__header {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
  color: #2c2416;
  font-size: 0.78rem;
  font-weight: 600;
}

.practice-coach-balloon__text {
  color: #2c2416;
  font-size: 0.9rem;
  line-height: 1.35;
}

.practice-coach-balloon__actions {
  margin-top: 8px;
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
  background: inherit;
  border-left: 1px solid inherit;
  border-bottom: 1px solid inherit;
  border-left-color: rgba(60, 50, 30, 0.16);
  border-bottom-color: rgba(60, 50, 30, 0.16);
  transform: rotate(45deg);
}

.practice-coach-balloon--tail-right .practice-coach-balloon__tail {
  left: auto;
  right: -7px;
  border-left: 0;
  border-bottom: 0;
  border-right: 1px solid rgba(60, 50, 30, 0.16);
  border-top: 1px solid rgba(60, 50, 30, 0.16);
}
</style>
