<template>
  <v-tooltip text="colorize tool">
    <template v-slot:activator="{ props }">
      <v-btn
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
              :value="index"
              v-bind:style="{
                backgroundColor: item,
              }"
              @click="selectColor"
            >
              <v-list-item-title>{{ item }}</v-list-item-title>
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

const notationMutateHelper = useNotationMutateHelper();
const watchHelper = useWatchHelper();
const screenHelper = useScreenHelper();
const editModeStore = useEditModeStore();
const notationStore = useNotationStore();

const backgroundColor = computed(() => {
  return selectedColor.value === "none"
    ? "transparent"
    : selectedColor.value === "transparent"
    ? transparentColor // indication for user that uncolorizing is taking place
    : selectedColor.value;
});

let selectedColor = ref<Color>("none"); /// TODO move to store

const colors: Color[] = ["lightyellow", "lightblue", "lightgreen", "pink", "transparent"];

watchHelper.watchMouseEvent(
  ["COLORIZING"],
  "EV_SVG_MOUSEDOWN",
  colorizeNotationAtMousePosition,
);

watchHelper.watchMouseEvent(
  ["COLORIZING"],
  "EV_SVG_MOUSEMOVE",
  colorizeNotationByMouseDrag,
);

// reset coorizing tool when colorizing by click or by drag ends
watchHelper.watchMouseEvent(["COLORIZING"], "EV_SVG_MOUSEUP", resetColorizing);

function selectColor(e: any) {
  editModeStore.setEditMode("COLORIZING");
  const color = (e.currentTarget as any).textContent as Color;
  selectedColor.value = color === "transparent" ? "none" : color;
}

function colorizeNotationByMouseDrag(e: MouseEvent) {
  if (e.buttons !== 1) return;
  colorizeNotationAtMousePosition(e);
}

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
    selectedColor.value === "transparent"
      ? null
      : { value: selectedColor.value, id: undefined };
  notationMutateHelper.updateNotation(notation);
}

function resetColorizing() {
  selectedColor.value = "none";
  editModeStore.setDefaultEditMode();
}
</script>
<style>
div.v-input__control {
  max-height: 0px;
}

._colorsMenu {
  _max-width: 0px;
  background-color: white;
  margin-bottom: -50px;
}
</style>
