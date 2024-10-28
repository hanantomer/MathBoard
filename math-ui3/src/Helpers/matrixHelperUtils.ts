
import {
  getDefaultFontSize,
  defaultdCellStroke,
} from "common/globals";

import {
  HorizontalLineNotationAttributes,
  SlopeLineNotationAttributes,
  VerticalLineNotationAttributes,
} from "common/baseTypes";

import { useCellStore } from "../store/pinia/cellStore";
import { cellSpace } from "common/globals";
import {
  NotationAttributes,
  PointNotationAttributes,
  RectNotationAttributes,
} from "common/baseTypes";

import  useMatrixCellHelper from "./matrixCellHelper";

const cellStore = useCellStore();
const matrixCellHelper = useMatrixCellHelper();

export default function useMatrixHelperUtils() {

  function getCol(n: NotationAttributes): number  {
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
      default:
        return 0;
    }
  }

  function getRow(n: NotationAttributes) : number {
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
      default:
        return 0;
    }
  }

  function getNotationXposByCol(col: number): number {
    return col * (cellStore.getCellHorizontalWidth() + 1);
  }

  function getNotationYposByRow(row: number): number {
    return row * (cellStore.getCellVerticalHeight());
  }

  function removeNotations(exit: any) {
    return exit.remove();
  }

  function colorizeNotationCell(n: NotationAttributes) {
    if (!n.color?.value) return;
    const n1 = n as PointNotationAttributes;
    if (!n1.row || !n1.col) return;
    const cell = { col: n1.col, row: n1.row };
    matrixCellHelper.colorizeCell(cell, n.color.value);
  }


  return {
    getRow,
    getCol,
    getDefaultFontSize,
    defaultdCellStroke,
    getNotationXposByCol,
    getNotationYposByRow,
    removeNotations,
    colorizeNotationCell,
  };
}
