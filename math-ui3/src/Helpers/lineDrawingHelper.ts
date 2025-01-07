import {
  NotationAttributes,
  SqrtNotationAttributes,
  DotCoordinates,

} from "../../../math-common/src/baseTypes";

import { LineHandleType } from "../../../math-common/src/unions";
import { useEditModeStore } from "../store/pinia/editModeStore";
import { useCellStore } from "../store/pinia/cellStore";
import { useNotationStore } from "../store/pinia/notationStore";

const editModeStore = useEditModeStore();
const cellStore = useCellStore();
const notationStore = useNotationStore();

export default function useLineDrawingHelper() {
  function setLineInitialPosition(
    e: MouseEvent,
    setLinePosition: (p: DotCoordinates) => void,
  ) {
    editModeStore.setNextEditMode();

    const position = {
      x: e.pageX - cellStore.getSvgBoundingRect().x,
      y: e.pageY - cellStore.getSvgBoundingRect().y,
    };

    setLinePosition(position);
  }

  function drawNewLine(e: MouseEvent, drawLine: (p: DotCoordinates) => void) {
    if (e.buttons !== 1) {
      return;
    }

    const position = {
      x: e.pageX - cellStore.getSvgBoundingRect().x,
      y: e.pageY - cellStore.getSvgBoundingRect().y,
    };

    drawLine(position);
  }

  function modifyLine(
    e: MouseEvent,
    modifyLine: (p: DotCoordinates) => void,
  ) {
    if (e.buttons !== 1) {
      return;
    }

    const position = {
      x: e.pageX - cellStore.getSvgBoundingRect().x,
      y: e.pageY - cellStore.getSvgBoundingRect().y,
    };

    modifyLine(position);
  }

  function endDrawing(endDrawing: () => void) {
    if (notationStore.hasSelectedNotations()) {
      showMatrixLine();
    }

    endDrawing();
  }


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
    setLineInitialPosition,
    drawNewLine,
    selectLine,
    showMatrixLine,
    resetDrawing,
    modifyLine,
    endDrawing
  };
}
