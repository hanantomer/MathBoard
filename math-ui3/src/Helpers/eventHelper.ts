import { useUserStore } from "../store/pinia/userStore";
import { useEditModeStore } from "../store/pinia/editModeStore";
import { useNotationStore } from "../store/pinia/notationStore";
import { cellSpace } from "common/globals";

import useMatrixHelper from "./matrixHelper";
import useMatrixCellHelper from "./matrixCellHelper";
import useNotationMutationHelper from "./notationMutateHelper";
import useAuthorizationHelper from "./authorizationHelper";
import useEventBus from "../helpers/eventBusHelper";
import useSelectionHelper from "./selectionHelper";
import {
  NotationAttributes,
  PointNotationAttributes,
  RectNotationAttributes,
  HorizontalLineNotationAttributes,
  VerticalLineNotationAttributes,
  SlopeLineNotationAttributes,
} from "common/baseTypes";
import { NotationTypeShape } from "common/unions";

const userStore = useUserStore();
const editModeStore = useEditModeStore();
const notationStore = useNotationStore();
const matrixHelper = useMatrixHelper();
const matrixCellHelper = useMatrixCellHelper();
const notationMutationHelper = useNotationMutationHelper();
const authorizationHelper = useAuthorizationHelper();
const eventBus = useEventBus();
const selectionHelper = useSelectionHelper();

type keyType = "SYMBOL" | "MOVEMENT" | "DELETION" | "DELETEANDMOVE";

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
    const selectedCell = notationStore.getSelectedCell();
    if (!selectedCell) return;

    let firstRow: number | null = null;
    let firstCol: number | null = null;

    notationStore.getCopiedNotations().forEach((n: NotationAttributes) => {
      switch (NotationTypeShape.get(n.notationType)) {
        case "POINT": {
          let n1 = { ...n } as PointNotationAttributes;
          if (!firstRow) firstRow = n1.row;
          if (!firstCol) firstCol = n1.col;

          n1.col = selectedCell.col + n1.col - firstCol;
          n1.row = selectedCell.row + n1.row - firstRow;
          notationMutationHelper.cloneNotation(n1);
          break;
        }

        case "HORIZONTAL_LINE": {
          let n1 = { ...n } as HorizontalLineNotationAttributes;
          const lineWidth = n1.toCol - n1.fromCol;
          if (!firstCol) firstCol = n1.fromCol;
          n1.fromCol = selectedCell.col + n1.fromCol - firstCol;
          n1.toCol = n1.fromCol + lineWidth;
          n1.row = selectedCell.row + n1.row;

          notationMutationHelper.cloneNotation(n1);

          break;
        }

        case "VERTICAL_LINE": {
          let n1 = { ...n } as VerticalLineNotationAttributes;
          if (!firstRow) firstRow = n1.fromRow;
          const lineHeight = n1.toRow - n1.fromRow;
          n1.col = selectedCell.col;
          n1.fromRow = selectedCell.row + n1.fromRow - firstRow;
          n1.toRow = n1.fromRow + lineHeight;

          notationMutationHelper.cloneNotation(n1);

          break;
        }

        case "SLOPE_LINE": {
          let n1 = { ...n } as SlopeLineNotationAttributes;
          if (!firstCol) firstCol = n1.fromCol;
          if (!firstRow) firstRow = n1.fromRow;
          const lineWidth = n1.toCol - n1.fromCol;
          const lineHeight = n1.toRow - n1.fromRow;
          n1.fromCol = selectedCell.col;
          n1.toCol = selectedCell.col + lineWidth;
          n1.fromRow = selectedCell.row + n1.fromRow - firstRow;
          n1.toRow = n1.fromRow + lineHeight;

          notationMutationHelper.cloneNotation(n1);

          break;
        }

        case "RECT": {
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
      }
    });

    notationStore.clearCopiedNotations();
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

    if (editModeStore.isTextWritingMode()) return;

    switch (classifyKeyCode(code)) {
      case "DELETION": {
        return handleDeletionKey(code);
      }

      case "MOVEMENT": {
        return handleMovementKey(code, svgId);
      }

      case "DELETEANDMOVE": {
        handleDeletionKey(code);
        return handleMovementKey(code, svgId);
      }

      case "SYMBOL": {
        return notationMutationHelper.upsertSymbolNotation(key);
      }
    }
  }

  function handleDeletionKey(key: string) {
    notationMutationHelper.deleteSelectedNotations();

    editModeStore.setDefaultEditMode();
  }

  function handleMovementKey(key: string, svgId: string) {
    // handeled by keyUp in AreaSelector
    if (editModeStore.getEditMode() === "AREA_SELECTED") return;

    if (key === "ArrowLeft" || key === "Backspace") {
      matrixCellHelper.setNextCell(-1, 0);
    }

    if (key === "ArrowRight" || key === "Space") {
      matrixCellHelper.setNextCell(1, 0);
    }

    if (key === "ArrowUp") {
      matrixCellHelper.setNextCell(0, -1);
    }

    if (key === "ArrowDown") {
      matrixCellHelper.setNextCell(0, 1);
    }

    if (key === "Enter") {
      matrixCellHelper.setNextCell(0, -1);
    }

    const svgBounds = document.getElementById(svgId)?.getBoundingClientRect()!;

    // select a notation occupied by selected cell
    selectionHelper.selectNotationAtPosition(svgId, {
      x:
        svgBounds.left +
        notationStore.getSelectedCell()?.col! *
          (notationStore.getCellHorizontalWidth() + cellSpace),
      y:
        svgBounds.left +
        notationStore.getSelectedCell()?.row! *
          (notationStore.getCellVerticalHeight() + cellSpace),
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

    if (code === "Backspace") return "DELETEANDMOVE";

    return null;
  }

  function emitSvgMouseDown(e: MouseEvent) {
    eventBus.emit("SVG_MOUSEDOWN", e);
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
    eventBus.emit("SVG_MOUSEMOVE", e);
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
    eventBus.emit("SVG_MOUSEUP", e);
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
    eventBus.emit("KEYUP", key);
  }

  function registerKeyUp() {
    window.addEventListener("keyup", emitKeyUp);
  }

  function unregisterKeyUp() {
    window.removeEventListener("keyup", emitKeyUp);
  }

  function emitCopy() {
    eventBus.emit("COPY", null);
  }

  function registerCopy() {
    document.addEventListener("copy", emitCopy);
  }

  function unregisterCopy() {
    document.removeEventListener("copy", emitCopy);
  }

  function emitPaste(e: ClipboardEvent) {
    eventBus.emit("PASTE", e);
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
