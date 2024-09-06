import { useUserStore } from "../store/pinia/userStore";
import { useEditModeStore } from "../store/pinia/editModeStore";
import { useNotationStore } from "../store/pinia/notationStore";
import { useCellStore } from "../store/pinia/cellStore";
import { cellSpace } from "common/globals";

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
const cellStore = useCellStore();

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
    const selectedCell = cellStore.getSelectedCell();
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
    if (!cellStore.getSelectedCell()) return;

    const dT = e.clipboardData; /*|| window.Clipboard*/
    const item = dT?.items[0];

    var reader = new FileReader();
    reader.addEventListener("load", () => {
      const base64data = reader.result;
      if (!base64data) return;
      let image: HTMLImageElement = new Image();
      image.src = base64data?.toString();
      image.onload = () => {
        let fromCol = cellStore.getSelectedCell()?.col;
        let fromRow = cellStore.getSelectedCell()?.row;
        if (!fromCol || !fromRow) return;
        let toCol =
          Math.ceil(image.width / cellStore.getCellHorizontalWidth()) + fromCol;
        let toRow =
          Math.ceil(image.height / cellStore.getCellVerticalHeight()) + fromRow;

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

    if (editModeStore.isExponentWritingMode()) return;

    switch (classifyKeyCode(code)) {
      case "DELETION": {
        return handleDeletionKey();
      }

      case "MOVEMENT": {
        return handleMovementKey(code);
      }

      case "DELETEANDMOVE": {
        handleDeletionKey();
        return handleMovementKey(code);
      }

      case "SYMBOL": {
        return notationMutationHelper.upsertSymbolNotation(key);
      }
    }
  }

  function handleDeletionKey() {
    notationMutationHelper.deleteSelectedNotations();

    editModeStore.setDefaultEditMode();
  }

  function handleMovementKey(key: string) {
    // handeled by keyUp in AreaSelector
    if (editModeStore.getEditMode() === "AREA_SELECTED") return;
    if (editModeStore.getEditMode() === "EXPONENT_SELECTED") return;
    if (editModeStore.getEditMode() === "EXPONENT_WRITING") return;

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

    const svgBounds = document
      .getElementById(cellStore.getSvgId()!)
      ?.getBoundingClientRect()!;

    // select a notation occupied by selected cell
    selectionHelper.selectNotationAtPosition(cellStore.getSvgId()!, {
      x:
        svgBounds.left +
        cellStore.getSelectedCell()?.col! *
          (cellStore.getCellHorizontalWidth() + cellSpace),
      y:
        svgBounds.top +
        cellStore.getSelectedCell()?.row! *
          (cellStore.getCellVerticalHeight() + cellSpace),
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

  function emitSvgMouseMove(e: MouseEvent) {
    eventBus.emit("EV_SVG_MOUSEMOVE", e);
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

  function emitSvgMouseUp(e: MouseEvent) {
    eventBus.emit("EV_SVG_MOUSEUP", e);
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
