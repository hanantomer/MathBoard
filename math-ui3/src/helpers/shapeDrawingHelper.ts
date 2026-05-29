import { NotationAttributes, DotCoordinates } from "common/baseTypes";

import { sqrtSymbolSuffix } from "common/globals";

import { useEditModeStore } from "../store/pinia/editModeStore";
import { useCellStore } from "../store/pinia/cellStore";
import { useNotationStore } from "../store/pinia/notationStore";
import useAuthorizationHelper from "./authorizationHelper";

const editModeStore = useEditModeStore();
const cellStore = useCellStore();
const notationStore = useNotationStore();

function canEditShapes(): boolean {
  if (notationStore.getParent().type !== "LESSON") {
    return true;
  }
  return useAuthorizationHelper().canEdit();
}

/**
 * Touch pointer-moves usually have `buttons === 0` while dragging (unlike mouse).
 * Pen can report pressure without the left-button bit on some devices.
 */
function isPointerDragActive(e: PointerEvent): boolean {
  if (e.pointerType === "touch") {
    return e.isPrimary;
  }
  if (e.pointerType === "pen") {
    return (e.buttons & 1) !== 0 || e.pressure > 0;
  }
  return (e.buttons & 1) !== 0;
}

export default function useShapeDrawingHelper() {
  let hiddenNotationUUID: string | null = null;

  function setLineInitialPosition(
    e: PointerEvent | TouchEvent,
    setLinePositionCallback: (p: DotCoordinates) => void,
  ) {
    if (!canEditShapes()) return;

    // if (!("touches" in e)) {
    //   const selectionHelper = useSelectionHelper();
    //   if (selectionHelper.trySelectNotationAtPointer(e)) {
    //     return;
    //   }
    // }

    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
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
      case "FREE_SKETCH_STARTED":
        editModeStore.setEditMode("FREE_SKETCH_DRAWING");
        break;
      default:
        editModeStore.setDefaultEditMode();
    }

    const rect = cellStore.getSvgBoundingRect();
    const position = {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };

    setLinePositionCallback(position);
  }

  function drawNewLine(
    e: PointerEvent | TouchEvent,
    drawLineCallback: (p: DotCoordinates) => void,
  ) {
    if (!canEditShapes()) return;

    let clientX: number;
    let clientY: number;

    if ("touches" in e) {
      if (e.touches.length !== 1) {
        return;
      }
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      if (!isPointerDragActive(e)) {
        return;
      }
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const rect = cellStore.getSvgBoundingRect();
    const position = {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };

    drawLineCallback(position);
  }

  function modifyLine(
    e: PointerEvent,
    modifyLineCallback: (p: DotCoordinates) => void,
  ) {
    if (!canEditShapes()) return;

    if (!isPointerDragActive(e)) {
      return;
    }

    const rect = cellStore.getSvgBoundingRect();
    const position = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    modifyLineCallback(position);
  }

  function moveLine(
    e: KeyboardEvent,
    moveLineCallback: (moveX: number, moveY: number) => void,
  ) {
    if (!canEditShapes()) return;

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

  async function saveDrawing(saveDrawingCallback: () => Promise<string>) {
    if (!canEditShapes()) return;

    await saveDrawingCallback();

    if (editModeStore.isPolygonDrawingMode()) return;

    const current = editModeStore.getEditMode();
    switch (current) {
      case "LINE_DRAWING":
        editModeStore.setEditMode("LINE_STARTED");
        break;
      case "LINE_EDITING_LEFT":
      case "LINE_EDITING_RIGHT":
        editModeStore.setEditMode("LINE_SELECTED");
        break;
      case "DIVISIONLINE_DRAWING":
        editModeStore.setEditMode("DIVISIONLINE_SELECTED");
        break;
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
      case "FREE_SKETCH_DRAWING":
        editModeStore.setEditMode("FREE_SKETCH_STARTED");
        break;
      default:
        editModeStore.setDefaultEditMode();
    }
  }

  function selectLine(
    selectedNotation: NotationAttributes,
    selectLineCallback: (notation: NotationAttributes) => void,
  ) {
    if (!canEditShapes()) return;

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
