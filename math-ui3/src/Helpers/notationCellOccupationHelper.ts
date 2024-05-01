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
    if (
      notation.col < matrixDimensions.colsNum &&
      notation.row < matrixDimensions.rowsNum
    ) {
      matrix[notation.col][notation.row] = doRemove ? null : notation.uuid;
    }
  }

  // update single cell
  function updateLineOccupationMatrixCell(
    colIndex: number,
    rowIndex: number,
    matrix: any,
    notation: NotationAttributes,
    doRemove: boolean,
  ) {
    if (doRemove) {
      matrix[colIndex][rowIndex] = null;
      return;
    }

    if (matrix[colIndex][rowIndex] === null) {
      matrix[colIndex][rowIndex] = [];
    }

    // line occuption mtarix can attribute multiple notations to single cell
    matrix[colIndex][rowIndex].push(notation.uuid);
  }

  function updateHorizontalLineOccupationMatrix(
    matrix: any,
    notation: HorizontalLineNotationAttributes,
    doRemove: boolean,
  ) {
    for (
      let colIndex = notation.fromCol;
      colIndex <= notation.toCol;
      colIndex++
    ) {
      if (
        colIndex < matrixDimensions.colsNum &&
        notation.row < matrixDimensions.rowsNum
      ) {
        updateLineOccupationMatrixCell(
          colIndex,
          notation.row,
          matrix,
          notation,
          doRemove,
        );

        updateLineOccupationMatrixCell(
          colIndex,
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
      if (
        i < matrixDimensions.rowsNum &&
        notation.col < matrixDimensions.colsNum
      ) {
        updateLineOccupationMatrixCell(
          notation.col,
          i,
          matrix,
          notation,
          doRemove,
        );

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

    for (
      let colIndex = notation.fromCol;
      colIndex <= notation.toCol;
      colIndex++
    ) {
      if (colIndex < matrixDimensions.colsNum) {
        let rowIndex =
          firstRowIndex +
          (slope > 0
            ? Math.floor((colIndex - notation.fromCol) * slope)
            : Math.ceil((colIndex - notation.fromCol) * slope));
        updateLineOccupationMatrixCell(
          colIndex,
          rowIndex,
          matrix,
          notation,
          doRemove,
        );

        updateLineOccupationMatrixCell(
          colIndex,
          rowIndex - 1,
          matrix,
          notation,
          doRemove,
        );
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
    for (let i = notation.fromCol; i <= notation.toCol; i++) {
      for (let j = notation.fromRow; j <= notation.toRow; j++) {
        if (i < matrixDimensions.colsNum && j < matrixDimensions.rowsNum) {
          matrix[i][j] = doRemove ? null : notation.uuid;
        }
      }
    }
  }

  return {
    updatePointOccupationMatrix,
    updateHorizontalLineOccupationMatrix,
    updateVerticalLineOccupationMatrix,
    updateSlopeLineOccupationMatrix,
    updateRectOccupationMatrix,
  };
}
