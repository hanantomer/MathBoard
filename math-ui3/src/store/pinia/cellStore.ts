// notations of current board(lesson, question or answers)
//  questions of current lesson
import { defineStore } from "pinia";
import { ref } from "vue";

import { CellAttributes } from "common/baseTypes";

export const useCellStore = defineStore("cell", () => {

  let svgId: string | undefined = undefined;

  let cellVerticalHight = ref<number>();

  let selectedCell = ref(<CellAttributes>{ col: 0, row: 0 });

  function getCellVerticalHeight() {
    if (!cellVerticalHight.value)
      throw new Error("cellVerticalHight.value is null");
    return cellVerticalHight.value;
  }

  function getCellHorizontalWidth() {
    if (!cellVerticalHight.value)
      throw new Error("cell VerticalHight value is null");
    return cellVerticalHight.value / 2;
  }

  function setCellVerticalHeight(size: number) {
    cellVerticalHight.value = size;
  }

  function getSelectedCell() {
    return selectedCell.value;
  }

  function selectCell(newSelectedCell: CellAttributes) {
    selectedCell.value = newSelectedCell;
  }

  function resetSelectedCell() {
    selectedCell.value = { col: -1, row: -1 };
  }

  function getSvgId() {
    return svgId;
  }

  function setSvgId(id: string) {
    svgId = id;
  }

  return {
    getSvgId,
    setSvgId,
    getSelectedCell,
    getCellHorizontalWidth,
    getCellVerticalHeight,
    selectCell,
    setCellVerticalHeight,
    resetSelectedCell,
  };
});
