import { useUserStore } from "../store/pinia/userStore";
import { useNotationStore } from "../store/pinia/notationStore";
import { watch } from "vue";

import useMatrixHelper from "./matrixHelper";
import useNotationMutationHelper from "./notationMutateHelper";
import useAuthHelper from "./authHelper";
import useEventBus from "../helpers/eventBusHelper";

const userStore = useUserStore();
const notationStore = useNotationStore();
const matrixHelper = useMatrixHelper();
const notationMutationHelper = useNotationMutationHelper();
const authHelper = useAuthHelper();
const eventBus = useEventBus();

export default function eventHelper() {
  async function paste(e: ClipboardEvent) {
    // disallow adding image by student
    if (!userStore.isTeacher) return;

    const dT = e.clipboardData; /*|| window.Clipboard*/
    const item = dT?.items[0];

    var reader = new FileReader();
    var that = this;
    reader.addEventListener("load", () => {
      const base64data = reader.result;

      let image: any = new Image();
      image.src = base64data;
      image.onload = () => {
        if (!base64data) return;
        let fromCol = parseInt(that.getSelectedCell().col);
        let fromRow = parseInt(that.getSelectedCell().row);
        let toCol =
          Math.ceil(image.width / matrixHelper.getRectSize()) + fromCol;
        let toRow =
          Math.ceil(image.height / matrixHelper.getRectSize()) + fromRow;
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

  function keyUp(e: KeyboardEvent) {
    const { ctrlKey, altKey, code, key } = e;

    if (notationStore.getEditMode() !== "SYMBOL") {
      return;
    }

    if (ctrlKey || altKey) {
      return;
    }

    if (
      !(
        code.startsWith("Digit") ||
        code.startsWith("Key") ||
        code.startsWith("Numpad") ||
        code === "Minus" ||
        code === "Delete" ||
        code === "Backspace" ||
        code === "Plus" ||
        code === "Equal" ||
        code === "Period" ||
        code === "ArrowLeft" ||
        code === "ArrowRight" ||
        code === "ArrowUp" ||
        code === "ArrowDown" ||
        code === "Space"
      )
    ) {
      return;
    }

    if (code === "Backspace") {
      notationMutationHelper.removeSelectedNotations();
      matrixHelper.setNextRect(-1, 0);
      return;
    }

    if (code === "Delete") {
      notationMutationHelper.removeSelectedNotations();
      return;
    }

    if (code === "ArrowLeft") {
      matrixHelper.setNextRect(-1, 0);
      return;
    }

    if (code === "ArrowRight" || code === "Space") {
      matrixHelper.setNextRect(1, 0);
      return;
    }

    if (code === "ArrowUp") {
      matrixHelper.setNextRect(0, -1);
      return;
    }

    if (code === "ArrowDown") {
      matrixHelper.setNextRect(0, 1);
      return;
    }

    if (code === "Enter") {
      matrixHelper.setNextRect(0, -1);
      return;
    }

    if (!authHelper.canEdit) {
      return;
    }

    notationMutationHelper.addSymbolNotation(key);
  }

  function mouseDown(e: MouseEvent) {
    if (
      notationStore.getEditMode() === "FRACTION" ||
      notationStore.getEditMode() === "SQRT" ||
      notationStore.getEditMode() === "SELECT"
    ) {
      return;
    }

    if (
      notationStore.getEditMode() === "CHECKMARK" ||
      notationStore.getEditMode() === "SEMICHECKMARK" ||
      notationStore.getEditMode() === "XMARK"
    ) {
      notationMutationHelper.addMarkNotation();
      return;
    }
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
    mouseDown,
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
