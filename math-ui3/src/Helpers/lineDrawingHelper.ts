import {
  NotationAttributes,
  DotCoordinates,
} from "../../../math-common/src/baseTypes";

import { useEditModeStore } from "../store/pinia/editModeStore";
import { useCellStore } from "../store/pinia/cellStore";
import { useNotationStore } from "../store/pinia/notationStore";

const editModeStore = useEditModeStore();
const cellStore = useCellStore();
const notationStore = useNotationStore();

export default function useLineDrawingHelper() {
  function setLineInitialPosition(
    e: MouseEvent,
    setLinePositionCallback: (p: DotCoordinates) => void,
  ) {
    editModeStore.setNextEditMode();

    const position = {
      x: e.pageX - cellStore.getSvgBoundingRect().x,
      y: e.pageY - cellStore.getSvgBoundingRect().y,
    };

    setLinePositionCallback(position);
  }

  function drawNewLine(
    e: MouseEvent,
    drawLineCallback: (p: DotCoordinates) => void,
  ) {
    if (e.buttons !== 1) {
      return;
    }

    const position = {
      x: e.pageX - cellStore.getSvgBoundingRect().x,
      y: e.pageY - cellStore.getSvgBoundingRect().y,
    };

    drawLineCallback(position);
  }

  function modifyLine(
    e: MouseEvent,
    modifyLineCallback: (p: DotCoordinates) => void,
  ) {
    if (e.buttons !== 1) {
      return;
    }

    const position = {
      x: e.pageX - cellStore.getSvgBoundingRect().x,
      y: e.pageY - cellStore.getSvgBoundingRect().y,
    };

    modifyLineCallback(position);
  }

  function endDrawing(endDrawingCallback: () => void) {
    if (notationStore.hasSelectedNotations()) {
      showMatrixLine();
    }
    editModeStore.setDefaultEditMode();
    endDrawingCallback();
  }

  function selectLine(
    selectedNotation: NotationAttributes,
    selectLineCallback: (notation: NotationAttributes) => void,
  ) {
    hideMatrixLine(selectedNotation.uuid);
    notationStore.selectNotation(selectedNotation.uuid);
    selectLineCallback(selectedNotation);
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

  function resetDrawing() {
    showMatrixLine();
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
