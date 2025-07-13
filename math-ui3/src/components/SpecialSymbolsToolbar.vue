import { ref } from 'vue';
<template>
  <v-toolbar color="primary" dark :class="toolbarClass">
    <v-tooltip v-for="(symbol, index) in specialSymbols" :key="symbol.name">
      {{ symbol.tooltip }} {{ symbol.shortcut ? `(${symbol.shortcut})` : "" }}

      <template v-slot:activator="{ props }">
        <v-divider v-if="symbol.isSeparator"></v-divider>
        <hr
          v-if="symbol.isSeparator"
          style="
            width: 30px;
            line-height: 1px !important;
            color: black;
            border: 1px solid grey;
          "
        />

        <v-btn
          v-if="!symbol.isSeparator"
          class="special-symbol"
          style="max-height: 30px"
          v-bind="props"
          icon
          :disabled="!editEnabled"
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
import useAuthorizationHelper from "../helpers/authorizationHelper";

const editModeStore = useEditModeStore();
const eventBus = useEventBusHelper();
const notationMutateHelper = useNotationMutateHelper();
const toolbarNavigation = useToolbarNavigation();
const watchHelper = useWatchHelper();
const authorizationHelper = useAuthorizationHelper();

const editEnabled = computed(() => {
  return authorizationHelper.canEdit();
});

const toolbarClass = computed(() => {
  return "vertical-toolbar specialSymbolsToolbar";
});

/**
 * Reactive array of special mathematical symbols for UI rendering.
 * Each symbol includes:
 * - name: unique identifier
 * - value: HTML entity or markup
 * - tooltip: description for UI
 * - tabIndex: keyboard navigation order
 * - shortcut: (optional) keyboard shortcut
 */
const specialSymbols = ref([
  // Greek letters group
  { name: "alpha", value: "&alpha;", tooltip: "Alpha", tabIndex: 1 },
  { name: "beta", value: "&beta;", tooltip: "Beta", tabIndex: 2 },
  { name: "gamma", value: "&gamma;", tooltip: "Gamma", tabIndex: 3 },
  { name: "delta", value: "&delta;", tooltip: "Delta", tabIndex: 4 },
  { name: "Theta", value: "&Theta;", tooltip: "Theta", tabIndex: 5 },
  { name: "pi", value: "&pi;", tooltip: "Pi", tabIndex: 6 },
  {
    name: "separator",
    value: "",
    tooltip: "",
    tabIndex: -1,
    isSeparator: true,
  },

  // Comparison operators
  { name: "ne", value: "&ne;", tooltip: "Not equal", tabIndex: 7 },
  { name: "ge", value: "&ge;", tooltip: "Greater than or equal", tabIndex: 8 },
  {
    name: "le",
    value: "&le;",
    tooltip: "Less than or equal",
    shortcut: "Alt+Shift+2",
    tabIndex: 9,
  },
  {
    name: "plusmn",
    value: "&plusmn;",
    tooltip: "Plus or Minus",
    shortcut: "Alt+8",
    tabIndex: 10,
  },
  {
    name: "separator",
    value: "",
    tooltip: "",
    tabIndex: -1,
    isSeparator: true,
  },

  // Mathematical operators
  { name: "sum", value: "&sum;", tooltip: "Sum", tabIndex: 11 },
  { name: "int", value: "&int;", tooltip: "Integral", tabIndex: 12 },
  { name: "infin", value: "&infin;", tooltip: "Infinity", tabIndex: 13 },
  {
    name: "separator",
    value: "",
    tooltip: "",
    tabIndex: -1,
    isSeparator: true,
  },

  // Set operations
  { name: "emptySet", value: "&#8709", tooltip: "Empty Set", tabIndex: 14 },
  { name: "union", value: "&#8746", tooltip: "Union", tabIndex: 15 },
  {
    name: "intersection",
    value: "&#8745",
    tooltip: "Intersection",
    tabIndex: 16,
  },
  {
    name: "separator",
    value: "",
    tooltip: "",
    tabIndex: -1,
    isSeparator: true,
  },

  // Trigonometric functions
  // { name: "sin", value: "sin", tooltip: "Sine", tabIndex: 17 },
  // { name: "cos", value: "cos", tooltip: "Cosine", tabIndex: 18 },
  // { name: "tan", value: "tan", tooltip: "Tangent", tabIndex: 19 },
  // { name: "cot", value: "cot", tooltip: "Cotangent", tabIndex: 20 },
  // {
  //   name: "separator",
  //   value: "",
  //   tooltip: "",
  //   tabIndex: -1,
  //   isSeparator: true,
  // },

  // Geometric symbols
  { name: "angle", value: "&ang;", tooltip: "Angle", tabIndex: 21 },
  { name: "triangle", value: "&#x25B2", tooltip: "Triangle", tabIndex: 22 },
  {
    name: "perpendicular",
    value: "&#10178",
    tooltip: "Perpendicular",
    tabIndex: 23,
  },
  { name: "parallel", value: "&#8741", tooltip: "Parallel", tabIndex: 24 },
]).value.map((symbol) => ({
  ...symbol,
  action: () => (symbol.isSeparator ? null : addSpecialSymbol(symbol.value)),
}));

const emit = defineEmits(["symbol-selected"]);

let selectedSymbol = ref("");

watchHelper.watchKeyEvent(["CELL_SELECTED"], "EV_KEYUP", (e: KeyboardEvent) =>
  toolbarNavigation.handleKeyboardNavigation(e, toolbarClass.value),
);

watchHelper.watchKeyEvent(["CELL_SELECTED"], "EV_KEYUP", (e: KeyboardEvent) =>
  toolbarNavigation.handleShortcuts(e, specialSymbols),
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
