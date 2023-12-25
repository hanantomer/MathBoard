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
import { useQuestionStore } from "../store/pinia/questionStore";
import { useEditModeStore } from "../store/pinia/editModeStore";
import useSelectionHelper from "../helpers/selectionHelper";

const notationLoadingHelper = useNotationLoadingHelper();
const notationStore = useNotationStore();
const eventBus = useEventBus();
const matrixHelper = UseMatrixHelper();
const selectionHelper = useSelectionHelper();
const eventHelper = UseEventHelper();
const editModeStore = useEditModeStore();
const questionStore = useQuestionStore();

onMounted(() => {
  eventHelper.registerSvgMouseDown(props.svgId);
  eventHelper.registerSvgMouseMove(props.svgId);
  eventHelper.registerSvgMouseUp(props.svgId);
  eventHelper.registerKeyUp();
  eventHelper.registerPaste();
});

onUnmounted(() => {
  eventHelper.unregisterSvgMouseDown(props.svgId);
  eventHelper.unregisterSvgMouseMove(props.svgId);
  eventHelper.unregisterSvgMouseUp(props.svgId);
  eventHelper.unregisterKeyUp();
  eventHelper.unregisterPaste();
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
  () => notationStore.getSelectedCell() as CellCoordinates,
  (
    newSelectedCell: CellCoordinates | undefined | null,
    oldSelectedCell: CellCoordinates | undefined | null,
  ) => {
    selectionHelper.showSelectedCell(
      props.svgId,
      newSelectedCell,
      oldSelectedCell,
    );
  },
  { immediate: true, deep: true },
);

watch(
  () => eventBus.bus.value.get("keyup"),
  (e: KeyboardEvent) => {
    eventHelper.keyUp(e, props.svgId);
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
  { immediate: true, deep: true },
);

async function load() {
  matrixHelper.setMatrix(props.svgId);

  // load notations
  await notationLoadingHelper.loadNotations(
    notationStore.getParent().type,
    notationStore.getParent().uuid,
  );

  // for answer load also question notations
  if (notationStore.getParent().type === "ANSWER") {
    await notationLoadingHelper.loadNotations(
      "QUESTION",
      questionStore.getCurrentQuestion()?.uuid!,
    );
  }
}

function handleMouseDown(e: MouseEvent) {
  if (e.buttons !== 1) {
    return;
  }

  if (editModeStore.isLineMode()) {
    return;
  }

  if (editModeStore.getEditMode() == "AREA_SELECT") {
    editModeStore.setNextEditMode();
    return;
  }

  // during area selection
  //if (editModeStore.isSelectionMode()) {
  //  return;
  //}

  const position = { x: e.clientX, y: e.clientY };

  selectionHelper.selectClickedNotation(position);
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
mjx-container[jax="SVG"][display="true"] {
  margin: auto !important;
}

mjx-line {
  margin-top: 0.05em !important;
  margin-bottom: 0.3em !important;
}
</style>
