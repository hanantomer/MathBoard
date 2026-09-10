<template>
  <lineWatcher
    :startEntry="{
      editMode: ['FREE_SKETCH_WITH_OCR_STARTED'],
      func: startOcrSketchDrawing,
    }"
    :drawEntry="{
      editMode: ['FREE_SKETCH_WITH_OCR_DRAWING'],
      func: drawOcrSketch,
    }"
    :saveEntry="{
      editMode: ['FREE_SKETCH_WITH_OCR_DRAWING'],
      func: endOcrSketchDrawing,
    }"
    :selectEntry="{
      editMode: ['FREE_SKETCH_WITH_OCR_STARTED'],
      func: () => {},
      event: 'EV_FREE_SKETCH_SELECTED',
    }"
    :moveByKeyEntry="{
      editMode: [],
      func: () => {},
    }"
    :endEntry="{
      editMode: [],
    }"
    :editEntryFirstHandle="{
      editMode: [],
      func: () => {},
    }"
    :editEntrySecondHandle="{
      editMode: [],
      func: () => {},
    }"
  />

  <div v-show="show">
    <svg
      :style="lineSvgScreenStyle"
      class="line-svg"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        class="line free-sketch-ocr-preview"
        id="freeSketchOcrPath"
        data-cy="freeSketchOcrEditor"
        d="M0 0"
        stroke-linecap="round"
        fill="transparent"
        stroke="black"
      />
    </svg>
  </div>
</template>

<script setup lang="ts">
import lineWatcher from "./LineWatcher.vue";
import useNotationMutateHelper from "../helpers/notationMutateHelper";
import useApiHelper from "../helpers/apiHelper";
import useScreenHelper from "../helpers/screenHelper";
import {
  OCR_STROKE_DEBOUNCE_MS,
  renderStrokesToImageBase64,
} from "../helpers/freeSketchOcrHelper";
import { computed, nextTick, onUnmounted, watch } from "vue";
import { useEditModeStore } from "../store/pinia/editModeStore";
import { useCellStore } from "../store/pinia/cellStore";
import useWatchHelper from "../helpers/watchHelper";
import { getStroke } from "perfect-freehand";
import { DotCoordinates } from "common/baseTypes";
import { matrixSize } from "common/globals";

const notationMutateHelper = useNotationMutateHelper();
const apiHelper = useApiHelper();
const screenHelper = useScreenHelper();
const editModeStore = useEditModeStore();
const cellStore = useCellStore();
const watchHelper = useWatchHelper();

type Point = { x: number; y: number };

let currentStroke: Point[] = [];
let batchStrokes: Point[][] = [];
let ocrDebounceTimer: ReturnType<typeof setTimeout> | undefined;
let ocrInFlight = false;

const show = computed(() => {
  return (
    editModeStore.isFreeSketchOcrDrawingMode() ||
    editModeStore.isFreeSketchOcrStartedMode()
  );
});

watch(show, async (visible) => {
  if (visible) {
    await nextTick();
    const id = cellStore.getSvgId();
    if (id) {
      cellStore.setSvgBoundingRect(id);
    }
  }
});

const lineSvgScreenStyle = computed(() => {
  const r = cellStore.getSvgBoundingRect();
  return {
    position: "fixed" as const,
    top: `${r.top}px`,
    left: `${r.left}px`,
    width: matrixSize.width,
    height: matrixSize.height,
    margin: "0",
    pointerEvents: "none" as const,
  };
});

watchHelper.watchGlobalEditModeChange((newMode, oldMode) => {
  if (
    oldMode === "FREE_SKETCH_WITH_OCR" &&
    newMode !== "FREE_SKETCH_WITH_OCR"
  ) {
    resetOcrBatch();
  }
});

onUnmounted(() => {
  resetOcrBatch();
});

function resetOcrBatch() {
  clearTimeout(ocrDebounceTimer);
  ocrDebounceTimer = undefined;
  currentStroke = [];
  batchStrokes = [];
  updatePreviewPath();
}

function startOcrSketchDrawing(p: DotCoordinates): boolean {
  currentStroke = [{ x: p.x, y: p.y }];
  updatePreviewPath();
  editModeStore.setEditMode("FREE_SKETCH_WITH_OCR_DRAWING");
  return true;
}

function drawOcrSketch(p: DotCoordinates) {
  currentStroke.push({ x: p.x, y: p.y });
  updatePreviewPath();
}

async function endOcrSketchDrawing(): Promise<string> {
  if (currentStroke.length >= 2) {
    batchStrokes.push([...currentStroke]);
  }
  currentStroke = [];
  updatePreviewPath();
  scheduleOcrProcessing();
  return "";
}

function scheduleOcrProcessing() {
  clearTimeout(ocrDebounceTimer);
  if (batchStrokes.length === 0) {
    return;
  }
  ocrDebounceTimer = setTimeout(() => {
    void processOcrBatch();
  }, OCR_STROKE_DEBOUNCE_MS);
}

async function processOcrBatch() {
  if (ocrInFlight || batchStrokes.length === 0) {
    return;
  }

  const strokes = batchStrokes.map((stroke) => [...stroke]);
  batchStrokes = [];
  currentStroke = [];
  updatePreviewPath();

  const rendered = renderStrokesToImageBase64(strokes);
  if (!rendered) {
    return;
  }

  ocrInFlight = true;
  try {
    const { symbol } = await apiHelper.recognizeSketchOcr(rendered.imageBase64);
    if (!symbol?.trim()) {
      throw new Error("OCR returned an empty symbol");
    }
    const rect = cellStore.getSvgBoundingRect();
    const cell = screenHelper.getCellByDotCoordinates({
      x: rendered.center.x + rect.left,
      y: rendered.center.y + rect.top,
    });
    await notationMutateHelper.addSymbolNotationAtCell(cell, symbol);
  } catch (error) {
    console.error("Sketch OCR failed:", error);
    await saveStrokesAsFreeSketches(strokes);
  } finally {
    ocrInFlight = false;
    editModeStore.setEditMode("FREE_SKETCH_WITH_OCR_STARTED");
  }
}

async function saveStrokesAsFreeSketches(strokes: Point[][]) {
  for (const stroke of strokes) {
    if (stroke.length >= 2) {
      await notationMutateHelper.addFreeSketchNotation({ points: stroke });
    }
  }
}

function getSvgPathFromStroke(points: Array<[number, number]>) {
  if (!points.length) return "";
  return (
    points.reduce((path, [x, y], index) => {
      return index === 0 ? `M ${x} ${y}` : `${path} L ${x} ${y}`;
    }, "") + " Z"
  );
}

function strokeToPathData(points: Point[]): string {
  if (points.length < 2) return "";

  let lastPoint: Point | null = null;
  const strokePoints = points.map((p) => {
    let pressure = 0.55;
    if (lastPoint) {
      const dist = Math.hypot(p.x - lastPoint.x, p.y - lastPoint.y);
      const speedFactor = Math.min(dist / 25, 1);
      pressure = Math.max(0.2, Math.min(1, 0.75 - speedFactor * 0.4));
    }
    lastPoint = p;
    return [p.x, p.y, pressure] as [number, number, number];
  });

  const stroke = getStroke(strokePoints, {
    size: 1.5,
    thinning: 0.18,
    smoothing: 0.9,
    streamline: 0.52,
    simulatePressure: true,
    last: true,
    start: { cap: true, taper: 0 },
    end: { cap: true, taper: 2 },
  });

  return getSvgPathFromStroke(stroke);
}

function updatePreviewPath() {
  const pathElement = document.getElementById("freeSketchOcrPath");
  if (!pathElement) return;

  const allStrokes = [
    ...batchStrokes,
    ...(currentStroke.length >= 2 ? [currentStroke] : []),
  ];

  if (allStrokes.length === 0) {
    pathElement.setAttribute("d", "M0 0");
    return;
  }

  const combined = allStrokes
    .map((stroke) => strokeToPathData(stroke))
    .filter(Boolean)
    .join(" ");

  pathElement.setAttribute("d", combined || "M0 0");
}
</script>

<style>
.free-sketch-ocr-preview {
  stroke-width: 2px;
  opacity: 0.85;
}
</style>
