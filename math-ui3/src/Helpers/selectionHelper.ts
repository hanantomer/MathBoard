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
