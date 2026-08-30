<template>
  <Teleport to="body">
    <div
      v-if="tip"
      ref="balloonEl"
      class="practice-coach-balloon"
      :class="[
        `practice-coach-balloon--${variant}`,
        {
          'practice-coach-balloon--tail-right': tailOnRight && !dragged,
          'practice-coach-balloon--no-tail': dragged,
          'practice-coach-balloon--dragging': dragging,
        },
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
        @pointerdown.stop
      >
        ×
      </button>
      <div
        class="practice-coach-balloon__drag"
        title="Drag to move"
        data-cy="practice-coach-balloon-drag"
        @pointerdown="onDragStart"
      >
        <span class="practice-coach-balloon__grip" aria-hidden="true" />
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
      </div>
      <div class="practice-coach-balloon__text">{{ tip }}</div>
      <div v-if="$slots.default" class="practice-coach-balloon__actions">
        <slot />
      </div>
      <div
        v-if="!dragged"
        class="practice-coach-balloon__tail"
        aria-hidden="true"
      />
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

const balloonEl = ref<HTMLElement | null>(null);
const anchor = ref<DOMRect | null>(null);
const tailOnRight = ref(false);
const dragged = ref<{ left: number; top: number } | null>(null);
const dragging = ref(false);
const size = ref({ width: 260, height: 140 });
let rafId = 0;
let remeasureTimer: ReturnType<typeof setTimeout> | undefined;
let sizeObserver: ResizeObserver | undefined;

function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(min, n), Math.max(min, max));
}

function exerciseBounds() {
  const pad = 12;
  const pane = document.querySelector(
    "[data-cy=practice-problem-pane]",
  ) as HTMLElement | null;
  const paneRect = pane?.getBoundingClientRect();
  let minLeft = pad;
  let minTop = 64 + pad;
  let maxRight = window.innerWidth - pad;
  const maxBottom = window.innerHeight - pad;

  if (paneRect && paneRect.width > 0 && paneRect.height > 0) {
    const isLeftColumn =
      paneRect.height > window.innerHeight * 0.45 &&
      paneRect.left < window.innerWidth / 2;
    if (isLeftColumn) {
      minLeft = Math.max(minLeft, Math.ceil(paneRect.right) + pad);
    } else {
      minTop = Math.max(minTop, Math.ceil(paneRect.bottom) + pad);
    }
  }

  const symbols = document.querySelector(
    "[data-cy=special-symbols-toolbar]",
  ) as HTMLElement | null;
  const symbolsRect = symbols?.getBoundingClientRect();
  if (
    symbolsRect &&
    symbolsRect.width > 80 &&
    window.matchMedia("(min-width: 1024px)").matches
  ) {
    maxRight = Math.min(maxRight, Math.floor(symbolsRect.left) - pad);
  }

  return { minLeft, minTop, maxRight, maxBottom };
}

function clampToBoard(left: number, top: number, width: number, height: number) {
  const b = exerciseBounds();
  return {
    left: clamp(left, b.minLeft, b.maxRight - width),
    top: clamp(top, b.minTop, b.maxBottom - height),
  };
}

function measureSize() {
  const el = balloonEl.value;
  if (!el) return;
  const rect = el.getBoundingClientRect();
  if (rect.width > 0 && rect.height > 0) {
    size.value = { width: Math.ceil(rect.width), height: Math.ceil(rect.height) };
  }
}

function observeSize() {
  sizeObserver?.disconnect();
  sizeObserver = undefined;
  const el = balloonEl.value;
  if (!el) return;
  sizeObserver = new ResizeObserver(() => measureSize());
  sizeObserver.observe(el);
  measureSize();
}

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

function onDragStart(e: PointerEvent) {
  if (e.button !== 0) return;
  const el = balloonEl.value;
  if (!el) return;
  e.preventDefault();
  const startX = e.clientX;
  const startY = e.clientY;
  const origin = el.getBoundingClientRect();
  dragging.value = true;
  el.setPointerCapture(e.pointerId);

  const onMove = (ev: PointerEvent) => {
    dragged.value = clampToBoard(
      origin.left + (ev.clientX - startX),
      origin.top + (ev.clientY - startY),
      origin.width,
      origin.height,
    );
  };
  const onUp = (ev: PointerEvent) => {
    dragging.value = false;
    try {
      el.releasePointerCapture(ev.pointerId);
    } catch {
      /* already released */
    }
    el.removeEventListener("pointermove", onMove);
    el.removeEventListener("pointerup", onUp);
    el.removeEventListener("pointercancel", onUp);
  };
  el.addEventListener("pointermove", onMove);
  el.addEventListener("pointerup", onUp);
  el.addEventListener("pointercancel", onUp);
}

watch(
  () => [props.tip, props.notations] as const,
  () => {
    dragged.value = null;
    scheduleMeasure();
    clearTimeout(remeasureTimer);
    remeasureTimer = setTimeout(() => {
      scheduleMeasure();
      observeSize();
    }, 50);
  },
  { immediate: true, deep: true },
);

watch(balloonEl, () => observeSize());

if (typeof window !== "undefined") {
  window.addEventListener("resize", scheduleMeasure);
  window.addEventListener("scroll", scheduleMeasure, true);
}

onUnmounted(() => {
  cancelAnimationFrame(rafId);
  clearTimeout(remeasureTimer);
  sizeObserver?.disconnect();
  window.removeEventListener("resize", scheduleMeasure);
  window.removeEventListener("scroll", scheduleMeasure, true);
});

const balloonStyle = computed((): CSSProperties => {
  const width = size.value.width;
  const height = size.value.height;
  const b = exerciseBounds();

  if (dragged.value) {
    const pos = clampToBoard(
      dragged.value.left,
      dragged.value.top,
      width,
      height,
    );
    return {
      position: "fixed",
      top: `${pos.top}px`,
      left: `${pos.left}px`,
      width: "260px",
      zIndex: 1001,
    };
  }

  const r = anchor.value;
  if (!r) {
    const pos = clampToBoard(b.minLeft, b.minTop, width, height);
    return {
      position: "fixed",
      top: `${pos.top}px`,
      left: `${pos.left}px`,
      width: "260px",
      zIndex: 1001,
    };
  }

  const gap = 56;
  let left = r.left;
  let top = r.bottom + gap;
  if (top + height > b.maxBottom) {
    top = r.top;
    left = r.right + gap;
  }
  if (left + width > b.maxRight) {
    left = r.left - width - gap;
  }
  if (left < b.minLeft) {
    left = b.minLeft;
  }

  const pos = clampToBoard(left, top, width, height);
  return {
    position: "fixed",
    top: `${pos.top}px`,
    left: `${pos.left}px`,
    width: "260px",
    zIndex: 1001,
  };
});

watch(
  balloonStyle,
  (style) => {
    const r = anchor.value;
    if (!r || !style.left || dragged.value) {
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
  padding: 8px 28px 12px 14px;
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

.practice-coach-balloon--dragging {
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.18);
  user-select: none;
}

.practice-coach-balloon__drag {
  cursor: grab;
  margin: -4px -8px 6px -4px;
  padding: 8px 8px 4px 4px;
  touch-action: none;
}

.practice-coach-balloon--dragging .practice-coach-balloon__drag {
  cursor: grabbing;
}

.practice-coach-balloon__grip {
  display: block;
  width: 28px;
  height: 4px;
  margin: 0 auto 6px;
  border-radius: 2px;
  background: rgba(0, 0, 0, 0.22);
}

.practice-coach-balloon__header {
  display: flex;
  align-items: center;
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

.practice-coach-balloon__actions :deep(.v-btn) {
  min-width: 0;
  padding-inline: 0;
  text-transform: none;
  letter-spacing: 0;
}

.practice-coach-balloon__close {
  position: absolute;
  top: 4px;
  right: 8px;
  z-index: 1;
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
  left: 22px;
  top: -7px;
  width: 12px;
  height: 12px;
  background: inherit;
  border-left: 1px solid rgba(60, 50, 30, 0.16);
  border-top: 1px solid rgba(60, 50, 30, 0.16);
  transform: rotate(45deg);
}

.practice-coach-balloon--tail-right .practice-coach-balloon__tail {
  left: auto;
  right: 22px;
  top: -7px;
  border-left: 1px solid rgba(60, 50, 30, 0.16);
  border-top: 1px solid rgba(60, 50, 30, 0.16);
  border-right: 0;
  border-bottom: 0;
}

.practice-coach-balloon--no-tail .practice-coach-balloon__tail {
  display: none;
}
</style>
