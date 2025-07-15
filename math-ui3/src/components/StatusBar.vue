<template>
  <div
    class="text-center"
    style="position: absolute !important; bottom: 200; width: 100%"
  >
    <v-snackbar v-model="snackbar" :timeout="timeout">{{ text }} </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { EditMode } from "common/unions";
import useWatchHelper from "../helpers/watchHelper";
import { useCellStore } from "../store/pinia/cellStore";

import { LineAttributes } from "common/baseTypes";

const watchHelper = useWatchHelper();
const cellStore = useCellStore();
const snackbar = ref(false);
const text = ref("");
const timeout = ref(10000);

const editModeStatusText = {
  TEXT_STARTED: "Draw a rectangle on screen to create a text box",
  SQRT_STARTED: "Draw a line on screen to create a square root",
  CURVE_STARTED: "Draw a curve on screen",
  EXPONENT_STARTED: "Click on a cell to create an exponent",
  EXPONENT_WRITING: "Type exponent and then click outside or press enter",
  CIRCLE_STARTED: "Draw a circle on screen",
  ANNOTATION_STARTED: "Click on a cell to add annotation",
  ANNOTATION_WRITING:
    "Type annotation text and then click outside or press enter",
  POLYGON_STARTED: "Draw a polygon on screen, line by line",
  LINE_STARTED: "Draw a line on screen",
  CHECKMARK_STARTED: "Click on a cell to create a checkmark",
  SEMICHECKMARK_STARTED: "Click on a cell to create a semi checkmark",
  XMARK_STARTED: "Click on a cell to create an xmark",
  COLORIZING:
    "Click on a cell to colorize it or drag slowly to colorize multiple cells",

};

watchHelper.watchEveryEditModeChange(setStatusBarText);

watchHelper.watchCustomEvent(
  [
    "LINE_DRAWING",
    "LINE_EDITING_LEFT",
    "LINE_EDITING_RIGHT",
    "POLYGON_DRAWING",
  ],
  "EV_LINE_CHANGED",
  setStatusBarLineIndication,
);

function setStatusBarLineIndication(lineStatus: string) {
  text.value = lineStatus;

  snackbar.value = true;
}

function setStatusBarText(editMode: EditMode) {
  if (!(editMode in editModeStatusText)) {
    snackbar.value = false;
    return;
  }

  text.value = editModeStatusText[editMode as keyof typeof editModeStatusText];

  snackbar.value = true;
}
</script>
