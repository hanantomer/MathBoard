<template>
  <input
    v-show="show"
    ref="inputRef"
    v-model="draft"
    type="text"
    class="cell-symbol-input"
    data-cy="cell-symbol-input"
    aria-label="Type symbol in selected cell"
    autocomplete="off"
    autocorrect="off"
    autocapitalize="off"
    spellcheck="false"
    inputmode="text"
    enterkeyhint="done"
    :style="inputStyle"
    @keydown="onKeydown"
    @keyup.stop
    @paste.prevent
    @input="onInput"
  />
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { useMediaQuery } from "@vueuse/core";
import { useCellStore } from "../store/pinia/cellStore";
import { useEditModeStore } from "../store/pinia/editModeStore";
import { useNotationStore } from "../store/pinia/notationStore";
import useScreenHelper from "../helpers/screenHelper";
import useNotationMutateHelper from "../helpers/notationMutateHelper";
import useMatrixCellHelper from "../helpers/matrixCellHelper";
import useWatchHelper from "../helpers/watchHelper";
import useAuthorizationHelper from "../helpers/authorizationHelper";

import { MOBILE_BOARD_MEDIA_QUERY } from "../composables/useBoardLayout";
import { PointNotationAttributes } from "common/baseTypes";

const isMobileBoard = useMediaQuery(MOBILE_BOARD_MEDIA_QUERY);
const cellStore = useCellStore();
const editModeStore = useEditModeStore();
const notationStore = useNotationStore();
const screenHelper = useScreenHelper();
const notationMutateHelper = useNotationMutateHelper();
const matrixCellHelper = useMatrixCellHelper();
const watchHelper = useWatchHelper();
const authorizationHelper = useAuthorizationHelper();

const inputRef = ref<HTMLInputElement | null>(null);
const draft = ref("");

const show = computed(() => {
  if (!isMobileBoard.value) return false;
  if (!authorizationHelper.canEdit()) return false;
  if (editModeStore.getEditMode() !== "CELL_SELECTED") return false;
  if (notationStore.getSelectedNotations().length > 0) return false;
  return true;
});

const inputStyle = computed(() => {
  const cell = cellStore.getSelectedCell();
  const { x, y } = screenHelper.getCellTopLeftCoordinates(cell);
  const width = Math.max(cellStore.getCellHorizontalWidth() - 2, 12);
  const height = Math.max(cellStore.getCellVerticalHeight() - 2, 12);
  const fontSize = Math.max(
    Math.floor(cellStore.getCellVerticalHeightNet() * 0.55),
    14,
  );

  return {
    position: "fixed" as const,
    left: `${x}px`,
    top: `${y}px`,
    width: `${width}px`,
    height: `${height}px`,
    fontSize: `${fontSize}px`,
    lineHeight: `${height}px`,
    zIndex: 2030,
  };
});

function focusInput() {
  const el = inputRef.value;
  if (!el || !show.value) return;
  el.focus({ preventScroll: false });
}

function scrollSelectedCellIntoView() {
  const svgId = cellStore.getSvgId();
  if (!svgId) return;
  const { row, col } = cellStore.getSelectedCell();
  const rowGroup = document.querySelector(
    `svg#${CSS.escape(svgId)} g[row="${row}"]`,
  );
  const cellRect = rowGroup?.querySelector(`rect[col="${col}"]`);
  (cellRect ?? rowGroup)?.scrollIntoView({
    block: "nearest",
    inline: "nearest",
  });
}

function commitCharacter(char: string) {
  if (!char || char.length !== 1) return;
  notationMutateHelper.addSymbolNotation(char);
}

function onInput() {
  const value = draft.value;
  if (!value) return;

  draft.value = "";
  if (inputRef.value) {
    inputRef.value.value = "";
  }

  for (const char of value) {
    if (char.length !== 1) continue;
    commitCharacter(char);
  }

  nextTick(() => {
    scrollSelectedCellIntoView();
    focusInput();
  });
}

async function onKeydown(e: KeyboardEvent) {
  e.stopPropagation();
  if (e.key === "Enter") {
    e.preventDefault();
    inputRef.value?.blur();
    return;
  }

  if (e.key === " " || e.code === "Space") {
    e.preventDefault();
    draft.value = "";
    if (inputRef.value) inputRef.value.value = "";
    await notationMutateHelper.handleSpaceOnSelectedCell();
    nextTick(focusInput);
    return;
  }

  if (e.key === "Backspace") {
    e.preventDefault();
    draft.value = "";
    if (inputRef.value) inputRef.value.value = "";
    const cell = cellStore.getSelectedCell();
    const atCell = notationStore.getNotationsAtCell(cell);
    const pointNotations = atCell.filter(
      (n) =>
        n.notationType === "SYMBOL" ||
        n.notationType === "LOGBASE" ||
        n.notationType === "EXPONENT",
    );
    const nonDot = pointNotations.find(
      (n) => (n as PointNotationAttributes).value !== ".",
    );
    const toDelete = nonDot ?? pointNotations[0];
    if (toDelete) {
      notationStore.resetSelectedNotations();
      notationStore.selectNotation(toDelete.uuid);
      await notationMutateHelper.deleteSelectedNotations();
      if ((toDelete as PointNotationAttributes).value === ".") {
        await notationMutateHelper.collapseNotationsToSelectedCell();
        nextTick(focusInput);
        return;
      }
    }
    matrixCellHelper.setNextCell(-1, 0);
    nextTick(focusInput);
  }
}

watch(
  () => [
    cellStore.getSelectedCell().col,
    cellStore.getSelectedCell().row,
    show.value,
  ],
  () => {
    draft.value = "";
    if (inputRef.value) inputRef.value.value = "";
  },
);

watch(show, (visible) => {
  if (!visible) {
    draft.value = "";
    inputRef.value?.blur();
  }
});

watchHelper.watchPointerEvent(
  ["CELL_SELECTED"],
  ["EV_SVG_POINTERUP", "EV_SVG_POINTERCANCEL"],
  () => {
    if (!isMobileBoard.value) return;
    if (notationStore.getSelectedNotations().length > 0) return;
    nextTick(() => {
      scrollSelectedCellIntoView();
      focusInput();
    });
  },
);
</script>

<style scoped>
.cell-symbol-input {
  margin: 0;
  padding: 0 2px;
  border: 2px solid chocolate;
  border-radius: 2px;
  background: lightyellow;
  color: black;
  outline: none;
  box-sizing: border-box;
}
</style>
