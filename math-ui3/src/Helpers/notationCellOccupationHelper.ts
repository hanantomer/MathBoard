import {
  PointNotationAttributes,
  HorizontalLineNotationAttributes,
  VerticalLineNotationAttributes,
  SlopeLineNotationAttributes,
  RectNotationAttributes,
  CurveNotationAttributes,
  NotationAttributes,
} from "common/baseTypes";

import useScreenHelper from "./screenHelper";

import { matrixDimensions } from "common/globals";
import { useCellStore } from "../store/pinia/cellStore";

const screenHelper = useScreenHelper();
const cellStore = useCellStore();

export default function notationCellOccupationHelper() {
  // point occupation matrix holds only one notation per cell
  function updatePointOccupationMatrix(
    matrix: any,
    notation: PointNotationAttributes,
    doRemove: boolean,
  ) {
    if (!validateRowAndCol(notation.col, notation.row)) return;
    matrix[notation.col][notation.row] = doRemove ? null : notation.uuid;
  }

  // update single cell
  function updateLineOccupationMatrixCell(
    col: number,
    row: number,
    matrix: any,
    notation: NotationAttributes,
    doRemove: boolean,
  ) {
    if (!validateRowAndCol(col, row)) return;
    if (doRemove) {
      matrix[col][row] = null;
      return;
    }

    if (matrix[col][row] === null) {
      matrix[col][row] = [];
    }

    // line occuption mtarix can attribute multiple notations to single cell
    matrix[col][row].push(notation.uuid);
  }

  function updateHorizontalLineOccupationMatrix(
    matrix: any,
    notation: HorizontalLineNotationAttributes,
    doRemove: boolean,
  ) {
    for (let col = notation.fromCol; col <= notation.toCol; col++) {
      if (validateRowAndCol(col, notation.row)) { // occupy notation row
        updateLineOccupationMatrixCell(
          col,
          notation.row,
          matrix,
          notation,
          doRemove,
        );

        if (validateRowAndCol(col, notation.row - 1))
          // occupy also row above
          updateLineOccupationMatrixCell(
            col,
            notation.row - 1,
            matrix,
            notation,
            doRemove,
          );
      }
    }
  }

  function updateVerticalLineOccupationMatrix(
    matrix: any,
    notation: VerticalLineNotationAttributes,
    doRemove: boolean,
  ) {
    for (let i = notation.fromRow; i <= notation.toRow; i++) {
      if (validateRowAndCol(i, matrixDimensions.rowsNum)) {
        updateLineOccupationMatrixCell(
          notation.col,
          i,
          matrix,
          notation,
          doRemove,
        );
      }

      if (validateRowAndCol(i, matrixDimensions.rowsNum - 1)) {
        updateLineOccupationMatrixCell(
          notation.col - 1,
          i,
          matrix,
          notation,
          doRemove,
        );
      }
    }
  }

  function updateSlopeLineOccupationMatrix(
    /// the occupation matrix shoulkd be populated to encompass the generated line
    matrix: any,
    notation: SlopeLineNotationAttributes,
    doRemove: boolean,
  ) {
    const slope =
      (notation.toRow - notation.fromRow) / (notation.toCol - notation.fromCol);

    let firstRowIndex =
      notation.toCol > notation.fromCol ? notation.fromRow : notation.toRow;

    const absoluetFromCol = Math.min(notation.toCol, notation.fromCol);
    const absoluetToCol = Math.max(notation.toCol, notation.fromCol);

    for (let col = absoluetFromCol; col <= absoluetToCol; col++) {
      if (col < matrixDimensions.colsNum) {
        let row =
          firstRowIndex +
          (slope > 0
            ? Math.floor((col - absoluetFromCol) * slope)
            : Math.ceil((col - absoluetFromCol) * slope));

        if (validateRowAndCol(col, row)) {
          updateLineOccupationMatrixCell(col, row, matrix, notation, doRemove);
        }

        if (validateRowAndCol(col, row - 1)) {
          updateLineOccupationMatrixCell(
            col,
            row - 1,
            matrix,
            notation,
            doRemove,
          );
        }
      }
    }
  }

  // rect occupation matrix holds only one notation per cell
  function updateRectOccupationMatrix(
    matrix: any,
    notation: RectNotationAttributes,
    doRemove: boolean,
  ) {
    for (let col = notation.fromCol; col <= notation.toCol; col++) {
      for (let row = notation.fromRow; row <= notation.toRow; row++) {
        if (validateRowAndCol(col, row)) {
          matrix[col][row] = doRemove ? null : notation.uuid;
        }
      }
    }
  }

  function updateCurveOccupationMatrix(
    matrix: any,
    notation: CurveNotationAttributes,
    doRemove: boolean,
  ) {
    if (!cellStore.getSvgId) return;

    const rect = screenHelper.getRectAttributes(cellStore.getSvgId()!, {
      topLeft: { x:notation.p1x , y: notation.p1y },
      bottomRight: { x:notation.p2x , y: notation.p2y}
    });

    for (let col = rect.fromCol; col <= rect.toCol; col++) {
      for (let row = rect.fromRow; row <= rect.toRow; row++) {
        if (validateRowAndCol(col, row)) {
          matrix[col][row] = doRemove ? null : notation.uuid;
        }
      }
    }
  }

  function validateRowAndCol(col: number, row: number): boolean {
    return (
      col < matrixDimensions.colsNum &&
      row < matrixDimensions.rowsNum &&
      col >= 0 &&
      row >= 0
    );
  }

  return {
    updatePointOccupationMatrix,
    updateHorizontalLineOccupationMatrix,
    updateVerticalLineOccupationMatrix,
    updateSlopeLineOccupationMatrix,
    updateCurveOccupationMatrix,
    updateRectOccupationMatrix,
  };
}
