import {
  NotationAttributes,
  PointNotationAttributes,
  LineNotationAttributes,
  RectNotationAttributes,
} from "common/baseTypes";

import useDbHelper from "./dbHelper";
import { useNotationStore } from "../store/pinia/notationStore";
import { BoardType, NotationType, NotationTypeValues } from "common/unions";

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
    boardType: BoardType | undefined,
    notationType: NotationType,
    parentUUId: string,
  ): Promise<NotationAttributes[]> {
    if (!boardType) boardType = notationStore.getParent().type;
    switch (notationType) {
      case "SYMBOL":
      case "SIGN":
      case "FRACTION":
      case "SQRT":
        return await dbHelper.getNotations<LineNotationAttributes>(
          notationType,
          boardType,
          parentUUId,
        );
      case "EXPONENT":
      case "GEO":
      case "IMAGE":
      case "TEXT":
        return await dbHelper.getNotations<RectNotationAttributes>(
          notationType,
          boardType,
          parentUUId,
        );
      default:
        return [];
    }
  }

  return {
    loadNotations,
  };
}
