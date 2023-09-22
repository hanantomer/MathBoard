// notations of current board(lesson, question or answers)
//  questions of current lesson
import { defineStore } from "pinia";
import { matrixDimensions } from "common/globals";
import { EditMode, BoardType, NotationTypeShape } from "common/enum";
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
    function getNotationsByShape(notationShape) {
        return Array.from(notations.values()).filter((n) => {
            n.notationType &&
                NotationTypeShape.get(n.notationType.valueOf()) == notationShape;
        });
    }
    function getNotations() {
        return notations;
    }
    function setActiveNotation(notation) {
        activeNotation = notation;
    }
    function setNotations(notations) {
        notations = notations;
    }
    function setActiveCell(newActiveCell) {
        activeCell = newActiveCell;
    }
    function setParent(parentUUID, boardType) {
        parent.uuid = parentUUID;
        parent.type = boardType;
    }
    function resetActiveCell() {
        activeCell = { col: -1, row: -1 };
    }
    function resetSelectedNotations() {
        selectedNotations.length = 0;
    }
    function setCurrentEditMode(newEditMode) {
        editMode.value = newEditMode;
    }
    function createCellOccupationMatrix() {
        let matrix = new Array();
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
//# sourceMappingURL=notationStore.js.map