<template>
  <lessonStudents></lessonStudents>
  <floatingToolbar></floatingToolbar>
  <imageCropEditor></imageCropEditor>
  <annotationEditor></annotationEditor>
  <freeTextEditor></freeTextEditor>
  <freeSketchDrawer></freeSketchDrawer>
  <freeSketchOcrDrawer></freeSketchOcrDrawer>
  <textAreaSync></textAreaSync>
  <exponentEditor></exponentEditor>
  <cellSymbolInput></cellSymbolInput>
  <v-progress-linear
    data-cy="pBar"
    v-show="progressBar"
    color="deep-purple-accent-4"
    indeterminate
    rounded
    height="8"
  ></v-progress-linear>
  <instructionBar></instructionBar>
  <cartesianSystemDrawer></cartesianSystemDrawer>
  <sqrtDrawer></sqrtDrawer>
  <lineDrawer></lineDrawer>
  <divisionLineDrawer></divisionLineDrawer>
  <polygonDrawer></polygonDrawer>
  <curveDrawer></curveDrawer>
  <circleDrawer></circleDrawer>
  <conicDrawer></conicDrawer>
  <areaSelector></areaSelector>

  <leftToolbar></leftToolbar>
  <boardRoleBanner />
  <boardEmptyLessonOverlay :loaded="loaded" :notations-ready="notationsReady" />
  <!-- Video dock temporarily disabled (TURN not configured). -->
  <!-- <lessonVideoDock></lessonVideoDock> -->

  <div
    ref="boardScrollRef"
    class="mathboard-scroll"
    :style="{
      '--board-matrix-height': matrixSize.height,
      '--board-matrix-width': matrixSize.width,
    }"
  >
    <div
      class="mathboard-stack"
      :class="{ 'mathboard-stack--practice-gutter': showPracticeGutter }"
    >
      <div
        v-if="showPracticeGutter"
        class="practice-number-strip"
        data-cy="practice-gutter-layer"
      >
        <div
          v-for="m in gutterMarks"
          :key="`${m.id}-${m.row}`"
          class="practice-number-strip__mark"
          :class="{
            'practice-number-strip__mark--clickable':
              m.status === 'started' || m.status === 'completed',
            'practice-number-strip__mark--done': m.status === 'completed',
            'practice-number-strip__mark--active': m.id === activeGutterPartId,
          }"
          :style="{
            top: `calc(${m.row} * 100% / ${rowsNum})`,
            height: `calc(100% / ${rowsNum})`,
          }"
          @click="onGutterMarkClick(m)"
        >
          {{ m.label }}
        </div>
      </div>
      <svg
        class="mathboard"
        :id="svgId"
        data-cy="mathboard"
        xmlns="http://www.w3.org/2000/svg"
      >
      <defs>
        <marker
          id="arrowleft"
          viewBox="0 0 10 10"
          refX="5"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <polygon points="0,0 10,5 0,10 3,5" fill="black" />
        </marker>
        <marker
          id="arrowright"
          viewBox="0 0 10 10"
          refX="5"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <polygon points="0,0 10,5 0,10 3,5" fill="black" />
        </marker>
      </defs>
    </svg>
    </div>
  </div>

  <specialSymbolsToolbar></specialSymbolsToolbar>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, nextTick, onUnmounted, ref, watch } from "vue";
import { useEventListener, useThrottleFn } from "@vueuse/core";
import useNotationLoadingHelper from "../helpers/notationLoadingHelper";
import { loadPracticeBoard } from "../helpers/practiceBoardAdapter";
import { ensurePartRow } from "../helpers/practicePartLabelHelper";
import { usePracticeStore } from "../store/pinia/practiceStore";
import { hasPracticeSections } from "common/practiceParts";
import useMatrixHelper from "../helpers/matrixHelper";
import useEventHelper from "../helpers/eventHelper";
import useWatchHelper from "../helpers/watchHelper";
import useNotationMutationHelper from "../helpers/notationMutateHelper";
import { useNotationStore } from "../store/pinia/notationStore";
import { useCellStore } from "../store/pinia/cellStore";
import { useEditModeStore, ARMED_TOOL_EDIT_MODES } from "../store/pinia/editModeStore";
import { useAnswerStore } from "../store/pinia/answerStore";
import { useOnboardingStore } from "../store/pinia/onboardingStore";
import { useUserStore } from "../store/pinia/userStore";
import { CursorType, EditModeCursorType } from "common/unions";
import { matrixDimensions, matrixSize } from "common/globals";
import useSelectionHelper from "../helpers/selectionHelper";
import useKeyHelper from "../helpers/keyHelper";
import leftToolbar from "./LeftToolbar.vue";
import boardRoleBanner from "./BoardRoleBanner.vue";
import boardEmptyLessonOverlay from "./BoardEmptyLessonOverlay.vue";
// import lessonVideoDock from "./LessonVideoDock.vue";


const freeTextEditor = defineAsyncComponent(
  () => import("./FreeTextEditor.vue"),
);
const freeSketchDrawer = defineAsyncComponent(
  () => import("./FreeSketchDrawer.vue"),
);
const freeSketchOcrDrawer = defineAsyncComponent(
  () => import("./FreeSketchOcrDrawer.vue"),
);
const textAreaSync = defineAsyncComponent(() => import("./TextAreaSync.vue"));
const InstructionBar = defineAsyncComponent(
  () => import("./InstructionBar.vue"),
);
const annotationEditor = defineAsyncComponent(
  () => import("./AnnotationEditor.vue"),
);
const exponentEditor = defineAsyncComponent(
  () => import("./ExponentEditor.vue"),
);
const cellSymbolInput = defineAsyncComponent(
  () => import("./CellSymbolInput.vue"),
);
const specialSymbolsToolbar = defineAsyncComponent(
  () => import("./SpecialSymbolsToolbar.vue"),
);
const areaSelector = defineAsyncComponent(() => import("./AreaSelector.vue"));
const sqrtDrawer = defineAsyncComponent(() => import("./SqrtDrawer.vue"));
const lineDrawer = defineAsyncComponent(() => import("./LineDrawer.vue"));
const divisionLineDrawer = defineAsyncComponent(
  () => import("./DivisionLineDrawer.vue"),
);
const polygonDrawer = defineAsyncComponent(() => import("./PolygonDrawer.vue"));
const curveDrawer = defineAsyncComponent(() => import("./CurveDrawer.vue"));
const circleDrawer = defineAsyncComponent(() => import("./CircleDrawer.vue"));
const conicDrawer = defineAsyncComponent(() => import("./ConicDrawer.vue"));
const cartesianSystemDrawer = defineAsyncComponent(
  () => import("./CartesianSystemDrawer.vue"),
);
const floatingToolbar = defineAsyncComponent(
  () => import("./FloatingToolbar.vue"),
);
const imageCropEditor = defineAsyncComponent(
  () => import("./ImageCropEditor.vue"),
);
const lessonStudents = defineAsyncComponent(
  () => import("./LessonStudents.vue"),
);

const notationLoadingHelper = useNotationLoadingHelper();
const notationStore = useNotationStore();
const practiceStore = usePracticeStore();
const cellStore = useCellStore();

const editModeStore = useEditModeStore();
const matrixHelper = useMatrixHelper();
const selectionHelper = useSelectionHelper();
const keyHelper = useKeyHelper();
const eventHelper = useEventHelper();
const watchHelper = useWatchHelper();
const notationMutateHelper = useNotationMutationHelper();
const answerStore = useAnswerStore();
const onboardingStore = useOnboardingStore();
const userStore = useUserStore();
const progressBar = ref(false);
const notationsReady = ref(false);
const boardScrollRef = ref<HTMLElement | null>(null);

const props = defineProps({
  svgId: { type: String, default: "" },
  loaded: { type: Boolean, default: false },
  practiceGutter: { type: Boolean, default: false },
  practiceGutterMarks: {
    type: Array as () => {
      row: number;
      id: string;
      label: string;
      status?: "locked" | "started" | "completed";
    }[],
    default: () => [],
  },
});

const emit = defineEmits<{
  "select-practice-part": [id: string];
}>();

const rowsNum = matrixDimensions.rowsNum;

const showPracticeGutter = computed(() => {
  if (!props.loaded) return false;
  const parent = notationStore.getParent();
  if (parent?.type !== "PRACTICE" || !parent.uuid) return false;
  void practiceStore.sessions;
  const session = practiceStore.getSession(parent.uuid);
  return session.submitted && hasPracticeSections(session.parts);
});

const gutterMarks = computed(() => {
  if (!showPracticeGutter.value) return [];
  if (props.practiceGutterMarks.length) return props.practiceGutterMarks;
  return [];
});

const activeGutterPartId = computed(() => {
  const parent = notationStore.getParent();
  if (parent?.type !== "PRACTICE" || !parent.uuid) return "";
  void practiceStore.sessions;
  return practiceStore.getSession(parent.uuid).activePartId ?? "";
});

function onGutterMarkClick(m: {
  id: string;
  status?: "locked" | "started" | "completed";
}) {
  if (m.status === "locked") return;
  emit("select-practice-part", m.id);
}

let cursor = ref<CursorType>("auto");
let quickTipsTimer: ReturnType<typeof setTimeout> | undefined;

function scheduleQuickTipsTour() {
  if (notationStore.getParent()?.type !== "LESSON") return;
  if (onboardingStore.isQuickTipsComplete()) return;
  if (userStore.isTeacher() && onboardingStore.shouldShowTeacherChecklist) {
    return;
  }
  clearTimeout(quickTipsTimer);
  quickTipsTimer = setTimeout(() => {
    onboardingStore.tryStartQuickTipsTour();
  }, 1200);
}

watch(
  () => props.loaded,
  (loaded) => {
    if (!loaded) {
      notationsReady.value = false;
      return;
    }
    scheduleQuickTipsTour();
  },
);

let svgResizeObserver: ResizeObserver | undefined;

function observeSvgBoundingRect() {
  svgResizeObserver?.disconnect();
  svgResizeObserver = undefined;
  const el = document.getElementById(props.svgId);
  if (!el) return;
  svgResizeObserver = new ResizeObserver(() => {
    refreshSvgBoundingRect();
  });
  svgResizeObserver.observe(el);
}

onUnmounted(() => {
  svgResizeObserver?.disconnect();
  clearTimeout(quickTipsTimer);
  eventHelper.unregisterSvgPointerUp();
  eventHelper.unregisterPointerUp();
  eventHelper.unregisterSvgPointerDown();
  eventHelper.unregisterSvgPointerMove();
  eventHelper.unregisterSvgPointerUp();
  eventHelper.unregisterKeyUp();
  eventHelper.unregisterKeyDown();
  eventHelper.unregisterPaste();
  eventHelper.unregisterCopy();
  eventHelper.unregisterMobileEscape();
});

function refreshSvgBoundingRect() {
  if (props.svgId) {
    cellStore.setSvgBoundingRect(props.svgId);
  } else {
    cellStore.refreshSvgBoundingRect();
  }
}

const refreshSvgBoundingRectThrottled = useThrottleFn(
  refreshSvgBoundingRect,
  50,
);

useEventListener(window, "resize", refreshSvgBoundingRect);
useEventListener(window, "scroll", refreshSvgBoundingRectThrottled, {
  capture: true,
});
// Board scroll must update immediately — throttling left selection ~1 viewport off.
useEventListener(boardScrollRef, "scroll", refreshSvgBoundingRect, {
  passive: true,
});

watch(
  () => [props.svgId, props.loaded, showPracticeGutter.value] as const,
  async () => {
    await nextTick();
    observeSvgBoundingRect();
    refreshSvgBoundingRect();
    requestAnimationFrame(() => refreshSvgBoundingRect());
  },
);

watchHelper.watchPointerEvent(
  [
    "CELL_SELECTED",
    "SPECIAL_SYMBOL_SELECTED",
    "LINE_SELECTED",
    "LINE_STARTED",
    "DIVISIONLINE_SELECTED",
    "DIVISIONLINE_STARTED",
    "CURVE_SELECTED",
    "CURVE_STARTED",
    "SQRT_SELECTED",
    "SQRT_STARTED",
    "ANNOTATION_SELECTED",
    "EXPONENT_SELECTED",
    "CIRCLE_SELECTED",
    "CIRCLE_STARTED",
    "CONIC_SELECTED",
    "PARABOLA_STARTED",
    "HYPERBOLA_STARTED",
    "IMAGE_SELECTED",
    "POLYGON_STARTED",
    "FREE_SKETCH_STARTED",
    "FREE_SKETCH_SELECTED",
    "TEXT_STARTED",
  ],
  ["EV_SVG_POINTERUP", "EV_SVG_POINTERCANCEL"],
  selectionHelper.selectClickedPosition,
  props.svgId,
);

watchHelper.watchPointerEvent(
  ["XMARK_STARTED", "CHECKMARK_STARTED", "SEMICHECKMARK_STARTED"],
  ["EV_SVG_POINTERUP"],
  notationMutateHelper.addMarkNotation,
);

watchHelper.watchKeyEvent(
  [
    "CELL_SELECTED",
    "LINE_SELECTED",
    "DIVISIONLINE_SELECTED",
    "CURVE_SELECTED",
    "SQRT_SELECTED",
    "ANNOTATION_SELECTED",
    "TEXT_SELECTED",
    "EXPONENT_SELECTED",
    "CIRCLE_SELECTED",
    "CONIC_SELECTED",
    "CONIC_DRAWING",
    "IMAGE_SELECTED",
    "FREE_SKETCH_SELECTED",
    ...ARMED_TOOL_EDIT_MODES,
  ],
  "EV_KEYUP",
  async (e: KeyboardEvent) => {
    await keyHelper.keyUpHandler(e);
  },
);

watchHelper.watchKeyEvent(
  [
    "CELL_SELECTED",
    "LINE_SELECTED",
    "CURVE_SELECTED",
    "SQRT_SELECTED",
    "ANNOTATION_SELECTED",
    "TEXT_SELECTED",
    "EXPONENT_SELECTED",
    "CIRCLE_SELECTED",
    "CONIC_SELECTED",
    ...ARMED_TOOL_EDIT_MODES,
  ],
  "EV_KEYDOWN",
  keyHelper.keyDownHandler,
);

watchHelper.watchEveryEditModeChange((newEditMode) => {
  cursor.value = EditModeCursorType.get(newEditMode)!;
  if (editModeStore.isDefaultEditMode()) {
    document.getElementById(props.svgId)?.classList.remove("touch-drawing");
  } else {
    document.getElementById(props.svgId)?.classList.add("touch-drawing");
  }
});

watchHelper.watchSelectedCellAndDisplayNewSelected(props.svgId);

watchHelper.watchCustomEvent(["CELL_SELECTED"], "EV_COPY", () => {
  eventHelper.copy();
});

watchHelper.watchCustomEvent(
  [
    "CELL_SELECTED",
    "TEXT_STARTED",
    "TEXT_SELECTED",
    "IMAGE_SELECTED",
    ...ARMED_TOOL_EDIT_MODES,
  ],
  "EV_PASTE",
  (e: ClipboardEvent) => {
    eventHelper.paste(e);
  },
);

// wait for child(e.g lesson) loaded signal
watchHelper.watchLoadedEvent(props, load);

watchHelper.watchNotationsEvent(props.svgId, matrixHelper.refreshScreen);

async function load() {
  notationsReady.value = false;

  await nextTick();
  cellStore.resetCellDimensions();
  cellStore.setSvgBoundingRect(props.svgId);

  eventHelper.unregisterPointerUp();
  eventHelper.unregisterSvgPointerDown();
  eventHelper.unregisterSvgPointerMove();
  eventHelper.unregisterSvgPointerUp();
  eventHelper.unregisterKeyUp();
  eventHelper.unregisterKeyDown();
  eventHelper.unregisterPaste();
  eventHelper.unregisterCopy();
  eventHelper.unregisterMobileEscape();

  eventHelper.registerPointerUp();
  eventHelper.registerSvgPointerDown();
  eventHelper.registerSvgPointerMove();
  eventHelper.registerSvgPointerUp();
  eventHelper.registerKeyUp();
  eventHelper.registerKeyDown();
  eventHelper.registerPaste();
  eventHelper.registerCopy();
  eventHelper.registerMobileEscape();

  progressBar.value = true;

  try {
    notationStore.clearNotations();
    cellStore.resetSelectedCell();
    matrixHelper.setMatrix(props.svgId);

    const boardParent = notationStore.getParent();
    if (!boardParent) {
      return;
    }

    // for answer or practice load also question notations
    if (boardParent.type === "ANSWER") {
      await notationLoadingHelper.loadNotations(
        "QUESTION",
        answerStore.getCurrentAnswer()!.question.uuid!,
      );

      await notationLoadingHelper.loadNotations(
        "ANSWER",
        answerStore.getCurrentAnswer()!.uuid!,
      );

      return;
    }

    if (boardParent.type === "PRACTICE") {
      await loadPracticeBoard(boardParent.uuid);
      const session = practiceStore.getSession(boardParent.uuid);
      if (session.submitted && session.activePartId) {
        ensurePartRow(session.activePartId);
      }
      return;
    }

    await notationLoadingHelper.loadNotations(
      boardParent.type,
      boardParent.uuid,
    );
  } finally {
    progressBar.value = false;
    notationsReady.value = true;
    await nextTick();
    matrixHelper.setMatrix(props.svgId);
    matrixHelper.refreshScreen(props.svgId);
    refreshSvgBoundingRect();
    requestAnimationFrame(() => {
      matrixHelper.setMatrix(props.svgId);
      matrixHelper.refreshScreen(props.svgId);
      refreshSvgBoundingRect();
      requestAnimationFrame(() => {
        matrixHelper.refreshScreen(props.svgId);
        refreshSvgBoundingRect();
      });
    });
  }
}
</script>

<style>
/* Fixed side toolbars; scroll viewport fits the window, full matrix height inside. */
.mathboard-scroll {
  --board-inset-left: calc(80px + var(--practice-problem-pane-width, 0px));
  --board-inset-right: 210px;
  --board-inset-top: 110px;
  --board-inset-bottom: 56px;
  --practice-number-strip-width: 40px;
  box-sizing: border-box;
  margin-top: var(--board-inset-top);
  margin-left: var(--board-inset-left);
  margin-right: var(--board-inset-right);
  margin-bottom: var(--board-inset-bottom);
  width: calc(100vw - var(--board-inset-left) - var(--board-inset-right));
  max-width: calc(100vw - var(--board-inset-left) - var(--board-inset-right));
  max-height: calc(
    100vh - var(--board-inset-top) - var(--board-inset-bottom)
  );
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
}

.mathboard-stack {
  position: relative;
  width: 100%;
  min-width: 0;
  height: var(--board-matrix-height);
}

.mathboard-stack--practice-gutter {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  isolation: isolate;
}

.practice-number-strip {
  position: sticky;
  left: 0;
  z-index: 2;
  flex: 0 0 var(--practice-number-strip-width);
  width: var(--practice-number-strip-width);
  height: var(--board-matrix-height);
  pointer-events: none;
  user-select: none;
  background: #f4f7fb;
}

.practice-number-strip__mark {
  position: absolute;
  left: 0;
  width: 100%;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 0.15em;
  font-size: 15px;
  font-weight: 700;
  line-height: 1.1;
  color: #1565c0;
  background: transparent;
  text-align: center;
}

.practice-number-strip__mark--clickable {
  pointer-events: auto;
  cursor: pointer;
}

.practice-number-strip__mark--done {
  color: #2e7d32;
}

.practice-number-strip__mark--active {
  font-weight: 800;
}

.mathboard-stack--practice-gutter .mathboard {
  flex: 1 1 0;
  width: 0;
  min-width: 0;
  z-index: 0;
}

/* Desktop: SVG fills the viewport; cell layout is driven by SVG client size. */
.mathboard {
  box-sizing: border-box;
  display: block;
  position: relative;
  z-index: 0;
  width: 100%;
  min-width: 0;
  max-width: 100%;
  height: var(--board-matrix-height);
  overflow: visible;
}

/* Mobile: full matrix width for horizontal pan (matches matrixSize in globals). */
@media (max-width: 1023px) {
  .mathboard-scroll {
    --board-inset-left: 56px;
    --board-inset-right: 0px;
    --board-inset-top: calc(64px + var(--practice-problem-pane-top, 0px));
    --board-inset-bottom: max(16px, env(safe-area-inset-bottom));
    margin-left: var(--board-inset-left);
    margin-right: 0;
    width: calc(100vw - var(--board-inset-left));
    max-width: calc(100vw - var(--board-inset-left));
    max-height: calc(
      100dvh - var(--board-inset-top) - var(--board-inset-bottom)
    );
    overflow-x: auto;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  .mathboard {
    width: var(--board-matrix-width);
    min-width: var(--board-matrix-width);
    max-width: none;
  }

  .mathboard-stack {
    width: var(--board-matrix-width);
    min-width: var(--board-matrix-width);
  }

  .mathboard-stack--practice-gutter {
    width: calc(var(--practice-number-strip-width) + var(--board-matrix-width));
    min-width: calc(
      var(--practice-number-strip-width) + var(--board-matrix-width)
    );
  }

  .mathboard-stack--practice-gutter .mathboard {
    width: var(--board-matrix-width);
    min-width: var(--board-matrix-width);
    flex: 0 0 var(--board-matrix-width);
  }
}

.activestudent {
  border: 2px dashed rgb(143, 26, 179);
}
.hellow {
  padding: 5px;
  color: darkkhaki;
}

/* (Optional) Apply a "closed-hand" cursor during drag operation. */
.grabbable:active {
  cursor: grabbing;
  cursor: -moz-grabbing;
  cursor: -webkit-grabbing;
}
.nopadding {
  padding: 0 !important;
}
.iconActive {
  background-color: dodgerblue;
}
.deleteButtonActive {
  cursor: URL("~@/assets/delete.jpg"), none !important;
}

@media (width <= 1150px) {
  .title {
    display: none;
  }
}

/* Overlay strokes are SVG geometry. HTML box styles here hid the stroke
   on select (only endpoint handles remained). */
.line-svg .line {
  position: static;
  display: inline;
  border: none;
}

.line-svg {
  position: fixed;
  pointer-events: none;
  overflow: visible;
  z-index: 998;
}

line:hover,
circle:hover,
polygon:hover,
path:hover {
  stroke-width: 5.5;
}

.solid {
  stroke: solid;
}
.dashed {
  stroke-dasharray: 6, 6;
}
/* SQRT FO is only the vinculum; clicking the bar selects the sqrt. */
foreignObject[notationType="SQRT"] {
  pointer-events: auto;
}

/* SQRTSYMBOL FO is the √ column. Inner glyph takes clicks. */
foreignObject[notationType="SQRTSYMBOL"],
foreignObject[notationType="SQRTSYMBOL"] > div {
  pointer-events: none;
}

/* Image FO is the rotated AABB; only the <img> should steal clicks. */
foreignObject[notationType="IMAGE"],
foreignObject[notationType="IMAGE"] * {
  pointer-events: none;
}
foreignObject[notationType="IMAGE"] .board-image {
  pointer-events: auto;
}

/* Annotation FO is a full-cell box; only the label text should steal clicks. */
foreignObject[notationType="ANNOTATION"],
foreignObject[notationType="ANNOTATION"] * {
  pointer-events: none;
}
foreignObject[notationType="ANNOTATION"] [data-cy="annotation"] {
  pointer-events: auto;
}

/* Display-only; editing uses FreeTextEditor. Native paste here doubled the text. */
foreignObject[notationType="TEXT"] textarea {
  pointer-events: none;
}

foreignObject.practice-part-label-fo,
foreignObject.practice-part-label-fo * {
  fill: none;
  background: transparent !important;
  border: none;
  box-shadow: none;
  overflow: visible;
  pointer-events: none;
}

.practice-part-label {
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  font-weight: 600;
  font-size: 0.9em;
  line-height: 1;
  color: #1565c0;
  background: transparent;
  pointer-events: none;
  user-select: none;
  white-space: nowrap;
}

.sqrt {
  border-bottom: solid 1px;
  border-top: solid 1px;
  z-index: 999;
  display: block;
  position: absolute;
  pointer-events: auto;
}

.sqrt:hover {
  border-bottom: solid 2px;
  border-top: solid 2px;
}

.sqrtsymbol {
  position: absolute;
  z-index: 999;
  font-size: 1.2em;
  pointer-events: auto;
  display: inline;
  width: auto;
}

.sqrtsymbol:hover {
  font-size: 1.25em;
}

.free-sketch {
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.touch-drawing {
  touch-action: none;
}
</style>
