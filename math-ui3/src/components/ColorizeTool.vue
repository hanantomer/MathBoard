<template>
  <v-tooltip text="colorize tool">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        v-bind:style="{
          backgroundColor: backgroundColor,
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
import { ref, computed } from "vue";
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

import { transparentColor } from "common/globals";

import { Color } from "common/unions";

const notationMutateHelper = useNotationMutateHelper();
const watchHelper = useWatchHelper();
const screenHelper = useScreenHelper();
const editModeStore = useEditModeStore();

const backgroundColor = computed(() => {
  return selectedColor.value === "none"
    ? "transparent"
    : selectedColor.value === "transparent"
    ? transparentColor
    : selectedColor.value;
});

let colorSelectionEl = ref();

let selectedColor = ref<Color>("none");

interface ColorStrip {
  title: string;
  value: Color;
}

const colors: ColorStrip[] = [
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

// reset coorizing tool when colorizing by click or by drag ends
watchHelper.watchMouseEvent(["COLORIZING"], "EV_SVG_MOUSEUP", resetColorizing);

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

    case "CONCAVECURVE":
    case "CONVEXCURVE":
    case "EXPONENT":
    case "ANNOTATION":
    case "SIGN":
    case "SQRTSYMBOL":
    case "SYMBOL": {
      return colorizeNotation(clickedNotation);
    }
    default: {
      throw new Error(
        clickedNotation?.notationType + ": not supported by colorizing",
      );
    }
  }
}

function colorizeNotation(notation: NotationAttributes) {
  notation.color = { value: selectedColor.value, id: undefined };
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
</style>
