import {
  NotationAttributes,
  PointNotationAttributes,
  LineNotationAttributes,
  RectNotationAttributes,
} from "common/baseTypes";

import { NotationTypeShape } from "common/unions";

import { matrixDimensions } from "common/globals";

export default function notationCellOccupationHelper() {
  function updateOccupationMatrix(
    matrix: any,
    notation: NotationAttributes,
    doRemove: boolean,
  ) {
    switch (NotationTypeShape.get(notation.notationType)) {
      case "LINE":
        {
          const n = notation as LineNotationAttributes;
          for (let i = n.fromCol; i <= n.toCol; i++) {
            if (
              i < matrixDimensions.colsNum &&
              n.row < matrixDimensions.rowsNum
            ) {
              matrix[i][n.row] = doRemove ? null : n;
            }
          }
        }
        break;
      case "POINT":
        {
          const n = notation as PointNotationAttributes;
          if (
            n.col < matrixDimensions.colsNum &&
            n.row < matrixDimensions.rowsNum
          ) {
            matrix[n.col][n.row] = doRemove ? null : n;
          }
        }
        break;
      case "RECT":
        {
          const n = notation as RectNotationAttributes;
          for (let i = n.fromCol; i <= n.toCol; i++) {
            for (let j = n.fromRow; j <= n.toRow; j++) {
              if (
                i < matrixDimensions.colsNum &&
                j < matrixDimensions.rowsNum
              ) {
                matrix[i][j] = doRemove ? null : n;
              }
            }
          }
        }
        break;
    }
  }

  return {
    updateOccupationMatrix,
  };
}
