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
        'CONIC_EDITING_THROUGH',
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
      v-show="handlesInteractive && !hasThroughPoints"
      v-bind:style="{
        left: handleOpeningX + 'px',
        top: handleOpeningY + 'px',
      }"
    ></line-handle>

    <div
      v-for="(pt, i) in numberedPoints"
      :key="'through-' + i"
      class="conic-through-handle"
      :data-cy="'conicThrough' + (i + 1)"
      :title="placingNow ? 'Click to re-pick from this point' : 'Drag to refit'"
      :style="throughHandleStyle(pt)"
      @pointerdown.stop="onThroughHandleDown(i, $event)"
    >
      {{ i + 1 }}
    </div>

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
      <polyline
        v-if="placeGuidePoints.length > 1"
        :points="placeGuidePolyline"
        fill="none"
        stroke="#1565c0"
        stroke-width="1"
        stroke-dasharray="5,4"
        opacity="0.7"
      />
      <circle
        v-if="ghostPoint"
        :cx="ghostPoint.x"
        :cy="ghostPoint.y"
        r="5"
        fill="none"
        stroke="#1565c0"
        stroke-width="1.5"
        stroke-dasharray="3,2"
        data-cy="conicPlaceGhost"
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
  defaultHyperbolaAt,
  hyperbolaBFromPoint,
  hyperbolaScaleAFromPoint,
  parabolaFromThreePoints,
  parabolaOpenFromPoint,
  parabolaScaleSizeFromPoint,
} from "common/conicGeometry";
import { useParabolaPlacement } from "../composables/useParabolaPlacement";

const notationMutateHelper = useNotationMutateHelper();
const notationStore = useNotationStore();
const editModeStore = useEditModeStore();
const cellStore = useCellStore();
const watchHelper = useWatchHelper();
const shapeDrawingHelper = useShapeDrawingHelper();
const parabolaPlace = useParabolaPlacement();

const HANDLE_HALF = LINE_HANDLE_HALF;
const THROUGH_HANDLE_HALF = 11;
const PLACE_EPS = 1e-6;

const handlesInteractive = computed(() => {
  const mode = editModeStore.getEditMode();
  return (
    mode === "CONIC_SELECTED" ||
    mode === "CONIC_EDITING_VERTEX" ||
    mode === "CONIC_EDITING_SCALE" ||
    mode === "CONIC_EDITING_OPENING" ||
    mode === "CONIC_EDITING_THROUGH"
  );
});

const pendingKind = ref<ConicKind>("parabola");
const gestureStart = ref<DotCoordinates | null>(null);
const throughEditIndex = ref<number | null>(null);

const conicAttributes = ref<ConicAttributes>({
  kind: "parabola",
  hx: 0,
  hy: 0,
  axis: "vertical",
  a: 0,
});

const placingNow = computed(
  () =>
    pendingKind.value === "parabola" && parabolaPlace.placingActive.value,
);

const hasThroughPoints = computed(
  () => (conicAttributes.value.through?.length ?? 0) === 3,
);

watch(
  () => editModeStore.getEditMode(),
  (mode) => {
    if (mode === "PARABOLA_STARTED") {
      pendingKind.value = "parabola";
      parabolaPlace.setActive(true);
    }
    if (mode === "HYPERBOLA_STARTED") {
      pendingKind.value = "hyperbola";
      parabolaPlace.setActive(false);
    }
    const keepParabolaPlace =
      mode === "PARABOLA_STARTED" || mode === "CONIC_DRAWING";
    if (
      pendingKind.value === "parabola" &&
      !keepParabolaPlace &&
      mode !== "CONIC_SELECTED" &&
      mode !== "CONIC_EDITING_VERTEX" &&
      mode !== "CONIC_EDITING_SCALE" &&
      mode !== "CONIC_EDITING_OPENING" &&
      mode !== "CONIC_EDITING_THROUGH"
    ) {
      parabolaPlace.setActive(false);
    }
  },
);

watch(
  () => parabolaPlace.count.value,
  (n) => {
    if (n < 2 && pendingKind.value === "parabola") {
      conicAttributes.value = {
        ...conicAttributes.value,
        kind: "parabola",
        a: 0,
      };
    }
  },
);

function roundPoint(point: DotCoordinates): DotCoordinates {
  return {
    x: Math.round(point.x),
    y: Math.round(point.y),
  };
}

function snapToHalfCell(point: DotCoordinates): DotCoordinates {
  const w = (cellStore.getCellHorizontalWidth() || 1) / 2;
  const h = (cellStore.getCellVerticalHeight() || 1) / 2;
  return {
    x: Math.round(point.x / w) * w,
    y: Math.round(point.y / h) * h,
  };
}

const overlayPaths = computed(() => {
  if (Math.abs(conicAttributes.value.a) < PLACE_EPS) return [];
  return conicSvgPaths(conicAttributes.value);
});
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

const numberedPoints = computed(() => {
  if (placingNow.value) return parabolaPlace.placingPoints.value;
  return conicAttributes.value.through ?? [];
});

const ghostPoint = computed(() =>
  placingNow.value ? parabolaPlace.hoverPoint.value : null,
);

const placeGuidePoints = computed(() => {
  const pts = [...numberedPoints.value];
  if (ghostPoint.value) pts.push(ghostPoint.value);
  return pts;
});

const placeGuidePolyline = computed(() =>
  placeGuidePoints.value.map((p) => `${p.x},${p.y}`).join(" "),
);

function throughHandleStyle(pt: DotCoordinates) {
  cellStore.getSvgBoundingRect();
  const v = svgUserToViewport(pt.x, pt.y);
  return {
    left: `${v.x - THROUGH_HANDLE_HALF}px`,
    top: `${v.y - THROUGH_HANDLE_HALF}px`,
  };
}

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
    editModeStore.isConicDrawingMode() ||
    editModeStore.isConicSelectedMode() ||
    placingNow.value
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
  const point = snapToHalfCell(p);
  dragPoint.value = null;
  lastMovePoint = null;
  gestureStart.value = point;
  parabolaPlace.hoverPoint.value = point;

  if (pendingKind.value === "hyperbola") {
    parabolaPlace.setActive(false);
    conicAttributes.value = defaultHyperbolaAt(point.x, point.y);
    return;
  }

  parabolaPlace.setActive(true);
  const pts = parabolaPlace.placingPoints.value;
  if (pts.length === 0) {
    conicAttributes.value = {
      kind: "parabola",
      hx: point.x,
      hy: point.y,
      axis: "vertical",
      a: 0,
    };
    return;
  }

  if (pts.length === 2) {
    const fitted = parabolaFromThreePoints(pts[0], pts[1], point);
    if (fitted) conicAttributes.value = fitted;
  }
}

function selectConic(notation: NotationAttributes) {
  const c = notation as ConicNotationAttributes;
  dragPoint.value = null;
  lastMovePoint = null;
  throughEditIndex.value = null;
  conicAttributes.value = {
    kind: c.kind,
    hx: c.hx,
    hy: c.hy,
    axis: c.axis,
    a: c.a,
    b: c.b,
    through: c.through,
  };
  pendingKind.value = c.kind;
  parabolaPlace.setActive(false);
  const el = document.getElementById(notation.uuid) as HTMLElement | null;
  if (el) el.style.display = "none";
  notationStore.selectNotation(notation.uuid);
}

function setScaleFromPoint(p: DotCoordinates) {
  const mode = editModeStore.getEditMode();
  if (mode === "CONIC_EDITING_SCALE") {
    const point = roundPoint(p);
    dragPoint.value = point;
    const cur = conicAttributes.value;
    if (cur.kind === "hyperbola") {
      conicAttributes.value = hyperbolaScaleAFromPoint(cur, point.x, point.y);
      return;
    }
    const sized = parabolaScaleSizeFromPoint(cur, point.x, point.y);
    conicAttributes.value = { ...sized, through: cur.through };
    return;
  }

  const point = snapToHalfCell(p);
  dragPoint.value = point;
  parabolaPlace.hoverPoint.value = point;
  const cur = conicAttributes.value;
  if (cur.kind === "hyperbola") {
    if (Math.hypot(point.x - cur.hx, point.y - cur.hy) < 8) return;
    conicAttributes.value = conicFromVertexAndPoint(
      "hyperbola",
      cur.hx,
      cur.hy,
      point.x,
      point.y,
    );
    return;
  }

  const pts = parabolaPlace.placingPoints.value;
  if (pts.length === 2) {
    const fitted = parabolaFromThreePoints(pts[0], pts[1], point);
    if (fitted) conicAttributes.value = fitted;
  }
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
  const mode = editModeStore.getEditMode();
  const start = gestureStart.value;
  const dragEnd = dragPoint.value;
  dragPoint.value = null;
  lastMovePoint = null;
  throughEditIndex.value = null;

  if (mode !== "CONIC_DRAWING") {
    return saveConic({ ...conicAttributes.value });
  }

  if (conicAttributes.value.kind === "hyperbola") {
    parabolaPlace.setActive(false);
    gestureStart.value = null;
    if (Math.abs(conicAttributes.value.a) < PLACE_EPS) {
      conicAttributes.value = defaultConicAt(
        "hyperbola",
        conicAttributes.value.hx,
        conicAttributes.value.hy,
      );
    }
    return saveConic({ ...conicAttributes.value });
  }

  const p = dragEnd ?? start;
  gestureStart.value = null;
  if (!p) {
    editModeStore.setEditMode("PARABOLA_STARTED");
    return "";
  }

  const pts = parabolaPlace.placingPoints.value;
  const last = pts[pts.length - 1];
  const isDup =
    !!last &&
    Math.abs(last.x - p.x) < PLACE_EPS &&
    Math.abs(last.y - p.y) < PLACE_EPS;

  if (pts.length < 2) {
    if (!isDup) parabolaPlace.setPoints([...pts, p]);
    editModeStore.setEditMode("PARABOLA_STARTED");
    return "";
  }

  if (isDup) {
    editModeStore.setEditMode("PARABOLA_STARTED");
    return "";
  }

  const fitted = parabolaFromThreePoints(pts[0], pts[1], p);
  if (!fitted) {
    editModeStore.setEditMode("PARABOLA_STARTED");
    return "";
  }

  parabolaPlace.setActive(false);
  conicAttributes.value = fitted;
  return saveConic({ ...fitted });
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
      mode !== "CONIC_EDITING_OPENING" &&
      mode !== "CONIC_EDITING_THROUGH"
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

watchHelper.watchPointerEvent(
  ["CONIC_EDITING_THROUGH"],
  ["EV_SVG_POINTERMOVE"],
  (e: PointerEvent) => shapeDrawingHelper.modifyLine(e, setThroughFromPoint),
);

watchHelper.watchPointerEvent(
  ["PARABOLA_STARTED"],
  ["EV_SVG_POINTERMOVE"],
  onPlaceHover,
);

function onPlaceHover(e: PointerEvent) {
  if (!placingNow.value) return;
  const point = snapToHalfCell(clientPointToSvgUser(e.clientX, e.clientY));
  parabolaPlace.hoverPoint.value = point;
  const pts = parabolaPlace.placingPoints.value;
  if (pts.length === 2) {
    const fitted = parabolaFromThreePoints(pts[0], pts[1], point);
    if (fitted) conicAttributes.value = fitted;
  }
}

function onThroughHandleDown(index: number, e: PointerEvent) {
  if (placingNow.value) {
    parabolaPlace.undoFrom(index);
    return;
  }
  if (!handlesInteractive.value) return;
  e.preventDefault();
  throughEditIndex.value = index;
  editModeStore.setEditMode("CONIC_EDITING_THROUGH");
  const id = cellStore.getSvgId();
  const svg = id ? document.getElementById(id) : null;
  if (svg && e.pointerId != null) {
    try {
      svg.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  }
}

function setThroughFromPoint(p: DotCoordinates) {
  const idx = throughEditIndex.value;
  const through = conicAttributes.value.through;
  if (idx == null || !through || through.length !== 3) return;
  const point = snapToHalfCell(p);
  const next = [...through];
  next[idx] = point;
  const fitted = parabolaFromThreePoints(next[0], next[1], next[2]);
  if (fitted) conicAttributes.value = fitted;
}
</script>

<style>
.conic-through-handle {
  position: fixed;
  z-index: 1000;
  width: 22px;
  height: 22px;
  box-sizing: border-box;
  border-radius: 50%;
  background: #1565c0;
  color: #fff;
  border: 2px solid #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.35);
  font-size: 11px;
  font-weight: 700;
  line-height: 18px;
  text-align: center;
  cursor: pointer;
  touch-action: none;
  user-select: none;
}
</style>
