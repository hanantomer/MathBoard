<template>
  <div
    class="text-center"
    style="position: absolute !important; bottom: 300; width: 100%"
  >
    <v-snackbar v-model="snackbar" :timeout="timeout">{{ text }} </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { GlobalEditMode, EditMode } from "common/unions";
import useWatchHelper from "../helpers/watchHelper";

const watchHelper = useWatchHelper();
const snackbar = ref(false);
const text = ref("");
const timeout = ref(30000);

const editModeStatusText = {
  FREE_SKETCH_STARTED:
    "Draw freely on the screen with your mouse or stylus click ESC to exit free sketch mode",
  TEXT_STARTED:
    "Draw a rectangle on screen to create a text box, click once to edit and twice to resize",
  SQRT_STARTED: "Draw a line on screen to create a square root",
  CURVE_STARTED:
    "Draw a curve on screen, then use the control point to adjust the curve",
  EXPONENT_STARTED: "Click on a cell to create an exponent",
  EXPONENT_WRITING: "Type exponent and then click outside or press enter",
  CIRCLE_STARTED: "Draw a circle on screen",
  ANNOTATION_STARTED: "Click on a everywhere to add annotation text, press ESC to exit annotation mode",
  ANNOTATION_WRITING:
    "Type annotation text and then click outside or press enter",
  POLYGON_STARTED:
    "To draw a polygon, click and hold to start a line at a point, drag to draw, and release to set the first vertex. Repeat for each segment: click and hold from the last vertex, drag, and release to set the next vertex. Connect the final vertex to the starting point to complete the polygon",
  LINE_STARTED: "Draw a line on screen press ESC to exit line drawing mode",
  CHECKMARK_STARTED: "Click on a cell to create a checkmark",
  SEMICHECKMARK_STARTED: "Click on a cell to create a semi checkmark",
  XMARK_STARTED: "Click on a cell to create an xmark",
  COLORIZING:
    "Click on a notation to colorize it or drag slowly to colorize multiple notations",
};

watchHelper.watchEveryEditModeChange(setStatusBarText);
watchHelper.watchGlobalEditModeChange(setStatusBarText);

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

function setStatusBarText(editMode: EditMode | GlobalEditMode) {
  if (!(editMode in editModeStatusText)) {
    snackbar.value = false;
    return;
  }

  text.value = editModeStatusText[editMode as keyof typeof editModeStatusText];

  snackbar.value = true;
}
</script>
