import { NotationType, NotationTypeShape } from "common/unions";
import { useNotationStore } from "../store/pinia/notationStore";
import { DotPosition } from "common/globals";
import { PointAttributes, NotationAttributes } from "common/baseTypes";
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
  //function selectNotationAtClickedPosition(position: DotPosition) {
  //  notationStore.resetSelectedNotations();

  //const selectedNotation =
  //  return selectNotationAtPosition(position);
  // if (
  //   selectedNotation &&
  //   NotationTypeShape.get(selectedNotation.notationType) !== "POINT"
  // ) {
  //   return;
  // }
  //}

  function selectNotationAtPosition(
    svgId: string,
    position: DotPosition,
  ): NotationAttributes | null {
    notationStore.resetSelectedNotations();
    /*
    const el = elementFinderHelper.findClickedNotation(
      {
        x: position.x,
        y: position.y,
      },
      "foreignObject",
      null,
    );
    if (!el) {
      return null;
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
      return null;
    }*/

    const notation = elementFinderHelper.findClickedNotation(svgId, position);

    if (!notation) return null;

    switch (NotationTypeShape.get(notation!.notationType)) {
      case "LINE": {
        if (notation!.notationType == "FRACTION")
          selectFractionNotation(notation!);
        if (notation!.notationType == "SQRT") selectSqrtNotation(notation!);
        break;
      }
      case "RECT":
      case "POINT": {
        selectNotation(notation!);
        break;
      }
    }

    return notation;
  }

  function selectNotation(activeNotation: NotationAttributes) {
    // disallow selection of question notations for student
    if (notationMutateHelper.isNotationInQuestionArea(activeNotation, 0, 0))
      return;

    //editModeStore.setEditMode("AREA_SELECTED");

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

  async function selectCell(svgId: string, position: DotPosition) {
    let clickedCell = elementFinderHelper.findClickedCell(svgId, position);

    // if (!clickedCell?.parentElement) {
    //   return null;
    // }

    // const col = elementFinderHelper.getElementAttributeValue(
    //   clickedCell,
    //   "col",
    // );
    // const row = elementFinderHelper.getElementAttributeValue(
    //   clickedCell.parentElement,
    //   "row",
    // );

    // let cellToActivate: PointAttributes = {
    //   col: parseInt(col || "-1"),
    //   row: parseInt(row || "-1"),
    // };

    if (!clickedCell) return;

    notationStore.selectCell(clickedCell!);

    if (!editModeStore.isCheckMode()) {
      editModeStore.setEditMode("CELL_SELECTED");
    }

    if (notationStore.getParent().type == "LESSON") {
      let t = await userOutgoingOperationsHelper.syncOutgoingSelectedCell(
        clickedCell,
        lessonStore.getCurrentLesson()!.uuid,
      );
    }
  }

  // selectNotationBySelectedCell() {
  //   const { col, row } = notationStore.getSelectedCell()

  //   notationStore.getNotations().find(n =>
  //     switch(NotationTypeShape.get(n.notationType)
  // }

  return {
    selectNotationAtPosition,
    selectCell,
  };
}
