// notations of current board(lesson, question or answers)
//  questions of current lesson
import { defineStore } from "pinia";
import { CellCoordinates, matrixDimensions } from "common/globals";
import { NotationAttributes } from "common/baseTypes";
import {
  EditMode,
  BoardType,
  NotationShape,
  NotationTypeShape,
} from "common/unions";
import { ref } from "vue";
import useUserOutgoingOperations from "../../helpers/userOutgoingOperationsHelper";
const userOutgoingOperations = useUserOutgoingOperations();

type Board = {
  uuid: string;
  type: BoardType;
};

///TODO complete setters
///TODO watch notations and sync occupation mattrix
export const useNotationStore = defineStore("notation", () => {
  let rectSize = ref<number>();

  const cellOccupationMatrix: (NotationAttributes | null)[][] =
    createCellOccupationMatrix();

  let parent = ref<Board>({ uuid: "", type: "LESSON" });

  let notations = ref(<Map<String, NotationAttributes>>new Map());

  let activeCell = ref(<CellCoordinates | null>null);


  let editMode = ref<EditMode>();

  const defaultEditMode: EditMode = "SYMBOL";

  function isSelectionMode() {
    return (
      editMode.value == "SELECT" ||
      editMode.value == "SELECTING" ||
      editMode.value == "MOVING"
    );
  }

  function isLineMode() {
    return editMode.value == "FRACTION" || editMode.value == "SQRT";
  }

  function isFractionMode() {
    return (
      editMode.value == "FRACTION" ||
      editMode.value == "FRACTION_DRAWING" ||
      editMode.value == "FRACTION_EDITITING" ||
      editMode.value == "FRACTION_SELECTING" ||
      editMode.value == "FRACTION_SELECTED"
    );
  }

  function isSqrtMode() {
    return (
      editMode.value == "SQRT" ||
      editMode.value == "SQRT_DRAWING" ||
      editMode.value == "SQRT_EDITITING" ||
      editMode.value == "SQRT_SELECTING" ||
      editMode.value == "SQRT_SELECTED"
    );
  }

  function isDefaultEditMode() {
    return editMode.value === defaultEditMode;
  }

  function isSqrtEditMode() {
    return editMode.value === "SQRT_DRAWING";
  }

  function isLineDrawingMode() {
    return (
      editMode.value == "FRACTION_DRAWING" || editMode.value == "SQRT_DRAWING"
    );
  }

  function isLineEditingMode() {
    return (
      editMode.value == "FRACTION_EDITITING" ||
      editMode.value == "SQRT_EDITITING"
    );
  }

  function isLineSelectingMode() {
    return (
      editMode.value == "FRACTION_SELECTING" ||
      editMode.value == "SQRT_SELECTING"
    );
  }

  function isLineSelectedMode() {
    return (
      editMode.value == "FRACTION_SELECTED" || editMode.value == "SQRT_SELECTED"
    );
  }

  function getRectSize() {
    if (!rectSize.value) throw new Error("rectSize.value is null");
    return rectSize.value;
  }

  function setRectSize(size: number) {
    rectSize.value = size;
  }

  function getEditMode() {
    return editMode.value;
  }

  function getDefaultEditMode() {
    return defaultEditMode;
  }

  function getSelectedNotations() : NotationAttributes[]{
    return Array.from(notations.value.values()).filter(
      (n) => n.selected === true,
    );
  }

  function getActiveCell() {
    return activeCell.value;
  }

  function getParent() {
    return parent.value;
  }

  function getCellOccupationMatrix() {
    return cellOccupationMatrix;
  }

  function getNotationsByShape<T>(notationShape: NotationShape): T[] {
    return Array.from(notations.value.values()).filter((n) => {
      return (
        n.notationType && NotationTypeShape.get(n.notationType) == notationShape
      );
    }) as T[];
  }

  function getNotations(): NotationAttributes[] {
    return Array.from(notations.value.values());
  }

  function setNotations(notations: NotationAttributes[]) {
    notations.forEach((n) => {
      addNotation(n);
    });
  }

  function getNotation(uuid: String) {
    return notations.value.get(uuid);
  }

  function setNotation(notation: NotationAttributes) {
    notations.value.set(notation.uuid, notation);
  }

  function removeNotation(uuid: string) {
    notations.value.delete(uuid);
    if (getParent().type === "LESSON") {
      userOutgoingOperations.syncOutgoingRemoveNotation(uuid, getParent().uuid);
    }
  }

  function removeAllNotations() {
    notations.value.clear();
  }

  function addNotation(notation: NotationAttributes) {
    notation.boardType = parent.value.type;
    notations.value.set(notation.uuid, notation);
  }

  
  function setActiveCell(newActiveCell: CellCoordinates | null) {
    activeCell.value = newActiveCell;
  }

  function selectNotation(uuid: string) {
    const notation = notations.value.get(uuid);
    if (notation) notation.selected = true;
  }

  function setParent(parentUUID: string, boardType: BoardType) {
    parent.value.uuid = parentUUID;
    parent.value.type = boardType;
  }

  function resetActiveCell() {
    activeCell.value = { col: -1, row: -1 };
  }

  function resetSelectedNotations() {
    Array.from(getSelectedNotations()).forEach((n) => (n.selected = false));
  }

  function setEditMode(newEditMode: EditMode) {
    console.debug("new edit mode:" + newEditMode);
    editMode.value = newEditMode;
  }

  function resetEditMode() {
    setEditMode("SYMBOL");
  }

  function createCellOccupationMatrix(): (NotationAttributes | null)[][] {
    let matrix: (NotationAttributes | null)[][] = new Array();
    for (let i = 0; i < matrixDimensions.rowsNum; i++) {
      matrix.push([]);
      for (let j = 0; j < matrixDimensions.colsNum; j++) {
        matrix[i][j] = null;
      }
    }
    return matrix;
  }

  // function setHiddenLineElement(el: HTMLElement) {
  //   hiddenLineElement = el;
  // }

  // function getHiddenLineElement() {
  //   return hiddenLineElement;
  // }

  return {
    addNotation,
    getNotation,
    getNotations,
    getNotationsByShape,
    getEditMode,
    getDefaultEditMode,
    getCellOccupationMatrix,
    getActiveCell,
    getSelectedNotations,
    getParent,
    getRectSize,

    isSelectionMode,
    isLineMode,
    isLineDrawingMode,
    isLineEditingMode,
    isLineSelectedMode,
    isLineSelectingMode,
    isFractionMode,
    isSqrtMode,
    isSqrtEditMode,
    isDefaultEditMode,

    setNotations,
    setNotation,
    selectNotation,
    setActiveCell,
    setEditMode,
    setParent,
    setRectSize,
    resetEditMode,
    resetActiveCell,
    resetSelectedNotations,
    removeNotation,
    removeAllNotations,
  };
});
