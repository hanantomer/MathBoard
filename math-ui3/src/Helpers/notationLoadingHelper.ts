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
  async function loadNotations(boardType?: BoardType) {
    let notations: NotationAttributes[] = [];

    for (let i = 0; i < NotationTypeValues.length; i++) {
      const nt = NotationTypeValues[i];
      let notationsFromDb = await loadNotationsByType(
        boardType,
        nt as NotationType,
      );
      notationsFromDb.forEach((n) => {
        notations.push({
          ...n,
          notationType: nt as NotationType,
        });
      });
    }

    notationStore.setNotations(notations);
  }

  // e.g. load lesson symbols
  async function loadNotationsByType(
    boardType: BoardType | undefined,
    notationType: NotationType,
  ): Promise<NotationAttributes[]> {
    if (!boardType) boardType = notationStore.getParent().value.type;
    let parentUUId = notationStore.getParent().value.uuid;
    switch (notationType) {
      case "SYMBOL":
      case "SIGN":
      case "POWER":
        return await dbHelper.getNotations<PointNotationAttributes>(
          notationType,
          boardType,
          parentUUId,
        );
      case "FRACTION":
      case "SQRT":
        return await dbHelper.getNotations<LineNotationAttributes>(
          notationType,
          boardType,
          parentUUId,
        );
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
