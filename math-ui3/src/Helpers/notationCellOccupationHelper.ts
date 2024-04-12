import {
  PointNotationAttributes,
  HorizontalLineNotationAttributes,
  VerticalLineNotationAttributes,
  SlopeLineNotationAttributes,
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

  function updateHorizontalLineOccupationMatrix(
    matrix: any,
    notation: HorizontalLineNotationAttributes,
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
        matrix[notation.col][i] = doRemove ? null : notation;
      }
    }
  }


  ///TODO: update occupation matrix assuming that from col is less than to col
  //// but from row can be greater than to row in case of negative slope
  /// the occupation matrix shoulkd be populated to encompass the generated lin
  function updateSlopeLineOccupationMatrix(
    matrix: any,
    notation: SlopeLineNotationAttributes,
    doRemove: boolean,
  ) {
    for (let i = notation.fromRow; i <= notation.toRow; i++) {
      if (
        i < matrixDimensions.rowsNum &&
        notation.toCol < matrixDimensions.colsNum
      ) {
        matrix[notation.fromCol][i] = doRemove ? null : notation;
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
    updateHorizontalLineOccupationMatrix,
    updateVerticalLineOccupationMatrix,
    updateSlopeLineOccupationMatrix,
    updateRectOccupationMatrix,
  };
}
