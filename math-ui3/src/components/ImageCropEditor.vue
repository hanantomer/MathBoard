<template>
  <div v-if="show" class="image-crop-root" @pointerdown.stop>
    <div class="image-crop-frame" :style="frameStyle">
      <div class="image-crop-window" :style="cropWindowStyle">
        <div
          v-for="handle in handles"
          :key="handle"
          class="crop-handle"
          :class="'crop-handle--' + handle"
          @pointerdown="(e) => startDrag(handle, e)"
        />
      </div>
    </div>
    <div class="image-crop-actions">
      <v-btn icon size="small" color="success" @click="applyCrop">
        <v-icon>mdi-check</v-icon>
      </v-btn>
      <v-btn icon size="small" color="error" @click="cancelCrop">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useEventListener } from "@vueuse/core";
import { useEditModeStore } from "../store/pinia/editModeStore";
import { useCellStore } from "../store/pinia/cellStore";
import { useNotationStore } from "../store/pinia/notationStore";
import { ImageNotationAttributes } from "common/baseTypes";
import useNotationMutateHelper from "../helpers/notationMutateHelper";

type Handle = "n" | "s" | "e" | "w" | "nw" | "ne" | "sw" | "se";

const MIN_CROP_SIZE = 24;
const handles: Handle[] = ["nw", "n", "ne", "e", "se", "s", "sw", "w"];

const editModeStore = useEditModeStore();
const cellStore = useCellStore();
const notationStore = useNotationStore();
const notationMutateHelper = useNotationMutateHelper();

const frameLeft = ref(0);
const frameTop = ref(0);
const frameWidth = ref(0);
const frameHeight = ref(0);
const frameRotation = ref(0);

const crop = ref({ x: 0, y: 0, width: 0, height: 0 });

const show = computed(() => editModeStore.isImageCroppingMode());

const selectedImage = computed(() => {
  const selected = notationStore.getSelectedNotations();
  if (selected.length !== 1 || selected[0].notationType !== "IMAGE") {
    return null;
  }
  return selected[0] as ImageNotationAttributes;
});

const frameStyle = computed(() => ({
  left: `${frameLeft.value}px`,
  top: `${frameTop.value}px`,
  width: `${frameWidth.value}px`,
  height: `${frameHeight.value}px`,
  transform: `rotate(${frameRotation.value}deg)`,
  transformOrigin: "center center",
}));

const cropWindowStyle = computed(() => ({
  left: `${crop.value.x}px`,
  top: `${crop.value.y}px`,
  width: `${crop.value.width}px`,
  height: `${crop.value.height}px`,
}));

function syncLayout() {
  const image = selectedImage.value;
  if (!image) return;

  const svg = cellStore.getSvgBoundingRect();
  const colW = cellStore.getCellHorizontalWidth();
  const rowH = cellStore.getCellVerticalHeight();

  frameLeft.value = svg.left + image.fromCol * colW;
  frameTop.value = svg.top + image.fromRow * rowH;
  frameWidth.value = (image.toCol - image.fromCol + 1) * colW;
  frameHeight.value = (image.toRow - image.fromRow + 1) * rowH;
  frameRotation.value = image.rotation ?? 0;
}

function resetCropToFullFrame() {
  crop.value = {
    x: 0,
    y: 0,
    width: frameWidth.value,
    height: frameHeight.value,
  };
}

function clampCrop(next: {
  x: number;
  y: number;
  width: number;
  height: number;
}) {
  let { x, y, width, height } = next;
  width = Math.max(MIN_CROP_SIZE, width);
  height = Math.max(MIN_CROP_SIZE, height);

  if (x < 0) {
    width += x;
    x = 0;
  }
  if (y < 0) {
    height += y;
    y = 0;
  }
  if (x + width > frameWidth.value) {
    width = frameWidth.value - x;
  }
  if (y + height > frameHeight.value) {
    height = frameHeight.value - y;
  }

  width = Math.max(MIN_CROP_SIZE, Math.min(width, frameWidth.value - x));
  height = Math.max(MIN_CROP_SIZE, Math.min(height, frameHeight.value - y));

  return { x, y, width, height };
}

function toLocalDelta(dx: number, dy: number) {
  const rad = (-frameRotation.value * Math.PI) / 180;
  return {
    x: dx * Math.cos(rad) - dy * Math.sin(rad),
    y: dx * Math.sin(rad) + dy * Math.cos(rad),
  };
}

function startDrag(handle: Handle, e: PointerEvent) {
  e.preventDefault();
  e.stopPropagation();

  const startX = e.clientX;
  const startY = e.clientY;
  const startCrop = { ...crop.value };

  const onMove = (ev: PointerEvent) => {
    const { x: localDx, y: localDy } = toLocalDelta(
      ev.clientX - startX,
      ev.clientY - startY,
    );

    let { x, y, width, height } = startCrop;

    if (handle.includes("e")) {
      width = startCrop.width + localDx;
    }
    if (handle.includes("w")) {
      x = startCrop.x + localDx;
      width = startCrop.width - localDx;
    }
    if (handle.includes("s")) {
      height = startCrop.height + localDy;
    }
    if (handle.includes("n")) {
      y = startCrop.y + localDy;
      height = startCrop.height - localDy;
    }

    crop.value = clampCrop({ x, y, width, height });
  };

  const onUp = () => {
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
  };

  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);
}

async function applyCrop() {
  const image = selectedImage.value;
  if (!image) return;
  await notationMutateHelper.applyImageCrop(image, { ...crop.value });
}

function cancelCrop() {
  notationMutateHelper.cancelImageCrop();
}

watch(show, (visible) => {
  if (!visible) return;
  syncLayout();
  resetCropToFullFrame();
});

watch(
  () => {
    const image = selectedImage.value;
    if (!show.value || !image) return "";
    const r = cellStore.getSvgBoundingRect();
    return [
      image.uuid,
      image.fromCol,
      image.toCol,
      image.fromRow,
      image.toRow,
      image.rotation ?? 0,
      r.top,
      r.left,
    ].join(":");
  },
  () => {
    if (!show.value) return;
    syncLayout();
  },
);

useEventListener(window, "keydown", (e: KeyboardEvent) => {
  if (!show.value) return;
  if (e.key === "Escape") {
    cancelCrop();
  }
});
</script>

<style scoped>
.image-crop-root {
  position: fixed;
  inset: 0;
  z-index: 120;
  pointer-events: auto;
}

.image-crop-frame {
  position: fixed;
  pointer-events: none;
}

.image-crop-window {
  position: absolute;
  box-sizing: border-box;
  border: 2px dashed #fff;
  outline: 1px solid rgba(0, 0, 0, 0.65);
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.45);
  pointer-events: auto;
  touch-action: none;
}

.crop-handle {
  position: absolute;
  width: 12px;
  height: 12px;
  background: #fff;
  border: 2px solid #1976d2;
  border-radius: 2px;
  pointer-events: auto;
  touch-action: none;
}

.crop-handle--nw {
  top: -6px;
  left: -6px;
  cursor: nwse-resize;
}
.crop-handle--n {
  top: -6px;
  left: calc(50% - 6px);
  cursor: ns-resize;
}
.crop-handle--ne {
  top: -6px;
  right: -6px;
  cursor: nesw-resize;
}
.crop-handle--e {
  top: calc(50% - 6px);
  right: -6px;
  cursor: ew-resize;
}
.crop-handle--se {
  bottom: -6px;
  right: -6px;
  cursor: nwse-resize;
}
.crop-handle--s {
  bottom: -6px;
  left: calc(50% - 6px);
  cursor: ns-resize;
}
.crop-handle--sw {
  bottom: -6px;
  left: -6px;
  cursor: nesw-resize;
}
.crop-handle--w {
  top: calc(50% - 6px);
  left: -6px;
  cursor: ew-resize;
}

.image-crop-actions {
  position: fixed;
  top: 72px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 121;
  pointer-events: auto;
}
</style>
