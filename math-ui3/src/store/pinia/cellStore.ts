// notations of current board(lesson, question or answers)
//  questions of current lesson
import { defineStore } from "pinia";
import { ref } from "vue";

import { CellAttributes } from "common/baseTypes";
import { useEditModeStore } from "./editModeStore";
import { cellSpace } from "common/globals";

export const useCellStore = defineStore("cell", () => {
  let svgId: string | undefined = undefined;

  let svgDimensions: DOMRect = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    toJSON: () => null,
  };

  let cellVerticalHight = ref<number>(0);

  let selectedCell = ref(<CellAttributes>{ col: 0, row: 0 });

  function getCellVerticalHeight(): number {
    return cellVerticalHight.value + cellSpace;
  }

  function getCellVerticalHeightNet(): number {
    return cellVerticalHight.value;
  }

  function getCellHorizontalWidth(): number {
    return (cellVerticalHight.value - 1) / 2 + cellSpace;
  }

  function getCellHorizontalWidthNet(): number {
    return (cellVerticalHight.value - 1) / 2;
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

  function resetSelectedCell() {
    selectedCell.value = { col: 1, row: 1 };
  }

  function getSvgBoundingRect() {
    return svgDimensions!;
  }

  function getSvgId() {
    return svgId;
  }

  function setSvgBoundingRect(id: string) {
    svgId = id;
    if (document.getElementById(svgId) !== null) {
      svgDimensions = document.getElementById(svgId)?.getBoundingClientRect()!;
    }
  }

  return {
    getSvgBoundingRect,
    setSvgBoundingRect,
    getSvgId,
    getSelectedCell,
    getCellHorizontalWidth,
    getCellHorizontalWidthNet,
    getCellVerticalHeight,
    getCellVerticalHeightNet,
    setSelectedCell,
    setCellVerticalHeight,
    resetSelectedCell,
  };
});
