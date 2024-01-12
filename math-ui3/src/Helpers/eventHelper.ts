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

type keyType = "SYMBOL" | "MOVEMENT" | "DELETION" | "MOVEANDDELTE";

export default function eventHelper() {
  async function copy(e: ClipboardEvent) {
    notationStore.setCopiedNotations(notationStore.getSelectedNotations());
  }

  async function paste(e: ClipboardEvent) {
    if (
      e.clipboardData?.items.length &&
      e.clipboardData?.items[0].kind === "string" &&
      e.clipboardData?.types[0].match("^text/plain")
    )
      return pasteText(e);

    if (e.clipboardData?.types[0] === "Files") return pasteImage(e);
  }

  async function pasteText(e: ClipboardEvent) {
    e.clipboardData?.items[0].getAsString((content) => {
      content.split("").forEach((c) => {
        notationMutationHelper.upsertSymbolNotation(c);
      });
    });
  }

  async function pasteImage(e: ClipboardEvent) {
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
          Math.ceil(image.width / notationStore.getCellHorizontalWidth()) +
          fromCol;
        let toRow =
          Math.ceil(image.height / notationStore.getCellVerticalHeight()) +
          fromRow;

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

      case "MOVEANDDELTE": {
        handleMovementKey(code, svgId);
        return handleDeletionKey(code);
      }

      case "SYMBOL": {
        return notationMutationHelper.upsertSymbolNotation(key);
      }
    }
  }

  function handleDeletionKey(key: string) {
    //if (key === "Backspace") {
    //  matrixHelper.setNextCell(-1, 0);
    //}

    notationMutationHelper.deleteSelectedNotations();

    editModeStore.resetEditMode();
  }

  function handleMovementKey(key: string, svgId: string) {
    if (key === "ArrowLeft" || key === "Backspace") {
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
        notationStore.getSelectedCell()?.col! *
          notationStore.getCellHorizontalWidth(),
      y:
        svgBounds.left +
        notationStore.getSelectedCell()?.row! *
          notationStore.getCellVerticalHeight(),
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
      code === "Slash" ||
      code === "Backslash" ||
      code === "Period"
    )
      return "SYMBOL";

    if (code === "Delete") return "DELETION";

    if (code === "Backspace") return "MOVEANDDELTE";

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

  function emitCopy(e: ClipboardEvent) {
    eventBus.emit("copy");
  }

  function registerCopy() {
    document.addEventListener("copy", emitCopy);
  }

  function unregisterCopy() {
    document.removeEventListener("copy", emitCopy);
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
    copy,
    paste,
    keyUp,
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
    registerCopy,
    unregisterCopy,
  };
}
