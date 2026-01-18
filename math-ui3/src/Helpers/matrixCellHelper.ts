import {
  CellAttributes
} from "common/baseTypes";
import {
  matrixDimensions,
  defaultdCellStroke,
  selectedCellStroke,
} from "common/globals";

import { useCellStore } from "../store/pinia/cellStore";
import useSelectionHelper from "./selectionHelper";

const selectionHelper = useSelectionHelper();
const cellStore = useCellStore();

export default function useMatrixCellHelper() {
  function getNextCell(
    horizontalStep: number,
    verticalStep: number,
  ): CellAttributes | undefined {
    if (
      cellStore.getSelectedCell()?.col == null ||
      !cellStore.getSelectedCell()?.row == null
    ) {
      return;
    }

    let col = cellStore.getSelectedCell()?.col || 0;
    let row = cellStore.getSelectedCell()?.row || 0;
    let nextCol = col;
    let nextRow = row;

    if (
      col + horizontalStep < matrixDimensions.colsNum &&
      col + horizontalStep >= 0
    ) {
      nextCol += horizontalStep;
    }

    if (
      col + horizontalStep >= matrixDimensions.colsNum &&
      row != matrixDimensions.rowsNum
    ) {
      nextRow += 1;
      nextCol = 0;
    }

    if (
      row + verticalStep < matrixDimensions.rowsNum &&
      row + verticalStep >= 0
    ) {
      nextRow += verticalStep;
    }

    if (
      row + verticalStep >= matrixDimensions.rowsNum ||
      row + verticalStep < 0
    ) {
      nextCol = 0;
      nextRow = 0;
    }

    return {
      col: nextCol,
      row: nextRow,
    };
  }

  function setNextCell(horizontalStep: number, verticalStep: number) {
    let nextCell = getNextCell(horizontalStep, verticalStep);
    if (nextCell) {
      selectionHelper.setSelectedCell(nextCell, true);
    }
  }

  function getCellElement(svgId: string, cell: CellAttributes): HTMLElement | null {
    return document
      ?.querySelector<HTMLElement>(
        `svg[id="${svgId}"] g[row="${cell.row}"]`,
      )
      ?.querySelector<HTMLElement>(`rect[col="${cell.col}"]`) ?? null;
  }

  function colorizeCell(
    cell: CellAttributes,
    color: string | null | undefined,
  ) {
    if (!color) color = "";
    const rectElm = document
      ?.querySelector<HTMLElement>(
        `svg[id="${cellStore.getSvgId()}"] g[row="${cell.row}"]`,
      )
      ?.querySelector<HTMLElement>(`rect[col="${cell.col}"]`);

    if (rectElm?.style) rectElm.style.fill = color;
  }

  // called by store watcher. see mathboard.vue
  function showSelectedCell(
    svgId: string,
    newSelectedCell: CellAttributes | null | undefined,
    oldSelectedCell: CellAttributes | null | undefined,
  ): void {
    if (oldSelectedCell?.col != null) {
      const prevRectElm = getCellElement(svgId, oldSelectedCell);
      if (prevRectElm?.style) {
        prevRectElm.style.stroke = defaultdCellStroke;
      }
    }

    if (newSelectedCell?.col != null) {
      const rectElm = getCellElement(svgId, newSelectedCell);
      if (rectElm?.style) {
        rectElm.style.stroke = selectedCellStroke;
      }
    }
  }

  function resetAllCellColors() {
    const svg = document.querySelector(`svg[id="${cellStore.getSvgId()}"]`);
    if (!svg) return;

    for (let row = 0; row < matrixDimensions.rowsNum; row++) {
      const rowGroup = svg.querySelector<HTMLElement>(`g[row="${row}"]`);
      if (!rowGroup) continue;

      for (let col = 0; col < matrixDimensions.colsNum; col++) {
        const cell = rowGroup.querySelector<HTMLElement>(`rect[col="${col}"]`);
        if (cell?.style) {
          cell.style.fill = "";
        }
      }
    }
  }

  return {
    colorizeCell,
    resetAllCellColors,
    setNextCell,
    showSelectedCell,
  };
}
