<template>
  <lineWatcher
    :startEntry="{
      editMode: ['PARABOLA_STARTED', 'HYPERBOLA_STARTED'],
      func: initConic,
    }"
    :drawEntry="{
      editMode: ['CONIC_DRAWING'],
      func: setScaleFromPoint,
    }"
    :editEntryFirstHandle="{
      editMode: ['CONIC_EDITING_VERTEX'],
      func: moveVertex,
    }"
    :editEntrySecondHandle="{
      editMode: ['CONIC_EDITING_SCALE'],
      func: setScaleFromPoint,
    }"
    :saveEntry="{
      editMode: ['CONIC_DRAWING', 'CONIC_EDITING_VERTEX', 'CONIC_EDITING_SCALE'],
      func: endDrawConic,
    }"
    :selectEntry="{
      editMode: ['CONIC_SELECTED'],
      func: selectConic,
      event: 'EV_CONIC_SELECTED',
    }"
    :moveByKeyEntry="{
      editMode: ['CONIC_SELECTED'],
      func: moveConic,
    }"
    :endEntry="{
      editMode: ['CONIC_SELECTED'],
    }"
  ></lineWatcher>
  <div v-show="show">
    <line-handle
      data-cy="conicVertexHandle"
      drawing-mode="CONIC_DRAWING"
      editing-mode="CONIC_EDITING_VERTEX"
      v-show="handlesInteractive"
      v-bind:style="{
        left: handleVertexX + 'px',
        top: handleVertexY + 'px',
      }"
    ></line-handle>
    <line-handle
      data-cy="conicScaleHandle"
      drawing-mode="CONIC_DRAWING"
      editing-mode="CONIC_EDITING_SCALE"
      v-show="handlesInteractive"
      v-bind:style="{
        left: handleScaleX + 'px',
        top: handleScaleY + 'px',
      }"
    ></line-handle>

    <svg
      :style="lineSvgScreenStyle"
      :viewBox="overlayViewBox"
      preserveAspectRatio="none"
      class="line-svg"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        v-for="(d, i) in overlayPaths"
        :key="'branch-' + i"
        :d="d"
        fill="none"
        stroke="black"
        stroke-width="2"
        stroke-linecap="round"
        data-cy="conicDrawer"
      />
      <path
        v-for="(d, i) in overlayAsymptotes"
        :key="'asym-' + i"
        :d="d"
        fill="none"
        stroke="black"
        stroke-width="1"
        stroke-dasharray="6,6"
        data-cy="conicAsymptote"
      />
    </svg>
  </div>
</template>
<script setup lang="ts">
import lineHandle, { LINE_HANDLE_HALF } from "./LineHandle.vue";
import lineWatcher from "./LineWatcher.vue";
import useNotationMutateHelper from "../helpers/notationMutateHelper";
import { computed, nextTick, ref, watch } from "vue";
import { useNotationStore } from "../store/pinia/notationStore";
import { useEditModeStore } from "../store/pinia/editModeStore";
import { useCellStore } from "../store/pinia/cellStore";
import {
  ConicAttributes,
  ConicKind,
  ConicNotationAttributes,
  DotCoordinates,
  NotationAttributes,
} from "common/baseTypes";
import { matrixSize } from "common/globals";
import {
  getBoardSvgUserExtent,
  svgUserToViewport,
} from "../helpers/pointerCoordinateHelper";
import {
  conicAsymptotePaths,
  conicFromVertexAndPoint,
  conicScaleHandlePoint,
  conicSvgPaths,
  DEFAULT_PARABOLA_HALF_WIDTH,
  hyperbolaBFromPoint,
} from "common/conicGeometry";

const notationMutateHelper = useNotationMutateHelper();
const notationStore = useNotationStore();
const editModeStore = useEditModeStore();
const cellStore = useCellStore();

const HANDLE_HALF = LINE_HANDLE_HALF;

const handlesInteractive = computed(() => {
  const mode = editModeStore.getEditMode();
  return (
    mode === "CONIC_SELECTED" ||
    mode === "CONIC_EDITING_VERTEX" ||
    mode === "CONIC_EDITING_SCALE"
  );
});

const pendingKind = ref<ConicKind>("parabola");

const conicAttributes = ref<ConicAttributes>({
  kind: "parabola",
  hx: 0,
  hy: 0,
  axis: "vertical",
  a: 0,
});

watch(
  () => editModeStore.getEditMode(),
  (mode) => {
    if (mode === "PARABOLA_STARTED") pendingKind.value = "parabola";
    if (mode === "HYPERBOLA_STARTED") pendingKind.value = "hyperbola";
  },
);

function roundPoint(point: DotCoordinates): DotCoordinates {
  return {
    x: Math.round(point.x),
    y: Math.round(point.y),
  };
}

const overlayPaths = computed(() => conicSvgPaths(conicAttributes.value));
const overlayAsymptotes = computed(() =>
  editModeStore.isConicSelectedMode() || editModeStore.isConicDrawingMode()
    ? conicAsymptotePaths(conicAttributes.value)
    : [],
);

const scalePoint = computed(() =>
  conicScaleHandlePoint(conicAttributes.value),
);

const overlayViewBox = computed(() => {
  cellStore.getSvgBoundingRect();
  const e = getBoardSvgUserExtent();
  if (!e.width || !e.height) return undefined;
  return `${e.x} ${e.y} ${e.width} ${e.height}`;
});

const handleVertexX = computed(() => {
  cellStore.getSvgBoundingRect();
  return svgUserToViewport(conicAttributes.value.hx, conicAttributes.value.hy).x - HANDLE_HALF;
});
const handleVertexY = computed(() => {
  cellStore.getSvgBoundingRect();
  return svgUserToViewport(conicAttributes.value.hx, conicAttributes.value.hy).y - HANDLE_HALF;
});
const handleScaleX = computed(() => {
  cellStore.getSvgBoundingRect();
  return svgUserToViewport(scalePoint.value.x, scalePoint.value.y).x - HANDLE_HALF;
});
const handleScaleY = computed(() => {
  cellStore.getSvgBoundingRect();
  return svgUserToViewport(scalePoint.value.x, scalePoint.value.y).y - HANDLE_HALF;
});

const show = computed(() => {
  return (
    editModeStore.isConicDrawingMode() || editModeStore.isConicSelectedMode()
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
    width: r.width ? `${r.width}px` : matrixSize.width,
    height: r.height ? `${r.height}px` : matrixSize.height,
    margin: "0",
    pointerEvents: "none" as const,
    overflow: "visible",
    zIndex: 998,
  };
});

function initConic(p: DotCoordinates) {
  const point = roundPoint(p);
  conicAttributes.value = conicFromVertexAndPoint(
    pendingKind.value,
    point.x,
    point.y,
    point.x + DEFAULT_PARABOLA_HALF_WIDTH,
    point.y + DEFAULT_PARABOLA_HALF_WIDTH,
  );
  conicAttributes.value.a = 0;
}

function selectConic(notation: NotationAttributes) {
  const c = notation as ConicNotationAttributes;
  conicAttributes.value = {
    kind: c.kind,
    hx: c.hx,
    hy: c.hy,
    axis: c.axis,
    a: c.a,
    b: c.b,
  };
  pendingKind.value = c.kind;
  const el = document.getElementById(notation.uuid) as HTMLElement | null;
  if (el) el.style.display = "none";
  notationStore.selectNotation(notation.uuid);
}

function setScaleFromPoint(p: DotCoordinates) {
  const point = roundPoint(p);
  const cur = conicAttributes.value;
  if (
    cur.kind === "hyperbola" &&
    editModeStore.getEditMode() === "CONIC_EDITING_SCALE" &&
    Math.abs(cur.a) > 8
  ) {
    const along =
      cur.axis === "horizontal"
        ? Math.abs(point.x - cur.hx) >= Math.abs(cur.a) * 0.6
        : Math.abs(point.y - cur.hy) >= Math.abs(cur.a) * 0.6;
    if (!along) {
      conicAttributes.value = {
        ...cur,
        b: hyperbolaBFromPoint(cur, point.x, point.y),
      };
      return;
    }
  }
  conicAttributes.value = conicFromVertexAndPoint(
    cur.kind,
    cur.hx,
    cur.hy,
    point.x,
    point.y,
  );
}

function moveVertex(p: DotCoordinates) {
  const point = roundPoint(p);
  const dx = point.x - conicAttributes.value.hx;
  const dy = point.y - conicAttributes.value.hy;
  conicAttributes.value = {
    ...conicAttributes.value,
    hx: point.x,
    hy: point.y,
  };
  void dx;
  void dy;
}

async function endDrawConic(): Promise<string> {
  const attrs: ConicAttributes = {
    kind: conicAttributes.value.kind,
    hx: Math.round(conicAttributes.value.hx),
    hy: Math.round(conicAttributes.value.hy),
    axis: conicAttributes.value.axis,
    a: conicAttributes.value.a,
    b: conicAttributes.value.b,
  };
  conicAttributes.value = attrs;
  return saveConic(attrs);
}

async function saveConic(attrs: ConicAttributes): Promise<string> {
  if (notationStore.getSelectedNotations().length > 0) {
    const updated = {
      ...notationStore.getSelectedNotations().at(0)!,
      ...attrs,
    };
    await notationMutateHelper.updateConicNotation(
      updated as ConicNotationAttributes,
    );
    return updated.uuid;
  }
  return await notationMutateHelper.addConicNotation(attrs);
}

function moveConic(moveX: number, moveY: number) {
  if (!notationStore.getSelectedNotations().length) return;
  conicAttributes.value = {
    ...conicAttributes.value,
    hx: Math.round(conicAttributes.value.hx + moveX),
    hy: Math.round(conicAttributes.value.hy + moveY),
  };
  saveConic(conicAttributes.value);
}
</script>
