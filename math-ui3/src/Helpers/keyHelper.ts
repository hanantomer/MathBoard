import { useEditModeStore } from "../store/pinia/editModeStore";
import { useCellStore } from "../store/pinia/cellStore";
import useMatrixCellHelper from "../helpers/matrixCellHelper";
import useAuthorizationHelper from "../helpers/authorizationHelper";
import useNotationMutateHelper from "../helpers/notationMutateHelper";
import useSelectionHelper from "../helpers/selectionHelper";
type keyType = "SYMBOL" | "MOVEMENT" | "DELETION" | "MOVEANDDELETE";

const editModeStore = useEditModeStore();
const cellStore = useCellStore();
const matrixCellHelper = useMatrixCellHelper();
const authorizationHelper = useAuthorizationHelper();
const notationMutateHelper = useNotationMutateHelper();
const selectionHelper = useSelectionHelper();

export default function () {
  function keyUpHandler(e: KeyboardEvent) {
    const { ctrlKey, altKey, code, key } = e;
    if (ctrlKey || altKey) return;

    if (!authorizationHelper.canEdit()) return;

    switch (classifyKeyCode(code)) {
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
        return notationMutateHelper.addSymbolNotation(key);
      }
    }
  }

  function handleDeletionKey() {
    notationMutateHelper.handleDeleteKey();

    matrixCellHelper.setNextCell(0, 0);

    editModeStore.setDefaultEditMode();
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
  };
}
