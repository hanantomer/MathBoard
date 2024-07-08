import { NotationTypeShape } from "common/unions";
import { useNotationStore } from "../store/pinia/notationStore";
import { useCellStore } from "../store/pinia/cellStore";
import { ScreenCoordinates, DotPosition } from "common/globals";
import { NotationAttributes } from "common/baseTypes";
import { useLessonStore } from "../store/pinia/lessonStore";
import { useEditModeStore } from "../store/pinia/editModeStore";
import usescreenHelper from "./screenHelper";
import useNotationMutateHelper from "./notationMutateHelper";
import useUserOutgoingOperationsHelper from "./userOutgoingOperationsHelper";
import useEventBus from "./eventBusHelper";

const eventBus = useEventBus();
const cellStore = useCellStore();
const notationMutateHelper = useNotationMutateHelper();
const screenHelper = usescreenHelper();
const userOutgoingOperationsHelper = useUserOutgoingOperationsHelper();
const lessonStore = useLessonStore();
const editModeStore = useEditModeStore();

export default function selectionHelper() {
  function selectNotationsOfArea(
    svgId: string,
    screenCoordinates: ScreenCoordinates,
  ) {
    const notationStore = useNotationStore(); // must be initlized here to  prevent circular refernce
    const areaCells = screenHelper.getScreenCoordinatesOccupiedCells(
      svgId,
      screenCoordinates,
    );
    notationStore.selectNotationsOfCells(areaCells);
  }

  function selectNotationAtPosition(
    svgId: string,
    position: DotPosition,
  ): NotationAttributes | null {
    const notationStore = useNotationStore();
    notationStore.resetSelectedNotations();

    const notation = screenHelper.getPointNotation(svgId, position);

    if (!notation) return null;

    switch (NotationTypeShape.get(notation!.notationType)) {
      case "HORIZONTAL_LINE":
      case "VERTICAL_LINE":
      case "SLOPE_LINE": {
        selectLineNotation(notation!);
        break;
      }
      case "CONVEX_CURVE":
      case "CONCAVE_CURVE":  {
        selectCurveNotation(notation!);
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
    const notationStore = useNotationStore();
    // disallow selection of question notations for student
    if (notationMutateHelper.isNotationInQuestionArea(activeNotation, 0, 0))
      return;

    if (activeNotation.notationType === "TEXT") {
      eventBus.emit("FREE_TEXT_SELECTED", activeNotation);
    }

    notationStore.selectNotation(activeNotation?.uuid);
  }

  function selectCurveNotation(notation: NotationAttributes) {
    switch (notation.notationType) {
      case "CONCAVECURVE":
        editModeStore.setEditMode("CONCAVE_CURVE_SELECTED");
        eventBus.emit("CONCAVE_CURVE_SELECTED", notation);
        break;
      case "CONVEXCURVE":
        editModeStore.setEditMode("CONVEX_CURVE_SELECTED");
        eventBus.emit("CONVEX_CURVE_SELECTED", notation);
    }
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
    const notationStore = useNotationStore();
    let clickedCell = screenHelper.getClickedCell(svgId, position);

    if (!clickedCell) return;

    cellStore.selectCell(clickedCell!);

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
