import * as d3 from "d3";
import {
  CellAttributes,
} from "common/baseTypes";
import {
  matrixDimensions,
  defaultdCellStroke,
  selectedCellStroke,
} from "common/globals";

import { useCellStore } from "../store/pinia/cellStore";

const cellStore = useCellStore();

export default function useHtmlMatrixHelper() {

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
      cellStore.setSelectedCell(nextCell);
    }
  }

  function colorizeCell(svgId: string, cell: CellAttributes, color: string) {
    let rectElm = document
      ?.querySelector<HTMLElement>(`svg[id="${svgId}"] g[row="${cell.row}"]`)
      ?.querySelector<HTMLElement>(`rect[col="${cell.col}"]`);

    if (rectElm?.style) rectElm.style.fill = color;
  }

  // called by store watcher. see mathboard.vue
  function showSelectedCell(
    svgId: string,
    newSelectedCell: CellAttributes | null | undefined,
    oldSelectedCell: CellAttributes | null | undefined,
  ) {
    if (oldSelectedCell?.col != null) {
      let prevRectElm = document
        ?.querySelector<HTMLElement>(
          `svg[id="${svgId}"] g[row="${oldSelectedCell.row}"]`,
        )
        ?.querySelector<HTMLElement>(`rect[col="${oldSelectedCell.col}"]`);

      if (prevRectElm?.style) {
        prevRectElm.style.stroke = defaultdCellStroke;
        //prevRectElm.style.strokeWidth = "0";
      }
    }

    if (newSelectedCell?.col != null) {
      let rectElm = document
        ?.querySelector<HTMLElement>(
          `svg[id="${svgId}"] g[row="${newSelectedCell.row}"]`,
        )
        ?.querySelector<HTMLElement>(`rect[col="${newSelectedCell.col}"]`);

      if (rectElm?.style) {
        rectElm.style.stroke = selectedCellStroke;
      }
    }
  }

  return {
    colorizeCell,
    setNextCell,
    showSelectedCell
  };
}
