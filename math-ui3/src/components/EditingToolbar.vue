<template>
  <v-toolbar
    color="primary"
    dark
    class="horizontal-toolbar"
    height="50"
    width="400"
  >
    <v-tooltip text="Colorize cell">
      <template v-slot:activator="{ props }">
        <v-btn
          v-bind="props"
          :color="'lightblue'"
          fab
          dark
          v-on:click="startBlueMode"
        >
        </v-btn>
      </template>
    </v-tooltip>
    <v-tooltip text="Colorize cell">
      <template v-slot:activator="{ props }">
        <v-btn
          v-bind="props"
          :color="'lightgreen'"
          fab
          dark
          v-on:click="startGreenMode"
        >
        </v-btn>
      </template>
    </v-tooltip>
        <v-tooltip text="Colorize cell">
      <template v-slot:activator="{ props }">
        <v-btn
          v-bind="props"
          :color="'lightpurple'"
          fab
          dark
          v-on:click="startPurpleMode"
        >
        </v-btn>
      </template>
    </v-tooltip>
    <v-tooltip text="Uncolorize">
      <template v-slot:activator="{ props }">
        <v-btn
          v-bind="props"
          :color="'transparent'"
          fab
          dark
          v-on:click="startUncolorizeMode"
        >
        </v-btn>
      </template>
    </v-tooltip>


  </v-toolbar>
</template>

<script setup lang="ts">
import { watch, ref, computed } from "vue";
import useNotationMutateHelper from "../helpers/notationMutateHelper";
import useEventBus from "../helpers/eventBusHelper";
import useAuthorizationHelper from "../helpers/authorizationHelper";

const authorizationHelper = useAuthorizationHelper();
const eventBus = useEventBus();

let blueButtonActive = ref(1);
let greenButtonActive = ref(1);
let purpleButtonActive = ref(1);
let transparentButtonActive = ref(1);

type CellColor = "lightblue"|  "lightgreen" | "lightpurple" | "transparent" | "none"
let cellColor: CellColor = "none";

watch(
  () => eventBus.bus.value.get("svgmousemove"),
  (e: MouseEvent) => {
    handleMouseMove(e);
  },
);

watch(
  () => eventBus.bus.value.get("svgmouseup"),
  (e: MouseEvent) => {
    handleMouseUp(e);
  },
);

watch(
  () => eventBus.bus.value.get("svgmousedown"),
  (e: MouseEvent) => {
    handleMouseDown(e);
  },
);

function handleMouseUp(e: MouseEvent) {
  resetButtonsState();
}

function handleMouseDown(e: MouseEvent) {
  eventBus.emit("colorizeCell", { ...e, cellColor });
}

function handleMouseMove(e: MouseEvent) {
  eventBus.emit("colorizeCell", { ...e, cellColor });
}

function startBlueMode() {
  resetButtonsState();
  blueButtonActive.value = 0;
}

function startGreenMode() {
  resetButtonsState();
  greenButtonActive.value = 0;
}

function startPurpleMode() {
  resetButtonsState();
  purpleButtonActive.value = 0;
  cellColor = "lightpurple";
}

function startUncolorizeMode() {
  resetButtonsState();
  transparentButtonActive.value = 0;
  cellColor = "transparent";
}

const editEnabled = computed(() => {
  return authorizationHelper.canEdit();
});

function resetButtonsState() {
  cellColor = "none";
  blueButtonActive.value = 1;
  greenButtonActive.value = 1;
  purpleButtonActive.value = 1;
  transparentButtonActive.value = 1;
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
