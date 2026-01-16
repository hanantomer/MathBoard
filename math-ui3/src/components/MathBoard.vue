<template>
  <lessonStudents></lessonStudents>
  <floatingToolbar></floatingToolbar>
  <annotationEditor></annotationEditor>
  <freeTextEditor></freeTextEditor>
  <textAreaSync></textAreaSync>
  <exponentEditor></exponentEditor>
  <areaSelector></areaSelector>
  <v-progress-linear
    data-cy="pBar"
    v-show="progressBar"
    color="deep-purple-accent-4"
    indeterminate
    rounded
    height="8"
  ></v-progress-linear>
  <statusBar></statusBar>
  <div style="display: flex">
    <leftToolbar></leftToolbar>
    <sqrtDrawer></sqrtDrawer>
    <lineDrawer></lineDrawer>
    <divisionLineDrawer></divisionLineDrawer>
    <polygonDrawer></polygonDrawer>
    <curveDrawer></curveDrawer>
    <circleDrawer></circleDrawer>

    <svg
      style="
        width: 1650px;
        height: 795px;
        margin-left: 10px;
        margin-top: 10px;
        background-color: white;
      "
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

    <specialSymbolsToolbar></specialSymbolsToolbar>
  </div>
</template>

<script setup lang="ts">
import freeTextEditor from "./FreeTextEditor.vue";
import textAreaSync from "./TextAreaSync.vue";
import StatusBar from "./StatusBar.vue";
import annotationEditor from "./AnnotationEditor.vue";
import exponentEditor from "./ExponentEditor.vue";
import useNotationLoadingHelper from "../helpers/notationLoadingHelper";
import useMatrixHelper from "../helpers/matrixHelper";
import useEventHelper from "../helpers/eventHelper";
import leftToolbar from "./LeftToolbar.vue";
import specialSymbolsToolbar from "./SpecialSymbolsToolbar.vue";
import areaSelector from "./AreaSelector.vue";
import sqrtDrawer from "./SqrtDrawer.vue";
import lineDrawer from "./LineDrawer.vue";
import divisionLineDrawer from "./DivisionLineDrawer.vue";
import polygonDrawer from "./PolygonDrawer.vue";
import curveDrawer from "./CurveDrawer.vue";
import circleDrawer from "./CircleDrawer.vue";
import useWatchHelper from "../helpers/watchHelper";
import useNotationMutationHelper from "../helpers/notationMutateHelper";
import { onUnmounted, ref } from "vue";
import { useNotationStore } from "../store/pinia/notationStore";
import { useCellStore } from "../store/pinia/cellStore";
import { useAnswerStore } from "../store/pinia/answerStore";
import { CursorType, EditModeCursorType } from "common/unions";
import useSelectionHelper from "../helpers/selectionHelper";
import useKeyHelper from "../helpers/keyHelper";

import floatingToolbar from "./FloatingToolbar.vue";
import lessonStudents from "./LessonStudents.vue";
const notationLoadingHelper = useNotationLoadingHelper();
const notationStore = useNotationStore();
const cellStore = useCellStore();
const matrixHelper = useMatrixHelper();
const selectionHelper = useSelectionHelper();
const keyHelper = useKeyHelper();
const eventHelper = useEventHelper();
const watchHelper = useWatchHelper();
const notationMutateHelper = useNotationMutationHelper();
const answerStore = useAnswerStore();
const progressBar = ref(false);

let cursor = ref<CursorType>("auto");

onUnmounted(() => {
  eventHelper.unregisterSvgMouseDown();
  eventHelper.unregisterSvgMouseMove();
  eventHelper.unregisterSvgMouseUp();
  eventHelper.unregisterMouseUp();
  eventHelper.unregisterKeyUp();
  eventHelper.unregisterPaste();
  eventHelper.unregisterCopy();
});

const props = defineProps({
  svgId: { type: String, default: "" },
  loaded: { type: Boolean, default: false },
});

watchHelper.watchMouseEvent(
  ["CELL_SELECTED", "SPECIAL_SYMBOL_SELECTED"],
  "EV_SVG_MOUSEUP",
  selectionHelper.selectClickedPosition,
  props.svgId,
);

watchHelper.watchMouseEvent(
  ["XMARK_STARTED", "CHECKMARK_STARTED", "SEMICHECKMARK_STARTED"],
  "EV_SVG_MOUSEUP",
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

watchHelper.watchEveryEditModeChange(
  (newEditMode) => (cursor.value = EditModeCursorType.get(newEditMode)!),
);

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

  eventHelper.registerSvgMouseDown();
  eventHelper.registerSvgMouseMove();
  eventHelper.registerSvgMouseUp();
  eventHelper.registerMouseUp();
  eventHelper.registerKeyUp();
  eventHelper.registerPaste();
  eventHelper.registerCopy();

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
  }
}
</script>

<style>
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
  margin-left: 10px;
  margin-top: 10px;
}

line:hover,
circle:hover,
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


</style>
