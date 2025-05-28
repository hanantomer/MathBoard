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

const watchHelper = useWatchHelper();
const snackbar = ref(false);
const text = ref("");
const timeout = ref(10000);

const editModeStatusText = {
  TEXT_STARTED: "Draw a rectangle on screen to create a text box",
  SQRT_STARTED: "Draw a line on screen to create a square root",
  CURVE_STARTED: "Draw a curve on screen",
  EXPONENT_STARTED: "Click on a cell to create an exponent",
  CIRCLE_STARTED: "Draw a circle on screen",
  ANNOTATION_STARTED: "Click on a cell to add annotation",
  ANNOTATION_WRITING: "Type annotation text and then click outside or press enter",
  HORIZONTAL_LINE_STARTED: "Draw a horizontal line on screen",
  VERTICAL_LINE_STARTED: "Draw a vertical line on screen",
  POLYGON_STARTED: "Draw a polygon on screen, line by line",
  SLOPE_LINE_STARTED: "Draw a sloped line on screen",
  CHECKMARK_STARTED: "Click on a cell to create a checkmark",
  SEMICHECKMARK_STARTED: "Click on a cell to create a semi checkmark",
  XMARK_STARTED: "Click on a cell to create an xmark",
};

watchHelper.watchEveryEditModeChange(setStatusBarText);

function setStatusBarText(editMode: EditMode) {
  if (!(editMode in editModeStatusText)) {
    snackbar.value = false;
    return;
  }

  text.value = editModeStatusText[editMode as keyof typeof editModeStatusText];

  snackbar.value = true;
}
</script>
