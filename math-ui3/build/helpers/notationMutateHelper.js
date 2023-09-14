//  questions of current lesson
import { EditMode } from "common/enum";
import useDbHelper from "../helpers/dbHelper";
import { NotationShape, NotationTypeShape, } from "common/enum";
import { BoardType, NotationType } from "common/enum";
import { useUserStore } from "../store/pinia/userStore";
import { useNotationStore } from "../store/pinia/notationStore";
import { onMounted } from "vue";
import useAuthHelper from "./authHelper";
import useUserOutgoingOperations from "./userOutgoingOperationsHelper";
import useMatrixHelper from "../helpers/matrixHelper";
const matrixHelper = useMatrixHelper();
const userStore = useUserStore();
const dbHelper = useDbHelper();
const notationStore = useNotationStore();
const authHelper = useAuthHelper();
const userOutgoingOperations = useUserOutgoingOperations();
// type PointNotationCreateAttributes = PointAttributes & BaseNotation;
// type LineNotationAttributes = LineAttributes & BaseNotation;
// type RectNotationAttributes = RectAttributes & BaseNotation;
// type BaseNotation = BaseNotation;
// type RectAttributes = RectAttributes;
// type LineAttributes = LineAttributes;
// type CellCoordinates = PointAttributes;
export default function notationMutateHelper() {
    /// TODO deal with mutations which originate from user incoming synchronisation
    onMounted(() => {
        notationStore.$subscribe((mutation, state) => {
            console.log("a change happened");
            console.log(mutation, state);
        });
    });
    function pointAtCellCoordinates(n1, n2, userUUId) {
        return n1.col == n2.col && n1.row == n2.row && n1.user.uuid === userUUId;
    }
    function pointAtLineCoordinates(pointNotation, lineCoordinates, userUUId) {
        return (pointNotation.col >= lineCoordinates.fromCol &&
            pointNotation.col <= lineCoordinates.toCol &&
            pointNotation.row == lineCoordinates.row &&
            pointNotation.user.uuid == userUUId);
    }
    function pointAtRectCoordinates(pointNotation, rectCoordinates, userUUId) {
        return (pointNotation.col >= rectCoordinates.fromCol &&
            pointNotation.col <= rectCoordinates.toCol &&
            pointNotation.row >= rectCoordinates.fromRow &&
            pointNotation.row <= rectCoordinates.toRow &&
            pointNotation.user.uuid == userUUId);
    }
    // line
    function lineAtCellCoordinates(lineCoordinates, cellCoordinates, userUUId) {
        return (lineCoordinates.fromCol <= cellCoordinates.col &&
            lineCoordinates.toCol >= cellCoordinates.col &&
            lineCoordinates.row == cellCoordinates.row &&
            lineCoordinates.user.uuid == userUUId);
    }
    function lineAtLineCoordinates(line1Coordinates, line2Coordinates, userUUId) {
        return (((line1Coordinates.fromCol >= line2Coordinates.fromCol &&
            line1Coordinates.fromCol <= line2Coordinates.toCol) ||
            (line1Coordinates.toCol >= line2Coordinates.fromCol &&
                line1Coordinates.toCol <= line2Coordinates.toCol)) &&
            line1Coordinates.row == line2Coordinates.row &&
            line1Coordinates.user.uuid == userUUId);
    }
    function lineAtRectCoordinates(lineNotation, rectCoordinates, userUUId) {
        return (((lineNotation.fromCol >= rectCoordinates.fromCol &&
            lineNotation.fromCol <= rectCoordinates.toCol) ||
            (lineNotation.toCol >= rectCoordinates.fromCol &&
                lineNotation.toCol <= rectCoordinates.toCol)) &&
            lineNotation.row >= rectCoordinates.fromRow &&
            lineNotation.row <= rectCoordinates.toRow &&
            lineNotation.user.uuid == userUUId);
    }
    // rect
    function rectAtCellCoordinates(rectNotation, CellCoordinates, userUUId) {
        return (rectNotation.fromCol <= CellCoordinates.col &&
            rectNotation.toCol >= CellCoordinates.col &&
            rectNotation.fromRow <= CellCoordinates.row &&
            rectNotation.toRow >= CellCoordinates.row &&
            rectNotation.user.uuid == userUUId);
    }
    function rectAtLineCoordinates(rectNotation, lineCoordinates, userUUId) {
        return (((rectNotation.fromCol >= lineCoordinates.fromCol &&
            rectNotation.fromCol <= lineCoordinates.toCol) ||
            (rectNotation.toCol >= lineCoordinates.fromCol &&
                rectNotation.toCol <= lineCoordinates.toCol)) &&
            rectNotation.fromRow <= lineCoordinates.row &&
            rectNotation.toRow >= lineCoordinates.row &&
            rectNotation.user.uuid == userUUId);
    }
    function rectAtRectCoordinates(rectNotation, rectCoordinates, userUUId) {
        return (((rectNotation.fromCol >= rectCoordinates.fromCol &&
            rectNotation.fromCol <= rectCoordinates.toCol) ||
            (rectNotation.toCol >= rectCoordinates.fromCol &&
                rectNotation.toCol <= rectCoordinates.toCol)) &&
            ((rectNotation.fromRow >= rectCoordinates.fromRow &&
                rectNotation.fromRow <= rectCoordinates.toRow) ||
                (rectNotation.toRow >= rectCoordinates.fromRow &&
                    rectNotation.toRow <= rectCoordinates.toRow)) &&
            rectNotation.user.uuid == userUUId);
    }
    function findNotationsByCellCoordinates(cellCoordinates) {
        let userUUId = userStore.currentUser.uuid;
        let notationsMap = notationStore.notations;
        return Object.entries(notationsMap)
            .map((n) => n[1])
            .filter((n) => n.notationType == NotationType.SYMBOL || // maybe replace type with reflection
            n.notationType == NotationType.POWER ||
            n.notationType == NotationType.SIGN
            ? pointAtCellCoordinates(n, cellCoordinates, userUUId)
            : n.notationType == NotationType.FRACTION ||
                n.notationType == NotationType.SQRT
                ? lineAtCellCoordinates(n, cellCoordinates, userUUId)
                : n.notationType == NotationType.TEXT
                    ? rectAtCellCoordinates(n, cellCoordinates, userUUId)
                    : false);
    }
    // return a list of notations wich overlap given rect coordinates
    function findNotationsByRectCoordinates(notationsMap, rectCoordinates) {
        return Object.entries(notationsMap)
            .map((n) => n[1])
            .filter((n) => n.notationType == NotationType.SYMBOL ||
            n.notationType == NotationType.POWER ||
            n.notationType == NotationType.SIGN
            ? pointAtRectCoordinates(n, rectCoordinates, userStore.currentUser.uuid)
            : n.notationType == NotationType.FRACTION ||
                n.notationType == NotationType.SQRT
                ? lineAtRectCoordinates(n, rectCoordinates, userStore.currentUser.uuid)
                : n.notationType == NotationType.TEXT
                    ? rectAtRectCoordinates(n, rectCoordinates, userStore.currentUser.uuid)
                    : false);
    }
    // return a list of notations wich overlap given line coordinates
    function findNotationsByLineCoordinates(notationsMap, lineCoordinates) {
        return Object.entries(notationsMap)
            .map((n) => n[1])
            .filter((n) => n.notationType == NotationType.SYMBOL ||
            n.notationType == NotationType.POWER ||
            n.notationType == NotationType.SIGN
            ? pointAtLineCoordinates(n, lineCoordinates, userStore.currentUser.uuid)
            : n.notationType == NotationType.FRACTION ||
                n.notationType == NotationType.SQRT
                ? lineAtLineCoordinates(n, lineCoordinates, userStore.currentUser.uuid)
                : n.notationType == NotationType.TEXT
                    ? rectAtLineCoordinates(n, lineCoordinates, userStore.currentUser.uuid)
                    : false);
    }
    function findOverlapNotationsOfSameType(notation) {
        let notationsMap = notationStore.notations;
        return Object.entries(notationsMap)
            .map((n) => n[1])
            .filter((n1) => n1.notationType === notation.notationType)
            .find((n2) => {
            switch (notation.notationType) {
                case NotationType.SYMBOL:
                case NotationType.SIGN:
                case NotationType.POWER:
                    return pointAtCellCoordinates(notation, n2, userStore.currentUser.uuid);
                case NotationType.FRACTION:
                case NotationType.SQRT:
                    return lineAtLineCoordinates(notation, n2, userStore.currentUser.uuid);
                case NotationType.TEXT:
                case NotationType.IMAGE:
                case NotationType.GEO:
                    return rectAtRectCoordinates(notation, n2, userStore.currentUser.uuid);
            }
        });
    }
    function findOverlapNotationsOfAnyType(notation) {
        let notationsMap = notationStore.notations;
        return Object.entries(notationsMap)
            .map((n) => n[1])
            .find((n2) => {
            switch (notation.notationType) {
                case NotationType.SYMBOL:
                case NotationType.POWER:
                    return (pointAtCellCoordinates(notation, n2, userStore.currentUser.uuid) ??
                        lineAtCellCoordinates(notation, n2, userStore.currentUser.uuid) ??
                        rectAtCellCoordinates(notation, n2, userStore.currentUser.uuid));
                case NotationType.FRACTION:
                case NotationType.SQRT:
                    return (lineAtCellCoordinates(notation, n2, userStore.currentUser.uuid) ??
                        lineAtLineCoordinates(notation, n2, userStore.currentUser.uuid) ??
                        lineAtRectCoordinates(notation, n2, userStore.currentUser.uuid));
                case NotationType.TEXT:
                case NotationType.IMAGE:
                case NotationType.GEO:
                    return (pointAtRectCoordinates(notation, n2, userStore.currentUser.uuid) ??
                        lineAtRectCoordinates(notation, n2, userStore.currentUser.uuid) ??
                        rectAtRectCoordinates(notation, n2, userStore.currentUser.uuid));
            }
        });
    }
    async function removeSymbolsByCell(coordinates) {
        let symbolsAtCell = findNotationsByCellCoordinates(coordinates).filter((n) => n.notationType === NotationType.SYMBOL ||
            n.notationType === NotationType.SIGN);
        if (!symbolsAtCell)
            return [];
        symbolsAtCell.forEach(async (n) => {
            await dbHelper
                .removeNotation(n)
                .then(() => notationStore.notations.delete(n.uuid));
        });
        return symbolsAtCell;
    }
    ///TODO - check if needs to return notation
    async function removeActiveNotation() {
        if (!authHelper.canEdit()) {
            return null;
        }
        if (notationStore.activeNotation == null)
            return null;
        await dbHelper.removeNotation(notationStore.activeNotation);
        notationStore.notations.delete(notationStore.activeNotation.uuid);
        let deletedNotationUUId = notationStore.activeNotation.uuid;
        notationStore.activeNotation = null;
        let deletedNotation = notationStore.notations.get(deletedNotationUUId);
        if (deletedNotation)
            userOutgoingOperations.syncOutgoingRemoveNotation(deletedNotation);
        return deletedNotation ? deletedNotation : null;
    }
    async function removeSelectedNotations() {
        if (!authHelper.canEdit)
            return;
        notationStore.selectedNotations.forEach(async (uuid) => {
            let n = notationStore.notations.get(uuid);
            if (!n)
                return;
            await dbHelper.removeNotation(n);
            notationStore.notations.delete(uuid);
            userOutgoingOperations.syncOutgoingRemoveNotation(n);
        });
        this.selectedNotations.length = 0;
    }
    async function selectNotation(CellCoordinates) {
        notationStore.selectedNotations.length = 0;
        findNotationsByCellCoordinates(CellCoordinates).forEach((n) => {
            notationStore.selectedNotations.push(n.uuid);
        });
    }
    // move without persistence - called during  mouse move  - don't bother the database during move
    async function moveSelectedNotations(deltaX, deltaY) {
        notationStore.selectedNotations.forEach((uuid) => {
            let n = notationStore.notations.get(uuid);
            if (!n?.notationType)
                return;
            switch (NotationTypeShape.get(n.notationType)) {
                case NotationShape.POINT: {
                    n.col += deltaX;
                    n.row += deltaY;
                    break;
                }
                case NotationShape.LINE: {
                    n.fromCol += deltaX;
                    n.toCol += deltaX;
                    n.row += deltaY;
                    break;
                }
                case NotationShape.RECT: {
                    n.fromCol += deltaX;
                    n.toCol += deltaX;
                    n.fromRow += deltaY;
                    n.toRow += deltaY;
                    break;
                }
            }
        });
    }
    // move selected notations with persistence - called upon muose up
    async function updateSelectedNotationCoordinates() {
        // disallow update during answer if any notation overlaps question area
        notationStore.selectedNotations.forEach((uuid) => {
            let n = notationStore.notations.get(uuid);
            if (!n)
                return;
            if (isNotationInQuestionArea(n)) {
                return;
            }
        });
        notationStore.selectedNotations.forEach(async (uuid) => {
            let n = notationStore.notations.get(uuid);
            if (!n)
                return;
            if (isNotationInQuestionArea(n))
                return;
            await dbHelper.updateNotation(n);
            userOutgoingOperations.syncOutgoingUpdateSelectedNotation(n);
        });
        notationStore.selectedNotations.length = 0;
    }
    async function updateNotation(notation) {
        // disallow update for student in question area
        if (isNotationInQuestionArea(notation)) {
            return;
        }
        await dbHelper.updateNotation(notation);
        notationStore.notations.set(notation.uuid, notation);
    }
    async function addNotation(notation) {
        //notation.user.uuid = userStore.currentUser!.uuid;
        let overlappedSameTypeNotation = findOverlapNotationsOfSameType(notation);
        if (overlappedSameTypeNotation) {
            setNotationAttributes(overlappedSameTypeNotation, notation);
            await dbHelper.updateNotation(overlappedSameTypeNotation);
            notationStore.notations.set(overlappedSameTypeNotation.uuid, overlappedSameTypeNotation);
            return overlappedSameTypeNotation;
        }
        let overlappedAnyTypeNotation = findOverlapNotationsOfAnyType(notation);
        // don't allow override of other type notation
        if (overlappedAnyTypeNotation) {
            return null;
        }
        // no overlapping -> add
        let newNotation = await dbHelper.addNotation(notation);
        notationStore.notations.set(newNotation.uuid, newNotation);
        return newNotation;
    }
    async function syncIncomingAddedNotation(notation) {
        notationStore.notations.set(notation.uuid, notation);
    }
    async function syncIncomingRemovedNotation(notation) {
        notationStore.notations.delete(notation.uuid);
    }
    async function syncIncomingUpdatedtNotation(notation) {
        notationStore.notations.set(notation.uuid, notation);
    }
    async function removeAllNotations() {
        notationStore.notations.clear();
    }
    function setNotationAttributes(existingNotation, notation) {
        switch (NotationTypeShape.get(existingNotation.notationType)) {
            case NotationShape.POINT: {
                existingNotation.col = notation.col;
                existingNotation.row = notation.row;
                if (existingNotation.notationType == NotationType.SYMBOL) {
                    ///TODO: update symbol or power values (create corresponding types in advance)
                }
                break;
            }
            case NotationShape.LINE: {
                existingNotation.fromCol = notation.fromCol;
                existingNotation.toCol = notation.toCol;
                existingNotation.row = notation.row;
                break;
            }
            case NotationShape.RECT: {
                existingNotation.fromCol = notation.fromCol;
                existingNotation.toCol = notation.toCol;
                existingNotation.fromRow = notation.fromRow;
                existingNotation.toRow = notation.toRow;
                break;
            }
        }
    }
    /// TODO move board type check outside
    // return true for student in question and point coordinates are within question area
    function isNotationInQuestionArea(notation) {
        if (!notation)
            return false;
        switch (NotationTypeShape.get(notation.notationType)) {
            case NotationShape.POINT: {
                let pointNotation = notation;
                return (notation?.boardType === BoardType.ANSWER &&
                    !userStore.isTeacher &&
                    notationStore.cellOccupationMatrix
                        .at(pointNotation.row)
                        ?.at(pointNotation.col)?.boardType == BoardType.QUESTION);
            }
            case NotationShape.LINE: {
                let lineNotation = notation;
                for (let i = lineNotation.fromCol; i <= lineNotation.toCol; i++) {
                    if (notation?.boardType === BoardType.ANSWER &&
                        !userStore.isTeacher &&
                        notationStore.cellOccupationMatrix.at(lineNotation.row)?.at(i)
                            ?.boardType == BoardType.QUESTION)
                        return true;
                }
            }
            case NotationShape.RECT: {
                let rectNotation = notation;
                for (let i = rectNotation.fromCol; i <= rectNotation.toCol; i++) {
                    for (let j = rectNotation.fromRow; i <= rectNotation.toRow; j++) {
                        if (notation?.boardType === BoardType.ANSWER &&
                            !userStore.isTeacher &&
                            notationStore.cellOccupationMatrix.at(j)?.at(i)?.boardType ==
                                BoardType.QUESTION)
                            return true;
                    }
                }
            }
        }
        return false;
    }
    async function setActiveNotation(activeNotation) {
        // disallow activation of question rows for student
        if (isNotationInQuestionArea(activeNotation))
            return;
        notationStore.activeNotation = activeNotation;
    }
    async function setActiveCell(newActiveCell) {
        if (notationStore.activeCell != newActiveCell) {
            return;
        }
        if ( // disallow activation of question cells for student
        isCellInQuestionArea(newActiveCell)) {
            return;
        }
        notationStore.setActiveCell(newActiveCell);
    }
    async function removeNotationsByRect(rectNotaion) {
        let notationsAtRectCoordinates = findNotationsByRectCoordinates(notationStore.notations, rectNotaion);
        if (!notationsAtRectCoordinates)
            return;
        notationsAtRectCoordinates.forEach(async (n) => {
            n.boardType = notationStore.parent.type;
            await dbHelper
                .removeNotation(n)
                .then(() => notationStore.notations.delete(n.uuid));
        });
    }
    function isCellInQuestionArea(CellCoordinates) {
        return (notationStore.parent.type == BoardType.ANSWER &&
            !userStore.isTeacher() &&
            CellCoordinates &&
            notationStore.cellOccupationMatrix
                .at(CellCoordinates.row)
                ?.at(CellCoordinates.col)?.boardType == BoardType.QUESTION);
    }
    function addMarkNotation() {
        if (notationStore.editMode == EditMode.CHECKMARK) {
            addSymbolNotation("&#x2714");
            return;
        }
        if (notationStore.editMode == EditMode.SEMICHECKMARK) {
            addSymbolNotation("&#x237B");
            return;
        }
        if (notationStore.editMode == EditMode.XMARK) {
            addSymbolNotation("&#x2718");
            return;
        }
    }
    function removeNotationsAtMousePosition(e) {
        let rectAtMousePosition = matrixHelper.findClickedObject({
            x: e.clientX,
            y: e.clientY,
        }, "rect", null);
        if (!rectAtMousePosition)
            return;
        removeSymbolsByCell({
            row: rectAtMousePosition.parentNode?.attributes?.row.value,
            col: rectAtMousePosition.attributes.col.value,
        });
    }
    function removeActiveOrSelectedNotations() {
        if (notationStore.activeCell) {
            removeActiveCellNotations();
        }
        if (notationStore.activeNotation) {
            removeActiveNotation();
        }
        if (notationStore.activeNotation) {
            removeSelectedNotations();
        }
    }
    async function removeActiveCellNotations() {
        if (!notationStore.activeCell)
            return;
        let notationsToDelete = await removeSymbolsByCell(notationStore.activeCell);
        if (!notationsToDelete)
            return;
        notationsToDelete.forEach((notation) => {
            userOutgoingOperations.syncOutgoingRemoveNotation(notation);
        });
    }
    function addImageNotation(fromCol, toCol, fromRow, toRow, base64Value) {
        let notation = {
            fromCol: fromCol,
            toCol: toCol,
            fromRow: fromRow,
            toRow: toRow,
            value: base64Value,
            boardType: notationStore.parent.type,
            notationType: NotationType.IMAGE,
            user: userStore.currentUser,
            createdAt: new Date(),
            id: -1,
            uuid: "",
        };
        addNotation(notation);
        // .then(() => {
        //   if (notationStore.parent.type === BoardType.LESSON) {
        //     userOutgoingOperations.syncOutgoingSaveNotation(notation);
        //   }
        // })
        // .catch((e) => {
        //   console.error(e);
        // });
        notationStore.resetActiveCell();
    }
    function addTextNotation(fromCol, toCol, fromRow, toRow, value) {
        let notation = {
            fromCol: fromCol,
            toCol: toCol,
            fromRow: fromRow,
            toRow: toRow,
            value: value,
            boardType: notationStore.parent.type,
            notationType: NotationType.TEXT,
            user: userStore.currentUser,
            createdAt: new Date(),
            id: -1,
            uuid: ""
        };
        addNotation(notation);
        // notationStore.resetActiveCell();
    }
    ;
    function addSymbolNotation(value) {
        if (!notationStore.activeCell)
            return;
        let notation = {
            col: notationStore.activeCell.col,
            row: notationStore.activeCell.row,
            value: value,
            boardType: notationStore.parent.type,
            notationType: NotationType.SYMBOL,
            user: userStore.currentUser,
            createdAt: new Date(),
            id: -1,
            uuid: "",
        };
        addNotation(notation);
        // if (notationStore.parent.type === BoardType.LESSON) {
        //   userOutgoingOperations.syncOutgoingSaveNotation(notation);
        // }
        if (notationStore.editMode == EditMode.SYMBOL) {
            matrixHelper.setNextRect(1, 0);
        }
    }
    function addSqrtNotation(coordinates) {
        let notation = {
            fromCol: coordinates.fromCol,
            toCol: coordinates.fromCol,
            row: coordinates.row,
            boardType: notationStore.parent.type,
            notationType: NotationType.SQRT,
            user: userStore.currentUser,
            createdAt: new Date(),
            id: -1,
            uuid: "",
        };
        addNotation(notation);
        //if (notationStore.parent.type === BoardType.LESSON) {
        //   userOutgoingOperations.syncOutgoingSaveNotation(notation);
        // }
    }
    function addFractiontNotation(coordinates) {
        let notation = {
            fromCol: coordinates.fromCol,
            toCol: coordinates.fromCol,
            row: coordinates.row,
            boardType: notationStore.parent.type,
            notationType: NotationType.FRACTION,
            user: userStore.currentUser,
            createdAt: new Date(),
            id: -1,
            uuid: "",
        };
        addNotation(notation);
        // if (notationStore.parent.type === BoardType.LESSON) {
        //   userOutgoingOperations.syncOutgoingSaveNotation(notation);
        // }
    }
    function setCurrentEditMode(editMode) {
        notationStore.editMode = editMode;
    }
    return {
        selectNotation,
        setActiveCell,
        setActiveNotation,
        addSymbolNotation,
        addMarkNotation,
        addImageNotation,
        addTextNotation,
        addFractiontNotation,
        addSqrtNotation,
        removeActiveOrSelectedNotations,
        moveSelectedNotations,
        updateSelectedNotationCoordinates,
        setCurrentEditMode
    };
}
//# sourceMappingURL=notationMutateHelper.js.map