import { NotationAttributes, DotCoordinates } from "common/baseTypes";

import { sqrtSymbolSuffix } from "common/globals";

import { useEditModeStore } from "../store/pinia/editModeStore";
import { useCellStore } from "../store/pinia/cellStore";
import { useNotationStore } from "../store/pinia/notationStore";

const editModeStore = useEditModeStore();
const cellStore = useCellStore();
const notationStore = useNotationStore();

export default function useShapeDrawingHelper() {
  let hiddenNotationUUID: string | null = null;

  function setLineInitialPosition(
    e: MouseEvent,
    setLinePositionCallback: (p: DotCoordinates) => void,
  ) {
    // advance from a "*_STARTED" state to corresponding drawing state
    const current = editModeStore.getEditMode();
    switch (current) {
      case "POLYGON_STARTED":
        editModeStore.setEditMode("POLYGON_DRAWING");
        break;
      case "LINE_STARTED":
        editModeStore.setEditMode("LINE_DRAWING");
        break;
      case "DIVISIONLINE_STARTED":
        editModeStore.setEditMode("DIVISIONLINE_DRAWING");
        break;
      case "CURVE_STARTED":
        editModeStore.setEditMode("CURVE_DRAWING");
        break;
      case "CIRCLE_STARTED":
        editModeStore.setEditMode("CIRCLE_DRAWING");
        break;
      case "SQRT_STARTED":
        editModeStore.setEditMode("SQRT_DRAWING");
        break;
      default:
        editModeStore.setDefaultEditMode();
    }

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

    if (editModeStore.isPolygonDrawingMode()) return;

    if (editModeStore.isFreeSketchDrawingMode()) {
      editModeStore.setDefaultEditMode();
      return;
    }
    notationStore.selectNotation(uuid);
    //if (uuid) {
    //  hideMatrixLine(uuid); // dont show created line yet since we back to edit mode
    //}
    // determine next mode based on current state
    const current = editModeStore.getEditMode();
    switch (current) {
      case "LINE_DRAWING":
      case "LINE_EDITING_LEFT":
      case "LINE_EDITING_RIGHT":
        editModeStore.setEditMode("LINE_SELECTED");
        break;
      case "DIVISIONLINE_DRAWING":
      case "DIVISIONLINE_EDITING_LEFT":
      case "DIVISIONLINE_EDITING_RIGHT":
        editModeStore.setEditMode("DIVISIONLINE_SELECTED");
        break;
      case "CURVE_DRAWING":
      case "CURVE_EDITING_LEFT":
      case "CURVE_EDITING_RIGHT":
      case "CURVE_EDITING_CONTROLֹ_POINT":
        editModeStore.setEditMode("CURVE_SELECTED");
        break;
      case "CIRCLE_DRAWING":
      case "CIRCLE_EDITING":
        editModeStore.setEditMode("CIRCLE_SELECTED");
        break;
      case "SQRT_DRAWING":
      case "SQRT_EDITING":
        editModeStore.setEditMode("SQRT_SELECTED");
        break;
      default:
        editModeStore.setDefaultEditMode();
    }
  }

  function selectLine(
    selectedNotation: NotationAttributes,
    selectLineCallback: (notation: NotationAttributes) => void,
  ) {
    notationStore.selectNotation(selectedNotation.uuid);
    selectLineCallback(selectedNotation);
    hideMatrixLine(selectedNotation.uuid);
  }

  function hideMatrixLine(uuid: string) {
    setTimeout(() => {
      hiddenNotationUUID = uuid;
      (document.getElementById(uuid) as HTMLElement).style.display = "none";

      if (document.getElementById(uuid + sqrtSymbolSuffix)) {
        (
          document.getElementById(uuid + sqrtSymbolSuffix) as HTMLElement
        ).style.display = "none"; // for sqrt symbol, see matrixHelper.ts
      }
    }, 100);
  }

  function showMatrixLine() {
    if (hiddenNotationUUID !== null) {
      (
        document.getElementById(hiddenNotationUUID) as HTMLElement
      ).style.display = "block";

      if (document.getElementById(hiddenNotationUUID + sqrtSymbolSuffix)) {
        (
          document.getElementById(
            hiddenNotationUUID + sqrtSymbolSuffix,
          ) as HTMLElement
        ).style.display = "block"; // for sqrt symbol see matrixHelper.ts
      }

      hiddenNotationUUID = null;
    }
  }

  function resetDrawing() {
    setTimeout(() => {
      showMatrixLine();
      editModeStore.setDefaultEditMode();
    }, 10);
  }

  return {
    setLineInitialPosition,
    drawNewLine,
    selectLine,
    hideMatrixLine,
    showMatrixLine,
    resetDrawing,
    modifyLine,
    moveLine,
    saveDrawing,
  };
}
