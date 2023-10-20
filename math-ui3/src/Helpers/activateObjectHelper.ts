import { EditMode, NotationShape, NotationType } from "common/unions";
import {
  LineNotationAttributes,
  RectNotationAttributes,
} from "common/baseTypes";
import { useNotationStore } from "../store/pinia/notationStore";
import { activeCellColor, CellCoordinates } from "common/globals";
import { NotationAttributes } from "common/baseTypes";

import useNotationMutateHelper from "./notationMutateHelper";
import useMatrixHelper from "./matrixHelper";
import useEventBus from "./eventBus";

const eventBus = useEventBus();
const matrixHelper = useMatrixHelper();
const notationStore = useNotationStore();
const notationMutateHelper = useNotationMutateHelper();

///TODO : split function to shorter blocks
export default function activateObjectHelper() {
  // called via mouse click
  function activateClickedObject(e: MouseEvent): CellCoordinates | null {
    let clickedRect = matrixHelper.findClickedObject(e, "rect", null);

    if (!clickedRect?.parentElement) {
      return null;
    }

    // activate notation
    let overlapRectNotation = getOverlappedRectNotation(e);
    if (overlapRectNotation) {
      setActiveNotation(overlapRectNotation).then(() => {
        if (overlapRectNotation?.notationType == "TEXT") {
          notationStore.setEditMode("TEXT");
        }
      });
      return null;
    }

    let lineElement = getOverlappedLineElement(e, "FRACTION");
    if (!lineElement) lineElement = getOverlappedLineElement(e, "SQRT");
    if (lineElement) {
      lineElement.style.display = "none";
      notationStore.setHiddenLineElement(lineElement);
      const lineNotation = getOverlappedLineNotation(lineElement);
      if (lineNotation) {
        // signal LineDrawer.vue
        eventBus.emit("lineSelected", lineNotation);
        return null;
      }
    }

    const sqrtElement = getOverlappedLineElement(e, "SQRT");
    if (sqrtElement) {
      sqrtElement.style.display = "none";
      const sqrtNotation = getOverlappedLineNotation(sqrtElement);
      if (sqrtNotation) {
        // signal line drawer
        // selection of line is handled in LineDrawer.vue
        eventBus.emit("lineSelected", sqrtNotation);
        return null;
      }
    }

    // no underlying elements found, activate single cell
    let cellToActivate: CellCoordinates = {
      col: getElementCoordinateValue(clickedRect, "col"),
      row: getElementCoordinateValue(clickedRect.parentElement!, "row"),
    };

    notationStore.setActiveCell(cellToActivate);
    notationStore.setEditMode("SYMBOL");
    return cellToActivate;
  }

  async function setActiveNotation(activeNotation: NotationAttributes | null) {
    // disallow activation of question rows for student
    if (notationMutateHelper.isNotationInQuestionArea(activeNotation)) return;
    notationStore.setActiveNotation(activeNotation);
  }

  async function setActiveCell(newActiveCell: CellCoordinates | null) {
    if (notationStore.getActiveCell().value != newActiveCell) {
      return;
    }

    if (
      // disallow activation of question cells for student
      notationMutateHelper.isCellInQuestionArea(newActiveCell)
    ) {
      return;
    }

    notationStore.setActiveCell(newActiveCell);
  }

  function reset() {
    setActiveCell(null);
    setActiveNotation(null);
  }

  function getElementCoordinateValue(
    element: Element,
    attrName: string,
  ): number {
    let val = element.attributes.getNamedItem(attrName)?.value;
    return val ? Number.parseInt(val) : -1;
  }

  function getOverlappedRectNotation(
    e: MouseEvent,
  ): RectNotationAttributes | null | undefined {
    let rectElement = matrixHelper.findTextAtClickedPosition(e);
    if (!rectElement) return null;

    return notationStore
      .getNotationsByShape<RectNotationAttributes>("RECT")
      .find((n: RectNotationAttributes) => {
        getElementCoordinateValue(rectElement, "fromCol") >= n.fromCol &&
          getElementCoordinateValue(rectElement, "toCol") <= n.toCol &&
          getElementCoordinateValue(rectElement, "fromRow") >= n.fromRow &&
          getElementCoordinateValue(rectElement, "toRow") >= n.toRow;
      });
  }

  function getOverlappedLineElement(
    e: MouseEvent,
    notationType: NotationType,
  ): HTMLElement | null {
    let lineElement = matrixHelper.findClickedObject(
      {
        x: e.clientX,
        y: e.clientY,
      },
      "foreignObject",
      notationType,
    );

    return lineElement;
  }

  function getOverlappedLineNotation(
    lineElement: Element,
  ): NotationAttributes | undefined {
    const lineNotations =
      notationStore.getNotationsByShape<LineNotationAttributes>("LINE");

    return lineNotations.find((n: LineNotationAttributes) => {
      return (
        getElementCoordinateValue(lineElement, "fromCol") >= n.fromCol &&
        getElementCoordinateValue(lineElement, "toCol") <= n.toCol &&
        getElementCoordinateValue(lineElement, "row") == n.row
      );
    });
  }

  // called by store watcher
  function activateCell(
    svgId: string,
    prevActiveCell: CellCoordinates | undefined,
    activeCell: CellCoordinates,
  ) {
    if (prevActiveCell?.col != null) {
      let prevRectElm = document
        ?.querySelector<HTMLElement>(
          `svg[id="${svgId}"] g[row="${prevActiveCell.row}"]`,
        )
        ?.querySelector<HTMLElement>(`rect[col="${prevActiveCell.col}"]`);

      if (prevRectElm?.style) prevRectElm.style.fill = "";
    }

    if (activeCell?.col != null) {
      let rectElm = document
        ?.querySelector<HTMLElement>(
          `svg[id="${svgId}"] g[row="${activeCell.row}"]`,
        )
        ?.querySelector<HTMLElement>(`rect[col="${activeCell.col}"]`);

      if (rectElm?.style) rectElm.style.fill = activeCellColor;
    }
  }

  return { activateCell, reset, activateClickedObject };
}
