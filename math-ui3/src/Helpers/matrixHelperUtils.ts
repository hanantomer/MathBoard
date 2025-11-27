import {
  //lineColor,
  htmlColor,
  selectionColor,
  getDefaultFontSize,
  defaultdCellStroke,
} from "common/globals";

import { useCellStore } from "../store/pinia/cellStore";
import { useNotationStore } from "../store/pinia/notationStore";
import {
  MultiCellAttributes,
  NotationAttributes,
  PointNotationAttributes,
  RectNotationAttributes,
  SqrtNotationAttributes,
} from "common/baseTypes";

import useMatrixCellHelper from "./matrixCellHelper";

const cellStore = useCellStore();
const notationStore = useNotationStore();
const matrixCellHelper = useMatrixCellHelper();

export default function useMatrixHelperUtils() {
  function getCol(n: NotationAttributes): number {
    switch (n.notationType) {
      case "EXPONENT":
      case "LOGBASE":
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
      case "SQRT": {
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
      case "LOGBASE":
      case "EXPONENT":
      case "SIGN":
      case "SYMBOL": {
        const n1 = n as PointNotationAttributes;
        if (n1.row == undefined || n1.col == undefined) return;
        const cell = { col: n1.col, row: n1.row };
        matrixCellHelper.colorizeCell(cell, n.color?.value);
        break;
      }
    }
  }
  function getColor(n: NotationAttributes) {
    switch (n.notationType) {
      case "ANNOTATION":
      case "EXPONENT":
      case "LOGBASE":
      case "SIGN":
      case "SYMBOL": // color is applied to the cell
        return n.selected ? selectionColor : htmlColor;
      case "CURVE":
      case "LINE":
      case "DIVISIONLINE":
      case "IMAGE":
      case "TEXT":
      case "CIRCLE":
      case "SQRT":
      case "SQRTSYMBOL":
        return n.selected ? selectionColor : n.color?.value ?? htmlColor;
    }
  }

  function symbolAdjecentToFraction(
    notation: PointNotationAttributes,
  ): boolean {
    const maxLineDistance = 1;

    //    if (notationStore.isSymbolPartOfFraction(notation)) {
    //      return false;
    //    }

    if (notationStore.isSymbolAdjecentToLine(notation, maxLineDistance)) {
      return true;
    }

    return false;
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
    symbolAdjecentToFraction,
  };
}
