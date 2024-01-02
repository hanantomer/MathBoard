import { useUserStore } from "../store/pinia/userStore";
import { useEditModeStore } from "../store/pinia/editModeStore";
import { useNotationStore } from "../store/pinia/notationStore";

import useMatrixHelper from "./matrixHelper";
import useNotationMutationHelper from "./notationMutateHelper";
import useAuthorizationHelper from "./authorizationHelper";
import useEventBus from "../helpers/eventBusHelper";
import useSelectionHelper from "./selectionHelper";

const userStore = useUserStore();
const editModeStore = useEditModeStore();
const notationStore = useNotationStore();
const matrixHelper = useMatrixHelper();
const notationMutationHelper = useNotationMutationHelper();
const authorizationHelper = useAuthorizationHelper();
const eventBus = useEventBus();
const selectionHelper = useSelectionHelper();

type keyType = "SYMBOL" | "MOVEMENT" | "DELETION";

export default function eventHelper() {
  async function paste(e: ClipboardEvent) {
    // disallow adding image by student
    if (!userStore.isTeacher) return;
    if (!notationStore.getSelectedCell()) return;

    const dT = e.clipboardData; /*|| window.Clipboard*/
    const item = dT?.items[0];

    var reader = new FileReader();
    reader.addEventListener("load", () => {
      const base64data = reader.result;
      if (!base64data) return;
      let image: HTMLImageElement = new Image();
      image.src = base64data?.toString();
      image.onload = () => {
        let fromCol = notationStore.getSelectedCell()?.col;
        let fromRow = notationStore.getSelectedCell()?.row;
        if (!fromCol || !fromRow) return;
        let toCol =
          Math.ceil(image.width / matrixHelper.getCellSize()) + fromCol;
        let toRow =
          Math.ceil(image.height / matrixHelper.getCellSize()) + fromRow;

        notationMutationHelper.addImageNotation(
          fromCol,
          toCol,
          fromRow,
          toRow,
          base64data.toString(),
        );
      };
    });

    reader.readAsDataURL(item?.getAsFile() as Blob);
  }

  function keyUp(e: KeyboardEvent, svgId: string) {
    const { ctrlKey, altKey, code, key } = e;
    if (ctrlKey || altKey) return;

    if (!authorizationHelper.canEdit()) return;

    if (editModeStore.isTextMode()) return;

    if (editModeStore.isExponentMode()) return;

    switch (classifyKeyCode(code)) {
      case "DELETION": {
        return handleDeletionKey(code);
      }

      case "MOVEMENT": {
        return handleMovementKey(code, svgId);
      }

      case "SYMBOL": {
        return notationMutationHelper.upsertSymbolNotation(key);
      }
    }
  }

  function handleDeletionKey(key: string) {
    //if (!editModeStore.isSelectedMode()) return;

    notationMutationHelper.deleteSelectedNotations();

    if (key === "Backspace") {
      matrixHelper.setNextCell(-1, 0);
    }

    editModeStore.resetEditMode();
  }

  function handleMovementKey(key: string, svgId: string) {

    if (key === "ArrowLeft") {
      matrixHelper.setNextCell(-1, 0);
    }

    if (key === "ArrowRight" || key === "Space") {
      matrixHelper.setNextCell(1, 0);
    }

    if (key === "ArrowUp") {
      matrixHelper.setNextCell(0, -1);
    }

    if (key === "ArrowDown") {
      matrixHelper.setNextCell(0, 1);
    }

    if (key === "Enter") {
      matrixHelper.setNextCell(0, -1);
    }

    // select a notation occupied by selected cell
    const svgBounds = document.getElementById(svgId)?.getBoundingClientRect()!;

    selectionHelper.selectClickedPosition({
      x:
        svgBounds.left +
        notationStore.getSelectedCell()?.col! * notationStore.getCellSize(),
      y:
        svgBounds.left +
        notationStore.getSelectedCell()?.row! * notationStore.getCellSize(),
    });
  }

  function classifyKeyCode(code: string): keyType | null {
    if (
      code === "ArrowLeft" ||
      code === "ArrowRight" ||
      code === "ArrowUp" ||
      code === "ArrowDown" ||
      code === "Space"
    )
      return "MOVEMENT";

    if (
      code.startsWith("Digit") ||
      code.startsWith("Key") ||
      code.startsWith("Numpad") ||
      code === "Minus" ||
      code === "Plus" ||
      code === "Equal" ||
      code === "Period"
    )
      return "SYMBOL";

    if (code === "Delete" || code === "Backspace") return "DELETION";

    return null;
  }

  function emitSvgMouseDown(e: MouseEvent) {
    eventBus.emit("svgmousedown", e);
  }

  function registerSvgMouseDown(svgId: string) {
    document
      ?.getElementById(svgId)
      ?.addEventListener("mousedown", emitSvgMouseDown);
  }

  function unregisterSvgMouseDown(svgId: string) {
    document
      ?.getElementById(svgId)
      ?.removeEventListener("mousedown", emitSvgMouseDown);
  }

  function emitSvgMouseMove(e: MouseEvent) {
    eventBus.emit("svgmousemove", e);
  }

  function registerSvgMouseMove(svgId: string) {
    document
      ?.getElementById(svgId)
      ?.addEventListener("mousemove", emitSvgMouseMove);
  }

  function unregisterSvgMouseMove(svgId: string) {
    document
      ?.getElementById(svgId)
      ?.removeEventListener("mousemove", emitSvgMouseMove);
  }

  function emitSvgMouseUp(e: MouseEvent) {
    eventBus.emit("svgmouseup", e);
  }

  function registerSvgMouseUp(svgId: string) {
    document
      ?.getElementById(svgId)
      ?.addEventListener("mouseup", emitSvgMouseUp);
  }

  function unregisterSvgMouseUp(svgId: string) {
    document
      ?.getElementById(svgId)
      ?.removeEventListener("mouseup", emitSvgMouseUp);
  }

  function emitKeyUp(key: KeyboardEvent) {
    eventBus.emit("keyup", key);
  }

  function registerKeyUp() {
    window.addEventListener("keyup", emitKeyUp);
  }

  function unregisterKeyUp() {
    window.removeEventListener("keyup", emitKeyUp);
  }

  function emitPaste(e: ClipboardEvent) {
    eventBus.emit("paste", e);
  }

  function registerPaste() {
    document.addEventListener("paste", emitPaste);
  }

  function unregisterPaste() {
    document.removeEventListener("paste", emitPaste);
  }

  return {
    paste,
    keyUp,
    //    mouseDown,
    registerSvgMouseDown,
    unregisterSvgMouseDown,
    registerSvgMouseMove,
    unregisterSvgMouseMove,
    registerSvgMouseUp,
    unregisterSvgMouseUp,
    registerKeyUp,
    unregisterKeyUp,
    registerPaste,
    unregisterPaste,
  };
}
