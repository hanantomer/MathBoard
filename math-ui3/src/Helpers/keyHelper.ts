import { useEditModeStore } from "../store/pinia/editModeStore";
import { useCellStore } from "../store/pinia/cellStore";
import useMatrixCellHelper from "../helpers/matrixCellHelper";
import useAuthorizationHelper from "../helpers/authorizationHelper";
import useNotationMutateHelper from "../helpers/notationMutateHelper";
import useSelectionHelper from "../helpers/selectionHelper";
type keyType = "SYMBOL" | "MOVEMENT" | "DELETION" | "MOVEANDDELETE" | "PUSH";

const editModeStore = useEditModeStore();
const cellStore = useCellStore();
const matrixCellHelper = useMatrixCellHelper();
const authorizationHelper = useAuthorizationHelper();
const notationMutateHelper = useNotationMutateHelper();
const selectionHelper = useSelectionHelper();

const KEY_STROKE_INTERVAL = 50; // ms
let shiftReleaseTime = 0;
let shiftReleased = false;
const delayedShiftKeys = new Set<string>([
  "1",
  "5",
  "6",
  "8",
  "9",
  "0",
  "=",
  "+",
  "<",
  ">",
  "?",
]);

export default function () {
  function keyDownHandler(e: KeyboardEvent) {
    const { key } = e;
    if (delayedShiftKeys.has(key) && shiftReleased) {
      shiftReleased = false;
    }
  }

  function keyUpHandler(e: KeyboardEvent) {
    const { ctrlKey, altKey, code, key } = e;
    if (ctrlKey || altKey) return;

    if (!authorizationHelper.canEdit()) return;

    if (code === "ShiftLeft" || code === "ShiftRight") {
      shiftReleased = true;
      shiftReleaseTime = Date.now();
      return;
    }

    let usePreviousShift = false;
    if (shiftReleased && Date.now() - shiftReleaseTime < KEY_STROKE_INTERVAL) {
      usePreviousShift = true;
      shiftReleased = false;
    }

    if (editModeStore.getEditMode() === "TEXT_WRITING") return;

    if (editModeStore.getEditMode() === "ANNOTATION_WRITING") return;

    switch (classifyKeyCode(code)) {
      case "PUSH": {
        return handlePushKey();
      }

      case "DELETION": {
        return handleDeletionKey();
      }

      case "MOVEMENT": {
        return handleMovementKey(code);
      }

      case "MOVEANDDELETE": {
        handleMovementKey(code);
        handleDeletionKey();
        return;
      }

      case "SYMBOL": {
        if (usePreviousShift) {
          if (key === "9") {
            notationMutateHelper.addSymbolNotation("(");
            return;
          }
          if (key === "0") {
            notationMutateHelper.addSymbolNotation(")");
            return;
          }
          if (key === "=") {
            notationMutateHelper.addSymbolNotation("+");
            return;
          }
        }
        return notationMutateHelper.addSymbolNotation(key);
      }
    }
  }

  function handlePushKey() {
    notationMutateHelper.handlePushKey();

    matrixCellHelper.setNextCell(0, 0);
  }

  function handleDeletionKey() {
    notationMutateHelper.handleDeleteKey();

    matrixCellHelper.setNextCell(0, 0);
  }

  function handleMovementKey(key: string) {
    if (editModeStore.getEditMode() !== "CELL_SELECTED") {
      return;
    }

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

    // select a notation occupied by selected cell
    selectionHelper.selectNotationAtPosition({
      x:
        cellStore.getSvgBoundingRect().left +
        cellStore.getSelectedCell()?.col! * cellStore.getCellHorizontalWidth(),
      y:
        cellStore.getSvgBoundingRect().top +
        cellStore.getSelectedCell()?.row! * cellStore.getCellVerticalHeight(),
    });
  }

  function classifyKeyCode(code: string): keyType | null {
    if (code === "Space") return "PUSH";

    if (
      code === "ArrowLeft" ||
      code === "ArrowRight" ||
      code === "ArrowUp" ||
      code === "ArrowDown"
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
      code === "Comma" ||
      code === "Backquote" ||
      code === "Shiftright" ||
      code === "Shifleft" ||
      code === "Semicolon" ||
      code === "Colon" ||
      code === "Backslash" ||
      code === "BracketLeft" ||
      code === "BracketRight" ||
      code === "Period"
    )
      return "SYMBOL";

    if (code === "Delete") return "DELETION";

    if (code === "Backspace") return "MOVEANDDELETE";

    return null;
  }

  return {
    keyUpHandler,
    keyDownHandler,
  };
}
