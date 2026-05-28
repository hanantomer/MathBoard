<template>
  <lessonStudents></lessonStudents>
  <floatingToolbar></floatingToolbar>
  <imageCropEditor></imageCropEditor>
  <annotationEditor></annotationEditor>
  <freeTextEditor></freeTextEditor>
  <freeSketchDrawer></freeSketchDrawer>
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
  <statusBar></statusBar>
  <cartesianSystemDrawer></cartesianSystemDrawer>
  <sqrtDrawer></sqrtDrawer>
  <lineDrawer></lineDrawer>
  <divisionLineDrawer></divisionLineDrawer>
  <polygonDrawer></polygonDrawer>
  <curveDrawer></curveDrawer>
  <circleDrawer></circleDrawer>
  <areaSelector></areaSelector>

  <leftToolbar></leftToolbar>
  <!-- Video dock temporarily disabled (TURN not configured). -->
  <!-- <lessonVideoDock></lessonVideoDock> -->

  <div ref="boardScrollRef" class="mathboard-scroll">
    <svg
      class="mathboard"
      :id="svgId"
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

  <specialSymbolsToolbar></specialSymbolsToolbar>
</template>

<script setup lang="ts">
import { defineAsyncComponent, nextTick, onUnmounted, ref } from "vue";
import { useEventListener, useThrottleFn } from "@vueuse/core";
import useNotationLoadingHelper from "../helpers/notationLoadingHelper";
import useMatrixHelper from "../helpers/matrixHelper";
import useEventHelper from "../helpers/eventHelper";
import useWatchHelper from "../helpers/watchHelper";
import useNotationMutationHelper from "../helpers/notationMutateHelper";
import { useNotationStore } from "../store/pinia/notationStore";
import { useCellStore } from "../store/pinia/cellStore";
import { useEditModeStore } from "../store/pinia/editModeStore";
import { useAnswerStore } from "../store/pinia/answerStore";
import { CursorType, EditModeCursorType } from "common/unions";
import useSelectionHelper from "../helpers/selectionHelper";
import useKeyHelper from "../helpers/keyHelper";
import leftToolbar from "./LeftToolbar.vue";
// import lessonVideoDock from "./LessonVideoDock.vue";


const freeTextEditor = defineAsyncComponent(
  () => import("./FreeTextEditor.vue"),
);
const freeSketchDrawer = defineAsyncComponent(
  () => import("./FreeSketchDrawer.vue"),
);
const textAreaSync = defineAsyncComponent(() => import("./TextAreaSync.vue"));
const StatusBar = defineAsyncComponent(() => import("./StatusBar.vue"));
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
const cellStore = useCellStore();
const editModeStore = useEditModeStore();
const matrixHelper = useMatrixHelper();
const selectionHelper = useSelectionHelper();
const keyHelper = useKeyHelper();
const eventHelper = useEventHelper();
const watchHelper = useWatchHelper();
const notationMutateHelper = useNotationMutationHelper();
const answerStore = useAnswerStore();
const progressBar = ref(false);
const boardScrollRef = ref<HTMLElement | null>(null);

let cursor = ref<CursorType>("auto");

onUnmounted(() => {
  eventHelper.unregisterSvgPointerUp();
  eventHelper.unregisterPointerUp();
  eventHelper.unregisterSvgPointerDown();
  eventHelper.unregisterSvgPointerMove();
  eventHelper.unregisterSvgPointerUp();
  eventHelper.unregisterPaste();
  eventHelper.unregisterCopy();
  eventHelper.unregisterMobileEscape();
});

const props = defineProps({
  svgId: { type: String, default: "" },
  loaded: { type: Boolean, default: false },
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
    "ANNOTATION_STARTED",
    "EXPONENT_SELECTED",
    "CIRCLE_SELECTED",
    "CIRCLE_STARTED",
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
    "IMAGE_SELECTED",
    "FREE_SKETCH_SELECTED",
    "ANNOTATION_STARTED",
    "LINE_STARTED",
    "DIVISIONLINE_STARTED",
    "CURVE_STARTED",
    "CIRCLE_STARTED",
    "FREE_SKETCH_STARTED",
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
  ["CELL_SELECTED"],
  "EV_PASTE",
  (e: ClipboardEvent) => {
    eventHelper.paste(e);
  },
);

// wait for child(e.g lesson) loaded signal
watchHelper.watchLoadedEvent(props, load);

watchHelper.watchNotationsEvent(props.svgId, matrixHelper.refreshScreen);

async function load() {
  cellStore.setSvgBoundingRect(props.svgId);
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

    matrixHelper.setMatrix(props.svgId);

    // for answer load also question notations too
    if (notationStore.getParent().type === "ANSWER") {
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

    await notationLoadingHelper.loadNotations(
      notationStore.getParent().type,
      notationStore.getParent().uuid,
    );
  } finally {
    progressBar.value = false;
    await nextTick();
    refreshSvgBoundingRect();
  }
}
</script>

<style>
/* Fixed side toolbars; scroll viewport fits the window, full matrix height inside. */
.mathboard-scroll {
  --board-inset-left: 80px;
  --board-inset-right: 210px;
  --board-inset-top: 110px;
  --board-inset-bottom: 56px;
  --board-matrix-height: 1650px;
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

/* Desktop: SVG fills the viewport; cell layout is driven by SVG client size. */
.mathboard {
  box-sizing: border-box;
  display: block;
  width: 100%;
  min-width: 0;
  max-width: 100%;
  height: var(--board-matrix-height);
}

/* Mobile: full matrix width for horizontal pan (matches matrixSize in globals). */
@media (max-width: 1023px) {
  .mathboard-scroll {
    --board-matrix-width: 1650px;
    --board-inset-left: 56px;
    --board-inset-right: 0px;
    --board-inset-top: 64px;
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

.line {
  position: absolute;
  display: block;
  border-bottom: solid 1px;
  border-top: solid 1px;
  z-index: 999;
}

.line-svg {
  position: absolute;
  pointer-events: none;
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
.sqrt {
  border-bottom: solid 1px;
  border-top: solid 1px;
  z-index: 999;
  display: block;
  position: absolute;
}

.sqrt:hover {
  border-bottom: solid 2px;
  border-top: solid 2px;
}

.sqrtsymbol {
  position: absolute;
  z-index: 999;
  font-size: 1.2em;
}

.sqrtsymbol:hover {
  font-size: 1.25em;
}

.free-sketch {
  max-width: 50px;
  max-height: 50px;
}

.touch-drawing {
  touch-action: none;
}
</style>
