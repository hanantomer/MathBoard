import { EditMode, NotationShape, NotationType } from "common/enum";
import { useNotationStore } from "../store/pinia/notationStore";
import { activeCellColor } from "common/globals";
import useNotationMutateHelper from "./notationMutateHelper";
import useMatrixHelper from "./matrixHelper";
const matrixHelper = useMatrixHelper();
const notationStore = useNotationStore();
const notationMutateHelper = useNotationMutateHelper();
export default function activateObjectHelper() {
    // called via mouse click
    function activateClickedObject(e) {
        let clickedRect = matrixHelper.findClickedObject(e, "rect", null);
        if (!clickedRect?.parentElement) {
            return null;
        }
        // activate notation
        let overlapRectNotation = getOverlappedRectNotation(e);
        if (overlapRectNotation) {
            setActiveNotation(overlapRectNotation).then(() => {
                if (overlapRectNotation?.notationType == NotationType.TEXT) {
                    notationStore.setCurrentEditMode("TEXT");
                }
            });
            return null;
        }
        let overlapLineNotation = getOverlappedLineNotation(e);
        if (overlapLineNotation) {
            // selection of line is handled in LineDrawer.vue, here we just reset previous activated element
            return null;
        }
        // no underlying elements found, activate single cell
        let cellToActivate = {
            col: getElementCoordinateValue(clickedRect, "col"),
            row: getElementCoordinateValue(clickedRect.parentElement, "row"),
        };
        notationStore.setActiveCell(cellToActivate);
        notationStore.setCurrentEditMode("SYMBOL");
        return cellToActivate;
    }
    async function setActiveNotation(activeNotation) {
        // disallow activation of question rows for student
        if (notationMutateHelper.isNotationInQuestionArea(activeNotation))
            return;
        notationStore.setActiveNotation(activeNotation);
    }
    async function setActiveCell(newActiveCell) {
        if (notationStore.getActiveCell().value != newActiveCell) {
            return;
        }
        if (
        // disallow activation of question cells for student
        notationMutateHelper.isCellInQuestionArea(newActiveCell)) {
            return;
        }
        notationStore.setActiveCell(newActiveCell);
    }
    function reset() {
        setActiveCell(null);
        setActiveNotation(null);
    }
    function getElementCoordinateValue(element, attrName) {
        let val = element.attributes.getNamedItem(attrName)?.value;
        return val ? Number.parseInt(val) : -1;
    }
    function getOverlappedRectNotation(e) {
        let rectElement = matrixHelper.findTextAtClickedPosition(e);
        if (!rectElement)
            return null;
        return notationStore
            .getNotationsByShape(NotationShape.RECT)
            .find((n) => {
            getElementCoordinateValue(rectElement, "fromCol") >= n.fromCol &&
                getElementCoordinateValue(rectElement, "toCol") <= n.toCol &&
                getElementCoordinateValue(rectElement, "fromRow") >= n.fromRow &&
                getElementCoordinateValue(rectElement, "toRow") >= n.toRow;
        });
    }
    function getOverlappedLineNotation(e) {
        let fractionElement = matrixHelper.findClickedObject({
            x: e.clientX,
            y: e.clientY,
        }, "foreignObject", NotationType.FRACTION);
        if (!fractionElement)
            return;
        return notationStore
            .getNotationsByShape(NotationShape.LINE)
            .find((n) => {
            getElementCoordinateValue(fractionElement, "fromCol") >= n.fromCol &&
                getElementCoordinateValue(fractionElement, "toCol") <= n.toCol &&
                getElementCoordinateValue(fractionElement, "row") >= n.row &&
                getElementCoordinateValue(fractionElement, "row") >= n.row;
        });
    }
    // called by store watcher
    function activateCell(svgId, prevActiveCell, activeCell) {
        if (prevActiveCell?.col) {
            let prevRectElm = document
                ?.querySelector(`svg[id="${svgId}"] g[row="${prevActiveCell.row}"]`)
                ?.querySelector(`rect[col="${prevActiveCell.col}"]`);
            if (prevRectElm?.style)
                prevRectElm.style.fill = "";
        }
        if (activeCell?.col) {
            let rectElm = document
                ?.querySelector(`svg[id="${svgId}"] g[row="${activeCell.row}"]`)
                ?.querySelector(`rect[col="${activeCell.col}"]`);
            if (rectElm?.style)
                rectElm.style.fill = activeCellColor;
        }
    }
    return { activateCell, reset, activateClickedObject };
}
//# sourceMappingURL=activateObjectHelper.js.map
