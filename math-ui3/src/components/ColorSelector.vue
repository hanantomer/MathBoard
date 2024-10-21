<template>
  <v-tooltip text="colorize tool">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        v-bind:style="{
          backgroundColor: selectedColor,
        }"
        icon
        @click.stop="selectColor"
        color="white"
        x-small
        fab
        dark
        ><v-icon>mdi-format-color-highlight</v-icon>
        <v-select
          ref="colorSelection"
          id="colorSelection"
          @update:modelValue="hideColorSelection"
          v-model="selectedColor"
          type="hidden"
          :items="colors"
          v-show="showColorSelection"
          v-bind:style="{
            backgroundColor: selectedColor,
          }"
        >
          <template v-slot:item="{ props, item }">
            <v-list-item
              v-bind="props"
              :title="item.value"
              :value="item.value"
              v-bind:style="{
                backgroundColor: item.value,
              }"
            >
            </v-list-item>
          </template>
        </v-select>
      </v-btn>
    </template>
  </v-tooltip>
</template>

<script setup lang="ts">
import { ref } from "vue";
import useWatchHelper from "../helpers/watchHelper";
import useMatrixCellHelper from "../helpers/matrixCellHelper";
import useScreenHelper from "../helpers/screenHelper";
import useUserOutgoingOperationsHelper from "../helpers/userOutgoingOperationsHelper";
import { useEditModeStore } from "../store/pinia/editModeStore";
import { useCellStore } from "../store/pinia/cellStore";
import { useNotationStore } from "../store/pinia/notationStore";
import {
  VerticalLineNotationAttributes,
  SlopeLineNotationAttributes,
  HorizontalLineNotationAttributes,
  NotationAttributes,
} from "common/baseTypes";

import { Color } from "common/unions";

const watchHelper = useWatchHelper();
const matrixCellHelper = useMatrixCellHelper();
const screenHelper = useScreenHelper();
const userOutgoingOperationsHelper = useUserOutgoingOperationsHelper();
const editModeStore = useEditModeStore();
const cellStore = useCellStore();
const notationStore = useNotationStore();

let colorSelection = ref();
let showColorSelection = ref(false);
const selectedColor = ref("red");
const colors = [{ value: "transparent" }, { value: "red" }, { value: "blue" }];
let cellColor: Color = "none";

watchHelper.watchMouseEvent(
  ["COLORIZING"],
  "EV_SVG_MOUSEDOWN",
  colorizeClickedPositionByMouseDown,
);

watchHelper.watchMouseEvent(
  ["COLORIZING"],
  "EV_SVG_MOUSEMOVE",
  colorizeCellByMouseMove,
);

watchHelper.watchMouseEvent(
  ["COLORIZING"],
  "EV_SVG_MOUSEUP",
  resetButtonsState,
);

function selectColor() {
  colorSelection.value.focus();
  colorSelection.value.details = false;
  colorSelection.value.menu = true;
}

function hideColorSelection() {
  showColorSelection.value = false;
}

function colorizeCellByMouseMove(e: MouseEvent) {
  if (cellColor === "none") return;
  if (e.buttons !== 1) return;
  colorizeCell(e, cellColor);
}

function colorizeClickedPositionByMouseDown(e: MouseEvent) {
  if (cellColor === "none") return;

  const dotCoordinates = { x: e.pageX, y: e.pageY };

  const clickedNotation = screenHelper.getNotationAtCoordinates(dotCoordinates);

  switch (clickedNotation?.notationType) {
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
  }

  colorizeCell(e, cellColor);
}

function colorizeNotation(notation: NotationAttributes) {}

function colorizeCell(e: MouseEvent, cellColor: string) {
  const clickedCell = screenHelper.getClickedCell({
    x: e.pageX,
    y: e.pageY,
  });

  matrixCellHelper.colorizeCell(cellStore.getSvgId()!, clickedCell, cellColor);

  userOutgoingOperationsHelper.syncOutgoingColorizedCell(
    clickedCell,
    notationStore.getParent().uuid,
    cellColor,
  );

  cellStore.resetSelectedCell();
}

function colorClicked(color: Color) {
  resetButtonsState();
  editModeStore.setEditMode("COLORIZING");
  cellColor = color;
}

function resetButtonsState() {
  if (cellColor === "none") return;
  cellColor = "none";
  editModeStore.setDefaultEditMode();
}
</script>

<style>
.v-list {
  position: static!important;
}
</style>
