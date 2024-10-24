import { NotationTypeShape } from "common/unions";
import { useNotationStore } from "../store/pinia/notationStore";
import { useCellStore } from "../store/pinia/cellStore";
import {
  RectCoordinates,
  DotCoordinates,
  VerticalLineNotationAttributes,
  HorizontalLineNotationAttributes,
  SlopeLineNotationAttributes,
} from "common/baseTypes";
import { NotationAttributes } from "common/baseTypes";
import { useLessonStore } from "../store/pinia/lessonStore";
import { useEditModeStore } from "../store/pinia/editModeStore";
import usescreenHelper from "./screenHelper";
import useNotationMutateHelper from "./notationMutateHelper";
import useUserOutgoingOperationsHelper from "./userOutgoingOperationsHelper";
import useEventBus from "./eventBusHelper";
import { max } from "d3";

const eventBus = useEventBus();
const cellStore = useCellStore();
const notationMutateHelper = useNotationMutateHelper();
const screenHelper = usescreenHelper();
const userOutgoingOperationsHelper = useUserOutgoingOperationsHelper();
const lessonStore = useLessonStore();
const editModeStore = useEditModeStore();

export default function selectionHelper() {
  function selectNotationsOfArea(RectCoordinates: RectCoordinates) {
    // must be initialized here to prevent circular refernce
    const notationStore = useNotationStore();
    const areaCells =
      screenHelper.getRectCoordinatesOccupiedCells(RectCoordinates);
    notationStore.selectNotationsOfCells(areaCells);
  }

  function selectNotationAtPosition(dotCoordinates: DotCoordinates): boolean {
    const maxDistanceToSelect = 5;
    const notationStore = useNotationStore();
    notationStore.resetSelectedNotations();

    const notation = screenHelper.getNotationAtCoordinates(dotCoordinates);

    if (!notation) return false;

    switch (NotationTypeShape.get(notation!.notationType)) {
      case "HORIZONTAL_LINE":
        const horizontalLineNotation =
          notation as HorizontalLineNotationAttributes;
        if (
          screenHelper.getClickedPosDistanceFromHorizontalLine(
            dotCoordinates,
            horizontalLineNotation,
          ) < maxDistanceToSelect
        ) {
          selectLineNotation(notation);
          return true;
        }
      case "VERTICAL_LINE":
        const verticalLineNotation = notation as VerticalLineNotationAttributes;
        if (
          screenHelper.getClickedPosDistanceFromVerticalLine(
            dotCoordinates,
            verticalLineNotation,
          ) < maxDistanceToSelect
        ) {
          selectLineNotation(notation);
          return true;
        }
        return false;
      case "SLOPE_LINE": {
        const slopeLineNotation = notation as SlopeLineNotationAttributes;
        if (
          screenHelper.getClickedPosDistanceFromSlopeLine(
            dotCoordinates,
            slopeLineNotation,
          ) < maxDistanceToSelect
        ) {
          selectLineNotation(notation);
          return true;
        }
        return false;
      }
      case "CURVE": {
        selectCurveNotation(notation);
        return true;
      }
      case "RECT":
      case "POINT": {
        selectPointOrRectNotation(notation);
        return true;
      }
    }

    return false;
  }

  function selectPointOrRectNotation(activeNotation: NotationAttributes) {
    const notationStore = useNotationStore();
    // disallow selection of question notations for student
    if (notationMutateHelper.isNotationInQuestionArea(activeNotation, 0, 0))
      return;

    if (activeNotation.notationType === "TEXT") {
      editModeStore.setEditMode("TEXT_SELECTED");
      eventBus.emit("EV_FREE_TEXT_SELECTED", activeNotation);
    }

    if (activeNotation.notationType === "ANNOTATION") {
      editModeStore.setEditMode("ANNOTATION_SELECTED");
      eventBus.emit("EV_ANNOTATION_SELECTED", activeNotation);
    }

    if (activeNotation.notationType === "EXPONENT") {
      editModeStore.setEditMode("EXPONENT_SELECTED");
      eventBus.emit("EV_EXPONENT_SELECTED", activeNotation);
    }

    notationStore.selectNotation(activeNotation?.uuid);
  }

  function selectCurveNotation(notation: NotationAttributes) {
    switch (notation.notationType) {
      case "CONCAVECURVE":
        editModeStore.setEditMode("CONCAVE_CURVE_SELECTED");
        eventBus.emit("EV_CONCAVE_CURVE_SELECTED", notation);
        break;
      case "CONVEXCURVE":
        editModeStore.setEditMode("CONVEX_CURVE_SELECTED");
        eventBus.emit("EV_CONVEX_CURVE_SELECTED", notation);
    }
  }

  function selectLineNotation(notation: NotationAttributes) {
    switch (notation.notationType) {
      case "SQRT":
        editModeStore.setEditMode("SQRT_SELECTED");
        eventBus.emit("EV_SQRT_SELECTED", notation);
        break;
      case "HORIZONTALLINE":
        editModeStore.setEditMode("HORIZONTAL_LINE_SELECTED");
        eventBus.emit("EV_HORIZONTAL_LINE_SELECTED", notation);
        break;
      case "VERTICALLINE":
        editModeStore.setEditMode("VERTICAL_LINE_SELECTED");
        eventBus.emit("EV_VERTICAL_LINE_SELECTED", notation);
        break;
      case "SLOPELINE":
        editModeStore.setEditMode("SLOPE_LINE_SELECTED");
        eventBus.emit("EV_SLOPE_LINE_SELECTED", notation);
        break;
    }
  }

  async function setSelectedCell(position: DotCoordinates) {
    const notationStore = useNotationStore();
    let clickedCell = screenHelper.getClickedCell(position);

    if (!clickedCell) return;

    cellStore.setSelectedCell(clickedCell!, true);

    //if (!editModeStore.isCheckMode()) {
    //  editModeStore.setEditMode("CELL_SELECTED");
    //}

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
    setSelectedCell,
  };
}
