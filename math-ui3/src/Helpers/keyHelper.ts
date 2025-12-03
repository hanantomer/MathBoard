import { useEditModeStore } from "../store/pinia/editModeStore";
import { useCellStore } from "../store/pinia/cellStore";
import { useNotationStore } from "../store/pinia/notationStore";
import useMatrixCellHelper from "../helpers/matrixCellHelper";
import useAuthorizationHelper from "../helpers/authorizationHelper";
import useNotationMutateHelper from "../helpers/notationMutateHelper";
import useSelectionHelper from "../helpers/selectionHelper";
type keyType = "SYMBOL" | "MOVEMENT" | "DELETION" | "MOVEANDDELETE" | "PUSH";

const editModeStore = useEditModeStore();
const cellStore = useCellStore();
const notationStore = useNotationStore();
const matrixCellHelper = useMatrixCellHelper();
const authorizationHelper = useAuthorizationHelper();
const notationMutateHelper = useNotationMutateHelper();
const selectionHelper = useSelectionHelper();

const KEY_STROKE_INTERVAL = 50; // ms
let shiftReleaseTime = 0;
let shiftReleased = false;
let altReleaseTime = 0;
let altReleased = false;
const delayedAltKeys = new Set<string>(["x", "l"]);
const delayedShiftKeys = new Map<string, string>([
  ["1", "!"],
  ["5", "%"],
  ["2", "@"],
  ["3", "#"],
  ["4", "$"],
  ["7", "&"],
  ["6", "^"],
  ["8", "*"],
  ["9", "("],
  ["8", "*"],
  ["9", "("],
  ["0", ")"],
  ["-", "_"],
  ["0", ")"],
  ["=", "+"],
  ["[", "{"],
  ["]", "}"],
  [";", ":"],
  ["'", '"'],
  ["<", ","],
  [">", "."],
  ["/", "?"],
  [",", "<"],
  [".", ">"],
  ["/", "?"],
]);

export default function () {
  function keyDownHandler(e: KeyboardEvent) {
    const { key } = e;
    if (delayedShiftKeys.has(key) && shiftReleased) {
      shiftReleased = false;
    }

    if (e.ctrlKey && e.key === "z" && !e.shiftKey) {
      e.preventDefault();
      notationStore.undo();
    }
  }

  function keyUpHandler(e: KeyboardEvent) {
    if (
      (e.ctrlKey && e.key === "y") ||
      (e.ctrlKey && e.shiftKey && e.key === "z")
    ) {
      e.preventDefault();
      notationStore.redo();
    }

    if (e.ctrlKey && e.key === "z" && !e.shiftKey) {
      e.preventDefault();
      notationStore.undo();
    }

    const { ctrlKey, altKey, code, key } = e;

    if (!authorizationHelper.canEdit()) return;

    if (code === "ShiftLeft" || code === "ShiftRight") {
      shiftReleased = true;
      shiftReleaseTime = Date.now();
      return;
    }

    if (code === "AltLeft" || code === "AltRight") {
      altReleased = true;
      altReleaseTime = Date.now();
      return;
    }

    let usePreviousShift = false;
    if (shiftReleased && Date.now() - shiftReleaseTime < KEY_STROKE_INTERVAL) {
      usePreviousShift = true;
      shiftReleased = false;
    }

    let usePreviousAlt = false;
    if (altReleased && Date.now() - altReleaseTime < KEY_STROKE_INTERVAL) {
      usePreviousAlt = true;
      altReleased = false;
    }

    if (editModeStore.getEditMode() === "TEXT_WRITING") return;

    if (editModeStore.getEditMode() === "ANNOTATION_WRITING") return;

    if (ctrlKey || altKey) {
      return;
    }

    const singleSymbolSelected =
      notationStore.getSelectedNotations().length === 1 &&
      notationStore.getSelectedNotations().at(0)?.notationType === "SYMBOL";

    switch (classifyKeyCode(code)) {
      case "PUSH": {
        return handlePushKey();
      }

      case "DELETION": {
        notationMutateHelper.deleteSelectedNotations();
        if (singleSymbolSelected) {
          notationMutateHelper.collapseNotationsToSelectedCell();
          matrixCellHelper.setNextCell(0, 0);
        }
        break;
      }

      case "MOVEMENT": {
        return handleMovementKey(code);
      }

      case "MOVEANDDELETE": {
        handleMovementKey(code);
        notationMutateHelper.deleteSelectedNotations();
        return;
      }

      case "SYMBOL": {
        if (altKey || (usePreviousAlt && delayedAltKeys.has(key))) {
          if (key === "x") {
            return editModeStore.setEditMode("EXPONENT_STARTED");
          }
          if (key === "l") {
            return editModeStore.setEditMode("LOG_STARTED");
          }
        }
        if (usePreviousShift && delayedShiftKeys.has(key)) {
          return notationMutateHelper.addSymbolNotation(
            delayedShiftKeys.get(key)!,
          );
        }
        return notationMutateHelper.addSymbolNotation(key);
      }
    }
  }

  function handlePushKey() {
    notationMutateHelper.handlePushKey();

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
      code === "Quote" ||
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
