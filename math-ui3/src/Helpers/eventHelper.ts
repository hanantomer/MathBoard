import { useUserStore } from "../store/pinia/userStore";
import { useEditModeStore } from "../store/pinia/editModeStore";
import { useNotationStore } from "../store/pinia/notationStore";
import { useCellStore } from "../store/pinia/cellStore";

import useNotationMutationHelper from "./notationMutateHelper";
import useEventBus from "../helpers/eventBusHelper";
import {
  NotationAttributes,
  PointNotationAttributes,
  RectNotationAttributes,
  HorizontalLineNotationAttributes,
  VerticalLineNotationAttributes,
  SlopeLineNotationAttributes,
  CurveNotationAttributes,
  SqrtNotationAttributes,
} from "common/baseTypes";

const userStore = useUserStore();
const notationStore = useNotationStore();
const cellStore = useCellStore();
const notationMutationHelper = useNotationMutationHelper();
const eventBus = useEventBus();

export default function eventHelper() {
  async function copy() {
    notationStore.setCopiedNotations(
      notationStore.getSelectedNotations().sort((n1: any, n2: any) => {
        return (n1.row | n1.fromRow) > (n2.row | n2.fromRow) ||
          (n1.col | n1.fromCol) > (n2.col | n2.fromCol)
          ? 1
          : -1;
      }),
    );
  }

  async function paste(e: ClipboardEvent) {
    if (notationStore.getCopiedNotations().length) {
      return pasteNotations();
    }

    if (
      e.clipboardData?.items.length &&
      e.clipboardData?.items[0].kind === "string" &&
      e.clipboardData?.types[0].match("^text/plain")
    )
      return pasteText(e);

    if (e.clipboardData?.types[0] === "Files") return pasteImage(e);
  }

  async function pasteNotations() {
    const selectedCell = cellStore.getSelectedCell();
    if (!selectedCell) return;

    let firstRow: number | null = null;
    let firstCol: number | null = null;

    notationStore.getCopiedNotations().forEach((n: NotationAttributes) => {
      switch (n.notationType) {
        case "SYMBOL":
        case "SIGN":
        case "SQRTSYMBOL":
        case "EXPONENT":
        case "ANNOTATION": {
          const n1 = n as PointNotationAttributes;
          if (!firstRow) firstRow = n1.row;
          if (!firstCol) firstCol = n1.col;

          n1.col = selectedCell.col + n1.col - firstCol;
          n1.row = selectedCell.row + n1.row - firstRow;
          notationMutationHelper.cloneNotation(n1);
          break;
        }

        case "HORIZONTALLINE": {
          let n1 = { ...n } as HorizontalLineNotationAttributes;
          const lineWidth = n1.p2x - n1.p1x;
          n1.p1x = selectedCell.col * cellStore.getCellHorizontalWidth();
          n1.p2x = n1.p1x + lineWidth;
          n1.py = selectedCell.row * cellStore.getCellVerticalHeight();
          notationMutationHelper.cloneNotation(n1);
          break;
        }

        case "SQRT": {
          let n1 = { ...n } as SqrtNotationAttributes;
          const numCols = n1.toCol - n1.fromCol;
          n1.fromCol = selectedCell.col;
          n1.toCol = n1.fromCol + numCols;
          n1.row = selectedCell.row;
          notationMutationHelper.cloneNotation(n1);
          break;
        }

        case "VERTICALLINE": {
          let n1 = { ...n } as VerticalLineNotationAttributes;
          const lineHeight = n1.p2y - n1.p1y;
          n1.p1y = selectedCell.row * cellStore.getCellVerticalHeight();
          n1.p2y = n1.p1y + lineHeight;
          n1.px = selectedCell.col * cellStore.getCellHorizontalWidth();
          notationMutationHelper.cloneNotation(n1);
          break;
        }

        case "SLOPELINE": {
          let n1 = { ...n } as SlopeLineNotationAttributes;
          const lineWidth = n1.p2x - n1.p1x;
          const lineHeight = n1.p2y - n1.p1y;
          n1.p1x = selectedCell.col * cellStore.getCellHorizontalWidth();
          n1.p2x = n1.p1x + lineWidth;
          n1.p1y = selectedCell.row * cellStore.getCellVerticalHeight();
          n1.p2y = n1.p1y + lineHeight;
          notationMutationHelper.cloneNotation(n1);
          break;
        }

        case "IMAGE":
        case "TEXT": {
          let n1 = { ...n } as RectNotationAttributes;
          const rectWidth = n1.toCol - n1.fromCol;
          const rectHeight = n1.toRow - n1.fromRow;
          if (!firstRow) firstRow = n1.fromRow;
          if (!firstCol) firstCol = n1.fromCol;

          n1.fromCol = selectedCell.col + n1.fromCol - firstCol;
          n1.toCol = n1.fromCol + rectWidth;
          n1.fromRow = selectedCell.row + n1.fromRow - firstRow;
          n1.toRow = n1.fromRow + rectHeight;
          notationMutationHelper.cloneNotation(n1);

          break;
        }

        case "CURVE": {
          let n1 = { ...n } as CurveNotationAttributes;

          const deltaX =
            selectedCell.col * cellStore.getCellHorizontalWidth() - n1.p1x;

          const deltaY =
            selectedCell.row * cellStore.getCellVerticalHeight() - n1.p1y;

          n1.p1x += deltaX;
          n1.p2x += deltaX;
          n1.p1y += deltaY;
          n1.p2y += deltaY;

          notationMutationHelper.cloneNotation(n1);
          break;
        }
      }
    });

    notationStore.clearCopiedNotations();
  }

  async function pasteText(e: ClipboardEvent) {
    const clipboardItems = await navigator.clipboard.read();
    if (!clipboardItems.length) return;
    if (!cellStore.getSelectedCell()) return;
    if (!userStore.isTeacher) return;
    if (clipboardItems[0].types.length === 0) return;
    if (clipboardItems[0].types[0] !== "text/plain") return;

    const initialCell = cellStore.getSelectedCell()!;
    let currentRow = initialCell.row;
    let currentCol = initialCell.col;

    let text = await navigator.clipboard.readText();
    if (!text) return;

    text.split("").forEach((c) => {
      if (c === "\n") {
        // Move to next row and reset column
        currentRow++;
        currentCol = initialCell.col;
        cellStore.setSelectedCell({ row: currentRow, col: currentCol }, false);
      } else if (c.trim().length !== 0) {
        notationMutationHelper.addSymbolNotation(c);
        // Move to next column
        currentCol++;
      }
    });
  }

  async function pasteImage(e: ClipboardEvent) {
    // disallow adding image by student
    if (!userStore.isTeacher) return;
    if (!cellStore.getSelectedCell()) return;

    try {
      window.focus();
      const clipboardItems = await navigator.clipboard.read();
      for (const clipboardItem of clipboardItems) {
        const imageTypes = clipboardItem.types.find((type) =>
          type.startsWith("image/"),
        );
        if (imageTypes) {
          const blob = await clipboardItem.getType(imageTypes);
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          const base64 = await convertBlobToBase64(blob);
          let image: HTMLImageElement = new Image();
          image.onload = () => {
            let fromCol = cellStore.getSelectedCell()?.col;
            let fromRow = cellStore.getSelectedCell()?.row;
            if (!fromCol || !fromRow) return;
            let toCol =
              Math.ceil(image.width / cellStore.getCellHorizontalWidth()) +
              fromCol;
            let toRow =
              Math.ceil(image.height / cellStore.getCellVerticalHeight()) +
              fromRow;

            notationMutationHelper.addImageNotation(
              fromCol,
              toCol,
              fromRow,
              toRow,
              base64,
            );
          };
          image.src = base64.toString();
          image.onerror = () => {
            console.error("Error loading image from clipboard");
          };
        }
      }
    } catch (err: any) {
      console.error(err.name, err.message);
    }
  }

  function emitSvgMouseDown(e: MouseEvent) {
    eventBus.emit("EV_SVG_MOUSEDOWN", e);
  }

  function registerSvgMouseDown() {
    document
      ?.getElementById(cellStore.getSvgId()!)
      ?.addEventListener("mousedown", emitSvgMouseDown);
  }

  function unregisterSvgMouseDown() {
    document
      ?.getElementById(cellStore.getSvgId()!)
      ?.removeEventListener("mousedown", emitSvgMouseDown);
  }

  function registerSvgMouseMove() {
    document
      ?.getElementById(cellStore.getSvgId()!)
      ?.addEventListener("mousemove", emitSvgMouseMove);
  }

  function unregisterSvgMouseMove() {
    document
      ?.getElementById(cellStore.getSvgId()!)
      ?.removeEventListener("mousemove", emitSvgMouseMove);
  }

  function emitSvgMouseMove(e: MouseEvent) {
    eventBus.emit("EV_SVG_MOUSEMOVE", e);
  }

  function emitSvgMouseUp(e: MouseEvent) {
    eventBus.emit("EV_SVG_MOUSEUP", e);
  }

  function emitMouseUp(e: MouseEvent) {
    eventBus.emit("EV_MOUSEUP", e);
  }

  function registerSvgMouseUp() {
    document
      ?.getElementById(cellStore.getSvgId()!)
      ?.addEventListener("mouseup", emitSvgMouseUp);
  }

  function unregisterSvgMouseUp() {
    document
      ?.getElementById(cellStore.getSvgId()!)
      ?.removeEventListener("mouseup", emitSvgMouseUp);
  }

  function registerMouseUp() {
    document.addEventListener("mouseup", emitMouseUp);
  }

  function unregisterMouseUp() {
    document.removeEventListener("mouseup", emitMouseUp);
  }

  function emitKeyUp(key: KeyboardEvent) {
    eventBus.emit("EV_KEYUP", key);
  }

  function registerKeyUp() {
    window.addEventListener("keyup", emitKeyUp);
  }

  function unregisterKeyUp() {
    window.removeEventListener("keyup", emitKeyUp);
  }

  function emitCopy() {
    eventBus.emit("EV_COPY", null);
  }

  function registerCopy() {
    document.addEventListener("copy", emitCopy);
  }

  function unregisterCopy() {
    document.removeEventListener("copy", emitCopy);
  }

  function emitPaste(e: ClipboardEvent) {
    eventBus.emit("EV_PASTE", e);
  }

  function registerPaste() {
    document.addEventListener("paste", emitPaste);
  }

  function unregisterPaste() {
    document.removeEventListener("paste", emitPaste);
  }

  async function convertBlobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  return {
    copy,
    paste,
    registerSvgMouseDown,
    unregisterSvgMouseDown,
    registerSvgMouseMove,
    unregisterSvgMouseMove,
    registerMouseUp,
    unregisterMouseUp,
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
