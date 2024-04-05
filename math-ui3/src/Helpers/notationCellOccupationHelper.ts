import {
  PointNotationAttributes,
  LineNotationAttributes,
  RectNotationAttributes,
} from "common/baseTypes";

import { matrixDimensions } from "common/globals";

export default function notationCellOccupationHelper() {

  function updatePointOccupationMatrix(
    matrix: any,
    notation: PointNotationAttributes,
    doRemove: boolean,
  ) {
    if (
      notation.col < matrixDimensions.colsNum &&
      notation.row < matrixDimensions.rowsNum
    ) {
      matrix[notation.col][notation.row] = doRemove ? null : notation;
    }
  }

  function updateLineOccupationMatrix(
    matrix: any,
    notation: LineNotationAttributes,
    doRemove: boolean,
  ) {
    for (let i = notation.fromCol; i <= notation.toCol; i++) {
      if (
        i < matrixDimensions.colsNum &&
        notation.row < matrixDimensions.rowsNum
      ) {
        matrix[i][notation.row] = doRemove ? null : notation;
      }
    }
  }

  function updateRectOccupationMatrix(
    matrix: any,
    notation: RectNotationAttributes,
    doRemove: boolean,
  ) {
    for (let i = notation.fromCol; i <= notation.toCol; i++) {
      for (let j = notation.fromRow; j <= notation.toRow; j++) {
        if (i < matrixDimensions.colsNum && j < matrixDimensions.rowsNum) {
          matrix[i][j] = doRemove ? null : notation;
        }
      }
    }
  }

  return {
    updatePointOccupationMatrix,
    updateLineOccupationMatrix,
    updateRectOccupationMatrix,
  };
}
