// notations of current board(lesson, question or answers)
//  questions of current lesson
import { defineStore } from "pinia";
import { Notation} from "../../Helpers/responseTypes";
import { CellCoordinates, matrixDimensions } from "../../../../math-common/src/globals";
import { EditMode } from "../../../../math-common/src/enum";
import { BoardType } from "../../../../math-common/src/enum";
import { reactive } from "vue";

type Board = {
  uuid: string;
  type: BoardType;
}


///TODO complete setters
///TODO watch notations and sync occupation mattrix
///TODO watch notations and sync user operations (avoid circular updates)

export const useNotationStore = defineStore("notation", () => {

  const cellOccupationMatrix: (Notation | null)[][] = createCellOccupationMatrix();
  let parent: Board = reactive<Board>({ type: BoardType.LESSON, uuid: "" });
  let notations: Map<String, Notation> = reactive(<Map<String, Notation>>{});
  let activeCell: CellCoordinates | null =  <CellCoordinates | null>reactive({});
  let activeNotation: Notation | null = <Notation | null>reactive({});
  let selectedNotations: string[] = reactive([]);
  let editMode = reactive(EditMode.SYMBOL.valueOf);


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

  function setCurrentEditMode(neweEditMode: EditMode) {
    editMode = neweEditMode.valueOf;
  }

  function createCellOccupationMatrix(): (Notation | null)[][] {
    let matrix: (Notation | null)[][] = new Array();
    for (let i = 0; i < matrixDimensions.rowsNum; i++) {
      for (let j = 0; j < matrixDimensions.colsNum; j++) {
        matrix[i][j] = null;
      }
    }
    return matrix;
  }


  return {
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



