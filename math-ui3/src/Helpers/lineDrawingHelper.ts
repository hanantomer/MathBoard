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
  let hiddenNotationUUID: string | null = null;

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

  function moveLine(
    e: KeyboardEvent,
    moveLineCallback: (moveX: number, moveY: number) => void,
  ) {
    let moveX = 0;
    let moveY = 0;
    switch (e.key) {
      case "ArrowUp":
        moveY = -1;
        break;
      case "ArrowDown":
        moveY = 1;
        break;
      case "ArrowLeft":
        moveX = -1;
        break;
      case "ArrowRight":
        moveX = 1;
        break;
      default:
        return;
    }
    if (moveX !== 0 || moveY !== 0) {
      moveLineCallback(moveX, moveY);
    }
  }

  function endDrawing(endDrawingCallback: () => void) {
    if (notationStore.hasSelectedNotations()) {
      showMatrixLine();
    }
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
    hiddenNotationUUID = uuid;
    (document.getElementById(uuid) as HTMLElement).style.display = "none";
  }

  function showMatrixLine() {
    if (hiddenNotationUUID !== null) {
      (
        document.getElementById(hiddenNotationUUID) as HTMLElement
      ).style.display = "block";
      hiddenNotationUUID = null;
    }
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
    moveLine,
    endDrawing,
  };
}
