<template>
  <v-tooltip text="colorize tool">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        v-bind:style="{
          backgroundColor: selectedColor,
        }"
        icon
        @click.stop="showColorSelectionMenu"
        color="white"
        x-small
        fab
        dark
        ><v-icon>mdi-format-color-highlight</v-icon>
        <v-menu
          open-on-hover
          activator="parent"
          style="max-width: 0px; background-color: white"
        >
          <v-select
            ref="colorSelectionEl"
            v-model="selectedColor"
            type="hidden"
            :items="colors"
            @update:modelValue="selectColor"
          >
            <template v-slot:item="{ props, item }">
              <v-list-item
                v-bind="props"
                style="min-height: 25px !important; color: gray"
                :title="item.title"
                :value="item.value"
                v-bind:style="{
                  backgroundColor: item.value,
                }"
              >
              </v-list-item>
            </template>
          </v-select>
        </v-menu>
      </v-btn>
    </template>
  </v-tooltip>
</template>

<script setup lang="ts">
import { ref } from "vue";
import useNotationMutateHelper from "../helpers/notationMutateHelper";
import useWatchHelper from "../helpers/watchHelper";
import useScreenHelper from "../helpers/screenHelper";
import { useEditModeStore } from "../store/pinia/editModeStore";
import {
  VerticalLineNotationAttributes,
  SlopeLineNotationAttributes,
  HorizontalLineNotationAttributes,
  NotationAttributes,
} from "common/baseTypes";

import { Color } from "common/unions";

const notationMutateHelper = useNotationMutateHelper();
const watchHelper = useWatchHelper();
const screenHelper = useScreenHelper();
const editModeStore = useEditModeStore();

let colorSelectionEl = ref();

let selectedColor = ref<Color>("transparent");

interface ColorLine {
  title: string;
  value: Color;
}

const colors: ColorLine[] = [
  { title: "blue", value: "lightblue" },
  { title: "green", value: "lightgreen" },
  { title: "pink", value: "pink" },
  { title: "transparent", value: "transparent" },
];

watchHelper.watchMouseEvent(
  ["COLORIZING"],
  "EV_SVG_MOUSEDOWN",
  colorizeNotationAtMousePosition,
);

watchHelper.watchMouseEvent(
  ["COLORIZING"],
  "EV_SVG_MOUSEMOVE",
  colorizeNotationAtMousePosition,
);

watchHelper.watchMouseEvent(["COLORIZING"], "EV_SVG_MOUSEUP", endColorizing);

function selectColor() {
  editModeStore.setEditMode("COLORIZING");
}

function showColorSelectionMenu(e: MouseEvent) {
  colorSelectionEl.value.focus();
  colorSelectionEl.value.details = false;
  colorSelectionEl.value.menu = true;
}

function colorizeNotationAtMousePosition(e: MouseEvent) {
  if (e.buttons !== 1) return;

  const dotCoordinates = { x: e.pageX, y: e.pageY };

  const clickedNotation = screenHelper.getNotationAtCoordinates(dotCoordinates);

  switch (clickedNotation?.notationType) {
    case "SQRT":
    case "HORIZONTALLINE": {
      if (
        screenHelper.getClickedPosDistanceFromHorizontalLine(
          dotCoordinates,
          clickedNotation as HorizontalLineNotationAttributes,
        ) < 5
      ) {
        return colorizeNotation(clickedNotation);
      }
    }

    case "VERTICALLINE": {
      if (
        screenHelper.getClickedPosDistanceFromVerticalLine(
          dotCoordinates,
          clickedNotation as VerticalLineNotationAttributes,
        ) < 5
      ) {
        return colorizeNotation(clickedNotation);
      }
    }

    case "SLOPELINE": {
      if (
        screenHelper.getClickedPosDistanceFromSlopeLine(
          dotCoordinates,
          clickedNotation as SlopeLineNotationAttributes,
        ) < 5
      ) {
        return colorizeNotation(clickedNotation);
      }
    }

    case "EXPONENT":
    case "ANNOTATION":
    case "SIGN":
    case "SQRTSYMBOL":
    case "SYMBOL": {
      return colorizeNotation(clickedNotation);
    }
  }
}

function colorizeNotation(notation: NotationAttributes) {
  notation.color = { value: selectedColor.value, id: undefined };
  notationMutateHelper.updateNotation(notation);
}

function endColorizing() {
  selectedColor.value = "transparent";
  editModeStore.setDefaultEditMode();
}
</script>
<style>
div.v-input__control {
  max-height: 0px;
}
</style>
