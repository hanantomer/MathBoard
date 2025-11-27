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
        <div class="symbol-group" v-if="group.title == 'Vectors'">
          <v-list>
            <v-list-item
              v-for="symbol in group.symbols"
              class="pa-0"
              :key="symbol.name"
            >
              <v-row>
                <v-col cols="5">
                  <v-combobox
                    v-if="symbol.name == 'vector'"
                    v-model="vectorSelectedLetter"
                    :items="letters"
                    class="vector-combo"
                  >
                  </v-combobox>
                  <v-combobox
                    v-if="symbol.name == 'magnitude'"
                    v-model="vectorSelectedLetter"
                    :items="letters"
                    class="vector-combo"
                  >
                  </v-combobox>
                  <v-combobox
                    v-if="symbol.name == 'dot'"
                    v-model="dotProductFirstSelectedLetter"
                    :items="letters"
                    class="vector-combo"
                  >
                  </v-combobox>
                  <v-combobox
                    v-if="symbol.name == 'cross'"
                    v-model="crossProductFirstSelectedLetter"
                    :items="letters"
                    class="vector-combo"
                  >
                  </v-combobox>
                </v-col>
                <v-col cols="1" style="padding: 0; margin-right: 10px">
                  <v-tooltip>
                    {{ symbol.tooltip }}
                    {{ symbol.shortcut ? `(${symbol.shortcut})` : "" }}
                    <template v-slot:activator="{ props }">
                      <v-btn
                        v-bind="props"
                        class="special-symbol"
                        style="
                          max-height: 35px;
                          max-width: 35px;
                          position: relative;
                          top: 25px;
                          margin-right: 16px;
                        "
                        icon
                        :disabled="!editEnabled"
                        :tabindex="symbol.tabIndex"
                        :aria-label="symbol.tooltip"
                        :aria-keyshortcuts="symbol.shortcut"
                        role="button"
                        :id="`special-symbol-${symbol.name}`"
                        @click="
                          () => addVectorSymbol(symbol.name, symbol.value)
                        "
                      >
                        <p
                          v-if="symbol.name == 'vector'"
                          v-html="wrapVectorSymbol(symbol.value)"
                        ></p>
                        <p v-else v-html="symbol.value"></p>
                      </v-btn>
                    </template>
                  </v-tooltip>
                </v-col>
                <v-col cols="5">
                  <v-combobox
                    v-if="symbol.name == 'dot'"
                    v-model="dotProductSecondSelectedLetter"
                    :items="letters"
                    class="vector-combo"
                  ></v-combobox>
                  <v-combobox
                    v-if="symbol.name == 'cross'"
                    v-model="crossProductSecondSelectedLetter"
                    :items="letters"
                    class="vector-combo"
                  ></v-combobox>
                </v-col>
              </v-row>
            </v-list-item>
          </v-list>
        </div>

        <div class="symbol-group" v-else>
          <v-tooltip v-for="symbol in group.symbols" :key="symbol.name">
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
                <p v-html="symbol.value"></p>
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
import {
  decodeSpecialSymbol,
  vectorSymbolPrefix,
  wrapVectorSymbol,
} from "common/globals";

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

const symbolGroups = [
  {
    title: "Greek letters",
    symbols: [
      { name: "alpha", value: "&alpha;", tooltip: "Alpha", tabIndex: 1 },
      { name: "beta", value: "&beta;", tooltip: "Beta", tabIndex: 2 },
      { name: "gamma", value: "&gamma;", tooltip: "Gamma", tabIndex: 3 },
      { name: "delta", value: "&delta;", tooltip: "Delta", tabIndex: 4 },
      { name: "theta", value: "&theta;", tooltip: "Theta", tabIndex: 5 },
      { name: "epsilon", value: "&epsilon;", tooltip: "Epsilon", tabIndex: 6 },
      { name: "zeta", value: "&zeta;", tooltip: "Zeta", tabIndex: 7 },
      { name: "omega", value: "&omega;", tooltip: "Omega", tabIndex: 8 },
      { name: "sigma", value: "&sigma;", tooltip: "Sigma", tabIndex: 9 },
      { name: "phi", value: "&phi;", tooltip: "Phi", tabIndex: 10 },
      { name: "pi", value: "&pi;", tooltip: "Pi", tabIndex: 11 },
    ],
  },
  {
    title: "Geometric symbols",
    symbols: [
      {
        name: "rightAngle",
        value: "&#8735;",
        tooltip: "Right angle (90°)",
        tabIndex: 12,
      },
      { name: "angle", value: "&ang;", tooltip: "Angle", tabIndex: 13 },
      { name: "triangle", value: "&#9651;", tooltip: "Triangle", tabIndex: 14 },
      { name: "perimeter", value: "P", tooltip: "Perimeter", tabIndex: 15 },
      { name: "area", value: "A", tooltip: "Area", tabIndex: 16 },
      {
        name: "perpendicular",
        value: "&perp;",
        tooltip: "Perpendicular",
        tabIndex: 17,
      },
      {
        name: "parallel",
        value: "&parallel;",
        tooltip: "Parallel",
        tabIndex: 18,
      },
    ],
  },
  {
    title: "Comparison operators",
    symbols: [
      { name: "ne", value: "&ne;", tooltip: "Not equal", tabIndex: 19 },
      {
        name: "ge",
        value: "&ge;",
        tooltip: "Greater than or equal",
        tabIndex: 20,
      },
      {
        name: "le",
        value: "&le;",
        tooltip: "Less than or equal",
        shortcut: "Alt+Shift+2",
        tabIndex: 21,
      },
      {
        name: "plusmn",
        value: "&plusmn;",
        tooltip: "Plus or minus",
        shortcut: "Alt+8",
        tabIndex: 22,
      },
    ],
  },
  {
    title: "Set operations",
    symbols: [
      {
        name: "emptySet",
        value: "&empty;",
        tooltip: "Empty set",
        tabIndex: 23,
      },
      { name: "union", value: "&cup;", tooltip: "Union", tabIndex: 24 },
      {
        name: "intersection",
        value: "&cap;",
        tooltip: "Intersection",
        tabIndex: 25,
      },
      { name: "sum", value: "&sum;", tooltip: "Sum", tabIndex: 26 },
    ],
  },
  {
    title: "Trigonometric functions",
    symbols: [
      { name: "sin", value: "sin", tooltip: "Sine", tabIndex: 27 },
      { name: "cos", value: "cos", tooltip: "Cosine", tabIndex: 28 },
      { name: "tan", value: "tan", tooltip: "Tangent", tabIndex: 29 },
      { name: "cot", value: "cot", tooltip: "Cotangent", tabIndex: 30 },
    ],
  },
  {
    title: "Derivatives & Integrals",
    symbols: [
      { name: "f(x)", value: "f(x)", tooltip: "Function f(x)", tabIndex: 31 },
      {
        name: "f'(x)",
        value: "f'(x)",
        tooltip: "First derivative",
        tabIndex: 32,
      },
      {
        name: "f''(x)",
        value: "f''(x)",
        tooltip: "Second derivative",
        tabIndex: 33,
      },
      { name: "u'", value: "u'", tooltip: "u'", tabIndex: 34 },
      { name: "v'", value: "v'", tooltip: "v'", tabIndex: 35 },
      { name: "infin", value: "&infin;", tooltip: "Infinity", tabIndex: 36 },
      { name: "int", value: "&int;", tooltip: "Integral", tabIndex: 37 },
    ],
  },
  {
    title: "Vectors",
    symbols: [
      { name: "vector", value: "v", tooltip: "Vector", tabIndex: 38 },
      { name: "magnitude", value: "||a||", tooltip: "Magnitude", tabIndex: 39 },
      {
        name: "dot",
        value: "a &middot; b",
        tooltip: "Dot product",
        tabIndex: 40,
      },
      {
        name: "cross",
        value: "a &times; b",
        tooltip: "Cross product",
        tabIndex: 41,
      },
    ],
  },
];

const letters = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
];

// model for the vector letter selector

const emit = defineEmits(["symbol-selected"]);
let selectedSymbol = ref("");

const vectorSelectedLetter = ref("v");
const magniutedSelectedLetter = ref("v");
const dotProductFirstSelectedLetter = ref("a");
const dotProductSecondSelectedLetter = ref("b");
const crossProductFirstSelectedLetter = ref("a");
const crossProductSecondSelectedLetter = ref("b");

watchHelper.watchKeyEvent(["CELL_SELECTED"], "EV_KEYUP", (e: KeyboardEvent) =>
  toolbarNavigation.handleKeyboardNavigation(e, "special-symbols-expansion"),
);

watchHelper.watchKeyEvent(["CELL_SELECTED"], "EV_KEYUP", (e: KeyboardEvent) =>
  toolbarNavigation.handleShortcuts(
    e,
    symbolGroups.flatMap((g) =>
      g.symbols.map((s) => ({
        ...s,
        action: () => addSpecialSymbol(s.value),
      })),
    ),
  ),
);

async function addVectorSymbol(symbolName: string, symbolValue: string) {
  selectedSymbol.value = symbolValue;

  //if (selectedFirstLetter.value === "") return;

  setTimeout(async () => {
    switch (symbolName) {
      case "vector":
        await addVector(vectorSelectedLetter.value);
        break;
      case "magnitude":
        await addVectorMagnitute(magniutedSelectedLetter.value);
        break;
      case "dot":
        await addVectorDotProduct(
          dotProductFirstSelectedLetter.value,
          dotProductSecondSelectedLetter.value,
        );
        break;
      case "cross":
        await addVectorCrossProduct(
          crossProductFirstSelectedLetter.value,
          crossProductSecondSelectedLetter.value,
        );
        break;
    }
  }, 0);
}

async function addVector(letter: string) {
  notationMutateHelper.addSymbolNotation(vectorSymbolPrefix + letter);
}

async function addVectorMagnitute(letter: string) {
  notationMutateHelper.addSymbolNotation("||");
  notationMutateHelper.addSymbolNotation(letter);
  notationMutateHelper.addSymbolNotation("||");
}

async function addVectorDotProduct(firstLetter: string, secondLetter: string) {
  notationMutateHelper.addSymbolNotation(firstLetter);
  notationMutateHelper.addSymbolNotation("·");
  notationMutateHelper.addSymbolNotation(secondLetter);
}

async function addVectorCrossProduct(
  firstLetter: string,
  secondLetter: string,
) {
  notationMutateHelper.addSymbolNotation(firstLetter);
  notationMutateHelper.addSymbolNotation("×");
  notationMutateHelper.addSymbolNotation(secondLetter);
}

async function addSpecialSymbol(symbolValue: string) {
  selectedSymbol.value = symbolValue;

  // Defer so UI focus/keyboard handlers settle (preserves original behavior)
  setTimeout(async () => {
    if (isTextOrAnnotationMode()) {
      emitSpecialSymbolToEditors();
      return;
    }

    if (isNinetyDegreesSymbol(symbolValue)) {
      await addNinetyDegreesAnnotation(symbolValue);
      return;
    }

    if (isMultiCharLiteral(symbolValue)) {
      addEachCharAsSymbol(symbolValue);
      return;
    }

    // Default: add the symbol as-is (covers entities like &pi; and <math>…)
    notationMutateHelper.addSymbolNotation(symbolValue);
  }, 0);
}

function isTextOrAnnotationMode(): boolean {
  return (
    editModeStore.isTextWritingMode() || editModeStore.isAnnotationWritingMode()
  );
}

function emitSpecialSymbolToEditors() {
  eventBus.emit("EV_SPECIAL_SYMBOL_SELECTED", selectedSymbol.value);
  // clear quickly to allow repeated selections via same event
  setTimeout(() => eventBus.emit("EV_SPECIAL_SYMBOL_SELECTED", ""), 0);
}

function isNinetyDegreesSymbol(item: string) {
  return item === "&#8735";
}

async function addNinetyDegreesAnnotation(item: string) {
  const coords = screenHelper.getSelectedCellDotCoordinates();
  if (!coords) return;

  const ninetyDegreesNotationUUId =
    await notationMutateHelper.addAnnotationNotation(
      decodeSpecialSymbol(item),
      coords,
    );

  selectionHelper.selectNotation(ninetyDegreesNotationUUId);
}

function isMultiCharLiteral(item: string) {
  return !item.startsWith("<math>") && !item.startsWith("&") && item.length > 1;
}

function addEachCharAsSymbol(item: string) {
  const chars = item.match(/[^(]|\([^)]*\)/g);
  if (!chars) return;
  let accumulatedSingleQuotes = "";
  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];
    if (char == "'" && i < chars.length - 1) {
      accumulatedSingleQuotes += char;
      continue;
    }
    if (char != "'" && accumulatedSingleQuotes) {
      notationMutateHelper.addSymbolNotation(accumulatedSingleQuotes);
      accumulatedSingleQuotes = "";
    }
    notationMutateHelper.addSymbolNotation(char);
  }

  //chars!.forEach((char) => notationMutateHelper.addSymbolNotation(char));
}
</script>

<style scoped>
.special-symbols-expansion {
  margin-top: 10px;
  margin-left: 10px;
  max-width: 150px;
  background-color: #f5f5f5;
  max-height: 100px;
}

.symbol-group {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  padding: 0;
}
.special-symbol {
  font-size: smaller !important;
  max-height: 25px !important;
}

.vector-symbol {
  font-style: large;
  padding: auto;
  margin-top: 10px;
}
.vector-symbol-arrow {
  margin-left: -0.55em !important; /* Adjust this value to shift the arrow horizontally */
  margin-top: -9px !important;
  position: absolute !important;
}

div.v-combobox__selection {
  margin-inline-end: 9px !important;
}
</style>
