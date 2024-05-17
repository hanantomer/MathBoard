import {
  PointNotationAttributes,
  HorizontalLineNotationAttributes,
  VerticalLineNotationAttributes,
  SlopeLineNotationAttributes,
  RectNotationAttributes,
  NotationAttributes,
} from "common/baseTypes";

import { matrixDimensions } from "common/globals";

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
      if (validateRowAndCol(col, notation.row)) {
        updateLineOccupationMatrixCell(
          col,
          notation.row,
          matrix,
          notation,
          doRemove,
        );

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

  function updateSlopeLineOccupationMatrix(
    /// the occupation matrix shoulkd be populated to encompass the generated line
    matrix: any,
    notation: SlopeLineNotationAttributes,
    doRemove: boolean,
  ) {
    const slope =
      (notation.toRow - notation.fromRow) / (notation.toCol - notation.fromCol);

    let firstRowIndex = notation.fromRow;

    for (let col = notation.fromCol; col <= notation.toCol; col++) {
      if (col < matrixDimensions.colsNum) {
        let row =
          firstRowIndex +
          (slope > 0
            ? Math.floor((col - notation.fromCol) * slope)
            : Math.ceil((col - notation.fromCol) * slope));

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
    console.log(matrix);
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
    updateRectOccupationMatrix,
  };
}
