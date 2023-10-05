// notations of current board(lesson, question or answers)
//  questions of current lesson
import { defineStore } from "pinia";
import { CellCoordinates, matrixDimensions } from "common/globals";
import { NotationAttributes } from "common/baseTypes";
import { EditMode, BoardType, NotationShape, NotationTypeShape } from "common/unions";
import { ref } from "vue";

type Board = {
  uuid: string;
  type: BoardType;
}


///TODO complete setters
///TODO watch notations and sync occupation mattrix
///TODO watch notations and sync user operations (avoid circular updates)

export const useNotationStore = defineStore("notation", () => {

  const cellOccupationMatrix: (NotationAttributes | null)[][] =
    createCellOccupationMatrix();
  let parent = ref<Board>({uuid:"", type: "LESSON"});
  let notations = ref(
    <Map<String, NotationAttributes>>new Map()
  );
  let activeCell = ref(<CellCoordinates | null> null);
  let activeNotation: NotationAttributes | null = <
    NotationAttributes | null
  >{};
  let selectedNotations: string[] = [];
  let editMode = ref<EditMode>("SYMBOL");

  function getEditMode() {
    return editMode;
  }

  function getSelectedNotations() {
    return selectedNotations;
  }

  function getActiveNotation() {
    return activeNotation;
  }

  function getActiveCell() {
    return activeCell;
  }

  function getParent() {
    return parent;
  }

  function getCellOccupationMatrix() {
    return cellOccupationMatrix;
  }

  function getNotationsByShape<T>(notationShape: NotationShape): T[] {
    return Array.from(notations.value.values()).filter((n) => {
      n.notationType &&
      NotationTypeShape.get(n.notationType) == notationShape;
    }) as T[];
  }

  function getNotations() {
    return notations;
  }

  function setNotations(notationsToSet: Map<String, NotationAttributes>) {
    notations.value = new Map(notationsToSet);
  }

  function addNotation(notation: NotationAttributes) {
    notations.value.set(notation.uuid, notation);
  }

  function setActiveNotation(notation: NotationAttributes | null) {
    activeNotation = notation;
  }


  function setActiveCell(newActiveCell: CellCoordinates | null) {
    activeCell.value = newActiveCell;
  }

  function setParent(parentUUID: string, boardType: BoardType) {
    parent.value.uuid = parentUUID;
    parent.value.type = boardType;
  }

  function resetActiveCell() {
    activeCell.value = { col: -1, row: -1 };
  }

  function resetSelectedNotations() {
    selectedNotations.length = 0;
  }


  function setCurrentEditMode(newEditMode: EditMode) {
    editMode.value = newEditMode;
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


  return {
    getNotations,
    getNotationsByShape,
    getEditMode,
    getCellOccupationMatrix,
    getActiveCell,
    getActiveNotation,
    getSelectedNotations,
    getParent,
    addNotation,
    setNotations,
    setActiveNotation,
    setCurrentEditMode,
    setParent,
    setActiveCell,
    resetActiveCell,
    resetSelectedNotations,
    activeCell,
    activeNotation
  };
});



