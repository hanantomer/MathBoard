import { NotationTypeEditMode } from "common/unions";
import {
  LineNotationAttributes,
  RectNotationAttributes,
} from "common/baseTypes";
import { useNotationStore } from "../store/pinia/notationStore";
import { selectedCellColor, CellCoordinates } from "common/globals";
import { NotationAttributes } from "common/baseTypes";
import useElementFinderHelper from "./elementFinderHelper";
import useNotationMutateHelper from "./notationMutateHelper";
import useUserOutgoingOperationsHelper from "./userOutgoingOperationsHelper";
import useEventBus from "./eventBusHelper";
import { useLessonStore } from "../store/pinia/lessonStore";
const eventBus = useEventBus();
const notationStore = useNotationStore();
const notationMutateHelper = useNotationMutateHelper();
const elementFinderHelper = useElementFinderHelper();
const userOutgoingOperationsHelper = useUserOutgoingOperationsHelper();
const lessonStore = useLessonStore();

///TODO : split function to shorter blocks
export default function selectionHelper() {
  // called via mouse click
  function selectClickedObject(e: MouseEvent) {
    // dont active object after click on toolbar fraction or sqrt
    if (notationStore.isLineMode()) {
      return;
    }

    if (notationStore.isSelectionMode()) {
      return;
    }

    if (setActiveRectNotation(e)) return;

    if (setActiveFractionNotation(e)) return;

    if (setActiveSqrtNotation(e)) return;

    // no underlying elements found, activate single cell
    setSelectedCell(e);
  }

  function selectNotation(activeNotation: NotationAttributes) {
    // disallow activation of question rows for student
    if (notationMutateHelper.isNotationInQuestionArea(activeNotation)) return;

    notationStore.selectNotation(activeNotation?.uuid);
  }

  function resetSelection() {
    notationStore.setSelectedCell(null);
    notationStore.resetSelectedNotations();
  }

  function getOverlappedRectNotation(
    e: MouseEvent,
  ): RectNotationAttributes | null | undefined {
    let rectElement = elementFinderHelper.findRectAtClickedPosition(e);
    if (!rectElement) return null;

    const rectNotation: RectNotationAttributes | undefined = notationStore
      .getNotationsByShape<RectNotationAttributes>("RECT")
      .find((n: RectNotationAttributes) => {
        return (
          elementFinderHelper.getElementAttributeValue(
            rectElement,
            "fromCol",
          ) == n.fromCol &&
          elementFinderHelper.getElementAttributeValue(rectElement, "toCol") ==
            n.toCol &&
          elementFinderHelper.getElementAttributeValue(
            rectElement,
            "fromRow",
          ) == n.fromRow &&
          elementFinderHelper.getElementAttributeValue(rectElement, "toRow") ==
            n.toRow
        );
      });

    return rectNotation;
  }

  // called by store watcher. see mathboard.vue
  /// TODO - move to dom helper or matrix helper
  function showSelectedCell(
    svgId: string,
    prevSelectedCell: CellCoordinates | undefined,
    selectedCell: CellCoordinates,
  ) {
    if (prevSelectedCell?.col != null) {
      let prevRectElm = document
        ?.querySelector<HTMLElement>(
          `svg[id="${svgId}"] g[row="${prevSelectedCell.row}"]`,
        )
        ?.querySelector<HTMLElement>(`rect[col="${prevSelectedCell.col}"]`);

      if (prevRectElm?.style) prevRectElm.style.fill = "";
    }

    if (selectedCell?.col != null) {
      let rectElm = document
        ?.querySelector<HTMLElement>(
          `svg[id="${svgId}"] g[row="${selectedCell.row}"]`,
        )
        ?.querySelector<HTMLElement>(`rect[col="${selectedCell.col}"]`);

      if (rectElm?.style) rectElm.style.fill = selectedCellColor;
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

  function setActiveRectNotation(e: MouseEvent): boolean {
    let overlapRectNotation = getOverlappedRectNotation(e);
    if (overlapRectNotation) {
      selectNotation(overlapRectNotation);

      /// TODO move to state machine i.e set state by selected notation
      const editMode = NotationTypeEditMode.get(
        overlapRectNotation!.notationType,
      );

      if (editMode) {
        notationStore.setEditMode(editMode);
      }
      return true;
    }
    return false;
  }

  function setActiveFractionNotation(e: MouseEvent): boolean {
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

  function setActiveSqrtNotation(e: MouseEvent): boolean {
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
  async function setSelectedCell(e: MouseEvent) {
    let clickedCell = elementFinderHelper.findClickedObject(e, "rect", null);

    if (!clickedCell?.parentElement) {
      return null;
    }

    let cellToActivate: CellCoordinates = {
      col: elementFinderHelper.getElementAttributeValue(clickedCell, "col"),
      row: elementFinderHelper.getElementAttributeValue(
        clickedCell.parentElement!,
        "row",
      ),
    };

    notationStore.setSelectedCell(cellToActivate);
    notationStore.resetEditMode();

    if (notationStore.getParent().type == "LESSON") {
      let t = await userOutgoingOperationsHelper.syncOutgoingSelectedCell(
        cellToActivate,
        lessonStore.getCurrentLesson().uuid,
      );
      console.log(t);
    }
  }

  return {
    showSelectedCell,
    //setSelectedCell,
    selectClickedObject,
    resetSelection,
  };
}
