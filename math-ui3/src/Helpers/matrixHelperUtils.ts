import {
  lineColor,
  htmlColor,
  selectionColor,
  getDefaultFontSize,
  defaultdCellStroke,
} from "common/globals";

import { useCellStore } from "../store/pinia/cellStore";
import {
  MultiCellAttributes,
  NotationAttributes,
  PointNotationAttributes,
  RectNotationAttributes,
} from "common/baseTypes";

import useMatrixCellHelper from "./matrixCellHelper";

const cellStore = useCellStore();
const matrixCellHelper = useMatrixCellHelper();

export default function useMatrixHelperUtils() {
  function getCol(n: NotationAttributes): number {
    switch (n.notationType) {
      case "ANNOTATION":
      case "SIGN":
      case "SYMBOL":
      case "SQRTSYMBOL": {
        return (n as PointNotationAttributes).col;
      }
      case "IMAGE":
      case "TEXT": {
        return (n as RectNotationAttributes).fromCol;
      }
      case "SQRT":
      case "EXPONENT": {
        return (n as unknown as MultiCellAttributes).fromCol;
      }

      default:
        return 0;
    }
  }

  function getRow(n: NotationAttributes): number {
    switch (n.notationType) {
      case "ANNOTATION":
      case "SIGN":
      case "SYMBOL":
      case "SQRTSYMBOL": {
        return (n as PointNotationAttributes).row;
      }
      case "IMAGE":
      case "TEXT": {
        return (n as RectNotationAttributes).fromRow;
      }
      case "SQRT":
      case "EXPONENT": {
        return (n as unknown as MultiCellAttributes).row;
      }
      default:
        return 0;
    }
  }

  function getNotationXposByCol(col: number): number {
    return col * cellStore.getCellHorizontalWidth();
  }

  function getNotationYposByRow(row: number): number {
    return row * cellStore.getCellVerticalHeight();
  }

  function removeNotations(exit: any) {
    return exit.remove();
  }

  function colorizeNotationCells(n: NotationAttributes) {
    switch (n.notationType) {
      case "ANNOTATION":
      case "SIGN":
      case "SYMBOL": {
        const n1 = n as PointNotationAttributes;
        if (n1.row == undefined || n1.col == undefined) return;
        const cell = { col: n1.col, row: n1.row };
        matrixCellHelper.colorizeCell(cell, n.color?.value);
        break;
      }

      case "EXPONENT": {
        const n1 = n as unknown as MultiCellAttributes;
        if (!n1.fromCol || !n1.fromCol || !n1.toCol) return;

        for (let i = n1.fromCol; i <= n1.toCol; i++) {
          const cell = { col: i, row: n1.row };
          matrixCellHelper.colorizeCell(cell, n.color?.value);
        }
        break;
      }
    }
  }
  function getColor(n: NotationAttributes) {
    switch (n.notationType) {
      case "ANNOTATION":
      case "EXPONENT":
      case "SIGN":
      case "SQRT":
      case "SQRTSYMBOL":
      case "SYMBOL":
        return n.selected ? selectionColor : htmlColor;
      case "CONCAVECURVE":
      case "CONVEXCURVE":
      case "HORIZONTALLINE":
      case "SLOPELINE":
      case "VERTICALLINE":
        return n.selected
          ? selectionColor
          : n.color?.value
          ? n.color.value
          : lineColor;
    }

    return n.selected
      ? selectionColor
      : //: n.color?.value
        //? n.color.value
        lineColor;
  }

  return {
    getColor,
    getRow,
    getCol,
    getDefaultFontSize,
    defaultdCellStroke,
    getNotationXposByCol,
    getNotationYposByRow,
    removeNotations,
    colorizeNotationCells,
  };
}
