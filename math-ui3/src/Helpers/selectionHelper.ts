import { NotationTypeShape } from "common/unions";
import { useNotationStore } from "../store/pinia/notationStore";
import { useCellStore } from "../store/pinia/cellStore";
import { RectCoordinates, DotCoordinates } from "common/baseTypes";
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
    RectCoordinates: RectCoordinates,
  ) {
    // must be initlized here to prevent circular refernce
    const notationStore = useNotationStore();
    const areaCells = screenHelper.getRectCoordinatesOccupiedCells(
      svgId,
      RectCoordinates,
    );
    notationStore.selectNotationsOfCells(areaCells);
  }

  function selectNotationAtPosition(
    svgId: string,
    dotCoordinates: DotCoordinates,
  ): NotationAttributes | null {
    const notationStore = useNotationStore();
    notationStore.resetSelectedNotations();

    const notation = screenHelper.getNotationAtDotCoordinates(
      svgId,
      dotCoordinates,
    );

    console.debug(
      "notation:" +
        notation?.notationType +
        ", selected at x:" +
        dotCoordinates.x +
        ",y:" +
        dotCoordinates.y,
    );

    if (!notation) return null;

    switch (NotationTypeShape.get(notation!.notationType)) {
      case "HORIZONTAL_LINE":
      case "VERTICAL_LINE":
      case "SLOPE_LINE": {
        selectLineNotation(notation!);
        break;
      }
      case "CONVEX_CURVE":
      case "CONCAVE_CURVE": {
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
      eventBus.emit("EV_FREE_TEXT_SELECTED", activeNotation);
    }

    notationStore.selectNotation(activeNotation?.uuid);
  }

  function selectCurveNotation(notation: NotationAttributes) {
    switch (notation.notationType) {
      case "CONCAVECURVE":
        editModeStore.setEditMode("EV_CONCAVE_CURVE_SELECTED");
        eventBus.emit("EV_CONCAVE_CURVE_SELECTED", notation);
        break;
      case "CONVEXCURVE":
        editModeStore.setEditMode("EV_CONVEX_CURVE_SELECTED");
        eventBus.emit("EV_CONVEX_CURVE_SELECTED", notation);
    }
  }

  function selectLineNotation(notation: NotationAttributes) {
    switch (notation.notationType) {
      case "SQRT":
        editModeStore.setEditMode("SQRT_SELECTED");
        eventBus.emit("EV_HORIZONTAL_LINE_SELECTED", notation);
        break;
      case "HORIZONTALLINE":
        editModeStore.setEditMode("EV_HORIZONTAL_LINE_SELECTED");
        eventBus.emit("EV_HORIZONTAL_LINE_SELECTED", notation);
        break;
      case "VERTICALLINE":
        editModeStore.setEditMode("EV_VERTICAL_LINE_SELECTED");
        eventBus.emit("EV_VERTICAL_LINE_SELECTED", notation);
        break;
      case "SLOPELINE":
        editModeStore.setEditMode("EV_SLOPE_LINE_SELECTED");
        eventBus.emit("EV_SLOPE_LINE_SELECTED", notation);
    }
  }

  async function selectCell(svgId: string, position: DotCoordinates) {
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
