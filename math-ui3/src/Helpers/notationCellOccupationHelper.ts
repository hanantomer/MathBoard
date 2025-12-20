import {
  PointNotationAttributes,
  RectNotationAttributes,
  CurveNotationAttributes,
  LineNotationAttributes,
  NotationAttributes,
  MultiCellAttributes,
  CircleNotationAttributes,
  AnnotationNotationAttributes,
  SqrtNotationAttributes,
} from "common/baseTypes";

// ...existing code...
import { matrixDimensions, clonedNotationUUIdPrefix } from "common/globals";
import { useCellStore } from "../store/pinia/cellStore";

export default function notationCellOccupationHelper() {
  const cellStore = useCellStore();

  function createCellSingleNotationOccupationMatrix(): (String | null)[][] {
    const cols = matrixDimensions.colsNum;
    const rows = matrixDimensions.rowsNum;
    const matrix: (String | null)[][] = new Array(cols);
    for (let c = 0; c < cols; c++) {
      matrix[c] = new Array(rows);
      for (let r = 0; r < rows; r++) matrix[c][r] = null;
    }
    return matrix;
  }

  function createCellMultipleNotationOccupationMatrix(): Set<String>[][] {
    const cols = matrixDimensions.colsNum;
    const rows = matrixDimensions.rowsNum;
    const matrix: Set<String>[][] = new Array(cols);
    for (let c = 0; c < cols; c++) {
      matrix[c] = new Array(rows);
      for (let r = 0; r < rows; r++) matrix[c][r] = new Set<String>();
    }
    return matrix;
  }

  function validateRowAndCol(col: number, row: number) {
    return (
      col != null &&
      row != null &&
      col >= 0 &&
      row >= 0 &&
      col < matrixDimensions.colsNum &&
      row < matrixDimensions.rowsNum
    );
  }

  function clearNotationFromMatrix(uuid: string, matrix: any) {
    if (!uuid) return;
    for (let c = 0; c < matrixDimensions.colsNum; c++) {
      for (let r = 0; r < matrixDimensions.rowsNum; r++) {
        const cell = matrix[c][r];
        if (cell == null) continue;
        if (cell instanceof Set) {
          if (cell.has(uuid)) {
            cell.delete(uuid);
          }
        } else if (cell === uuid) {
          matrix[c][r] = null;
        }
      }
    }
  }

  function updatePointOccupationMatrix(
    matrix: any,
    notation: PointNotationAttributes,
    doRemove: boolean,
  ) {
    if (!notation || notation.uuid?.startsWith(clonedNotationUUIdPrefix))
      return;
    if (!validateRowAndCol(notation.col, notation.row)) return;
    clearNotationFromMatrix(notation.uuid, matrix);
    matrix[notation.col][notation.row] = doRemove ? null : notation.uuid;
  }

  function updateMultiCellOccupationMatrix(
    matrix: any,
    notation: MultiCellAttributes,
    uuid: string,
    doRemove: boolean,
  ) {
    if (!notation || !validateRowAndCol(notation.fromCol, notation.row)) return;
    clearNotationFromMatrix(uuid, matrix);
    for (let c = notation.fromCol; c <= notation.toCol; c++) {
      if (!validateRowAndCol(c, notation.row)) continue;
      matrix[c][notation.row] = doRemove ? null : uuid;
    }
  }

  function updateLineOccupationMatrix(
    matrix: any,
    notation: LineNotationAttributes,
    uuid: string,
    doRemove: boolean,
  ) {
    if (!notation || !uuid) return;
    clearNotationFromMatrix(uuid, matrix);

    const colWidth = cellStore.getCellHorizontalWidth();
    const rowHeight = cellStore.getCellVerticalHeight();

    const minCol = Math.max(
      0,
      Math.floor(Math.min(notation.p1x, notation.p2x) / colWidth),
    );
    const maxCol = Math.min(
      matrixDimensions.colsNum - 1,
      Math.floor(Math.max(notation.p1x, notation.p2x) / colWidth),
    );
    const minRow = Math.max(
      0,
      Math.floor(Math.min(notation.p1y, notation.p2y) / rowHeight),
    );
    const maxRow = Math.min(
      matrixDimensions.rowsNum - 1,
      Math.floor(Math.max(notation.p1y, notation.p2y) / rowHeight),
    );

    for (let c = minCol; c <= maxCol; c++) {
      for (let r = minRow; r <= maxRow; r++) {
        if (!validateRowAndCol(c, r)) continue;
        if (doRemove) {
          (matrix[c][r] as Set<String>)?.delete(uuid);
        } else {
          if (matrix[c][r] == null) matrix[c][r] = new Set<String>();
          (matrix[c][r] as Set<String>).add(uuid);
        }
      }
    }
  }

  function updateAnnotationOccupationMatrix(
    matrix: any,
    notation: AnnotationNotationAttributes,
    doRemove: boolean,
  ) {
    if (!notation) return;
    const col = Math.round(notation.x / cellStore.getCellHorizontalWidth());
    const row = Math.round(notation.y / cellStore.getCellVerticalHeight());
    if (!validateRowAndCol(col, row)) return;
    clearNotationFromMatrix(notation.uuid, matrix);
    matrix[col][row] = doRemove ? null : notation.uuid;
  }

  function updateRectOccupationMatrix(
    matrix: any,
    notation: RectNotationAttributes,
    doRemove: boolean,
  ) {
    if (!notation) return;
    clearNotationFromMatrix(notation.uuid, matrix);
    for (let c = notation.fromCol; c <= notation.toCol; c++) {
      for (let r = notation.fromRow; r <= notation.toRow; r++) {
        if (!validateRowAndCol(c, r)) continue;
        matrix[c][r] = doRemove ? null : notation.uuid;
      }
    }
  }

  function updateCurveOccupationMatrix(
    matrix: any,
    notation: CurveNotationAttributes,
    doRemove: boolean,
  ) {
    // approximate bounding box covering cells touched by the curve
    const colWidth = cellStore.getCellHorizontalWidth();
    const rowHeight = cellStore.getCellVerticalHeight();

    const minX = Math.min(notation.p1x, notation.p2x, notation.cpx);
    const maxX = Math.max(notation.p1x, notation.p2x, notation.cpx);
    const minY = Math.min(notation.p1y, notation.p2y, notation.cpy);
    const maxY = Math.max(notation.p1y, notation.p2y, notation.cpy);

    const minCol = Math.max(0, Math.floor(minX / colWidth));
    const maxCol = Math.min(
      matrixDimensions.colsNum - 1,
      Math.floor(maxX / colWidth),
    );
    const minRow = Math.max(0, Math.floor(minY / rowHeight));
    const maxRow = Math.min(
      matrixDimensions.rowsNum - 1,
      Math.floor(maxY / rowHeight),
    );

    clearNotationFromMatrix(notation.uuid, matrix);

    for (let c = minCol; c <= maxCol; c++) {
      for (let r = minRow; r <= maxRow; r++) {
        if (!validateRowAndCol(c, r)) continue;
        if (doRemove) {
          (matrix[c][r] as Set<String>)?.delete(notation.uuid);
        } else {
          if (matrix[c][r] == null) matrix[c][r] = new Set<String>();
          (matrix[c][r] as Set<String>).add(notation.uuid);
        }
      }
    }
  }

  function updateSqrtOccupationMatrix(
    matrix: any,
    notation: SqrtNotationAttributes,
    uuid: string,
    doRemove: boolean,
  ) {
    // similar to multi-cell, but across fromCol..toCol at a single row
    if (!notation) return;
    clearNotationFromMatrix(uuid, matrix);
    for (let c = notation.fromCol; c <= notation.toCol; c++) {
      if (!validateRowAndCol(c, notation.row)) continue;
      if (doRemove) {
        (matrix[c][notation.row] as Set<String>)?.delete(uuid);
      } else {
        if (matrix[c][notation.row] == null)
          matrix[c][notation.row] = new Set<String>();
        (matrix[c][notation.row] as Set<String>).add(uuid);
      }
    }
  }

  function updateCircleOccupationMatrix(
    matrix: any,
    notation: CircleNotationAttributes,
    doRemove: boolean,
  ) {
    const colWidth = cellStore.getCellHorizontalWidth();
    const rowHeight = cellStore.getCellVerticalHeight();

    const minCol = Math.max(
      0,
      Math.floor((notation.cx - notation.r) / colWidth),
    );
    const maxCol = Math.min(
      matrixDimensions.colsNum - 1,
      Math.floor((notation.cx + notation.r) / colWidth),
    );
    const minRow = Math.max(
      0,
      Math.floor((notation.cy - notation.r) / rowHeight),
    );
    const maxRow = Math.min(
      matrixDimensions.rowsNum - 1,
      Math.floor((notation.cy + notation.r) / rowHeight),
    );

    clearNotationFromMatrix(notation.uuid, matrix);

    for (let c = minCol; c <= maxCol; c++) {
      for (let r = minRow; r <= maxRow; r++) {
        if (!validateRowAndCol(c, r)) continue;
        matrix[c][r] = doRemove ? null : notation.uuid;
      }
    }
  }

  function updateOccupationMatrix(
    notation: NotationAttributes,
    dotMatrix: (String | null)[][],
    symbolMatrix: (String | null)[][],
    lineMatrix: Set<String | null>[][],
    rectMatrix: (String | null)[][],
    doRemove: boolean = false,
  ) {
    switch (notation.notationType) {
      case "EXPONENT":
      case "LOGBASE":
      case "SIGN":
      case "SQRTSYMBOL":
      case "SYMBOL":
        if ((notation as PointNotationAttributes).value === ".") {
          updatePointOccupationMatrix(
            dotMatrix,
            notation as PointNotationAttributes,
            doRemove,
          );
        } else {
          updatePointOccupationMatrix(
            symbolMatrix,
            notation as PointNotationAttributes,
            doRemove,
          );
        }
        break;
      case "ANNOTATION":
        updateAnnotationOccupationMatrix(
          symbolMatrix,
          notation as AnnotationNotationAttributes,
          doRemove,
        );
        break;
      case "TEXT":
      case "IMAGE":
        updateRectOccupationMatrix(
          rectMatrix,
          notation as RectNotationAttributes,
          doRemove,
        );
        break;
      case "CURVE":
        updateCurveOccupationMatrix(
          lineMatrix,
          notation as CurveNotationAttributes,
          doRemove,
        );
        break;
      case "SQRT":
        updateSqrtOccupationMatrix(
          lineMatrix,
          notation as SqrtNotationAttributes,
          notation.uuid,
          doRemove,
        );
        break;
      case "DIVISIONLINE":
      case "LINE":
        updateLineOccupationMatrix(
          lineMatrix,
          notation as LineNotationAttributes,
          notation.uuid,
          doRemove,
        );
        break;
      case "CIRCLE":
        updateCircleOccupationMatrix(
          rectMatrix,
          notation as CircleNotationAttributes,
          doRemove,
        );
        break;
    }
  }

  function getDotNotationAtCell(
    matrix: (String | null)[][],
    col: number,
    row: number,
  ): String | null {
    if (!validateRowAndCol(col, row)) return null;
    return matrix[col][row];
  }

  function getSymbolNotationAtCell(
    matrix: (String | null)[][],
    col: number,
    row: number,
  ): String | null {
    if (!validateRowAndCol(col, row)) return null;
    return matrix[col][row];
  }

  function getRectNotationAtCell(
    matrix: (String | null)[][],
    col: number,
    row: number,
  ): String | null {
    if (!validateRowAndCol(col, row)) return null;
    return matrix[col][row];
  }

  function getLineNotationsAtCell(
    matrix: Set<String | null>[][],
    col: number,
    row: number,
  ): Set<String | null> {
    if (!validateRowAndCol(col, row)) return new Set();
    return matrix[col][row];
  }

  return {
    getDotNotationAtCell,
    getSymbolNotationAtCell,
    getRectNotationAtCell,
    getLineNotationsAtCell,
    createCellSingleNotationOccupationMatrix,
    createCellMultipleNotationOccupationMatrix,
    updatePointOccupationMatrix,
    updateMultiCellOccupationMatrix,
    updateLineOccupationMatrix,
    updateAnnotationOccupationMatrix,
    updateRectOccupationMatrix,
    updateCurveOccupationMatrix,
    updateSqrtOccupationMatrix,
    updateCircleOccupationMatrix,
    updateOccupationMatrix,
    clearNotationFromMatrix,
  };
}
