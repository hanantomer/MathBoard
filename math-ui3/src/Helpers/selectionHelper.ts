import { NotationTypeShape } from "common/unions";
import { useNotationStore } from "../store/pinia/notationStore";
import { DotPosition } from "common/globals";
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

export default function selectionHelper() {

  function selectNotationAtPosition(
    svgId: string,
    position: DotPosition,
  ): NotationAttributes | null {

    notationStore.resetSelectedNotations();

    const notation = elementFinderHelper.findClickedNotation(svgId, position);

    if (!notation) return null;

    switch (NotationTypeShape.get(notation!.notationType)) {
      case "HORIZONTAL_LINE":
      case "VERTICAL_LINE":
      case "SLOPE_LINE":
      {
        selectLineNotation(notation!);
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

    notationStore.selectNotation(activeNotation?.uuid);
  }

  function selectLineNotation(notation: NotationAttributes) {

    switch (notation.notationType) {
      case "SQRT":
        editModeStore.setEditMode("SQRT_SELECTED");
        eventBus.emit("horizontalLineSelected", notation);
        break;
      case "HORIZONTALLINE":
        editModeStore.setEditMode("HORIZONTAL_LINE_SELECTED");
        eventBus.emit("horizontalLineSelected", notation);
        break;
      case "VERTICALLINE":
        editModeStore.setEditMode("VERTICAL_LINE_SELECTED");
        eventBus.emit("verticalLineSelected", notation);
        break;
      case "SLOPELINE":
        editModeStore.setEditMode("SLOPE_LINE_SELECTED");
        eventBus.emit("slopeLineSelected", notation);
    }


  }

  async function selectCell(svgId: string, position: DotPosition) {
    let clickedCell = elementFinderHelper.findClickedCell(svgId, position);

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

  return {
    selectNotationAtPosition,
    selectCell,
  };
}
