import {
  NotationAttributes,
  RectCoordinates,
  DotCoordinates,
  LineNotationAttributes,
  MultiCellAttributes,
  CellAttributes,
  isCellNotationType,
} from "common/baseTypes";

import { getMousePositionInSVG } from "common/globals";
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
import { NotationType } from "common/unions";

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
    if (notation.notationType === "SQRT") {
      return false;
    }

    return handleNotationSelection(
      notation,
      dotCoordinates,
      maxDistanceToSelect,
    );
  }

  function handleNotationSelection(
    notation: NotationAttributes,
    dotCoordinates: DotCoordinates,
    maxDistance: number,
  ): boolean {
    const handlers: Record<NotationType, () => boolean> = {
      POLYGON: () => {
        return true;
      },
      SQRT: () => handleSqrtSelection(notation, dotCoordinates, maxDistance),
      DIVISIONLINE: () =>
        handleLineSelection(notation, dotCoordinates, maxDistance, true),
      LINE: () =>
        handleLineSelection(notation, dotCoordinates, maxDistance, false),
      CURVE: () => {
        selectCurveNotation(notation.uuid);
        return true;
      },
      CIRCLE: () => {
        selectCircleNotation(notation.uuid);
        return true;
      },
      EXPONENT: () => {
        selectNotation(notation.uuid);
        return true;
      },
      LOGBASE: () => {
        selectNotation(notation.uuid);
        return true;
      },
      IMAGE: () => {
        selectNotation(notation.uuid);
        return true;
      },
      TEXT: () => {
        selectNotation(notation.uuid);
        return true;
      },
      ANNOTATION: () => {
        selectNotation(notation.uuid);
        return true;
      },
      SIGN: () => {
        selectNotation(notation.uuid);
        return true;
      },
      SYMBOL: () => {
        selectNotation(notation.uuid);
        return true;
      },
      SQRTSYMBOL: () => {
        selectNotation(notation.uuid);
        return true;
      },
    };

    const handler = handlers[notation.notationType];
    return handler ? handler() : false;
  }

  function handleSqrtSelection(
    notation: NotationAttributes,
    dotCoordinates: DotCoordinates,
    maxDistance: number,
  ): boolean {
    const sqrt = notation as unknown as MultiCellAttributes;
    const distance = screenHelper.getClickedPosDistanceFromSqrt(
      dotCoordinates,
      sqrt,
    );

    if (distance < maxDistance) {
      selectSqrtNotation(notation);
      return true;
    }

    return false;
  }

  function handleLineSelection(
    notation: NotationAttributes,
    dotCoordinates: DotCoordinates,
    maxDistance: number,
    isDivisionLine: boolean,
  ): boolean {
    const lineNotation = notation as LineNotationAttributes;
    const distance = screenHelper.getClickedPosDistanceFromLine(
      dotCoordinates,
      lineNotation,
    );

    if (distance < maxDistance) {
      if (isDivisionLine) {
        selectDivisionLineNotation(notation.uuid);
      } else {
        selectLineNotation(notation.uuid);
      }
      return true;
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
  }

  function selectDivisionLineNotation(uuid: String) {
    const notation = notationStore.getNotation(uuid)!;
    editModeStore.setEditMode("DIVISIONLINE_SELECTED");
    eventBus.emit("EV_DIVISIONLINE_SELECTED", notation);
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
    const svgEl = document.getElementById(
      cellStore.getSvgId()!,
    ) as SVGSVGElement | null;

    if (!svgEl) return;

    const position = getMousePositionInSVG(
      svgEl,
      e,
      cellStore.getSvgBoundingRect(),
    );

    let clickedCell = screenHelper.getCellByDotCoordinates(position);
    if (!clickedCell) return;

    notationStore.resetSelectedNotations();
    const uuid = (e.target as any).id;
    let notationFoundAtCell = false;
    if (uuid) {
      // select clicked element
      selectNotation(uuid);
    } else {
      // select element in clicked cell
      notationFoundAtCell = selectNotationAtPosition(position);
    }

    if (!uuid && !notationFoundAtCell) {
      // if no notation found, reset selected notations
      notationStore.resetSelectedNotations();
      setSelectedCell(clickedCell, true);
      return;
    }

    const pointNotationSelected =
      (notationFoundAtCell &&
        isCellNotationType(notationStore.getNotations()[0].notationType)) ||
      (uuid &&
        isCellNotationType(notationStore.getNotation(uuid)!.notationType));

    setSelectedCell(clickedCell, pointNotationSelected);
  }

  function selectNotation(uuid: string) {
    const n = notationStore.getNotation(uuid)!;
    switch (n.notationType) {
      case "DIVISIONLINE":
        selectDivisionLineNotation(uuid);
        break;
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
