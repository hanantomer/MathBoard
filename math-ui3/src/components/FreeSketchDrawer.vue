<template>
  <lineWatcher
    :startEntry="{
      editMode: ['CELL_SELECTED'],
      func: startFreeSketchDrawing,
    }"
    :drawEntry="{
      editMode: ['FREE_SKETCH_DRAWING'],
      func: drawFreeSketch,
    }"
    :saveEntry="{
      editMode: ['FREE_SKETCH_DRAWING'],
      func: endFreeSketchDrawing,
    }"
    :selectEntry="{
      editMode: [],
      func: () => {},
      event: 'EV_FREE_SKETCH_SELECTED',
    }"
    :moveByKeyEntry="{
      editMode: ['FREE_SKETCH_SELECTED'],
      func: moveFreeSketch,
    }"
    :endEntry="{
      editMode: ['FREE_SKETCH_SELECTED'],
    }"
    :editEntryFirstHandle="{
      editMode: [],
      func: () => {},
    }"
    :editEntrySecondHandle="{
      editMode: [],
      func: () => {},
    }"
  ></lineWatcher>

  <div v-show="show">
    <svg
      :style="{
        width: matrixSize.width,
        height: matrixSize.height,
      }"
      id="freeSketchSvgId"
      class="line-svg"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        class="line"
        id="freeSketchPath"
        d="M0 0"
        stroke-linecap="round"
        fill="transparent"
        stroke="black"
      ></path>
    </svg>
  </div>
</template>

<script setup lang="ts">
import lineWatcher from "./LineWatcher.vue";
import useNotationMutateHelper from "../helpers/notationMutateHelper";
import { computed } from "vue";
import { useNotationStore } from "../store/pinia/notationStore";
import { useEditModeStore } from "../store/pinia/editModeStore";
import { useCellStore } from "../store/pinia/cellStore";
import { getStroke } from "perfect-freehand";
import {
  DotCoordinates,
  NotationAttributes,
  FreeSketchNotationAttributes,
} from "common/baseTypes";

import { matrixSize } from "common/globals";

const notationMutateHelper = useNotationMutateHelper();
const notationStore = useNotationStore();
const editModeStore = useEditModeStore();
const cellStore = useCellStore();

type Point = {
  x: number;
  y: number;
};

let sketchPoints: Point[] = [];

const show = computed(() => {
  return editModeStore.isFreeSketchDrawingMode();
});

function startFreeSketchDrawing(p: DotCoordinates) {
  if (editModeStore.getGlobalEditMode() !== "FREE_SKETCH") {
    return;
  }

  sketchPoints = [];
  sketchPoints.push({
    x: p.x,
    y: p.y,
  });
  updateSketchPath();
  editModeStore.setEditMode("FREE_SKETCH_DRAWING");
}

function drawFreeSketch(p: DotCoordinates) {
  sketchPoints.push({
    x: p.x,
    y: p.y,
  });
  updateSketchPath();
}

function moveFreeSketch(moveX: number, moveY: number) {
  sketchPoints = sketchPoints.map((point) => ({
    x: point.x + moveX,
    y: point.y + moveY,
  }));
  updateSketchPath();
}

function getSvgPathFromStroke(points: Array<[number, number]>) {
  if (!points.length) return "";
  return (
    points.reduce((path, [x, y], index) => {
      return index === 0 ? `M ${x} ${y}` : `${path} L ${x} ${y}`;
    }, "") + " Z"
  );
}

function updateSketchPath() {
  const pathElement = document.getElementById("freeSketchPath");
  if (!pathElement) return;

  if (sketchPoints.length === 0) {
    pathElement.setAttribute("d", "M0 0");
    return;
  }

  const offsetX = cellStore.getSvgBoundingRect().left - 10;

  // Generate a simulated pressure (0..1) based on stroke speed.
  // Slower strokes create thicker lines (higher "pressure"), while fast strokes thin out.
  let lastPoint: Point | null = null;
  const strokePoints = sketchPoints.map((p) => {
    const scaledX = p.x + offsetX;
    const scaledY = p.y;

    let pressure = 0.55;
    if (lastPoint) {
      const dx = scaledX - lastPoint.x;
      const dy = scaledY - lastPoint.y;
      const dist = Math.hypot(dx, dy);
      // Map distance to a pressure value that keeps strokes legible for letters/numbers.
      const speedFactor = Math.min(dist / 25, 1); // larger = faster
      pressure = 0.75 - speedFactor * 0.4;
      pressure = Math.max(0.2, Math.min(1, pressure));
    }

    lastPoint = { x: scaledX, y: scaledY };
    return [scaledX, scaledY, pressure] as [number, number, number];
  });

  const stroke = getStroke(strokePoints, {
    size: 1.5, // thin strokes — good for small/precise numbers
    thinning: 0.18, // very low → almost uniform width (less artistic taper)
    smoothing: 0.9, // strong jitter removal, but not extreme (keeps corners)
    streamline: 0.52, // balanced responsiveness vs smoothness
    simulatePressure: true, // fake pressure from velocity (helps mouse feel natural)
    easing: (t: number) => 1 - (1 - t) ** 2.4, // gentle ease-out → subtle end taper

    last: true, // better final stroke shape

    start: {
      cap: true,
      taper: 0, // no start taper → crisp beginning
    },
    end: {
      cap: true,
      taper: 2, // very small end taper (helps without rounding corners)
    },
  });

  pathElement.setAttribute("d", getSvgPathFromStroke(stroke));
}

async function endFreeSketchDrawing(): Promise<string> {
  if (sketchPoints.length < 2) {
    return "";
  }

  const uuid = await saveFreeSketch(sketchPoints);
  return uuid;
}

async function saveFreeSketch(points: Point[]): Promise<string> {
  if (notationStore.getSelectedNotations().length > 0) {
    let updatedSketch = {
      ...notationStore.getSelectedNotations().at(0)!,
      points,
    };

    notationMutateHelper.updateFreeSketchNotation(
      updatedSketch as FreeSketchNotationAttributes,
    );
    return updatedSketch.uuid;
  } else {
    return await notationMutateHelper.addFreeSketchNotation({ points });
  }
}
</script>

<style>
.line {
  stroke-width: 2px;
}
</style>
