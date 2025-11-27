import {
  NotationAttributes,
  PointNotationAttributes,
  RectNotationAttributes,
  CurveNotationAttributes,
  CircleNotationAttributes,
  LineNotationAttributes,
} from "common/baseTypes";

import useApiHelper from "./apiHelper";
import { useNotationStore } from "../store/pinia/notationStore";
import { BoardType, NotationType, NotationTypeValues } from "common/unions";

const notationStore = useNotationStore();
const apiHelper = useApiHelper();

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
      case "LOGBASE":
      case "ANNOTATION":
      case "SIGN":
      case "SYMBOL":
        return await apiHelper.getNotations<PointNotationAttributes>(
          notationType,
          boardType,
          parentUUId,
        );
      case "SQRT":
      case "DIVISIONLINE":
      case "LINE":
        return await apiHelper.getNotations<LineNotationAttributes>(
          notationType,
          boardType,
          parentUUId,
        );
      case "IMAGE":
      case "TEXT":
        return await apiHelper.getNotations<RectNotationAttributes>(
          notationType,
          boardType,
          parentUUId,
        );
      case "CURVE":
        return await apiHelper.getNotations<CurveNotationAttributes>(
          notationType,
          boardType,
          parentUUId,
        );
      case "CIRCLE":
        return await apiHelper.getNotations<CircleNotationAttributes>(
          notationType,
          boardType,
          parentUUId,
        );
      case "POLYGON":
      case "SQRTSYMBOL":
        return [];

      default:
        throw new Error(`${notationType} :notation type is invalid`);
    }
  }

  return {
    loadNotations,
  };
}
