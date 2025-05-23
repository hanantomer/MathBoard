<template>
  <v-toolbar color="primary" dark class="vertical-toolbar" density="compact">
    <v-tooltip v-for="item in symbolButtons" :key="item.value">
      {{ item.tooltip }}
      <template v-slot:activator="{ props }">
        <v-btn
          style="margin-inline-start: -6px; width: 10px"
          :data-cy="item.value"
          v-bind="props"
          xx-small
          fab
          dark
          v-on:mousedown="selectSpecialSymbol(item.value, item.activeState)"
          :disabled="!editEnabled"
          v-html="item.value"
        >
        </v-btn>
      </template>
    </v-tooltip>
  </v-toolbar>
</template>

<script setup lang="ts">
import { ref } from "vue";

import { useCellStore } from "../store/pinia/cellStore";
import { useEditModeStore } from "../store/pinia/editModeStore";
import { computed } from "vue";

import useEventBus from "../helpers/eventBusHelper";
import useAuthorizationHelper from "../helpers/authorizationHelper";
import useScreenHelper from "../helpers/screenHelper";
import useWatchHelper from "../helpers/watchHelper";
import useNotationMutateHelper from "../helpers/notationMutateHelper";
import { event } from "cypress/types/jquery";

const authorizationHelper = useAuthorizationHelper();
const editModeStore = useEditModeStore();
const cellStore = useCellStore();
const watchHelper = useWatchHelper();
const notationMutateHelper = useNotationMutateHelper();
const eventBus = useEventBus();

const symbolButtons: Array<{
  value: string;
  activeState: any;
  tooltip: string;
}> = Array(
  {
    value: "&#8737",
    activeState: ref(1),
    tooltip: "Angle",
  },
  {
    value: "&alpha;",
    activeState: ref(1),
    tooltip: "Alfa",
  },
  {
    value: "&beta;",
    activeState: ref(1),
    tooltip: "Beta",
  },
  {
    value: "&gamma;",
    activeState: ref(1),
    tooltip: "Gama",
  },
  {
    value: "&delta;",
    activeState: ref(1),
    tooltip: "Delta",
  },
  {
    value: "&Theta;",
    activeState: ref(1),
    tooltip: "Theta",
  },

  {
    value: "&pi;",
    activeState: ref(1),
    tooltip: "Pi",
  },
  {
    value: "&sum;",
    activeState: ref(1),
    tooltip: "Sum",
  },
  {
    value: "&plusmn;",
    activeState: ref(1),
    tooltip: "Plus or Minus",
  },
  {
    value: "&int;",
    activeState: ref(1),
    tooltip: "Integral",
  },
  {
    value: "&ne;",
    activeState: ref(1),
    tooltip: "Not equal",
  },
  {
    value: "&ge;",
    activeState: ref(1),
    tooltip: "Greater than or equal",
  },
  {
    value: "&le;",
    activeState: ref(1),
    tooltip: "Lessr than or equal",
  },
  {
    value: "&infin;",
    activeState: ref(1),
    tooltip: "Infinity",
  },
  {
    value: "<sup><i>sin</i></sup>",
    activeState: ref(1),
    tooltip: "Sine",
  },
  {
    value: "<sup><i>cos</i></sup>",
    activeState: ref(1),
    tooltip: "Cosine",
  },
  {
    value: "<sup><i>tan</i></sup>",
    activeState: ref(1),
    tooltip: "Tangens",
  },
  {
    value: "<sup><i>cot</i></sup>",
    activeState: ref(1),
    tooltip: "Cotangens",
  },
);

let selectedSymbol = ref("");

const editEnabled = computed(() => {
  return authorizationHelper.canEdit();
});

// watchHelper.watchEndOfEditMode(
//   ["SPECIAL_SYMBOL_SELECTED"],
//   [],
//   resetButtonsState,
// );

// watchHelper.watchMouseEvent(
//   ["SPECIAL_SYMBOL_SELECTED"],
//   "EV_SVG_MOUSEUP",
//   addSpecialSymbol,
// );

function selectSpecialSymbol(item: string, activeState: any) {
  selectedSymbol.value = item;

  if (cellStore.getSelectedCell()) {
    addSpecialSymbol();
  }
}

function addSpecialSymbol() {
  setTimeout(() => {
    if (
      editModeStore.isTextWritingMode() ||
      editModeStore.isAnnotationWritingMode()
    ) {
      //      editModeStore.setEditMode("SPECIAL_SYMBOL_SELECTED");
      eventBus.emit("EV_SPECIAL_SYMBOL_SELECTED", selectedSymbol.value);
    } else {
      notationMutateHelper.addSymbolNotation(selectedSymbol.value);
    }
    resetButtonsState();
  }, 0);
}

function resetButtonsState() {
  symbolButtons.forEach((b) => {
    b.activeState.value = 1;
  });
}
</script>

<style>
.right-toolbar {
  width: 35px !important;
  height: max-content !important;
  padding: 4px !important;
}

.right-toolbar .v-toolbar__content {
  width: 35px !important;
  height: max-content !important;
  padding: 2px !important;
}
</style>
