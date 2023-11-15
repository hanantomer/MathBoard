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
import { useEditModeStore } from "../store/pinia/editModeStore";
const eventBus = useEventBus();
const notationStore = useNotationStore();
const notationMutateHelper = useNotationMutateHelper();
const elementFinderHelper = useElementFinderHelper();
const userOutgoingOperationsHelper = useUserOutgoingOperationsHelper();
const lessonStore = useLessonStore();
const editModeStore = useEditModeStore();

///TODO : split function to shorter blocks
export default function selectionHelper() {
  // called via mouse click
  function selectClickedObject(e: MouseEvent) {
    // dont active object after click on toolbar fraction or sqrt
    if (editModeStore.isLineMode()) {
      return;
    }

    if (editModeStore.isSelectionMode()) {
      return;
    }

    resetSelection();

    if (selectRectNotation(e)) return;

    if (selectFractionNotation(e)) return;

    if (selectSqrtNotation(e)) return;

    // no underlying elements found, activate single cell
    selectCell(e);
  }

  function selectNotation(activeNotation: NotationAttributes) {
    // disallow activation of question rows for student
    if (notationMutateHelper.isNotationInQuestionArea(activeNotation)) return;

    notationStore.selectNotation(activeNotation?.uuid);
  }

  function resetSelection() {
    notationStore.selectCell(null);
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
    newSelectedCell: CellCoordinates | null | undefined,
    oldSelectedCell: CellCoordinates | null | undefined,
  ) {
    if (oldSelectedCell?.col != null) {
      let prevRectElm = document
        ?.querySelector<HTMLElement>(
          `svg[id="${svgId}"] g[row="${oldSelectedCell.row}"]`,
        )
        ?.querySelector<HTMLElement>(`rect[col="${oldSelectedCell.col}"]`);

      if (prevRectElm?.style) prevRectElm.style.fill = "";
    }

    if (newSelectedCell?.col != null) {
      let rectElm = document
        ?.querySelector<HTMLElement>(
          `svg[id="${svgId}"] g[row="${newSelectedCell.row}"]`,
        )
        ?.querySelector<HTMLElement>(`rect[col="${newSelectedCell.col}"]`);

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

  function selectRectNotation(e: MouseEvent): boolean {
    const rectElement = elementFinderHelper.findClickedObject(
      {
        x: e.clientX,
        y: e.clientY,
      },
      "foreignObject",
      ["TEXT", "IMAGE", "GEO"],
    );
    if (!rectElement) return false;

    let overlapRectNotation = getOverlappedRectNotation(e);
    if (!overlapRectNotation) return false;

    selectNotation(overlapRectNotation);

    /// TODO move to state machine i.e set state by selected notation
    /*const editMode = NotationTypeEditMode.get(
      overlapRectNotation!.notationType,
    );
    if (editMode) {
      notationStore.setEditMode(editMode);
    }*/

    return true;
  }

  function selectFractionNotation(e: MouseEvent): boolean {
    const fractionElement = elementFinderHelper.findClickedObject(
      {
        x: e.clientX,
        y: e.clientY,
      },
      "foreignObject",
      ["FRACTION"],
    );
    if (!fractionElement) return false;

    const fractionNotation = getOverlappedLineNotation(fractionElement);
    if (!fractionNotation) return false;

    editModeStore.setEditMode("FRACTION_SELECTING");

    // signal LineDrawer.vue
    eventBus.emit("lineSelected", fractionNotation);
    return true;
  }

  function selectSqrtNotation(e: MouseEvent): boolean {
    const sqrtElement = elementFinderHelper.findClickedObject(
      {
        x: e.clientX,
        y: e.clientY,
      },
      "foreignObject",
      ["SQRT"],
    );
    if (!sqrtElement) return false;

    const sqrtNotation = getOverlappedLineNotation(sqrtElement);
    if (!sqrtNotation) return false;

    editModeStore.setEditMode("SQRT_SELECTING");
    // signal LineDrawer.vue
    eventBus.emit("lineSelected", sqrtNotation);
    return true;
  }

  // update, store active cell
  async function selectCell(e: MouseEvent) {
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

    notationStore.selectCell(cellToActivate);
    editModeStore.resetEditMode();

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
    selectClickedObject,
    resetSelection,
  };
}
