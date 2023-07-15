
import { watch } from "vue"
import { EditMode, NotationShape, NotationType } from "../../../math-common/src/enum";
import { RectNotation, LineNotation } from "./responseTypes";
import { useNotationStore } from "../store/pinia/notationStore";
import {
  CellCoordinates,
  activeCellColor,
} from "../../../math-common/src/globals";
import { storeToRefs } from 'pinia'
import useMatrixHelper from "./matrixHelper"
import useNotationMutateHelper from "./notationMutateHelper"

const notationMutateHelper = useNotationMutateHelper();
const matrixHelper = useMatrixHelper();
const notationStore = useNotationStore();
const { activeCell } = storeToRefs(notationStore)

export default function activateObjectHelper() {

  watch(activeCell, (oldActiveCell, newActiveCell) => {
    activateCell(newActiveCell, oldActiveCell);
  })

  // called via mouse click
  function activateClickedObject(e: MouseEvent): CellCoordinates | null {
    let clickedRect = matrixHelper.findClickedObject(
      e,
      "rect",
      NotationType.TEXT
    );

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

  function getElementCoordinateValue(element: Element, attrName: string): number{
    let val = element.attributes.getNamedItem(attrName)?.value;
    return val  ? Number.parseInt(val) : -1;
  }

  function getOverlappedRectNotation(e: MouseEvent): RectNotation | null | undefined {
    let rectElement = matrixHelper.findTextAtClickedPosition(e);
    if (!rectElement) return null;

    return notationStore.getNotations<RectNotation>(NotationShape.RECT).find((n: RectNotation) => {
      getElementCoordinateValue(rectElement, "fromCol") >= n.fromCol &&
      getElementCoordinateValue(rectElement, "toCol") <= n.toCol &&
      getElementCoordinateValue(rectElement, "fromRow") >= n.fromRow &&
      getElementCoordinateValue(rectElement, "toRow") >= n.toRow
    });
  }

  function getOverlappedLineNotation(e: MouseEvent) {
    let fractionElement =  matrixHelper.findClickedObject(
      {
        x: e.clientX,
        y: e.clientY,
      },
      "foreignObject",
      NotationType.FRACTION
    );

    if (!fractionElement) return;

    return notationStore
      .getNotations <LineNotation>(NotationShape.LINE)
      .find((n: LineNotation) => {
        getElementCoordinateValue(fractionElement, "fromCol") >= n.fromCol &&
          getElementCoordinateValue(fractionElement, "toCol") <= n.toCol &&
          getElementCoordinateValue(fractionElement, "row") >= n.row &&
          getElementCoordinateValue(fractionElement, "row") >= n.row;
      });
  }


  // called by store watcher
  function activateCell(
    activeCell: CellCoordinates | null,
    prevActiveCell: CellCoordinates | null
  ) {
    this.activateObjectMixin_unselectPreviouslyActiveCell(prevActiveCell);
    if (!activeCell?.col) return;

    let rectElm = document
      ?.querySelector<HTMLElement>(
        `svg[id="${this.svgId}"] g[row="${activeCell.row}"]`
      )
      ?.querySelector<HTMLElement>(`rect[col="${activeCell.col}"]`);

    if (rectElm?.style) rectElm.style.fill = activeCellColor;
  }

  return { activateCell, reset, activateClickedObject };
}
