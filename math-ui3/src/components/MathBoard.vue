<template>
  <v-row>
    <v-col cols="12" class="d-flex justify-center">
      <slot name="title"></slot>
    </v-col>
  </v-row>
  <v-row class="fill-height">
    <v-col colls="1">
      <toolbar></toolbar>
    </v-col>
    <v-col cols="11">
      <lineDrawer :svgId="svgId"></lineDrawer>
      <areaSelector :svgId="svgId"></areaSelector>
      <svg v-bind:id="svgId" x="0" y="0" width="100%" height="100%"></svg>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import useNotationLoadingHelper from "../helpers/notationLoadingHelper";
import UseMatrixHelper from "../helpers/matrixHelper";
import UseEventHelper from "../helpers/eventHelper";
import toolbar from "./Toolbar.vue";
import areaSelector from "./AreaSelector.vue";
import lineDrawer from "./LineDrawer.vue";
import useEventBus from "../helpers/eventBusHelper";
import { CellCoordinates } from "common/globals";
import { onMounted, onUnmounted, watch } from "vue";
import { useNotationStore } from "../store/pinia/notationStore";
import { useEditModeStore } from "../store/pinia/editModeStore";
import { useAnswerStore } from "../store/pinia/answerStore";
import useSelectionHelper from "../helpers/selectionHelper";
import useNotationMutateHelper from "../helpers/notationMutateHelper";

const notationLoadingHelper = useNotationLoadingHelper();
const notationStore = useNotationStore();
const eventBus = useEventBus();
const matrixHelper = UseMatrixHelper();
const selectionHelper = useSelectionHelper();
const notationMutateHelper = useNotationMutateHelper();
const eventHelper = UseEventHelper();
const editModeStore = useEditModeStore();
const answerStore = useAnswerStore();

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

  if (editModeStore.isLineMode()) {
    return;
  }

  if (editModeStore.getEditMode() == "AREA_SELECT") {
    editModeStore.setNextEditMode();
    return;
  }

  if (
    editModeStore.getEditMode() === "CHECKMARK" ||
    editModeStore.getEditMode() === "SEMICHECKMARK" ||
    editModeStore.getEditMode() === "XMARK"
  ) {
    selectionHelper.selectCell(position);
    notationMutateHelper.addMarkNotation();
    return;
  }

  selectionHelper.selectClickedPosition(position);
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
</style>
