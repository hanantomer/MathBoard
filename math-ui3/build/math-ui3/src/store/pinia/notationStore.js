// notations of current board(lesson, question or answers)
//  questions of current lesson
import { defineStore } from "pinia";
import { matrixDimensions } from "../../../../math-common/build/globals";
import { EditMode, BoardType, NotationTypeShape } from "../../../../math-common/src/enum";
import { reactive, ref } from "vue";
///TODO complete setters
///TODO watch notations and sync occupation mattrix
///TODO watch notations and sync user operations (avoid circular updates)
export const useNotationStore = defineStore("notation", () => {
    const cellOccupationMatrix = createCellOccupationMatrix();
    let parent = reactive({ type: BoardType.LESSON, uuid: "" });
    let notations = reactive({});
    let activeCell = {};
    let activeNotation = {};
    let selectedNotations = [];
    let editMode = ref(EditMode.SYMBOL);
    async function setActiveCell(newActiveCell) {
        activeCell = newActiveCell;
    }
    async function setParent(parentUUID, boardType) {
        parent.uuid = parentUUID;
        parent.type = boardType;
    }
    function resetActiveCell() {
        activeCell = { col: -1, row: -1 };
    }
    function setCurrentEditMode(newEditMode) {
        editMode.value = newEditMode;
    }
    function createCellOccupationMatrix() {
        let matrix = new Array();
        for (let i = 0; i < matrixDimensions.rowsNum; i++) {
            for (let j = 0; j < matrixDimensions.colsNum; j++) {
                matrix[i][j] = null;
            }
        }
        return matrix;
    }
    function getNotations(notationShape) {
        return Array.from(notations.values()).filter((n) => {
            n.notationType &&
                NotationTypeShape.get(n.notationType.valueOf()) == notationShape;
        });
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
//# sourceMappingURL=notationStore.js.map
