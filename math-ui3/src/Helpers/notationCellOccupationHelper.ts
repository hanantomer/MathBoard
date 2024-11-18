import {
  PointNotationAttributes,
  ExponentNotationAttributes,
  HorizontalLineAttributes,
  VerticalLineNotationAttributes,
  SlopeLineNotationAttributes,
  RectNotationAttributes,
  CurveNotationAttributes,
  NotationAttributes,
  SlopeLineAttributes,
  MultiCellAttributes,
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

  function updateMultiCellOccupationMatrix(
    matrix: any,
    notation: MultiCellAttributes,
    uuid: string,
    doRemove: boolean,
  ) {
    for (let i = notation.fromCol; i <= notation.toCol; i++) {
      if (!validateRowAndCol(i, notation.row)) return;
      matrix[i][notation.row] = doRemove ? null : uuid;
    }
  }

  // update single cell
  function updateLineOccupationMatrixCell(
    col: number,
    row: number,
    matrix: any,
    uuid: string,
    doRemove: boolean,
  ) {
    if (!validateRowAndCol(col, row)) return;
    if (doRemove) {
      for (let i = 0; i < matrix[col][row].length; i++) {
        if (matrix[col][row][i] === uuid) {
          matrix[col][row][i] = null;
        }
      }
      return;
    }

    if (matrix[col][row] === null) {
      matrix[col][row] = [];
    }

    // line occuption mtarix can attribute multiple notations to single cell
    matrix[col][row].push(uuid);
  }

  // function updateHorizontalLineOccupationMatrix(
  //   matrix: any,
  //   notation: HorizontalLineAttributes,
  //   uuid: string,
  //   doRemove: boolean,
  // ) {
  //   const fromCol = Math.round(
  //     notation.p1x / cellStore.getCellHorizontalWidth(),
  //   );
  //   const toCol = Math.round(notation.p2x / cellStore.getCellHorizontalWidth());
  //   const row = Math.round(notation.py / cellStore.getCellVerticalHeight());

  //   for (let col = fromCol; col <= toCol; col++) {
  //     if (validateRowAndCol(col, row)) {
  //       if (validateRowAndCol(col, row - 1))
  //         // occupy 2 rows
  //         updateLineOccupationMatrixCell(col, row, matrix, uuid, doRemove);
  //       updateLineOccupationMatrixCell(col, row - 1, matrix, uuid, doRemove);
  //     }
  //   }
  // }

  // function updateVerticalLineOccupationMatrix(
  //   matrix: any,
  //   notation: VerticalLineNotationAttributes,
  //   doRemove: boolean,
  // ) {
  //   const fromRow = Math.round(
  //     notation.p1y / cellStore.getCellVerticalHeight(),
  //   );
  //   const toRow = Math.round(notation.p2y / cellStore.getCellVerticalHeight());
  //   const col = Math.round(notation.px / cellStore.getCellHorizontalWidth());

  //   for (let i = fromRow; i <= toRow; i++) {
  //     if (validateRowAndCol(i, matrixDimensions.rowsNum)) {
  //       updateLineOccupationMatrixCell(col, i, matrix, notation.uuid, doRemove);
  //     }

  //     if (validateRowAndCol(i, matrixDimensions.rowsNum - 1)) {
  //       updateLineOccupationMatrixCell(
  //         col - 1,
  //         i,
  //         matrix,
  //         notation.uuid,
  //         doRemove,
  //       );

  //       updateLineOccupationMatrixCell(col, i, matrix, notation.uuid, doRemove);
  //     }
  //   }
  // }

  /// populate occupation matrix to encompass the sloped line
  // function updateSlopeLineOccupationMatrix(
  //   matrix: any,
  //   notation: SlopeLineAttributes,
  //   uuid: string,
  //   doRemove: boolean,
  // ) {
  //   const fromCol = Math.round(
  //     notation.p1x / cellStore.getCellHorizontalWidth(),
  //   );
  //   const toCol = Math.round(notation.p2x / cellStore.getCellHorizontalWidth());
  //   const fromRow = Math.round(
  //     notation.p1y / cellStore.getCellVerticalHeight(),
  //   );
  //   const toRow = Math.round(notation.p2y / cellStore.getCellVerticalHeight());

  //   // slope is positive if fromRow > toRow
  //   const slope = (fromRow - toRow) / (toCol - fromCol);

  //   let firstRowIndex = slope > 0 ? fromRow : toRow;
  //   for (let col = fromCol - 1, i = 0; col <= toCol; col++, i++) {
  //     let row = Math.ceil(firstRowIndex + i * slope * -1);

  //     if (validateRowAndCol(col, row)) {
  //       updateLineOccupationMatrixCell(col, row, matrix, uuid, doRemove);
  //       updateLineOccupationMatrixCell(col - 1, row, matrix, uuid, doRemove);
  //     }
  //   }
  // }

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

  // function updateCurveOccupationMatrix(
  //   matrix: any,
  //   notation: CurveNotationAttributes,
  //   doRemove: boolean,
  // ) {
  //   if (!cellStore.getSvgId) return;

  //   // get curve-enclosing-triangle and mark all cells intersecting
  //   // with the edges which emerge from the control point

  //   updateSlopeLineOccupationMatrix(
  //     matrix,
  //     {
  //       p1x: notation.p1x,
  //       p2x: notation.cpx,
  //       p1y: notation.p1y,
  //       p2y: notation.cpy,
  //     },
  //     notation.uuid,
  //     doRemove,
  //   );

  //   updateSlopeLineOccupationMatrix(
  //     matrix,
  //     {
  //       p1x: notation.p2x,
  //       p2x: notation.cpx,
  //       p1y: notation.p2y,
  //       p2y: notation.cpy,
  //     },
  //     notation.uuid,
  //     doRemove,
  //   );
  // }

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
    updateMultiCellOccupationMatrix,
    //updateHorizontalLineOccupationMatrix,
    //updateVerticalLineOccupationMatrix,
    //updateSlopeLineOccupationMatrix,
    //updateCurveOccupationMatrix,
    updateRectOccupationMatrix,
  };
}
