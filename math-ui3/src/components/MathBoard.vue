<template>
  <annotationEditor></annotationEditor>
  <freeTextEditor></freeTextEditor>
  <exponentEditor></exponentEditor>
  <areaSelector></areaSelector>
  <v-row align="start" class="fill-heigh" no-gutters>
    <v-progress-linear
      data-cy="pBar"
      v-show="progressBar"
      color="deep-purple-accent-4"
      indeterminate
      rounded
      height="8"
    ></v-progress-linear>
    <div style="display: flex">
      <leftToolbar></leftToolbar>
      <horizontalLineDrawer></horizontalLineDrawer>
      <sqrtDrawer></sqrtDrawer>
      <verticalLineDrawer></verticalLineDrawer>
      <slopeLineDrawer></slopeLineDrawer>
      <curveDrawer :curveType="curveType"></curveDrawer>
      <v-sheet>
        <svg
          v-bind:style="{ cursor: cursor, margin: '10px' }"
          v-bind:id="svgId"
          width="1520"
          height="760"
          margin="10"
        ></svg>
      </v-sheet>
      <specialSymbolsToolbar></specialSymbolsToolbar>
    </div>
  </v-row>
</template>

<script setup lang="ts">
import freeTextEditor from "./FreeTextEditor.vue";
import annotationEditor from "./AnnotationEditor.vue";
import exponentEditor from "./ExponentEditor.vue";
import useNotationLoadingHelper from "../helpers/notationLoadingHelper";
import UseMatrixHelper from "../helpers/matrixHelper";
import UseEventHelper from "../helpers/eventHelper";
import leftToolbar from "./LeftToolbar.vue";
import specialSymbolsToolbar from "./SpecialSymbolsToolbar.vue";
import areaSelector from "./AreaSelector.vue";
import horizontalLineDrawer from "./HorizontalLineDrawer.vue";
import sqrtDrawer from "./SqrtDrawer.vue";
import verticalLineDrawer from "./VerticalLineDrawer.vue";
import slopeLineDrawer from "./SlopeLineDrawer.vue";
import curveDrawer from "./CurveDrawer.vue";
import useWatchHelper from "../helpers/watchHelper";
import { onUnmounted, ref, computed } from "vue";
import { useNotationStore } from "../store/pinia/notationStore";
import { useCellStore } from "../store/pinia/cellStore";
import { useEditModeStore } from "../store/pinia/editModeStore";
import { useAnswerStore } from "../store/pinia/answerStore";
import { CursorType, EditModeCursorType } from "common/unions";
import useSelectionHelper from "../helpers/selectionHelper";
import useKeyHelper from "../helpers/keyHelper";
const notationLoadingHelper = useNotationLoadingHelper();
const notationStore = useNotationStore();
const cellStore = useCellStore();
const matrixHelper = UseMatrixHelper();
const selectionHelper = useSelectionHelper();
const keyHelper = useKeyHelper();
const eventHelper = UseEventHelper();
const watchHelper = useWatchHelper();
const editModeStore = useEditModeStore();
const answerStore = useAnswerStore();
const progressBar = ref(false);

let cursor = ref<CursorType>("auto");
//let toolbarKey = ref(0);

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

let curveType = computed(() => {
  return editModeStore.getEditMode() === "CONCAVE_CURVE_STARTED"
    ? "CONCAVE"
    : "CONVEX";
});

watchHelper.watchMouseEvent(
  ["SYMBOL", "CELL_SELECTED"],
  "EV_SVG_MOUSEUP",
  selectionHelper.selectClickedPosition,
);

watchHelper.watchKeyEvent(
  [
    "SYMBOL",
    "CELL_SELECTED",
    "HORIZONTAL_LINE_SELECTED",
    "VERTICAL_LINE_SELECTED",
    "SLOPE_LINE_SELECTED",
    "CONCAVE_CURVE_SELECTED",
    "CONVEX_CURVE_SELECTED",
    "SQRT_SELECTED",
    "ANNOTATION_SELECTED",
    "TEXT_SELECTED",
    "EXPONENT_SELECTED",
  ],
  "EV_KEYUP",
  keyHelper.keyUpHandler,
);

watchHelper.watchEveryEditModeChange(
  (newEditMode) => (cursor.value = EditModeCursorType.get(newEditMode)!),
);

watchHelper.watchSelectedCellAndDisplayNewSelected(props.svgId);

watchHelper.watchCustomEvent("SYMBOL", "EV_COPY", () => {
  eventHelper.copy();
});

watchHelper.watchCustomEvent("SYMBOL", "EV_PASTE", (e: ClipboardEvent) => {
  eventHelper.paste(e);
});

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
  //toolbarKey.value++; // refresh toolbar

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
html {
  overflow: auto;
  background-image: url('data:image/svg+xml;utf-8,<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="M120-120v-190l358-358-58-56 58-56 76 76 124-124q5-5 12.5-8t15.5-3q8 0 15 3t13 8l94 94q5 6 8 13t3 15q0 8-3 15.5t-8 12.5L705-555l76 78-57 57-56-58-358 358H120Zm80-80h78l332-334-76-76-334 332v78Zm447-410 96-96-37-37-96 96 37 37Zm0 0-37-37 37 37Z"/></svg>');
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
  stroke: chocolate;
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
path:hover {
  stroke-width: 4.5;
}

.sqrt {
  border-bottom: solid 1px;
  border-top: solid 1px;
  z-index: 999;
  display: block;
  position: relative;
  top: 2px;
}

.sqrt:hover {
  border-bottom: solid 2px;
  border-top: solid 2px;
}

.sqrtsymbol {
  position: absolute;
  color: chocolate;
  margin-top: -8px;
  margin-left: 8px;
  z-index: 999;
  font-weight: bold;
  font-size: 1.7em;
}
</style>
