<template>
  <areaSelector :svgId="svgId"></areaSelector>
  <v-row>
    <slot name="title"></slot>
  </v-row>
  <v-row align="start" class="fill-heigh" no-gutters>
    <div style="display: flex; flex-direction: row">
      <v-sheet class="mt-14 ml-1">
        <toolbar></toolbar>
      </v-sheet>
      <div style="display: flex; flex-direction: column">
        <v-sheet class="mt-10 ml-8 overflow-auto">
          <v-progress-linear
            v-show="pBar"
            color="deep-purple-accent-4"
            indeterminate
            rounded
            height="6"
          ></v-progress-linear>

          <lineDrawer :svgId="svgId"></lineDrawer>
          <svg v-bind:id="svgId" width="1600" height="760"></svg>
        </v-sheet>
        <v-sheet class="ml-auto mr-auto">
          <editingToolbar></editingToolbar>
        </v-sheet>
      </div>
    </div>
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
import { PointAttributes } from "common/baseTypes";
import { onMounted, onUnmounted, ref, watch } from "vue";
import { useNotationStore } from "../store/pinia/notationStore";
import { useEditModeStore } from "../store/pinia/editModeStore";
import { useAnswerStore } from "../store/pinia/answerStore";
import { NotationTypeShape } from "common/unions";
import useSelectionHelper from "../helpers/selectionHelper";
import useNotationMutateHelper from "../helpers/notationMutateHelper";
import useElementFinderHelper from "../helpers/elementFinderHelper";
import useUserOutgoingOperations from "../helpers/userOutgoingOperationsHelper";
import useNotationCellOccupationHelper from "../helpers/notationCellOccupationHelper";

const notationCellOccupationHelper = useNotationCellOccupationHelper();
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
const userOutgoingOperations = useUserOutgoingOperations();
const pBar = ref(false);

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
  () => notationStore.getSelectedCell() as PointAttributes,
  (
    newSelectedCell: PointAttributes | undefined | null,
    oldSelectedCell: PointAttributes | undefined | null,
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
    /*
    let clickedCell = elementFinderHelper.findClickedNotation(
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

    let cell: PointAttributes = {
      col: parseInt(col || "-1"),
      row: parseInt(row || "-1"),
    };

    */

    const clickedCell = elementFinderHelper.findClickedCell(props.svgId, {
      x: params.clientX,
      y: params.clientY,
    });

    matrixHelper.colorizeCell(props.svgId, clickedCell, params.cellColor);

    userOutgoingOperations.syncOutgoingColorizedCell(
      clickedCell,
      notationStore.getParent().uuid,
      params.cellColor,
    );

    notationStore.resetSelectedCell();
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
  pBar.value = true;

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

  if (editModeStore.isLineMode() || editModeStore.isColorisingMode()) {
    return;
  }

  if (
    editModeStore.getEditMode() === "CHECKMARK" ||
    editModeStore.getEditMode() === "SEMICHECKMARK" ||
    editModeStore.getEditMode() === "XMARK"
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
