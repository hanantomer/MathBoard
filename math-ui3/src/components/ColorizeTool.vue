<template>
  <v-tooltip text="colorize tool">
    <template v-slot:activator="{ props }">
      <v-btn
        :disabled="!editEnabled"
        v-bind="props"
        v-bind:style="{
          backgroundColor: backgroundColor,
        }"
        icon
        color="white"
        x-small
        fab
        dark
        ><v-icon>mdi-format-color-highlight</v-icon>
        <v-menu activator="parent">
          <v-list>
            <v-list-item
              v-for="(item, index) in colors"
              :key="index"
              :active="item === selectedColor"
              v-bind:style="{
                backgroundColor: item,
                height: 20,
              }"
              @click="
                selectedColor = item;
                editModeStore.setEditMode('COLORIZING');
              "
            >
              <v-list-item-title></v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-btn>
    </template>
  </v-tooltip>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import useNotationMutateHelper from "../helpers/notationMutateHelper";
import useWatchHelper from "../helpers/watchHelper";
import useScreenHelper from "../helpers/screenHelper";
import { useEditModeStore } from "../store/pinia/editModeStore";
import { useNotationStore } from "../store/pinia/notationStore";
import { NotationAttributes } from "common/baseTypes";

import { transparentColor } from "common/globals";

import { Color } from "common/unions";
import useAuthorizationHelper from "../helpers/authorizationHelper";

const notationMutateHelper = useNotationMutateHelper();
const authorizationHelper = useAuthorizationHelper();
const watchHelper = useWatchHelper();
const screenHelper = useScreenHelper();
const editModeStore = useEditModeStore();
const notationStore = useNotationStore();

const editEnabled = computed(() => {
  return authorizationHelper.canEdit();
});

const backgroundColor = computed(() => {
  return selectedColor.value === null
    ? ""
    : selectedColor.value === "none"
    ? transparentColor // indication for user that uncolorizing is taking place
    : selectedColor.value;
});

let selectedColor = ref<Color | null>(null);

const colors: Color[] = [
  "ciyan",
  "blue",
  "green",
  "purple",
  "orange",
  "red",
  "yellow",
  "gray",
  "lightgray",
  "darkgray",
  "lightblue",
  "lightgreen",
  "pink",
  "none",
];

watchHelper.watchMouseEvent(
  ["COLORIZING"],
  "EV_SVG_MOUSEDOWN",
  colorizeNotationAtMousePosition,
);

watchHelper.watchMouseEvent(
  ["COLORIZING"],
  "EV_SVG_MOUSE_OR_TOUCH_DRAG",
  colorizeNotationAtMousePosition,
);

// reset coorizing tool when colorizing by click or by drag ends
watchHelper.watchMouseEvent(["COLORIZING"], "EV_SVG_MOUSEUP", resetColorizing);


function colorizeNotationAtMousePosition(e: MouseEvent) {
  const uuid = (e.target as any).id;
  if (uuid) {
    // line or curve clicked - see matrixLineHelper
    colorizeNotation(notationStore.getNotation(uuid)!);
    return;
  }

  const dotCoordinates = { x: e.pageX, y: e.pageY };
  const clickedNotation = screenHelper.getNotationAtCoordinates(dotCoordinates);
  if (clickedNotation) {
    colorizeNotation(clickedNotation);
  }
}

function colorizeNotation(notation: NotationAttributes) {
  notation.color =
    selectedColor.value === "none" || selectedColor.value === null
      ? null
      : { value: selectedColor.value, id: undefined };
  notationMutateHelper.updateNotation(notation);
}

function resetColorizing() {
  selectedColor.value = null;
  editModeStore.setDefaultEditMode();
}
</script>
<style scoped>
.v-list-item {
  min-height: 20px !important;
}
</style>
