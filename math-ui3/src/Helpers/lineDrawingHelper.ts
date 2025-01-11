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

  function modifyLine(e: MouseEvent, modifyLine: (p: DotCoordinates) => void) {
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

  function selectLine(
    selectedNotation: NotationAttributes,
    selectLine: (notation: NotationAttributes) => void,
  ) {
    hideMatrixLine(selectedNotation.uuid);
    notationStore.selectNotation(selectedNotation.uuid);
    selectLine(selectedNotation);
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

  function resetDrawing() {
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
    endDrawing,
  };
}
