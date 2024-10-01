<template>
  <v-toolbar
    color="transparent"
    class="horizontal-toolbar"
    height="50"
    width="400"
  >
    <div
      class="d-flex justify-space-between"
      style="background-color: transparent"
    >
      <v-btn-toggle divided>
        <v-tooltip text="Colorize cell to blue">
          <template v-slot:activator="{ props }">
            <v-btn
              size="x-small"
              class="bg-blue-lighten-5"
              v-bind="props"
              v-on:click="startBlueMode"
            >
            </v-btn>
          </template>
        </v-tooltip>
        <v-tooltip text="Colorize cell to green">
          <template v-slot:activator="{ props }">
            <v-btn
              size="x-small"
              class="bg-green-lighten-4 ml-1"
              v-bind="props"
              v-on:click="startGreenMode"
            >
            </v-btn>
          </template>
        </v-tooltip>
        <v-tooltip text="Colorize cell to pink">
          <template v-slot:activator="{ props }">
            <v-btn
              size="x-small"
              class="bg-pink-lighten-4 ml-1"
              v-bind="props"
              v-on:click="startPurpleMode"
            >
            </v-btn>
          </template>
        </v-tooltip>
        <v-tooltip text="Uncolorize cell">
          <template v-slot:activator="{ props }">
            <v-btn
              style="border: solid 1px"
              size="x-small"
              class="bg-transparent ml-1"
              v-bind="props"
              v-on:click="startUncolorizeMode"
            >
            </v-btn>
          </template>
        </v-tooltip>
      </v-btn-toggle>
    </div>
  </v-toolbar>
</template>

<script setup lang="ts">
import { watch, ref } from "vue";
import useEventBus from "../helpers/eventBusHelper";
import { useEditModeStore } from "../store/pinia/editModeStore";

const eventBus = useEventBus();
const editModeStore = useEditModeStore();

let blueButtonActive = ref(1);
let greenButtonActive = ref(1);
let purpleButtonActive = ref(1);
let transparentButtonActive = ref(1);

type CellColor = "lightblue" | "lightgreen" | "pink" | "transparent" | "none";
let cellColor: CellColor = "none";

watch(
  () => eventBus.get("SYMBOL", "EV_SVG_MOUSEMOVE"),
  (e: MouseEvent) => {
    handleMouseMove(e);
  },
);

watch(
  () => eventBus.get("SYMBOL", "EV_SVG_MOUSEUP"),
  (e: MouseEvent) => {
    handleMouseUp(e);
  },
);

watch(
  () => eventBus.get("SYMBOL", "EV_SVG_MOUSEDOWN"),
  (e: MouseEvent) => {
    handleMouseDown(e);
  },
);

function handleMouseUp(e: MouseEvent) {
  if (cellColor === "none") return;
  resetButtonsState();
}

function handleMouseDown(e: MouseEvent) {
  if (cellColor === "none") return;
  eventBus.emit("EV_CELL_COLORIZED", {
    pageX: e.pageX,
    pageY: e.pageY,
    cellColor,
  });
}

function handleMouseMove(e: MouseEvent) {
  if (cellColor === "none") return;
  if (e.buttons !== 1) return;
  eventBus.emit("EV_CELL_COLORIZED", {
    pageX: e.pageX,
    pageY: e.pageY,
    cellColor,
  });
}

function startBlueMode() {
  resetButtonsState();
  editModeStore.setEditMode("COLORISING");
  blueButtonActive.value = 0;
  cellColor = "lightblue";
}

function startGreenMode() {
  resetButtonsState();
  editModeStore.setEditMode("COLORISING");
  greenButtonActive.value = 0;
  cellColor = "lightgreen";
}

function startPurpleMode() {
  resetButtonsState();
  editModeStore.setEditMode("COLORISING");
  purpleButtonActive.value = 0;
  cellColor = "pink";
}

function startUncolorizeMode() {
  resetButtonsState();
  editModeStore.setEditMode("COLORISING");
  transparentButtonActive.value = 0;
  cellColor = "transparent";
}

function resetButtonsState() {
  cellColor = "none";
  blueButtonActive.value = 1;
  greenButtonActive.value = 1;
  purpleButtonActive.value = 1;
  transparentButtonActive.value = 1;
  editModeStore.setDefaultEditMode();
}
</script>

<style>
.vertical-toolbar {
  flex-basis: content;
  flex-flow: column wrap !important;
  width: 55px !important;
  height: max-content !important;
  padding: 4px !important;
}
.vertical-toolbar .v-toolbar__content {
  flex-flow: column wrap !important;
  width: 35px !important;
  height: max-content !important;
  padding: 2px !important;
}
.vertical-toolbar-column {
  flex-basis: content;
}
</style>
