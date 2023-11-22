import {
  NotationType,
  NotationTypeEditMode,
  NotationTypeShape,
  NotationTypeValues,
} from "common/unions";
import {
  LineNotationAttributes,
  RectNotationAttributes,
} from "common/baseTypes";
import { useNotationStore } from "../store/pinia/notationStore";
import {
  selectedCellColor,
  CellCoordinates,
  DotPosition,
} from "common/globals";
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
  function selectClickedNotation(position: DotPosition) {
    notationStore.resetSelectedNotations();

    const el = elementFinderHelper.findClickedObject(
      {
        x: position.x,
        y: position.y,
      },
      "foreignObject",
      NotationTypeValues,
    );
    if (!el) {
      selectCell(position);
      return;
    }

    const notationType: NotationType =
      elementFinderHelper.getElementAttributeValue(
        el,
        "notationType",
      ) as NotationType;

    const uuid: string = elementFinderHelper.getElementAttributeValue(
      el,
      "id",
    ) as string;

    const notation = notationStore.getNotation(uuid);
    if (!notation) return;

    switch (NotationTypeShape.get(notationType)) {
      case "LINE": {
        if (notationType == "FRACTION") selectFractionNotation(notation);
        if (notationType == "SQRT") selectSqrtNotation(notation);
        notationStore.selectCell(null);
        return;
      }
      case "RECT": {
        selectNotation(notation);
        notationStore.selectCell(null);
        return;
      }
      case "POINT": {
        selectNotation(notation);
        selectCell(position);
        return;
      }
    }
  }

  function selectNotation(activeNotation: NotationAttributes) {
    // disallow selection of question notations for student
    if (notationMutateHelper.isNotationInQuestionArea(activeNotation)) return;

    editModeStore.setEditMode("AREA_SELECTED");
    notationStore.selectNotation(activeNotation?.uuid);
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

  function selectFractionNotation(notation: NotationAttributes) {
    editModeStore.setEditMode("FRACTION_SELECTED");

    // signal LineDrawer.vue to perform store and visual selection
    eventBus.emit("lineSelected", notation);
  }

  function selectSqrtNotation(notation: NotationAttributes) {
    editModeStore.setEditMode("SQRT_SELECTED");

    // signal LineDrawer.vue to perform store and visual selection
    eventBus.emit("lineSelected", notation);
  }

  // update, store active cell
  async function selectCell(position: DotPosition) {
    let clickedCell = elementFinderHelper.findClickedObject(
      position,
      "rect",
      null,
    );

    if (!clickedCell?.parentElement) {
      return null;
    }

    const col = elementFinderHelper.getElementAttributeValue(
      clickedCell,
      "col",
    );
    const row = elementFinderHelper.getElementAttributeValue(
      clickedCell.parentElement,
      "row",
    );

    let cellToActivate: CellCoordinates = {
      col: parseInt(col || "-1"),
      row: parseInt(row || "-1"),
    };

    notationStore.selectCell(cellToActivate);
    editModeStore.setEditMode("CELL_SELECTED");

    if (notationStore.getParent().type == "LESSON") {
      let t = await userOutgoingOperationsHelper.syncOutgoingSelectedCell(
        cellToActivate,
        lessonStore.getCurrentLesson().uuid,
      );
    }
  }

  return {
    showSelectedCell,
    selectCell,
    selectClickedNotation,
  };
}
