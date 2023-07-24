// notations of current board(lesson, question or answers)
//  questions of current lesson
import { defineStore } from "pinia";
import { CellCoordinates, matrixDimensions } from "../../../../math-common/src/globals";
import { BaseNotation} from "../../../../math-db/src/models/baseNotation";
import { EditMode, BoardType, NotationShape, NotationTypeShape } from "../../../../math-common/src/enum";
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


  async function setActiveCell(newActiveCell: CellCoordinates | null) {
    activeCell = newActiveCell;
  }

  async function setParent(parentUUID: string, boardType: BoardType) {
    parent.uuid = parentUUID;
    parent.type = boardType;
  }

  function resetActiveCell() {
    activeCell = { col: -1, row: -1 };
  }

  function setCurrentEditMode(newEditMode: EditMode) {
    editMode.value = newEditMode;
  }

  function createCellOccupationMatrix(): (BaseNotation | null)[][] {
    let matrix: (BaseNotation | null)[][] = new Array();
    for (let i = 0; i < matrixDimensions.rowsNum; i++) {
      for (let j = 0; j < matrixDimensions.colsNum; j++) {
        matrix[i][j] = null;
      }
    }
    return matrix;
  }

  function getNotations<T>(notationShape: NotationShape): T[] {
    return Array.from(notations.values()).filter((n) => {
      NotationTypeShape.get(n.notationType) == notationShape;
    }) as T[];
  }

  return {
    getNotations,
    editMode,
    setCurrentEditMode,
    parent,
    notations,
    cellOccupationMatrix,
    activeCell,
    activeNotation,
    setActiveCell,
    selectedNotations,
    resetActiveCell,
    setParent
  };
});



