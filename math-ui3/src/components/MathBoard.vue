<template>
  <annotationEditor></annotationEditor>
  <freeTextEditor></freeTextEditor>
  <exponentEditor></exponentEditor>
  <areaSelector></areaSelector>
  <v-row align="start" class="fill-heigh" no-gutters>
    <div style="display: flex; flex-direction: row">
      <v-sheet class="mt-14 ml-1">
        <toolbar :key="toolbarKey"></toolbar>
      </v-sheet>
      <div style="display: flex; flex-direction: column">
        <v-sheet class="mt-10 ml-16">
          <v-progress-linear
            data-cy="pBar"
            v-show="pBar"
            color="deep-purple-accent-4"
            indeterminate
            rounded
            height="6"
          ></v-progress-linear>
          <horizontalLineDrawer></horizontalLineDrawer>
          <sqrtDrawer></sqrtDrawer>
          <verticalLineDrawer></verticalLineDrawer>
          <slopeLineDrawer></slopeLineDrawer>
          <curveDrawer :curveType="curveType"></curveDrawer>
          <svg
            v-bind:style="{ cursor: cursor }"
            v-bind:id="svgId"
            width="1600"
            height="760"
          ></svg>
        </v-sheet>
        <v-sheet class="ml-auto mr-auto">
          <editingToolbar></editingToolbar>
        </v-sheet>
      </div>
    </div>
  </v-row>
</template>

<script setup lang="ts">
import freeTextEditor from "./FreeTextEditor.vue";
import annotationEditor from "./AnnotationEditor.vue";
import exponentEditor from "./ExponentEditor.vue";
import useNotationLoadingHelper from "../helpers/notationLoadingHelper";
import UseMatrixHelper from "../helpers/matrixHelper";
import UseMatrixCellHelper from "../helpers/matrixCellHelper";
import UseEventHelper from "../helpers/eventHelper";
import toolbar from "./Toolbar.vue";
import editingToolbar from "./EditingToolbar.vue";
import areaSelector from "./AreaSelector.vue";
import horizontalLineDrawer from "./HorizontalLineDrawer.vue";
import sqrtDrawer from "./SqrtDrawer.vue";
import verticalLineDrawer from "./VerticalLineDrawer.vue";
import slopeLineDrawer from "./SlopeLineDrawer.vue";
import curveDrawer from "./CurveDrawer.vue";
import useEventBus from "../helpers/eventBusHelper";
import useWatchHelper from "../helpers/watchHelper";
import { onUnmounted, ref, computed } from "vue";
import { useNotationStore } from "../store/pinia/notationStore";
import { useCellStore } from "../store/pinia/cellStore";
import { useEditModeStore } from "../store/pinia/editModeStore";
import { useAnswerStore } from "../store/pinia/answerStore";
import { CursorType, EditModeCursorType } from "common/unions";
import useSelectionHelper from "../helpers/selectionHelper";
import usescreenHelper from "../helpers/screenHelper";
import useUserOutgoingOperations from "../helpers/userOutgoingOperationsHelper";
import useKeyHelper from "../helpers/keyHelper";
const notationLoadingHelper = useNotationLoadingHelper();
const notationStore = useNotationStore();
const cellStore = useCellStore();
const eventBus = useEventBus();
const matrixHelper = UseMatrixHelper();
const matrixCellHelper = UseMatrixCellHelper();
const selectionHelper = useSelectionHelper();
const keyHelper = useKeyHelper();
const eventHelper = UseEventHelper();
const watchHelper = useWatchHelper();

const editModeStore = useEditModeStore();
const answerStore = useAnswerStore();
const screenHelper = usescreenHelper();
const userOutgoingOperations = useUserOutgoingOperations();

const pBar = ref(false);
let cursor = ref<CursorType>("auto");
let toolbarKey = ref(0);

onUnmounted(() => {
  eventHelper.unregisterSvgMouseDown();
  eventHelper.unregisterSvgMouseMove();
  eventHelper.unregisterSvgMouseUp();
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
  selectClickedPosition,
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

watchHelper.watchEveryEditMode(
  (newEditMode) => (cursor.value = EditModeCursorType.get(newEditMode)!),
);

watchHelper.watchSelectedCell(props.svgId);

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
  eventHelper.registerKeyUp();
  eventHelper.registerPaste();
  eventHelper.registerCopy();

  pBar.value = true;
  toolbarKey.value++; // refreash toolbar

  try {
    notationStore.clearNotations();

    matrixHelper.setMatrix(props.svgId);

    // for answer load also question notations
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
    pBar.value = false;
  }
}

function selectClickedPosition(e: MouseEvent) {
  const position = { x: e.pageX, y: e.pageY };
  if (!selectionHelper.selectNotationAtPosition(position)) {
    selectionHelper.setSelectedCell(position);
  }
}
</script>

<style>
html {
  overflow: auto;
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
  top: 4px;
  stroke: chocolate;
  position: absolute;
  color: black;
  display: block;
  border-bottom: solid 1px;
  border-top: solid 1px;
  z-index: 999;
}

line:hover {
  stroke: rgb(235, 69, 91);
}

.lineHandle {
  cursor: col-resize;
  position: absolute;
  display: block;
  width: 12px;
  height: 12px;
  border: 1, 1, 1, 1;
  z-index: 999;
}

.sqrtsymbol {
  position: absolute;
  color: chocolate;
  margin-left: 8px;
  z-index: 999;
  font-weight: bold;
  font-size: 1.7em;
}
</style>
