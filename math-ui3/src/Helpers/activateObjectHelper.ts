import { NotationTypeEditMode } from "common/unions";
import {
  LineNotationAttributes,
  RectNotationAttributes,
} from "common/baseTypes";
import { useNotationStore } from "../store/pinia/notationStore";
import { activeCellColor, CellCoordinates } from "common/globals";
import { NotationAttributes } from "common/baseTypes";
import useElementFinderHelper from "./elementFinderHelper";
import useNotationMutateHelper from "./notationMutateHelper";
import useUserOutgoingOperationsHelper from "./userOutgoingOperationsHelper";
import useEventBus from "./eventBus";
import { useLessonStore } from "../store/pinia/lessonStore";
const eventBus = useEventBus();
const notationStore = useNotationStore();
const notationMutateHelper = useNotationMutateHelper();
const elementFinderHelper = useElementFinderHelper();
const userOutgoingOperationsHelper = useUserOutgoingOperationsHelper();
const lessonStore = useLessonStore();

///TODO : split function to shorter blocks
export default function activateObjectHelper() {
  // called via mouse click
  function activateClickedObject(e: MouseEvent) {
    // dont active object after click on toolbar fraction or sqrt
    if (notationStore.isLineMode()) {
      return;
    }

    if (notationStore.isSelectionMode()) {
      return;
    }

    if (setActiveRect(e)) return;

    if (setActiveFraction(e)) return;

    if (setActiveSqrt(e)) return;

    // no underlying elements found, activate single cell
    setActiveCell(e);
  }

  async function setActiveNotation(activeNotation: NotationAttributes | null) {
    // disallow activation of question rows for student
    if (notationMutateHelper.isNotationInQuestionArea(activeNotation)) return;
    notationStore.setActiveNotation(activeNotation);
  }

  function reset() {
    notationStore.setActiveCell(null);
    setActiveNotation(null);
  }

  function getOverlappedRectNotation(
    e: MouseEvent,
  ): RectNotationAttributes | null | undefined {
    let rectElement = elementFinderHelper.findRectAtClickedPosition(e);
    if (!rectElement) return null;

    return notationStore
      .getNotationsByShape<RectNotationAttributes>("RECT")
      .find((n: RectNotationAttributes) => {
        elementFinderHelper.getElementAttributeValue(rectElement, "fromCol") >=
          n.fromCol &&
          elementFinderHelper.getElementAttributeValue(rectElement, "toCol") <=
            n.toCol &&
          elementFinderHelper.getElementAttributeValue(
            rectElement,
            "fromRow",
          ) >= n.fromRow &&
          elementFinderHelper.getElementAttributeValue(rectElement, "toRow") >=
            n.toRow;
      });
  }

  // called by store watcher. see mathboard.vue
  function showActiveCell(
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

  function getOverlappedLineNotation(
    lineElement: Element,
  ): NotationAttributes | undefined {
    const lineNotations =
      notationStore.getNotationsByShape<LineNotationAttributes>("LINE");

    return lineNotations.find((n: LineNotationAttributes) => {
      return (
        elementFinderHelper.getElementAttributeValue(lineElement, "fromCol") >=
          n.fromCol &&
        elementFinderHelper.getElementAttributeValue(lineElement, "toCol") <=
          n.toCol &&
        elementFinderHelper.getElementAttributeValue(lineElement, "row") ==
          n.row
      );
    });
  }

  function setActiveRect(e: MouseEvent) {
    let overlapRectNotation = getOverlappedRectNotation(e);
    if (overlapRectNotation) {
      setActiveNotation(overlapRectNotation).then(() => {
        const editMode = NotationTypeEditMode.get(
          overlapRectNotation!.notationType,
        );
        if (editMode) {
          notationStore.setEditMode(editMode);
        }
      });

      return true;
    }
    return false;
  }

  function setActiveFraction(e: MouseEvent) {
    const fractionElement = elementFinderHelper.findClickedObject(
      {
        x: e.clientX,
        y: e.clientY,
      },
      "foreignObject",
      ["FRACTION"],
    );

    notationStore.setEditMode("FRACTION_SELECTING");

    if (fractionElement) {
      //      fractionElement.style.display = "none";
      //notationStore.setHiddenLineElement(fractionElement);
      const fractionNotation = getOverlappedLineNotation(fractionElement);
      if (fractionNotation) {
        // signal LineDrawer.vue
        eventBus.emit("lineSelected", fractionNotation);
        return true;
      }
    }

    return false;
  }

  function setActiveSqrt(e: MouseEvent) {
    const sqrtElement = elementFinderHelper.findClickedObject(
      {
        x: e.clientX,
        y: e.clientY,
      },
      "foreignObject",
      ["SQRT"],
    );

    notationStore.setEditMode("SQRT_SELECTING");

    if (sqrtElement) {
      //sqrtElement.style.display = "none";
      //notationStore.setHiddenLineElement(sqrtElement);
      const sqrtNotation = getOverlappedLineNotation(sqrtElement);
      if (sqrtNotation) {
        // signal LineDrawer.vue
        eventBus.emit("lineSelected", sqrtNotation);
        return true;
      }
    }

    return false;
  }

  // update, store active cell
  async function setActiveCell(e: MouseEvent) {
    let clickedCell = elementFinderHelper.findClickedObject(e, "rect", null);

    if (!clickedCell?.parentElement) {
      return null;
    }

    let cellToActivate: CellCoordinates = {
      col: elementFinderHelper.getElementAttributeValue(clickedCell, "col"),
      row: elementFinderHelper.getElementAttributeValue(
        clickedCell.parentElement!,
        "row",
      )
    };

    notationStore.setActiveCell(cellToActivate);
    notationStore.resetEditMode();

    if (notationStore.getParent().type == "LESSON") {
      let t =
        await userOutgoingOperationsHelper.syncOutgoingActiveCell(
          cellToActivate, lessonStore.getCurrentLesson().uuid
        );
      console.log(t);
    }
  }

  return { showActiveCell, setActiveCell, activateClickedObject, reset };
}
