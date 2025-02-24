import {
  NotationAttributes,
  PointNotationAttributes,
  RectNotationAttributes,
  CurveNotationAttributes,
  HorizontalLineNotationAttributes,
  VerticalLineNotationAttributes,
  SlopeLineNotationAttributes,
} from "common/baseTypes";

import useDbHelper from "./dbHelper";
import { useNotationStore } from "../store/pinia/notationStore";
import { BoardType, NotationType,  NotationTypeValues } from "common/unions";

const notationStore = useNotationStore();
const dbHelper = useDbHelper();

export default function notationLoadingHelper() {
  // e.g get lesson notations
  async function loadNotations(boardType: BoardType, parentUUId: string) {

    let notations: NotationAttributes[] = [];

    for (let i = 0; i < NotationTypeValues.length; i++) {
      const notationType = NotationTypeValues[i];
      let notationsFromDb = await loadNotationsByType(
        boardType,
        notationType as NotationType,
        parentUUId,
      );
      if (!notationsFromDb) continue;
      notationsFromDb.forEach((n) => {
        notations.push({
          ...n,
          notationType: notationType as NotationType,
        });
      });
    }

    notationStore.setNotations(notations);
  }

  // e.g. load lesson symbols
  async function loadNotationsByType(
    boardType: BoardType,
    notationType: NotationType,
    parentUUId: string,
  ): Promise<NotationAttributes[]> {

    if (!boardType) boardType = notationStore.getParent().type;

    switch (notationType) {
      case "EXPONENT":
      case "ANNOTATION":
      case "SIGN":
      case "SQRTSYMBOL":
      case "SYMBOL":
        return await dbHelper.getNotations<PointNotationAttributes>(
          notationType,
          boardType,
          parentUUId,
        );
      case "SQRT":
      case "HORIZONTALLINE":
        return await dbHelper.getNotations<HorizontalLineNotationAttributes>(
          notationType,
          boardType,
          parentUUId,
        );
      case "VERTICALLINE":
        return await dbHelper.getNotations<VerticalLineNotationAttributes>(
          notationType,
          boardType,
          parentUUId,
        );
      case "SLOPELINE":
        return await dbHelper.getNotations<SlopeLineNotationAttributes>(
          notationType,
          boardType,
          parentUUId,
        );
      case "IMAGE":
      case "TEXT":
        return await dbHelper.getNotations<RectNotationAttributes>(
          notationType,
          boardType,
          parentUUId,
        );
      case "CONVEXCURVE":
      case "CONCAVECURVE":
        return await dbHelper.getNotations<CurveNotationAttributes>(
          notationType,
          boardType,
          parentUUId,
        );

      default:
        throw new Error(`${notationType} :notation type is invalid`);
    }
  }

  return {
    loadNotations,
  };
}
