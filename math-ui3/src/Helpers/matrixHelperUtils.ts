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

import { useNotationStore } from "../store/pinia/notationStore";
import { cellSpace } from "common/globals";
import {
  NotationAttributes,
  PointNotationAttributes,
  RectNotationAttributes,
} from "common/baseTypes";

const notationStore = useNotationStore();
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
    return col * (notationStore.getCellHorizontalWidth() + 1);
  }

  function getNotationYposByRow(row: number): number {
    return row * (notationStore.getCellVerticalHeight() + cellSpace);
  }

  function removeNotations(exit: any) {
    return exit.remove();
  }


  return {
    getRow,
    getCol,
    getDefaultFontSize,
    defaultdCellStroke,
    getNotationXposByCol,
    getNotationYposByRow,
    removeNotations
  };
}
