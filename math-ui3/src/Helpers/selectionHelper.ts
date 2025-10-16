import {
  RectCoordinates,
  DotCoordinates,
  LineNotationAttributes,
  MultiCellAttributes,
  CellAttributes,
} from "common/baseTypes";

import { NotationAttributes } from "common/baseTypes";
import { useLessonStore } from "../store/pinia/lessonStore";
import { useEditModeStore } from "../store/pinia/editModeStore";
import { useNotationStore } from "../store/pinia/notationStore";
import { useCellStore } from "../store/pinia/cellStore";
import { useUserStore } from "../store/pinia/userStore";
import usescreenHelper from "./screenHelper";
import useNotationMutateHelper from "./notationMutateHelper";
import useUserOutgoingOperationsHelper from "./userOutgoingOperationsHelper";
import useEventBus from "./eventBusHelper";
import useAuthorizationHelper from "./authorizationHelper";

const eventBus = useEventBus();
const cellStore = useCellStore();
const notationMutateHelper = useNotationMutateHelper();
const screenHelper = usescreenHelper();
const userOutgoingOperationsHelper = useUserOutgoingOperationsHelper();
const lessonStore = useLessonStore();
const notationStore = useNotationStore();
const authorizationHelper = useAuthorizationHelper();
const userStore = useUserStore();
const editModeStore = useEditModeStore();

export default function selectionHelper() {
  function selectNotationsOfArea(rectCoordinates: RectCoordinates) {
    // must be initialized here to prevent circular refernce
    const notationStore = useNotationStore();

    const areaCells =
      screenHelper.getRectCoordinatesOccupiedCells(rectCoordinates);

    notationStore.selectNotationsOfCells(areaCells);
    notationStore.selectNotationsOfRectCoordinates(rectCoordinates);
  }

  function selectNotationAtPosition(dotCoordinates: DotCoordinates): boolean {
    const maxDistanceToSelect = 5;
    const notationStore = useNotationStore();
    notationStore.resetSelectedNotations();

    const notation = screenHelper.getNotationAtCoordinates(dotCoordinates);

    if (!notation) return false;

    switch (notation!.notationType) {
      case "SQRT":
        const sqrt = notation as unknown as MultiCellAttributes;
        if (
          screenHelper.getClickedPosDistanceFromSqrt(dotCoordinates, sqrt) <
          maxDistanceToSelect
        ) {
          selectSqrtNotation(notation);
          return true;
        }
        break;

      case "LINE": {
        const lineNotation = notation as LineNotationAttributes;
        const distanceFromLine = screenHelper.getClickedPosDistanceFromLine(
          dotCoordinates,
          lineNotation,
        );
        if (distanceFromLine < maxDistanceToSelect) {
          selectLineNotation(notation.uuid);
          return true;
        }
        return false;
      }
      case "CURVE": {
        selectCurveNotation(notation.uuid);
        return true;
      }
      case "EXPONENT":
      case "LOGBASE":
      case "IMAGE":
      case "TEXT":
      case "ANNOTATION":
      case "SIGN":
      case "SYMBOL":
      case "SQRTSYMBOL": {
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
      // toggle between TEXT_SELECTED and TEXT_WRITING
      if (editModeStore.getEditMode() == "TEXT_SELECTED") {
        editModeStore.setEditMode("TEXT_WRITING");
        eventBus.emit("EV_TEXT_EDITING", activeNotation);
      } else {
        editModeStore.setEditMode("TEXT_SELECTED");
        eventBus.emit("EV_TEXT_SELECTED", activeNotation);
      }
    }

    if (activeNotation.notationType === "IMAGE") {
      editModeStore.setEditMode("IMAGE_SELECTED");
      eventBus.emit("EV_IMAGE_SELECTED", activeNotation);
    }

    if (activeNotation.notationType === "ANNOTATION") {
      editModeStore.setEditMode("ANNOTATION_SELECTED");
      eventBus.emit("EV_ANNOTATION_SELECTED", activeNotation);
    }

    if (activeNotation.notationType === "EXPONENT") {
      editModeStore.setEditMode("EXPONENT_SELECTED");
    }

    notationStore.selectNotation(activeNotation?.uuid);
  }

  function selectSqrtNotation(notation: NotationAttributes) {
    editModeStore.setEditMode("SQRT_SELECTED");
    eventBus.emit("EV_SQRT_SELECTED", notation);
  }

  function selectCurveNotation(uuid: String) {
    const notation = notationStore.getNotation(uuid)!;
    editModeStore.setEditMode("CURVE_SELECTED");
    eventBus.emit("EV_CURVE_SELECTED", notation);
  }

  function selectCircleNotation(uuid: String) {
    const notation = notationStore.getNotation(uuid)!;
    editModeStore.setEditMode("CIRCLE_SELECTED");
    eventBus.emit("EV_CIRCLE_SELECTED", notation);
  }

  function selectLineNotation(uuid: String) {
    const notation = notationStore.getNotation(uuid)!;
    editModeStore.setEditMode("LINE_SELECTED");
    eventBus.emit("EV_LINE_SELECTED", notation);
    //eventBus.emit("EV_NOTATION_SELECTED", notation);
  }

  function selectDivisionLineNotation(uuid: String) {
    const notation = notationStore.getNotation(uuid)!;
    editModeStore.setEditMode("DIVISION_LINE_SELECTED");
    eventBus.emit("EV_DIVISION_LINE_SELECTED", notation);
  }

  async function setSelectedCell(cell: CellAttributes, setEditMode: boolean) {
    const notationStore = useNotationStore();

    if (!authorizationHelper.canEdit()) return;

    cellStore.setSelectedCell(cell!, setEditMode);

    if (
      lessonStore.getCurrentLesson() &&
      notationStore.getParent().type == "LESSON"
    ) {
      await userOutgoingOperationsHelper.syncOutgoingSelectedCell(
        cell,
        lessonStore.getCurrentLesson()!.uuid,
        userStore.getCurrentUser()!.uuid,
      );
    }
  }

  function selectClickedPosition(e: MouseEvent) {
    notationStore.resetSelectedNotations();
    const uuid = (e.target as any).id;
    if (uuid) {
      selectNotation(uuid);
    } else {
      const position = { x: e.pageX, y: e.pageY };
      let clickedCell = screenHelper.getCellByDotCoordinates(position);
      if (!clickedCell) return;
      setSelectedCell(clickedCell, true);
      selectNotationAtPosition(position);
    }
  }

  function selectNotation(uuid: string) {
    const n = notationStore.getNotation(uuid)!;
    switch (n.notationType) {
      case "LINE":
        selectLineNotation(uuid);
        break;
      case "SQRT":
        selectSqrtNotation(n);
        break;
      case "CURVE":
        selectCurveNotation(uuid);
        break;
      case "CIRCLE":
        selectCircleNotation(uuid);
        break;
      case "EXPONENT":
      case "LOGBASE":
      case "IMAGE":
      case "TEXT":
      case "ANNOTATION":
      case "SIGN":
      case "SYMBOL":
      case "SQRTSYMBOL": {
        selectPointOrRectNotation(n);
        break;
      }
    }
  }

  return {
    selectClickedPosition,
    selectNotation,
    selectNotationAtPosition,
    selectNotationsOfArea,
    setSelectedCell,
    selectCurveNotation,
    selectCircleNotation,
    selectLineNotation,
    selectDivisionLineNotation,
  };
}
