// notations of current board(lesson, question or answers)
//  questions of current lesson
import { defineStore } from "pinia";
import { ref, shallowRef } from "vue";

import { CellAttributes } from "common/baseTypes";
import { useEditModeStore } from "./editModeStore";
import { cellSpace } from "common/globals";

export const useCellStore = defineStore("cell", () => {
  let svgId: string | undefined = undefined;

  /** Viewport rect of the board SVG; reactive so overlays can track layout/scroll. */
  const svgBoundingRect = shallowRef<DOMRect>(
    new DOMRect(0, 0, 0, 0),
  );

  let cellVerticalHight = ref<number>(0);

  let selectedCell = ref(<CellAttributes>{ col: 0, row: 0 });

  function getCellVerticalHeight(): number {
    return cellVerticalHight.value + cellSpace;
  }

  function getCellVerticalHeightNet(): number {
    return cellVerticalHight.value;
  }

  function getCellHorizontalWidth(): number {
    return Math.floor((cellVerticalHight.value - 1) / 2) + cellSpace;
  }

  function getCellHorizontalWidthNet(): number {
    return Math.floor((cellVerticalHight.value - 1) / 2);
  }

  function setCellVerticalHeight(size: number) {
    cellVerticalHight.value = size;
  }

  function getSelectedCell(): CellAttributes {
    return selectedCell.value;
  }

  function setSelectedCell(
    newSelectedCell: CellAttributes,
    setEditMode: boolean,
  ) {
    selectedCell.value = newSelectedCell;
    if (setEditMode) {
      // Call useEditModeStore inside the function, not at the top level
      const editModeStore = useEditModeStore();
      editModeStore.setEditMode("CELL_SELECTED");
    }
  }

  function resetCellDimensions() {
    cellVerticalHight.value = 0;
  }

  function resetSelectedCell() {
    selectedCell.value = { col: 1, row: 1 };
  }

  function getSvgBoundingRect() {
    return svgBoundingRect.value;
  }

  function refreshSvgBoundingRect() {
    if (!svgId) return;
    const el = document.getElementById(svgId);
    if (!el) return;

    const next = el.getBoundingClientRect();
    const prev = svgBoundingRect.value;
    if (
      prev.top === next.top &&
      prev.left === next.left &&
      prev.width === next.width &&
      prev.height === next.height
    ) {
      return;
    }
    svgBoundingRect.value = next;
  }

  function getSvgId() {
    return svgId;
  }

  function setSvgBoundingRect(id: string) {
    svgId = id;
    refreshSvgBoundingRect();
  }

  return {
    getSvgBoundingRect,
    refreshSvgBoundingRect,
    setSvgBoundingRect,
    getSvgId,
    getSelectedCell,
    getCellHorizontalWidth,
    getCellHorizontalWidthNet,
    getCellVerticalHeight,
    getCellVerticalHeightNet,
    setSelectedCell,
    setCellVerticalHeight,
    resetCellDimensions,
    resetSelectedCell,
  };
});
