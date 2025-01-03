import {
  NotationAttributes,
  SqrtNotationAttributes,
} from "../../../math-common/src/baseTypes";

import { useEditModeStore } from "../store/pinia/editModeStore";
import { useCellStore } from "../store/pinia/cellStore";
import { useNotationStore } from "../store/pinia/notationStore";

const editModeStore = useEditModeStore();
const cellStore = useCellStore();
const notationStore = useNotationStore();

export default function useLineDrawingHelper() {
  function selectLine(lineNotation: NotationAttributes, linePosition: any) {
    hideMatrixLine(lineNotation.uuid);
    notationStore.selectNotation(lineNotation.uuid);

    if (lineNotation.notationType === "HORIZONTALLINE") {
      Object.assign(linePosition, lineNotation);
    }

    if (lineNotation.notationType === "SQRT") {
      linePosition.p1x =
        (lineNotation as SqrtNotationAttributes).fromCol *
        cellStore.getCellHorizontalWidth();

      linePosition.p2x =
        (lineNotation as SqrtNotationAttributes).toCol *
        cellStore.getCellHorizontalWidth();

      linePosition.py =
        (lineNotation as SqrtNotationAttributes).row *
        cellStore.getCellVerticalHeight();
    }
  }

  function hideMatrixLine(uuid: string) {
    (document.getElementById(uuid) as HTMLElement).style.display = "none";
  }

  function showMatrixLine() {
    if (notationStore.getSelectedNotations().length > 0)
      (
        document.getElementById(
          notationStore.getSelectedNotations()!.at(0)!.uuid,
        ) as HTMLElement
      ).style.display = "block";
  }

  function getNearestRow(clickedYPos: number) {
    let clickedRow = Math.round(
      clickedYPos / cellStore.getCellVerticalHeight(),
    );
    return clickedRow * cellStore.getCellVerticalHeight();
  }

  function getNearestCol(clickedXPos: number) {
    let clickedCol = Math.round(
      clickedXPos / cellStore.getCellHorizontalWidth(),
    );
    return clickedCol * cellStore.getCellHorizontalWidth();
  }

  function resetDrawing(linePosition: any) {
    // set line position coordinates to 0
    let key: keyof typeof linePosition;
    for (key in linePosition) {
      linePosition[key] = 0;
    }
    notationStore.resetSelectedNotations();
    editModeStore.setDefaultEditMode();
  }

  return {
    selectLine,
    showMatrixLine,
    resetDrawing,
  };
}
