// notations of current board(lesson, question or answers)
//  questions of current lesson
import { defineStore } from "pinia";
import { matrixDimensions } from "common/globals";
import { EditMode, BoardType, NotationTypeShape } from "common/enum";
import { ref } from "vue";
///TODO complete setters
///TODO watch notations and sync occupation mattrix
///TODO watch notations and sync user operations (avoid circular updates)
export const useNotationStore = defineStore("notation", () => {
    const cellOccupationMatrix = createCellOccupationMatrix();
    let parent = ref({ uuid: "", type: BoardType.LESSON });
    let notations = ref(new Map());
    let activeCell = ref(null);
    let activeNotation = {};
    let selectedNotations = [];
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
    function getNotationsByShape(notationShape) {
        return Array.from(notations.value.values()).filter((n) => {
            n.notationType &&
                NotationTypeShape.get(n.notationType.valueOf()) == notationShape;
        });
    }
    function getNotations() {
        return notations;
    }
    function setNotations(notations) {
        notations = notations;
    }
    function addNotation(notation) {
        notations.value.set(notation.uuid, notation);
    }
    function setActiveNotation(notation) {
        activeNotation = notation;
    }
    function setActiveCell(newActiveCell) {
        activeCell.value = newActiveCell;
    }
    function setParent(parentUUID, boardType) {
        parent.value.uuid = parentUUID;
        parent.value.type = boardType;
    }
    function resetActiveCell() {
        activeCell.value = { col: -1, row: -1 };
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
//# sourceMappingURL=notationStore.js.map
