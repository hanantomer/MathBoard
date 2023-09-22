// notations of current board(lesson, question or answers)
//  questions of current lesson
import { defineStore } from "pinia";
import { CellCoordinates, matrixDimensions } from "common/globals";
import { BaseNotation } from "common/baseTypes";
import { EditMode, BoardType, NotationShape, NotationTypeShape } from "common/enum";
import { reactive, ref } from "vue";

type Board = {
  uuid: string;
  type: BoardType;
}


///TODO complete setters
///TODO watch notations and sync occupation mattrix
///TODO watch notations and sync user operations (avoid circular updates)

export const useNotationStore = defineStore("notation", () => {

  const cellOccupationMatrix: (BaseNotation | null)[][] =
    createCellOccupationMatrix();
  let parent: Board = reactive<Board>({ type: BoardType.LESSON, uuid: "" });
  let notations: Map<String, BaseNotation> = reactive(
    <Map<String, BaseNotation>>{}
  );
  let activeCell: CellCoordinates | null =  <CellCoordinates | null>{};
  let activeNotation: BaseNotation | null = <BaseNotation | null>{};
  let selectedNotations: string[] = [];
  let editMode = ref(EditMode.SYMBOL);

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
    return Array.from(notations.values()).filter((n) => {
      n.notationType &&
      NotationTypeShape.get(n.notationType.valueOf()) == notationShape;
    }) as T[];
  }

  function getNotations() {
    return notations;
  }

  function setActiveNotation(notation: BaseNotation | null) {
    activeNotation = notation;
  }

  function setNotations(notations: Map<String, BaseNotation>) {
    notations = notations;
  }

  function setActiveCell(newActiveCell: CellCoordinates | null) {
    activeCell = newActiveCell;
  }

  function setParent(parentUUID: string, boardType: BoardType) {
    parent.uuid = parentUUID;
    parent.type = boardType;
  }

  function resetActiveCell() {
    activeCell = { col: -1, row: -1 };
  }

  function resetSelectedNotations() {
    selectedNotations.length = 0;
  }


  function setCurrentEditMode(newEditMode: EditMode) {
    editMode.value = newEditMode;
  }

  function createCellOccupationMatrix(): (BaseNotation | null)[][] {
    let matrix: (BaseNotation | null)[][] = new Array();
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



