import { ref } from 'vue';
<template>
  <v-expansion-panels multiple class="special-symbols-expansion">
    <v-expansion-panel
      v-for="(group, groupIdx) in symbolGroups"
      :key="groupIdx"
      :value="groupIdx"
    >
      <v-expansion-panel-title>
        {{ group.title }}
      </v-expansion-panel-title>
      <v-expansion-panel-text>
        <div class="symbol-group">
          <v-tooltip
            v-for="symbol in group.symbols"
            :key="symbol.name"
          >
            {{ symbol.tooltip }}
            {{ symbol.shortcut ? `(${symbol.shortcut})` : "" }}
            <template v-slot:activator="{ props }">
              <v-btn
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
        </div>
        <v-divider></v-divider>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useToolbarNavigation } from "../helpers/ToolbarNavigationHelper";
import { useEditModeStore } from "../store/pinia/editModeStore";
import useScreenHelper from "../helpers/screenHelper";
import useWatchHelper from "../helpers/watchHelper";
import useNotationMutateHelper from "../helpers/notationMutateHelper";
import useEventBusHelper from "../helpers/eventBusHelper";
import useAuthorizationHelper from "../helpers/authorizationHelper";
import { decodeSpecialSymbol } from "common/globals";
import useSelectionHelper from "../helpers/selectionHelper";

const editModeStore = useEditModeStore();
const eventBus = useEventBusHelper();
const notationMutateHelper = useNotationMutateHelper();
const toolbarNavigation = useToolbarNavigation();
const watchHelper = useWatchHelper();
const authorizationHelper = useAuthorizationHelper();
const screenHelper = useScreenHelper();
const selectionHelper = useSelectionHelper();

const editEnabled = computed(() => {
  return authorizationHelper.canEdit();
});

// Group symbols by their comment header
const symbolGroups = [
  {
    title: "Greek letters",
    symbols: [
      { name: "alpha", value: "&alpha;", tooltip: "Alpha", tabIndex: 1 },
      { name: "beta", value: "&beta;", tooltip: "Beta", tabIndex: 2 },
      { name: "gamma", value: "&gamma;", tooltip: "Gamma", tabIndex: 3 },
      { name: "delta", value: "&delta;", tooltip: "Delta", tabIndex: 4 },
      { name: "Theta", value: "&Theta;", tooltip: "Theta", tabIndex: 5 },
    ],
  },
  {
    title: "Geometric symbols",
    symbols: [
      { name: "pi", value: "&pi;", tooltip: "Pi", tabIndex: 6 },
      { name: "90", value: "&#8735", tooltip: "90 degrees", tabIndex: 7 },
      { name: "angle", value: "&ang;", tooltip: "Angle", tabIndex: 8 },
      { name: "triangle", value: "&#x25B2", tooltip: "Triangle", tabIndex: 9 },
      {
        name: "perimeter",
        value: "<math><mi>P</mi></math>",
        tooltip: "Perimeter",
        tabIndex: 10,
      },
      {
        name: "area",
        value: "<math><mi>A</mi></math>",
        tooltip: "Area",
        tabIndex: 11,
      },
      {
        name: "perpendicular",
        value: "&#10178",
        tooltip: "Perpendicular",
        tabIndex: 12,
      },
      { name: "parallel", value: "&#8741", tooltip: "Parallel", tabIndex: 13 },
    ],
  },
  {
    title: "Comparison operators",
    symbols: [
      { name: "ne", value: "&ne;", tooltip: "Not equal", tabIndex: 14 },
      {
        name: "ge",
        value: "&ge;",
        tooltip: "Greater than or equal",
        tabIndex: 15,
      },
      {
        name: "le",
        value: "&le;",
        tooltip: "Less than or equal",
        shortcut: "Alt+Shift+2",
        tabIndex: 16,
      },
      {
        name: "plusmn",
        value: "&plusmn;",
        tooltip: "Plus or Minus",
        shortcut: "Alt+8",
        tabIndex: 17,
      },
    ],
  },
  {
    title: "Mathematical operators",
    symbols: [
      { name: "sum", value: "&sum;", tooltip: "Sum", tabIndex: 18 },
      { name: "int", value: "&int;", tooltip: "Integral", tabIndex: 19 },
      { name: "infin", value: "&infin;", tooltip: "Infinity", tabIndex: 20 },
    ],
  },
  {
    title: "Set operations",
    symbols: [
      { name: "emptySet", value: "&#8709", tooltip: "Empty Set", tabIndex: 21 },
      { name: "union", value: "&#8746", tooltip: "Union", tabIndex: 22 },
      {
        name: "intersection",
        value: "&#8745",
        tooltip: "Intersection",
        tabIndex: 23,
      },
    ],
  },
  {
    title: "Trigonometric functions",
    symbols: [
      { name: "sin", value: "sin", tooltip: "Sine", tabIndex: 24 },
      { name: "cos", value: "cos", tooltip: "Cosine", tabIndex: 25 },
      { name: "tan", value: "tan", tooltip: "Tangent", tabIndex: 26 },
      { name: "cot", value: "cot", tooltip: "Cotangent", tabIndex: 27 },
    ],
  },
  {
    title: "Functions",
    symbols: [
      { name: "f(x)", value: "f(x)", tooltip: "f(x)", tabIndex: 28 },
      { name: "f`(x)", value: "f`(x)", tooltip: "f`(x)", tabIndex: 29 },
      { name: "f``(x)", value: "f``(x)", tooltip: "f``(x)", tabIndex: 30 },
    ],
  },
];

const emit = defineEmits(["symbol-selected"]);
let selectedSymbol = ref("");

watchHelper.watchKeyEvent(["CELL_SELECTED"], "EV_KEYUP", (e: KeyboardEvent) =>
  toolbarNavigation.handleKeyboardNavigation(e, "special-symbols-expansion"),
);

watchHelper.watchKeyEvent(["CELL_SELECTED"], "EV_KEYUP", (e: KeyboardEvent) =>
  toolbarNavigation.handleShortcuts(
    e,
    symbolGroups.flatMap((g) => g.symbols.map(s => ({
      ...s,
      action: () => addSpecialSymbol(s.value)
    }))),
  ),
);

async function addSpecialSymbol(item: string) {
  selectedSymbol.value = item;
  setTimeout(async () => {
    if (
      editModeStore.isTextWritingMode() ||
      editModeStore.isAnnotationWritingMode()
    ) {
      eventBus.emit("EV_SPECIAL_SYMBOL_SELECTED", selectedSymbol.value);
      setTimeout(() => {
        eventBus.emit("EV_SPECIAL_SYMBOL_SELECTED", "");
      }, 0);
    } else {
      if (item === "&#8735") {
        // 90 degrees symbol
        const selectedCellDotCoordinates =
          screenHelper.getSelectedCellDotCoordinates();
        if (!selectedCellDotCoordinates) return;

        const ninetyDegreesNotationUUId =
          await notationMutateHelper.addAnnotationNotation(
            decodeSpecialSymbol(item),
            selectedCellDotCoordinates!,
          );

        selectionHelper.selectNotation(ninetyDegreesNotationUUId);
        return;
      }
      if (
        !item.startsWith("<math>") &&
        !item.startsWith("&") &&
        item.length > 1
      ) {
        const chars = item.split("") || [];
        chars.forEach((char) => notationMutateHelper.addSymbolNotation(char));
      } else {
        notationMutateHelper.addSymbolNotation(item);
      }
    }
  }, 0);
}
</script>

<style scoped>
.special-symbols-expansion {
  width: 100%;
  max-width: 150px;
  max-height: 500px;
  margin: 0 auto;
}
.symbol-group {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 4px 0;
}
.special-symbol {
  font-size: smaller !important;
  margin: 0 !important;
  max-height: 25px !important;
}
</style>
