import {
  NotationAttributes,
  DotCoordinates,
} from "../../../math-common/src/baseTypes";

import { useEditModeStore } from "../store/pinia/editModeStore";
import { useCellStore } from "../store/pinia/cellStore";
import { useNotationStore } from "../store/pinia/notationStore";
import useSelectionHelper from "./selectionHelper";

const editModeStore = useEditModeStore();
const cellStore = useCellStore();
const notationStore = useNotationStore();
const selectionHelper = useSelectionHelper();

export default function useShapeDrawingHelper() {
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

  async function saveDrawing(
    e: MouseEvent,
    saveDrawingCallback: (e: MouseEvent) => Promise<string>,
  ) {
    const uuid = await saveDrawingCallback(e);

    if (!editModeStore.isPolygonDrawingMode()) {
      notationStore.selectNotation(uuid);
      if (uuid) {
        setTimeout(() => {
          hideMatrixLine(uuid); // dont show created line yet since we back to edit mode
        }, 1);
      }
      editModeStore.setNextEditMode();
    }
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

    if (document.getElementById(uuid + "_")) {
      (document.getElementById(uuid + "_") as HTMLElement).style.display =
        "none"; // for sqrt symbol, see matrixHelper.ts
    }
  }

  function showMatrixLine() {
    if (hiddenNotationUUID !== null) {
      (
        document.getElementById(hiddenNotationUUID) as HTMLElement
      ).style.display = "block";

      if (document.getElementById(hiddenNotationUUID + "_")) {
        (
          document.getElementById(hiddenNotationUUID + "_") as HTMLElement
        ).style.display = "block"; // for sqrt symbol see matrixHelper.ts
      }

      hiddenNotationUUID = null;
    }
  }

  function resetDrawing(e: MouseEvent | null) {
    showMatrixLine();
    notationStore.resetSelectedNotations();
    if (e) {
      selectionHelper.selectClickedPosition(e);
      return;
    }
  }

  return {
    setLineInitialPosition,
    drawNewLine,
    selectLine,
    showMatrixLine,
    resetDrawing,
    modifyLine,
    moveLine,
    saveDrawing,
  };
}
