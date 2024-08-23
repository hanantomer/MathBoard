<template>
  <freeTextEditor :svgId="svgId"></freeTextEditor>
  <exponentEditor :svgId="svgId"></exponentEditor>
  <areaSelector :svgId="svgId"></areaSelector>
  <v-row align="start" class="fill-heigh" no-gutters>
    <div style="display: flex; flex-direction: row">
      <v-sheet class="mt-14 ml-1">
        <toolbar :key="toolbarKey"></toolbar>
      </v-sheet>
      <div style="display: flex; flex-direction: column">
        <v-sheet class="mt-10 ml-8">
          <v-progress-linear
            data-cy="pBar"
            v-show="pBar"
            color="deep-purple-accent-4"
            indeterminate
            rounded
            height="6"
          ></v-progress-linear>
          <horizontalLineDrawer :svgId="svgId"></horizontalLineDrawer>
          <verticalLineDrawer :svgId="svgId"></verticalLineDrawer>
          <slopeLineDrawer :svgId="svgId"></slopeLineDrawer>
          <curveDrawer :svgId="svgId" :curveType="curveType"></curveDrawer>
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
import exponentEditor from "./ExponentEditor.vue";
import useNotationLoadingHelper from "../helpers/notationLoadingHelper";
import UseMatrixHelper from "../helpers/matrixHelper";
import UseMatrixCellHelper from "../helpers/matrixCellHelper";
import UseEventHelper from "../helpers/eventHelper";
import toolbar from "./Toolbar.vue";
import editingToolbar from "./EditingToolbar.vue";
import areaSelector from "./AreaSelector.vue";
import horizontalLineDrawer from "./HorizontalLineDrawer.vue";
import verticalLineDrawer from "./VerticalLineDrawer.vue";
import slopeLineDrawer from "./SlopeLineDrawer.vue";
import curveDrawer from "./CurveDrawer.vue";
import useEventBus from "../helpers/eventBusHelper";
import { CellAttributes } from "common/baseTypes";
import { onMounted, onUnmounted, ref, watch, computed } from "vue";
import { useNotationStore } from "../store/pinia/notationStore";
import { useCellStore } from "../store/pinia/cellStore";
import { useEditModeStore } from "../store/pinia/editModeStore";
import { useAnswerStore } from "../store/pinia/answerStore";
import {
  NotationTypeShape,
  CursorType,
  EditMode,
  EditModeCursorType,
} from "common/unions";
import useSelectionHelper from "../helpers/selectionHelper";
import useNotationMutateHelper from "../helpers/notationMutateHelper";
import usescreenHelper from "../helpers/screenHelper";
import useUserOutgoingOperations from "../helpers/userOutgoingOperationsHelper";
const notationLoadingHelper = useNotationLoadingHelper();
const notationStore = useNotationStore();
const cellStore = useCellStore();
const eventBus = useEventBus();
const matrixHelper = UseMatrixHelper();
const matrixCellHelper = UseMatrixCellHelper();
const selectionHelper = useSelectionHelper();
const notationMutateHelper = useNotationMutateHelper();
const eventHelper = UseEventHelper();
const editModeStore = useEditModeStore();
const answerStore = useAnswerStore();
const screenHelper = usescreenHelper();
const userOutgoingOperations = useUserOutgoingOperations();
const pBar = ref(false);
let cursor = ref<CursorType>("auto");
let toolbarKey = ref(0);

onMounted(() => {});

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

watch(
  () => eventBus.bus.value.get("EV_SVG_MOUSEDOWN"),
  (e: MouseEvent) => {
    if (!e) return;
    handleMouseDown(e);
  },
  { immediate: true },
);

watch(
  () => eventBus.bus.value.get("EV_KEYUP"),
  (e: KeyboardEvent) => {
    eventHelper.keyUp(e, props.svgId);
  },
);

watch(
  () => editModeStore.getEditMode() as EditMode,
  (newEditMode: EditMode) => {
    cursor.value = EditModeCursorType.get(newEditMode)!;
  },
  { immediate: true, deep: true },
);

watch(
  () => cellStore.getSelectedCell() as CellAttributes,
  (
    newSelectedCell: CellAttributes | undefined | null,
    oldSelectedCell: CellAttributes | undefined | null,
  ) => {
    setTimeout(() => {
      matrixCellHelper.showSelectedCell(
        props.svgId,
        newSelectedCell,
        oldSelectedCell,
      );
    }, 100);
  },
  { immediate: true, deep: true },
);

watch(
  () => eventBus.bus.value.get("EV_CELL_COLORIZED"),
  (params) => {
    const clickedCell = screenHelper.getClickedCell(props.svgId, {
      x: params.clientX,
      y: params.clientY,
    });

    matrixCellHelper.colorizeCell(props.svgId, clickedCell, params.cellColor);

    userOutgoingOperations.syncOutgoingColorizedCell(
      clickedCell,
      notationStore.getParent().uuid,
      params.cellColor,
    );

    cellStore.resetSelectedCell();
  },
);

watch(
  () => eventBus.bus.value.get("EV_COPY"),
  () => {
    eventHelper.copy();
    eventBus.bus.value.delete("EV_COPY"); // clean copy buffer
  },
);

watch(
  () => eventBus.bus.value.get("EV_PASTE"),
  (e: ClipboardEvent) => {
    eventHelper.paste(e);
  },
);

// wait for child(e.g lesson) signal
watch(
  () => props.loaded,
  (loaded: Boolean) => {
    if (loaded) load();
  },
  { immediate: true },
);

watch(
  () => notationStore.getNotations(),
  () => {
    matrixHelper.refreshScreen(notationStore.getNotations(), props.svgId);
  },
  { deep: true },
);

async function load() {
  cellStore.setSvgId(props.svgId);

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

function handleMouseDown(e: MouseEvent) {
  if (e.buttons !== 1) {
    return;
  }

  const position = { x: e.clientX, y: e.clientY };

  if (
    editModeStore.isSelectFromListMode() ||
    editModeStore.isLineMode() ||
    editModeStore.isCurveMode() ||
    editModeStore.isColorisingMode() ||
    editModeStore.isTextStartedMode() ||
    editModeStore.isExponentStartedMode() 
  ) {
    return;
  }

  if (
    editModeStore.getEditMode() === "CHECKMARK_STARTED" ||
    editModeStore.getEditMode() === "SEMICHECKMARK_STARTED" ||
    editModeStore.getEditMode() === "XMARK_STARTED"
  ) {
    selectionHelper.selectCell(props.svgId, position);
    notationMutateHelper.addMarkNotation();
    return;
  }

  const notation = selectionHelper.selectNotationAtPosition(
    props.svgId,
    position,
  );

  if (!notation || NotationTypeShape.get(notation?.notationType) === "POINT") {
    selectionHelper.selectCell(props.svgId, position);
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
  stroke: chocolate;
}
.lineHandle {
  cursor: col-resize;
  display: block;
  position: absolute;
  z-index: 999;
  width: 12px;
  height: 12px;
  border: 1, 1, 1, 1;
}

.sqrtsymbol {
  position: absolute;
  color: chocolate;
  margin-left: 6px;
  z-index: 999;
  font-weight: bold;
  font-size: 1.7em;
}
</style>
