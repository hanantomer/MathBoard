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
          :color="item.activeState.value === 1 ? 'white' : 'green'"
          v-on:click="selectSpecialSymbol(item.value, item.activeState)"
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

import useAuthorizationHelper from "../helpers/authorizationHelper";
import useScreenHelper from "../helpers/screenHelper";
import useWatchHelper from "../helpers/watchHelper";
import useNotationMutateHelper from "../helpers/notationMutateHelper";

const authorizationHelper = useAuthorizationHelper();
const editModeStore = useEditModeStore();
const cellStore = useCellStore();
const watchHelper = useWatchHelper();
const screenHelper = useScreenHelper();
const notationMutateHelper = useNotationMutateHelper();

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
);

let selectedSymbol = ref("");

const editEnabled = computed(() => {
  return authorizationHelper.canEdit();
});

watchHelper.watchEndOfEditMode(["SPECIAL_SYMBOL"], [],  resetButtonsState);

watchHelper.watchMouseEvent(
  ["SPECIAL_SYMBOL"],
  "EV_SVG_MOUSEUP",
  addSpecialSymbolToCell,
);

function selectSpecialSymbol(item: string, activeState: any) {
  editModeStore.setEditMode("SPECIAL_SYMBOL");
  selectedSymbol.value = item;

  if (cellStore.getSelectedCell()) {
    addSpecialSymbolToCell();
  }
}

function addSpecialSymbolToCell() {
  setTimeout(() => {
    // let selection helper to finish its work
    notationMutateHelper.addSymbolNotation(selectedSymbol.value);
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
