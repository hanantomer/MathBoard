import {
  NotationType,
  NotationTypeShape,
  NotationTypeValues,
} from "common/unions";
import { useNotationStore } from "../store/pinia/notationStore";
import { CellCoordinates, DotPosition } from "common/globals";
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
  function selectClickedPosition(position: DotPosition) {
    notationStore.resetSelectedNotations();

    selectNotationAtPosition(position);

    selectCell(position);

    //if (notationSelected) {
    //notationStore.selectCell(null);
    //} else {
    //selectCell(position);
    //}
  }

  function selectNotationAtPosition(position: DotPosition): boolean {
    const el = elementFinderHelper.findClickedObject(
      {
        x: position.x,
        y: position.y,
      },
      "foreignObject",
      null,
    );
    if (!el) {
      return false;
    }

    const notationType: NotationType =
      elementFinderHelper.getElementAttributeValue(
        el,
        "notationType",
      ) as NotationType;

    const uuid: string = elementFinderHelper.getElementAttributeValue(
      el,
      "uuid",
    ) as string;

    const notation = notationStore.getNotation(uuid);
    if (!notation) {
      console.warn(`notation with uuid: ${uuid} not found`);
      return false;
    }

    switch (NotationTypeShape.get(notationType)) {
      case "LINE": {
        if (notationType == "FRACTION") selectFractionNotation(notation);
        if (notationType == "SQRT") selectSqrtNotation(notation);
        break;
      }

      case "RECT":
      case "POINT": {
        selectNotation(notation);
        break;
      }
    }

    return true;
  }

  function selectNotation(activeNotation: NotationAttributes) {
    // disallow selection of question notations for student
    if (notationMutateHelper.isNotationInQuestionArea(activeNotation)) return;

    editModeStore.setEditMode("AREA_SELECTED");

    notationStore.selectNotation(activeNotation?.uuid);
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

    if (!editModeStore.isCheckMode()) {
      editModeStore.setEditMode("CELL_SELECTED");
    }

    if (notationStore.getParent().type == "LESSON") {
      let t = await userOutgoingOperationsHelper.syncOutgoingSelectedCell(
        cellToActivate,
        lessonStore.getCurrentLesson()!.uuid,
      );
    }
  }

  return {
    selectClickedPosition,
    selectCell,
  };
}
