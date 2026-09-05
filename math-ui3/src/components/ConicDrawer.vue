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
      editMode: [
        'CONIC_DRAWING',
        'CONIC_EDITING_VERTEX',
        'CONIC_EDITING_SCALE',
        'CONIC_EDITING_OPENING',
      ],
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
      title="Move"
      role="move"
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
      title="Width"
      :role="conicAttributes.axis === 'vertical' ? 'resize-x' : 'resize-y'"
      drawing-mode="CONIC_DRAWING"
      editing-mode="CONIC_EDITING_SCALE"
      v-show="handlesInteractive"
      v-bind:style="{
        left: handleScaleX + 'px',
        top: handleScaleY + 'px',
      }"
    ></line-handle>
    <line-handle
      data-cy="conicOpeningHandle"
      title="Open"
      :role="conicAttributes.axis === 'vertical' ? 'resize-y' : 'resize-x'"
      drawing-mode="CONIC_DRAWING"
      editing-mode="CONIC_EDITING_OPENING"
      v-show="handlesInteractive"
      v-bind:style="{
        left: handleOpeningX + 'px',
        top: handleOpeningY + 'px',
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
        :key="'hit-' + i"
        :d="d"
        fill="none"
        stroke="transparent"
        stroke-width="16"
        stroke-linecap="round"
        :pointer-events="handlesInteractive ? 'stroke' : 'none'"
        :style="{ cursor: handlesInteractive ? 'move' : 'default' }"
        @pointerdown="onBodyPointerDown"
      />
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
      <line
        v-if="guideScale"
        :x1="conicAttributes.hx"
        :y1="conicAttributes.hy"
        :x2="guideScale.x"
        :y2="guideScale.y"
        stroke="#333"
        stroke-width="1"
        stroke-dasharray="4,4"
        opacity="0.45"
      />
      <line
        v-if="guideOpening"
        :x1="conicAttributes.hx"
        :y1="conicAttributes.hy"
        :x2="guideOpening.x"
        :y2="guideOpening.y"
        stroke="#333"
        stroke-width="1"
        stroke-dasharray="4,4"
        opacity="0.45"
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
import useWatchHelper from "../helpers/watchHelper";
import useShapeDrawingHelper from "../helpers/shapeDrawingHelper";
import {
  ConicAttributes,
  ConicKind,
  ConicNotationAttributes,
  DotCoordinates,
  NotationAttributes,
} from "common/baseTypes";
import { matrixSize } from "common/globals";
import {
  clientPointToSvgUser,
  getBoardSvgUserExtent,
  svgUserToViewport,
} from "../helpers/pointerCoordinateHelper";
import {
  conicAsymptotePaths,
  conicFromVertexAndPoint,
  conicMoveBy,
  conicOpeningHandlePoint,
  conicScaleHandlePoint,
  conicSvgPaths,
  defaultConicAt,
  hyperbolaBFromPoint,
  hyperbolaScaleAFromPoint,
  parabolaOpenFromPoint,
  parabolaScaleSizeFromPoint,
} from "common/conicGeometry";

const notationMutateHelper = useNotationMutateHelper();
const notationStore = useNotationStore();
const editModeStore = useEditModeStore();
const cellStore = useCellStore();
const watchHelper = useWatchHelper();
const shapeDrawingHelper = useShapeDrawingHelper();

const HANDLE_HALF = LINE_HANDLE_HALF;

const handlesInteractive = computed(() => {
  const mode = editModeStore.getEditMode();
  return (
    mode === "CONIC_SELECTED" ||
    mode === "CONIC_EDITING_VERTEX" ||
    mode === "CONIC_EDITING_SCALE" ||
    mode === "CONIC_EDITING_OPENING"
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

function snapToGrid(point: DotCoordinates): DotCoordinates {
  const w = cellStore.getCellHorizontalWidth() || 1;
  const h = cellStore.getCellVerticalHeight() || 1;
  return {
    x: Math.round(point.x / w) * w,
    y: Math.round(point.y / h) * h,
  };
}

const overlayPaths = computed(() => conicSvgPaths(conicAttributes.value));
const overlayAsymptotes = computed(() =>
  editModeStore.isConicSelectedMode() || editModeStore.isConicDrawingMode()
    ? conicAsymptotePaths(conicAttributes.value)
    : [],
);

const dragPoint = ref<DotCoordinates | null>(null);
let lastMovePoint: DotCoordinates | null = null;

const scalePoint = computed(() => {
  const cur = conicAttributes.value;
  const mode = editModeStore.getEditMode();
  if (
    dragPoint.value &&
    (mode === "CONIC_EDITING_SCALE" || mode === "CONIC_DRAWING")
  ) {
    if (cur.kind === "parabola") {
      return cur.axis === "vertical"
        ? { x: dragPoint.value.x, y: cur.hy }
        : { x: cur.hx, y: dragPoint.value.y };
    }
    return cur.axis === "horizontal"
      ? { x: dragPoint.value.x, y: cur.hy }
      : { x: cur.hx, y: dragPoint.value.y };
  }
  return conicScaleHandlePoint(cur);
});

const openingPoint = computed(() => {
  const cur = conicAttributes.value;
  if (
    dragPoint.value &&
    editModeStore.getEditMode() === "CONIC_EDITING_OPENING"
  ) {
    if (cur.kind === "parabola") {
      return cur.axis === "vertical"
        ? { x: cur.hx, y: dragPoint.value.y }
        : { x: dragPoint.value.x, y: cur.hy };
    }
    return dragPoint.value;
  }
  return conicOpeningHandlePoint(cur);
});

const guideScale = computed(() =>
  handlesInteractive.value ? scalePoint.value : null,
);
const guideOpening = computed(() =>
  handlesInteractive.value ? openingPoint.value : null,
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
const handleOpeningX = computed(() => {
  cellStore.getSvgBoundingRect();
  return (
    svgUserToViewport(openingPoint.value.x, openingPoint.value.y).x -
    HANDLE_HALF
  );
});
const handleOpeningY = computed(() => {
  cellStore.getSvgBoundingRect();
  return (
    svgUserToViewport(openingPoint.value.x, openingPoint.value.y).y -
    HANDLE_HALF
  );
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
  const point = snapToGrid(roundPoint(p));
  dragPoint.value = null;
  lastMovePoint = null;
  conicAttributes.value = defaultConicAt(pendingKind.value, point.x, point.y);
}

function selectConic(notation: NotationAttributes) {
  const c = notation as ConicNotationAttributes;
  dragPoint.value = null;
  lastMovePoint = null;
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
    editModeStore.getEditMode() === "CONIC_DRAWING" &&
    Math.hypot(point.x - cur.hx, point.y - cur.hy) < 8
  ) {
    return;
  }
  dragPoint.value = point;
  const lockAxis = editModeStore.getEditMode() === "CONIC_EDITING_SCALE";
  if (cur.kind === "hyperbola") {
    conicAttributes.value = lockAxis
      ? hyperbolaScaleAFromPoint(cur, point.x, point.y)
      : conicFromVertexAndPoint("hyperbola", cur.hx, cur.hy, point.x, point.y);
    return;
  }
  conicAttributes.value = parabolaScaleSizeFromPoint(cur, point.x, point.y);
}

function setOpeningFromPoint(p: DotCoordinates) {
  const point = roundPoint(p);
  dragPoint.value = point;
  const cur = conicAttributes.value;
  if (cur.kind === "hyperbola") {
    conicAttributes.value = {
      ...cur,
      b: hyperbolaBFromPoint(cur, point.x, point.y),
    };
    return;
  }
  conicAttributes.value = parabolaOpenFromPoint(cur, point.x, point.y);
}

function onBodyPointerDown(e: PointerEvent) {
  if (!handlesInteractive.value) return;
  const pt = roundPoint(clientPointToSvgUser(e.clientX, e.clientY));
  const near = (h: DotCoordinates) => Math.hypot(pt.x - h.x, pt.y - h.y) < 20;
  if (
    near(conicScaleHandlePoint(conicAttributes.value)) ||
    near(conicOpeningHandlePoint(conicAttributes.value))
  ) {
    return;
  }
  e.preventDefault();
  lastMovePoint = pt;
  editModeStore.setEditMode("CONIC_EDITING_VERTEX");
  const id = cellStore.getSvgId();
  const svg = id ? document.getElementById(id) : null;
  if (svg && e.pointerId != null) {
    try {
      svg.setPointerCapture(e.pointerId);
    } catch {
      /* detached or capture not allowed */
    }
  }
}

function moveVertex(p: DotCoordinates) {
  const point = roundPoint(p);
  if (!lastMovePoint) {
    lastMovePoint = point;
    return;
  }
  const dx = point.x - lastMovePoint.x;
  const dy = point.y - lastMovePoint.y;
  lastMovePoint = point;
  if (dx === 0 && dy === 0) return;
  conicAttributes.value = conicMoveBy(conicAttributes.value, dx, dy);
}

async function endDrawConic(): Promise<string> {
  dragPoint.value = null;
  lastMovePoint = null;
  if (Math.abs(conicAttributes.value.a) < 1e-6) {
    conicAttributes.value = defaultConicAt(
      conicAttributes.value.kind,
      conicAttributes.value.hx,
      conicAttributes.value.hy,
    );
  }
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
  conicAttributes.value = conicMoveBy(conicAttributes.value, moveX, moveY);
  saveConic(conicAttributes.value);
}

watch(
  () => ({
    mode: editModeStore.getEditMode(),
    selected: notationStore.getSelectedNotations()[0],
  }),
  ({ mode, selected }) => {
    if (selected?.notationType !== "CONIC") return;
    if (
      mode !== "CONIC_SELECTED" &&
      mode !== "CONIC_EDITING_VERTEX" &&
      mode !== "CONIC_EDITING_SCALE" &&
      mode !== "CONIC_EDITING_OPENING"
    ) {
      return;
    }
    if (mode === "CONIC_SELECTED") {
      selectConic(selected);
    }
  },
);

watchHelper.watchPointerEvent(
  ["CONIC_EDITING_OPENING"],
  ["EV_SVG_POINTERMOVE"],
  (e: PointerEvent) => shapeDrawingHelper.modifyLine(e, setOpeningFromPoint),
);
</script>
