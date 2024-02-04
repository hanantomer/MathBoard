<template>
  <lineDrawer :svgId="svgId"></lineDrawer>
  <areaSelector :svgId="svgId"></areaSelector>
  <v-row>
    <slot name="title"></slot>
  </v-row>
  <v-row align="start" class="fill-height" no-gutters>
    <div class="d-flex">
      <v-sheet class="mt-10 ml-1">
        <toolbar></toolbar>
      </v-sheet>
      <v-sheet class="mt-10 ml-8">
        <svg v-bind:id="svgId" x="0" y="0" width="1600" height="760"></svg>
      </v-sheet>
    </div>
  </v-row>
  <v-row>
    <v-sheet class="flex-row ml-auto mr-auto">
      <v-toolbar dense floating>
        <editingToolbar></editingToolbar>
      </v-toolbar>
    </v-sheet>
  </v-row>
</template>

<script setup lang="ts">
import useNotationLoadingHelper from "../helpers/notationLoadingHelper";
import UseMatrixHelper from "../helpers/matrixHelper";
import UseEventHelper from "../helpers/eventHelper";
import toolbar from "./Toolbar.vue";
import editingToolbar from "./EditingToolbar.vue";
import areaSelector from "./AreaSelector.vue";
import lineDrawer from "./LineDrawer.vue";
import useEventBus from "../helpers/eventBusHelper";
import { CellCoordinates } from "common/globals";
import { onMounted, onUnmounted, watch } from "vue";
import { useNotationStore } from "../store/pinia/notationStore";
import { useEditModeStore } from "../store/pinia/editModeStore";
import { useAnswerStore } from "../store/pinia/answerStore";
import { NotationTypeShape } from "common/unions";
import useSelectionHelper from "../helpers/selectionHelper";
import useNotationMutateHelper from "../helpers/notationMutateHelper";
import useElementFinderHelper from "../helpers/elementFinderHelper";

const notationLoadingHelper = useNotationLoadingHelper();
const notationStore = useNotationStore();
const eventBus = useEventBus();
const matrixHelper = UseMatrixHelper();
const selectionHelper = useSelectionHelper();
const notationMutateHelper = useNotationMutateHelper();
const eventHelper = UseEventHelper();
const editModeStore = useEditModeStore();
const answerStore = useAnswerStore();
const elementFinderHelper = useElementFinderHelper();

onMounted(() => {
  eventHelper.registerSvgMouseDown(props.svgId);
  eventHelper.registerSvgMouseMove(props.svgId);
  eventHelper.registerSvgMouseUp(props.svgId);
  eventHelper.registerKeyUp();
  eventHelper.registerPaste();
  eventHelper.registerCopy();
});

onUnmounted(() => {
  eventHelper.unregisterSvgMouseDown(props.svgId);
  eventHelper.unregisterSvgMouseMove(props.svgId);
  eventHelper.unregisterSvgMouseUp(props.svgId);
  eventHelper.unregisterKeyUp();
  eventHelper.unregisterPaste();
  eventHelper.unregisterCopy();
});

const props = defineProps({
  svgId: { type: String, default: "" },
  loaded: { type: Boolean, default: false },
});

watch(
  () => eventBus.bus.value.get("svgmousedown"),
  (e: MouseEvent) => {
    if (!e) return;
    handleMouseDown(e);
  },
  { immediate: true },
);

watch(
  () => eventBus.bus.value.get("keyup"),
  (e: KeyboardEvent) => {
    eventHelper.keyUp(e, props.svgId);
  },
);

watch(
  () => notationStore.getSelectedCell() as CellCoordinates,
  (
    newSelectedCell: CellCoordinates | undefined | null,
    oldSelectedCell: CellCoordinates | undefined | null,
  ) => {
    setTimeout(() => {
      matrixHelper.showSelectedCell(
        props.svgId,
        newSelectedCell,
        oldSelectedCell,
      );
    }, 100);
  },
  { immediate: true, deep: true },
);

watch(
  () => eventBus.bus.value.get("colorizeCell"),
  (params) => {
    let clickedCell = elementFinderHelper.findClickedObject(
      {
        x: params.clientX,
        y: params.clientY,
      },
      "rect",
      null,
    );

    if (!clickedCell) return;

    const col = elementFinderHelper.getElementAttributeValue(
      clickedCell,
      "col",
    );
    const row = elementFinderHelper.getElementAttributeValue(
      clickedCell.parentElement!,
      "row",
    );

    let cellToColorize: CellCoordinates = {
      col: parseInt(col || "-1"),
      row: parseInt(row || "-1"),
    };

    matrixHelper.colorizeCell(props.svgId, cellToColorize, params.cellColor);
  },
);

watch(
  () => eventBus.bus.value.get("copy"),
  () => {
    eventHelper.copy();
    eventBus.bus.value.delete("copy");
  },
);

watch(
  () => eventBus.bus.value.get("paste"),
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

  // load notations
  await notationLoadingHelper.loadNotations(
    notationStore.getParent().type,
    notationStore.getParent().uuid,
  );
}

function handleMouseDown(e: MouseEvent) {
  if (e.buttons !== 1) {
    return;
  }

  const position = { x: e.clientX, y: e.clientY };

  if (editModeStore.isLineMode() || editModeStore.isColorisingMode()) {
    return;
  }

  //if (editModeStore.getEditMode() == "AREA_SELECT") {
  //  editModeStore.setNextEditMode();
  //  return;
  //}

  if (
    editModeStore.getEditMode() === "CHECKMARK" ||
    editModeStore.getEditMode() === "SEMICHECKMARK" ||
    editModeStore.getEditMode() === "XMARK"
  ) {
    selectionHelper.selectCell(position);
    notationMutateHelper.addMarkNotation();
    return;
  }

  const notation = selectionHelper.selectNotationAtPosition(position);
  if (!notation || NotationTypeShape.get(notation?.notationType) === "POINT") {
    selectionHelper.selectCell(position);
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
.title {
  max-width: 300px;
  color: white;
  position: absolute;
  top: 20px;
  left: 50%;
  text-align: center;
  z-index: 9999;
}
</style>
