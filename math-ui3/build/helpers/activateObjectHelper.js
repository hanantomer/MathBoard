import { watch } from "vue";
import { EditMode, NotationShape, NotationType, } from "common/enum";
import { useNotationStore } from "../store/pinia/notationStore";
import { activeCellColor, } from "common/globals";
import useMatrixHelper from "./matrixHelper";
import useNotationMutateHelper from "./notationMutateHelper";
const notationMutateHelper = useNotationMutateHelper();
const matrixHelper = useMatrixHelper();
const notationStore = useNotationStore();
export default function activateObjectHelper() {
    watch(notationStore.activeCell, (oldActiveCell, newActiveCell) => {
        if (newActiveCell)
            activateCell(newActiveCell, oldActiveCell);
    });
    // called via mouse click
    function activateClickedObject(e) {
        let clickedRect = matrixHelper.findClickedObject(e, "rect", NotationType.TEXT);
        if (!clickedRect) {
            return null;
        }
        // activate notation
        let overlapRectNotation = getOverlappedRectNotation(e);
        if (overlapRectNotation) {
            notationMutateHelper.setActiveNotation(overlapRectNotation).then(() => {
                if (overlapRectNotation?.notationType == NotationType.TEXT) {
                    notationStore.setCurrentEditMode(EditMode.TEXT);
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
            row: getElementCoordinateValue(clickedRect, "row"),
        };
        notationStore.setActiveCell(cellToActivate);
        notationStore.setCurrentEditMode(EditMode.SYMBOL);
        return cellToActivate;
    }
    function reset() {
        notationMutateHelper.setActiveCell(null);
        notationMutateHelper.setActiveNotation(null);
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
    function activateCell(activeCell, prevActiveCell) {
        this.activateObjectMixin_unselectPreviouslyActiveCell(prevActiveCell);
        if (!activeCell?.col)
            return;
        let rectElm = document
            ?.querySelector(`svg[id="${this.svgId}"] g[row="${activeCell.row}"]`)
            ?.querySelector(`rect[col="${activeCell.col}"]`);
        if (rectElm?.style)
            rectElm.style.fill = activeCellColor;
    }
    return { activateCell, reset, activateClickedObject };
}
//# sourceMappingURL=activateObjectHelper.js.map