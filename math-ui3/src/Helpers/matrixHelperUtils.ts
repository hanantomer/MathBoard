import { NotationTypeShape } from "common/unions";
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
    switch (NotationTypeShape.get(n.notationType)) {
      case "POINT": {
        return (n as PointNotationAttributes).col;
      }
      case "HORIZONTAL_LINE": {
        return (n as HorizontalLineNotationAttributes).fromCol;
      }
      case "VERTICAL_LINE": {
        return (n as VerticalLineNotationAttributes).col;
      }
      case "SLOPE_LINE": {
        return (n as SlopeLineNotationAttributes).fromCol;
      }
      case "RECT": {
        return (n as RectNotationAttributes).fromCol;
      }
    }
    throw new Error("invlid notation type:" + n.notationType);
  }

  function getRow(n: NotationAttributes) : number {
    switch (NotationTypeShape.get(n.notationType)) {
      case "POINT":
      case "HORIZONTAL_LINE": {
        return (n as HorizontalLineNotationAttributes).row;
      }
      case "VERTICAL_LINE": {
        return (n as VerticalLineNotationAttributes).fromRow;
      }
      case "SLOPE_LINE": {
        return (n as SlopeLineNotationAttributes).fromRow;
      }
      case "RECT": {
        return (n as RectNotationAttributes).fromRow;
      }
    }
    throw new Error("invalid notation type:+" + n.notationType)
  }

  function getNotationXposByCol(col: number): number {
    return col * (cellStore.getCellHorizontalWidth() + 1);
  }

  function getNotationYposByRow(row: number): number {
    return row * (cellStore.getCellVerticalHeight() + cellSpace);
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
