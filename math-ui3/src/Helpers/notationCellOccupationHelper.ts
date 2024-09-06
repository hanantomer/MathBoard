import {
  PointNotationAttributes,
  ExponentNotationAttributes,
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

  function updateExponentOccupationMatrix(
    matrix: any,
    notation: ExponentNotationAttributes,
    doRemove: boolean,
  ) {
    if (!validateRowAndCol(notation.col, notation.row)) return;

    // occupy base cells plus one cell for exponent
    for (let i = 0; i <= notation.base.toString().length; i++) {
      matrix[notation.col + i][notation.row] = doRemove ? null : notation.uuid;
    }
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
      for (let i = 0; i < matrix[col][row].length; i++) {
        if (matrix[col][row][i] === notation.uuid) {
          matrix[col][row][i] = null;
        }
      }
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
      if (validateRowAndCol(col, notation.row)) {

        if (validateRowAndCol(col, notation.row - 1))
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

  /// populate occupation matrix to encompass the sloped line
  function updateSlopeLineOccupationMatrix(
    matrix: any,
    notation: SlopeLineNotationAttributes,
    doRemove: boolean,
  ) {
    // slope is positive if fromRow > toRow
    const slope =
      (notation.toRow - notation.fromRow) / (notation.toCol - notation.fromCol);

    let firstRowIndex = notation.fromRow;
    for (
      let col = notation.fromCol - 1, i = 0;
      col <= notation.toCol;
      col++, i++
    ) {
      let row = Math.ceil(firstRowIndex + i * slope);

      if (validateRowAndCol(col, row)) {
        updateLineOccupationMatrixCell(col, row, matrix, notation, doRemove);
        updateLineOccupationMatrixCell(
          col - 1,
          row,
          matrix,
          notation,
          doRemove,
        );
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
      for (
        let row = Math.min(notation.fromRow, notation.toRow);
        row <= Math.max(notation.fromRow, notation.toRow);
        row++
      ) {
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

    // get curve-enclosing-triangle and mark all cells intersecting
    // with the edges which emerge from the control point

    const triangleEddge1 = screenHelper.getSlopeLineAttributesByCoordinates({
      bottom: { x: notation.p1x, y: notation.p1y },
      top: { x: notation.cpx, y: notation.cpy },
    });

    updateSlopeLineOccupationMatrix(
      matrix,
      { ...notation, ...triangleEddge1 },
      doRemove,
    );

    const triangleEddge2 = screenHelper.getSlopeLineAttributesByCoordinates({
      bottom: { x: notation.cpx, y: notation.cpy },
      top: { x: notation.p2x, y: notation.p2y },
    });

    updateSlopeLineOccupationMatrix(
      matrix,
      { ...notation, ...triangleEddge2 },
      doRemove,
    );
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
    updateExponentOccupationMatrix,
    updateHorizontalLineOccupationMatrix,
    updateVerticalLineOccupationMatrix,
    updateSlopeLineOccupationMatrix,
    updateCurveOccupationMatrix,
    updateRectOccupationMatrix,
  };
}
