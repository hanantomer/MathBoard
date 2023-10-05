//  questions of current lesson
import { EditMode } from "common/enum";
import useDbHelper from "../helpers/dbHelper";
import { NotationShape, NotationTypeShape } from "common/enum";
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
        let userUUId = userStore.getCurrentUser().uuid;
        let notationsMap = notationStore.getNotations();
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
            ? pointAtRectCoordinates(n, rectCoordinates, userStore.getCurrentUser().uuid)
            : n.notationType == NotationType.FRACTION ||
                n.notationType == NotationType.SQRT
                ? lineAtRectCoordinates(n, rectCoordinates, userStore.getCurrentUser().uuid)
                : n.notationType == NotationType.TEXT
                    ? rectAtRectCoordinates(n, rectCoordinates, userStore.getCurrentUser().uuid)
                    : false);
    }
    // return a list of notations wich overlap given line coordinates
    function findNotationsByLineCoordinates(notationsMap, lineCoordinates) {
        return Object.entries(notationsMap)
            .map((n) => n[1])
            .filter((n) => n.notationType == NotationType.SYMBOL ||
            n.notationType == NotationType.POWER ||
            n.notationType == NotationType.SIGN
            ? pointAtLineCoordinates(n, lineCoordinates, userStore.getCurrentUser().uuid)
            : n.notationType == NotationType.FRACTION ||
                n.notationType == NotationType.SQRT
                ? lineAtLineCoordinates(n, lineCoordinates, userStore.getCurrentUser().uuid)
                : n.notationType == NotationType.TEXT
                    ? rectAtLineCoordinates(n, lineCoordinates, userStore.getCurrentUser().uuid)
                    : false);
    }
    function findOverlapNotationsOfSameType(notation) {
        let notationsMap = notationStore.getNotations();
        return Object.entries(notationsMap)
            .map((n) => n[1])
            .filter((n1) => n1.notationType === notation.notationType)
            .find((n2) => {
            switch (notation.notationType) {
                case NotationType.SYMBOL:
                case NotationType.SIGN:
                case NotationType.POWER:
                    return pointAtCellCoordinates(notation, n2, userStore.getCurrentUser().uuid);
                case NotationType.FRACTION:
                case NotationType.SQRT:
                    return lineAtLineCoordinates(notation, n2, userStore.getCurrentUser().uuid);
                case NotationType.TEXT:
                case NotationType.IMAGE:
                case NotationType.GEO:
                    return rectAtRectCoordinates(notation, n2, userStore.getCurrentUser().uuid);
            }
        });
    }
    function findOverlapNotationsOfAnyType(notation) {
        let notationsMap = notationStore.getNotations();
        return Object.entries(notationsMap)
            .map((n) => n[1])
            .find((n2) => {
            switch (notation.notationType) {
                case NotationType.SYMBOL:
                case NotationType.POWER:
                    return (pointAtCellCoordinates(notation, n2, userStore.getCurrentUser().uuid) ??
                        lineAtCellCoordinates(notation, n2, userStore.getCurrentUser().uuid) ??
                        rectAtCellCoordinates(notation, n2, userStore.getCurrentUser().uuid));
                case NotationType.FRACTION:
                case NotationType.SQRT:
                    return (lineAtCellCoordinates(notation, n2, userStore.getCurrentUser().uuid) ??
                        lineAtLineCoordinates(notation, n2, userStore.getCurrentUser().uuid) ??
                        lineAtRectCoordinates(notation, n2, userStore.getCurrentUser().uuid));
                case NotationType.TEXT:
                case NotationType.IMAGE:
                case NotationType.GEO:
                    return (pointAtRectCoordinates(notation, n2, userStore.getCurrentUser().uuid) ??
                        lineAtRectCoordinates(notation, n2, userStore.getCurrentUser().uuid) ??
                        rectAtRectCoordinates(notation, n2, userStore.getCurrentUser().uuid));
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
                .then(() => notationStore.getNotations().value.delete(n.uuid));
        });
        return symbolsAtCell;
    }
    ///TODO - check if needs to return notation
    async function removeActiveNotation() {
        if (!authHelper.canEdit()) {
            return null;
        }
        if (!notationStore.getActiveNotation())
            return null;
        await dbHelper.removeNotation(notationStore.getActiveNotation());
        notationStore
            .getNotations().value
            .delete(notationStore.getActiveNotation().uuid);
        let deletedNotationUUId = notationStore.getActiveNotation()?.uuid;
        notationStore.setActiveNotation(null);
        if (!deletedNotationUUId)
            return null;
        let deletedNotation = notationStore
            .getNotations().value
            .get(deletedNotationUUId);
        if (deletedNotation)
            userOutgoingOperations.syncOutgoingRemoveNotation(deletedNotation.uuid);
        return deletedNotation ? deletedNotation : null;
    }
    async function removeSelectedNotations() {
        if (!authHelper.canEdit)
            return;
        notationStore.getSelectedNotations().forEach(async (uuid) => {
            let n = notationStore.getNotations().value.get(uuid);
            if (!n)
                return;
            await dbHelper.removeNotation(n);
            notationStore.getNotations().value.delete(uuid);
            userOutgoingOperations.syncOutgoingRemoveNotation(n.uuid);
        });
        this.resetSelectedNotations();
    }
    async function selectNotation(CellCoordinates) {
        notationStore.resetSelectedNotations();
        findNotationsByCellCoordinates(CellCoordinates).forEach((n) => {
            notationStore.getSelectedNotations().push(n.uuid);
        });
    }
    // move without persistence - called during  mouse move  - don't bother the database during move
    async function moveSelectedNotations(deltaX, deltaY) {
        notationStore.getSelectedNotations().forEach((uuid) => {
            let n = notationStore.getNotations().value.get(uuid);
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
        notationStore.getSelectedNotations().forEach((uuid) => {
            let n = notationStore.getNotations().value.get(uuid);
            if (!n)
                return;
            if (isNotationInQuestionArea(n)) {
                return;
            }
        });
        notationStore.getSelectedNotations().forEach(async (uuid) => {
            let n = notationStore.getNotations().value.get(uuid);
            if (!n)
                return;
            if (isNotationInQuestionArea(n))
                return;
            await dbHelper.updateNotation(n);
            userOutgoingOperations.syncOutgoingUpdateSelectedNotation(n);
        });
        notationStore.resetSelectedNotations();
    }
    async function updateNotation(notation) {
        // disallow update for student in question area
        if (isNotationInQuestionArea(notation)) {
            return;
        }
        await dbHelper.updateNotation(notation);
        notationStore.getNotations().value.set(notation.uuid, notation);
    }
    async function addNotation(notation) {
        //notation.user.uuid = userStore.getCurrentUser().uuid;
        let overlappedSameTypeNotation = findOverlapNotationsOfSameType(notation);
        if (overlappedSameTypeNotation) {
            setNotationAttributes(overlappedSameTypeNotation, notation);
            await dbHelper.updateNotation(overlappedSameTypeNotation);
            notationStore
                .getNotations().value
                .set(overlappedSameTypeNotation.uuid, overlappedSameTypeNotation);
            return overlappedSameTypeNotation;
        }
        let overlappedAnyTypeNotation = findOverlapNotationsOfAnyType(notation);
        // don't allow override of other type notation
        if (overlappedAnyTypeNotation) {
            return null;
        }
        // no overlapping -> add
        let newNotation = await dbHelper.addNotation(notation);
        notationStore.addNotation(newNotation);
        return newNotation;
    }
    async function syncIncomingAddedNotation(notation) {
        notationStore.getNotations().value.set(notation.uuid, notation);
    }
    async function syncIncomingRemovedNotation(notation) {
        notationStore.getNotations().value.delete(notation.uuid);
    }
    async function syncIncomingUpdatedtNotation(notation) {
        notationStore.getNotations().value.set(notation.uuid, notation);
    }
    async function removeAllNotations() {
        notationStore.getNotations().value.clear();
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
                    !userStore.isTeacher() &&
                    notationStore
                        .getCellOccupationMatrix()
                        .at(pointNotation.row)
                        ?.at(pointNotation.col)?.boardType == BoardType.QUESTION);
            }
            case NotationShape.LINE: {
                let lineNotation = notation;
                for (let i = lineNotation.fromCol; i <= lineNotation.toCol; i++) {
                    if (notation?.boardType === BoardType.ANSWER &&
                        !userStore.isTeacher() &&
                        notationStore.getCellOccupationMatrix().at(lineNotation.row)?.at(i)
                            ?.boardType == BoardType.QUESTION)
                        return true;
                }
            }
            case NotationShape.RECT: {
                let rectNotation = notation;
                for (let i = rectNotation.fromCol; i <= rectNotation.toCol; i++) {
                    for (let j = rectNotation.fromRow; i <= rectNotation.toRow; j++) {
                        if (notation?.boardType === BoardType.ANSWER &&
                            !userStore.isTeacher() &&
                            notationStore.getCellOccupationMatrix().at(j)?.at(i)?.boardType ==
                                BoardType.QUESTION)
                            return true;
                    }
                }
            }
        }
        return false;
    }
    async function removeNotationsByRect(rectNotaion) {
        let notationsAtRectCoordinates = findNotationsByRectCoordinates(notationStore.getNotations().value, rectNotaion);
        if (!notationsAtRectCoordinates)
            return;
        notationsAtRectCoordinates.forEach(async (n) => {
            n.boardType = notationStore.getParent().value.type;
            await dbHelper
                .removeNotation(n)
                .then(() => notationStore.getNotations().value.delete(n.uuid));
        });
    }
    function isCellInQuestionArea(CellCoordinates) {
        return (notationStore.getParent().value.type == BoardType.ANSWER &&
            !userStore.isTeacher() &&
            CellCoordinates &&
            notationStore
                .getCellOccupationMatrix()
                .at(CellCoordinates.row)
                ?.at(CellCoordinates.col)?.boardType == "QUESTION");
    }
    function addMarkNotation() {
        if (notationStore.getEditMode().value == "CHECKMARK") {
            addSymbolNotation("&#x2714");
            return;
        }
        if (notationStore.getEditMode().value == "SEMICHECKMARK") {
            addSymbolNotation("&#x237B");
            return;
        }
        if (notationStore.getEditMode().value == "XMARK") {
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
        if (notationStore.getActiveCell()) {
            removeActiveCellNotations();
        }
        if (notationStore.getActiveNotation()) {
            removeActiveNotation();
        }
        if (notationStore.getActiveNotation()) {
            removeSelectedNotations();
        }
    }
    async function removeActiveCellNotations() {
        if (!notationStore.getActiveCell().value)
            return;
        let notationsToDelete = await removeSymbolsByCell(notationStore.getActiveCell().value);
        if (!notationsToDelete)
            return;
        notationsToDelete.forEach((notation) => {
            userOutgoingOperations.syncOutgoingRemoveNotation(notation.uuid);
        });
    }
    function addImageNotation(fromCol, toCol, fromRow, toRow, base64Value) {
        let notation = {
            fromCol: fromCol,
            toCol: toCol,
            fromRow: fromRow,
            toRow: toRow,
            value: base64Value,
            boardType: notationStore.getParent().value.type,
            notationType: NotationType.IMAGE,
            user: userStore.getCurrentUser(),
        };
        addNotation(notation);
        // .then(() => {
        //   if (notationStore.getParent().type === BoardType.LESSON) {
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
            boardType: notationStore.getParent().value.type,
            notationType: NotationType.TEXT,
            user: userStore.getCurrentUser(),
        };
        addNotation(notation);
        // notationStore.resetActiveCell();
    }
    function addSymbolNotation(value) {
        if (!notationStore.getActiveCell())
            return;
        let notation = {
            col: notationStore.getActiveCell().value.col,
            row: notationStore.getActiveCell().value.row,
            value: value,
            boardType: notationStore.getParent().value.type,
            notationType: NotationType.SYMBOL,
            user: userStore.getCurrentUser(),
        };
        addNotation(notation);
        // if (notationStore.getParent().type === BoardType.LESSON) {
        //   userOutgoingOperations.syncOutgoingSaveNotation(notation);
        // }
        if (notationStore.getEditMode().value == "SYMBOL") {
            matrixHelper.setNextRect(1, 0);
        }
    }
    function addSqrtNotation(coordinates) {
        let notation = {
            fromCol: coordinates.fromCol,
            toCol: coordinates.fromCol,
            row: coordinates.row,
            boardType: notationStore.getParent().value.type,
            notationType: NotationType.SQRT,
            user: userStore.getCurrentUser(),
        };
        addNotation(notation);
        //if (notationStore.getParent().type === BoardType.LESSON) {
        //   userOutgoingOperations.syncOutgoingSaveNotation(notation);
        // }
    }
    function addFractiontNotation(coordinates) {
        let notation = {
            fromCol: coordinates.fromCol,
            toCol: coordinates.fromCol,
            row: coordinates.row,
            boardType: notationStore.getParent().value.type,
            notationType: NotationType.FRACTION,
            user: userStore.getCurrentUser(),
        };
        addNotation(notation);
        // if (notationStore.getParent().type === BoardType.LESSON) {
        //   userOutgoingOperations.syncOutgoingSaveNotation(notation);
        // }
    }
    function setCurrentEditMode(editMode) {
        notationStore.setCurrentEditMode(editMode);
    }
    return {
        selectNotation,
        isNotationInQuestionArea,
        isCellInQuestionArea,
        removeNotationsByRect,
        addSymbolNotation,
        addMarkNotation,
        addImageNotation,
        addTextNotation,
        addFractiontNotation,
        addSqrtNotation,
        removeActiveOrSelectedNotations,
        moveSelectedNotations,
        updateSelectedNotationCoordinates,
        setCurrentEditMode,
    };
}
//# sourceMappingURL=notationMutateHelper.js.map
