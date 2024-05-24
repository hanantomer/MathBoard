import { NotationTypeShape } from "common/unions";
import { useNotationStore } from "../store/pinia/notationStore";
import { AreaCoordinates, DotPosition } from "common/globals";
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
  function selectNotationsOfArea(
    svgId: string,
    areaCoordinates: AreaCoordinates,
  ) {
    const areaCells = elementFinderHelper.findAreaCells(svgId, areaCoordinates);
    notationStore.selectNotationsOfCells(areaCells);
  }

  function selectNotationAtPosition(
    svgId: string,
    position: DotPosition,
  ): NotationAttributes | null {
    notationStore.resetSelectedNotations();

    const notation = elementFinderHelper.findPointNotation(svgId, position);

    if (!notation) return null;

    switch (NotationTypeShape.get(notation!.notationType)) {
      case "HORIZONTAL_LINE":
      case "VERTICAL_LINE":
      case "SLOPE_LINE": {
        selectLineNotation(notation!);
        break;
      }
      case "RECT":
      case "POINT": {
        selectPointOrRectNotation(notation!);
        break;
      }
    }

    return notation;
  }

  function selectPointOrRectNotation(activeNotation: NotationAttributes) {
    // disallow selection of question notations for student
    if (notationMutateHelper.isNotationInQuestionArea(activeNotation, 0, 0))
      return;

    if (activeNotation.notationType === "TEXT") {
      eventBus.emit("FREE_TEXT_SELECTED", activeNotation);
    }

    notationStore.selectNotation(activeNotation?.uuid);
  }

  function selectLineNotation(notation: NotationAttributes) {
    switch (notation.notationType) {
      case "SQRT":
        editModeStore.setEditMode("SQRT_SELECTED");
        eventBus.emit("HORIZONTAL_LINE_SELECTED", notation);
        break;
      case "HORIZONTALLINE":
        editModeStore.setEditMode("HORIZONTAL_LINE_SELECTED");
        eventBus.emit("HORIZONTAL_LINE_SELECTED", notation);
        break;
      case "VERTICALLINE":
        editModeStore.setEditMode("VERTICAL_LINE_SELECTED");
        eventBus.emit("VERTICAL_LINE_SELECTED", notation);
        break;
      case "SLOPELINE":
        editModeStore.setEditMode("SLOPE_LINE_SELECTED");
        eventBus.emit("SLOPE_LINE_SELECTED", notation);
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
    selectNotationsOfArea,
    selectCell,
  };
}
