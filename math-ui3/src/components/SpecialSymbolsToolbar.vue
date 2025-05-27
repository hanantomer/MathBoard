<template>
  <v-toolbar color="primary" dark :class="toolbarClass">
    <v-tooltip v-for="(symbol, index) in specialSymbols" :key="symbol.name">
      {{ symbol.tooltip }} {{ symbol.shortcut ? `(${symbol.shortcut})` : "" }}
      <template v-slot:activator="{ props }">
        <v-btn
          class="special-symbol"
          style="max-height: 35px"
          v-bind="props"
          icon
          x-small
          fab
          dark
          :tabindex="symbol.tabIndex"
          :aria-label="symbol.tooltip"
          :aria-keyshortcuts="symbol.shortcut"
          role="button"
          :id="`special-symbol-${symbol.name}`"
          @click="() => addSpecialSymbol(symbol.value)"
        >
          <span v-html="symbol.value"></span>
        </v-btn>
      </template>
    </v-tooltip>
  </v-toolbar>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useToolbarNavigation } from "../helpers/ToolbarNavigationHelper";
import { useEditModeStore } from "../store/pinia/editModeStore";
import useWatchHelper from "../helpers/watchHelper";
import useNotationMutateHelper from "../helpers/notationMutateHelper";
import useEventBusHelper from "../helpers/eventBusHelper";

const editModeStore = useEditModeStore();
const eventBus = useEventBusHelper();
const notationMutateHelper = useNotationMutateHelper();
const toolbarNavigation = useToolbarNavigation();
const watchHelper = useWatchHelper();

const toolbarClass = computed(() => {
  return "vertical-toolbar specialSymbolsToolbar";
});

const specialSymbols = ref([
  {
    name: "alpha",
    value: "&alpha;",
    tooltip: "Alpha",
    tabIndex: 1,
  },
  {
    name: "beta",
    value: "&beta;",
    tooltip: "Beta",
    tabIndex: 2,
  },
  {
    name: "gamma",
    value: "&gamma;",
    tooltip: "Gama",
    tabIndex: 3,
  },
  {
    name: "delta",
    value: "&delta;",
    tooltip: "Delta",
    tabIndex: 4,
  },
  {
    name: "Theta",
    value: "&Theta;",
    tooltip: "Theta",
    tabIndex: 5,
  },
  {
    name: "pi",
    value: "&pi;",
    tooltip: "Pi",
    tabIndex: 6,
  },
  {
    name: "sum",
    value: "&sum;",
    tooltip: "Sum",
    tabIndex: 7,
  },
  {
    name: "plusmn",
    value: "&plusmn;",
    tooltip: "Plus or Minus",
    shortcut: "Alt+8",
    tabIndex: 8,
  },
  {
    name: "int",
    value: "&int;",
    tooltip: "Integral",
    tabIndex: 9,
  },
  {
    name: "ne",
    value: "&ne;",
    tooltip: "Not equal",
    tabIndex: 10,
  },
  {
    name: "ge",
    value: "&ge;",
    tooltip: "Greater than or equal",
    tabIndex: 11,
  },
  {
    name: "le",
    value: "&le;",
    tooltip: "Lessr than or equal",
    shortcut: "Alt+Shift+2",
    tabIndex: 12,
  },
  {
    name: "infin",
    value: "&infin;",
    tooltip: "Infinity",
    tabIndex: 13,
  },
  {
    name: "sin",
    value: "<sup><i>sin</i></sup>",
    tooltip: "Sine",
    tabIndex: 14,
  },
  {
    name: "cos",
    value: "<sup><i>cos</i></sup>",
    tooltip: "Cosine",
    tabIndex: 15,
  },
  {
    name: "tan",
    value: "<sup><i>tan</i></sup>",
    tooltip: "Tangens",
    tabIndex: 16,
  },
  {
    name: "cot",
    value: "<sup><i>cot</i></sup>",
    tooltip: "Cotangens",
    tabIndex: 17,
  },
]).value.map((symbol) => ({
  ...symbol,
  action: () => addSpecialSymbol(symbol.value),
}));

const emit = defineEmits(["symbol-selected"]);

let selectedSymbol = ref("");

watchHelper.watchKeyEvent(
  ["CELL_SELECTED", "SYMBOL"],
  "EV_KEYUP",
  (e: KeyboardEvent) =>
    toolbarNavigation.handleKeyboardNavigation(e, toolbarClass.value),
);

watchHelper.watchKeyEvent(
  ["CELL_SELECTED", "SYMBOL"],
  "EV_KEYUP",
  (e: KeyboardEvent) => toolbarNavigation.handleShortcuts(e, specialSymbols),
);

function addSpecialSymbol(item: string) {
  selectedSymbol.value = item;
  setTimeout(() => {
    if (
      editModeStore.isTextWritingMode() ||
      editModeStore.isAnnotationWritingMode()
    ) {
      eventBus.emit("EV_SPECIAL_SYMBOL_SELECTED", selectedSymbol.value);
    } else {
      notationMutateHelper.addSymbolNotation(selectedSymbol.value);
    }
  }, 0);
}
</script>

<style scoped>
.vertical-toolbar {
  flex-basis: content;
  flex-flow: column wrap !important;
  width: 70px !important;
  height: max-content !important;
  padding: 4px !important;
}

.vertical-toolbar .v-toolbar__content {
  flex-flow: column wrap !important;
}
</style>
