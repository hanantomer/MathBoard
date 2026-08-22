import {
  NotationAttributes,
  RectCoordinates,
  DotCoordinates,
  LineNotationAttributes,
  ImageNotationAttributes,
  AnnotationNotationAttributes,
  MultiCellAttributes,
  CellAttributes,
  isCellNotationType,
} from "common/baseTypes";

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
import { handlePracticeClick, isPracticeBoard, isPracticeLayer } from "./practiceBoardAdapter";
import { NotationType } from "common/unions";
import { viewportPointerPosition } from "./pointerCoordinateHelper";
import { sqrtSymbolSuffix } from "common/globals";

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
  function storedNotationUuid(id: string | undefined | null): string | undefined {
    if (!id) return undefined;
    if (notationStore.getNotation(id)) return id;
    if (id.endsWith(sqrtSymbolSuffix)) {
      const parentId = id.slice(0, -sqrtSymbolSuffix.length);
      if (notationStore.getNotation(parentId)) return parentId;
    }
    return undefined;
  }

  function notationUuidFromEventTarget(
    target: EventTarget | null,
  ): string | undefined {
    let el = target as HTMLElement | null;
    while (el && el.tagName !== "svg" && el.tagName !== "SVG") {
      const fromId = storedNotationUuid(el.id);
      if (fromId) return fromId;
      const fromAttr = storedNotationUuid(el.getAttribute?.("uuid"));
      if (fromAttr) return fromAttr;
      el = el.parentElement;
    }
    return undefined;
  }

  function isSqrtSymbolDomTarget(target: EventTarget | null): boolean {
    let el = target as HTMLElement | null;
    while (el && el.tagName !== "svg" && el.tagName !== "SVG") {
      if (el.id?.endsWith(sqrtSymbolSuffix)) return true;
      if (el.getAttribute?.("uuid")?.endsWith(sqrtSymbolSuffix)) return true;
      if (el.getAttribute?.("notationType") === "SQRTSYMBOL") return true;
      el = el.parentElement;
    }
    return false;
  }

  function isSqrtLineDomTarget(target: EventTarget | null): boolean {
    let el = target as HTMLElement | null;
    while (el && el.tagName !== "svg" && el.tagName !== "SVG") {
      if (el.classList?.contains("sqrt")) return true;
      if (el.getAttribute?.("notationType") === "SQRT") return true;
      el = el.parentElement;
    }
    return false;
  }

  function isBoardImageDomTarget(target: EventTarget | null): boolean {
    let el = target as HTMLElement | null;
    while (el && el.tagName !== "svg" && el.tagName !== "SVG") {
      if (el.classList?.contains("board-image") || el.tagName === "IMG") {
        return true;
      }
      el = el.parentElement;
    }
    return false;
  }

  function isAnnotationDomTarget(target: EventTarget | null): boolean {
    let el = target as HTMLElement | null;
    while (el && el.tagName !== "svg" && el.tagName !== "SVG") {
      if (el.getAttribute?.("data-cy") === "annotation") return true;
      el = el.parentElement;
    }
    return false;
  }

  function selectNotationsOfArea(rectCoordinates: RectCoordinates) {
    // must be initialized here to prevent circular refernce
    const notationStore = useNotationStore();

    const areaCells =
      screenHelper.getRectCoordinatesOccupiedCells(rectCoordinates);

    notationStore.selectNotationsOfCells(areaCells);
    notationStore.selectNotationsOfRectCoordinates(rectCoordinates);
  }

  const SQRT_STROKE_SELECT_PX = 10;

  function isNearSqrtStroke(
    notation: NotationAttributes,
    position: DotCoordinates,
  ): boolean {
    return (
      screenHelper.getClickedPosDistanceFromSqrt(
        position,
        notation as unknown as MultiCellAttributes,
      ) < SQRT_STROKE_SELECT_PX
    );
  }

  /** SQRT line FO can still overlap radicand cells; keep the hit only on the bar or √ glyph. */
  function notationFromPointerTarget(
    target: EventTarget | null,
    position: DotCoordinates,
  ): NotationAttributes | null {
    const uuid = notationUuidFromEventTarget(target);
    const clickedNotation = uuid ? notationStore.getNotation(uuid) : null;
    if (!clickedNotation) return null;
    if (clickedNotation.notationType === "SQRT") {
      if (
        !isSqrtSymbolDomTarget(target) &&
        !isSqrtLineDomTarget(target) &&
        !isNearSqrtStroke(clickedNotation, position)
      ) {
        return null;
      }
    }
    if (clickedNotation.notationType === "IMAGE") {
      if (!isBoardImageDomTarget(target)) {
        return null;
      }
    }
    if (clickedNotation.notationType === "ANNOTATION") {
      if (!isAnnotationDomTarget(target)) {
        return null;
      }
    }
    return clickedNotation;
  }

  function selectNotationAtPosition(dotCoordinates: DotCoordinates): boolean {
    if (
      notationStore.getParent()?.type === "LESSON" &&
      !authorizationHelper.canEdit()
    ) {
      return false;
    }

    const maxDistanceToSelect = 5;
    notationStore.resetSelectedNotations();

    const notation = screenHelper.getNotationAtCoordinates(dotCoordinates);
    if (!notation) return false;
    // Practice: never select the QUESTION stem via proximity.
    if (isPracticeBoard() && !isPracticeLayer(notation)) {
      return false;
    }

    return handleNotationSelection(
      notation,
      dotCoordinates,
      notation.notationType === "SQRT"
        ? SQRT_STROKE_SELECT_PX
        : maxDistanceToSelect,
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
      FREESKETCH: () => {
        selectFreeSketchNotation(notation.uuid);
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
        if (
          !screenHelper.isClickedPointInsideImage(
            dotCoordinates,
            notation as ImageNotationAttributes,
          )
        ) {
          return false;
        }
        selectNotation(notation.uuid);
        return true;
      },
      TEXT: () => {
        selectNotation(notation.uuid);
        return true;
      },
      ANNOTATION: () => {
        if (
          !screenHelper.isClickedPointInsideAnnotation(
            dotCoordinates,
            notation as AnnotationNotationAttributes,
          )
        ) {
          return false;
        }
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

  function selectFreeSketchNotation(uuid: string) {
    const notation = notationStore.getNotation(uuid)!;
    notationStore.selectNotation(uuid);
    editModeStore.setEditMode("FREE_SKETCH_SELECTED");
    eventBus.emit("EV_FREE_SKETCH_SELECTED", notation);
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

    const prev = cellStore.getSelectedCell();
    cellStore.setSelectedCell(cell!, setEditMode);

    if (prev?.row === cell.row && prev?.col === cell.col) {
      return;
    }

    if (
      lessonStore.getCurrentLesson() &&
      notationStore.getParent()?.type == "LESSON"
    ) {
      await userOutgoingOperationsHelper.syncOutgoingSelectedCell(
        cell,
        lessonStore.getCurrentLesson()!.uuid,
        userStore.getCurrentUser()!.uuid,
      );
    }
  }

  /** Select an existing notation under the pointer (used while a draw tool is active). */
  function trySelectNotationAtPointer(e: PointerEvent): boolean {
    if (
      notationStore.getParent()?.type === "LESSON" &&
      !authorizationHelper.canEdit()
    ) {
      return false;
    }

    if (!cellStore.getSvgId()) return false;

    const position = viewportPointerPosition(e);

    const clickedNotation = notationFromPointerTarget(e.target, position);
    if (clickedNotation) {
      selectNotation(clickedNotation.uuid);
      return true;
    }

    return selectNotationAtPosition(position);
  }

  function selectClickedPosition(e: PointerEvent) {
    const boardParent = notationStore.getParent();
    if (
      boardParent?.type === "LESSON" &&
      !authorizationHelper.canEdit()
    ) {
      return;
    }

    if (!cellStore.getSvgId()) return;

    const position = viewportPointerPosition(e);

    const clickedCell = screenHelper.getCellByDotCoordinates(position);
    if (!clickedCell) return;

    const clickedNotation = notationFromPointerTarget(e.target, position);

    if (
      handlePracticeClick(clickedNotation ?? null, clickedCell, {
        selectNotation,
        setSelectedCell,
        resetSelectedNotations: () => notationStore.resetSelectedNotations(),
      })
    ) {
      return;
    }

    notationStore.resetSelectedNotations();

    let notationFoundAtCell = false;
    if (clickedNotation) {
      selectNotation(clickedNotation.uuid);
    } else {
      notationFoundAtCell = selectNotationAtPosition(position);
    }

    if (!clickedNotation && !notationFoundAtCell) {
      notationStore.resetSelectedNotations();
      setSelectedCell(clickedCell, true);
      return;
    }

    const pointNotationSelected =
      (notationFoundAtCell &&
        isCellNotationType(notationStore.getNotations()[0].notationType)) ||
      (clickedNotation &&
        isCellNotationType(clickedNotation.notationType));

    if (pointNotationSelected) {
      setSelectedCell(clickedCell, true);
      return;
    }

    // Answer: TEXT/IMAGE stems don't set the active cell otherwise.
    if (boardParent?.type === "ANSWER") {
      notationStore.resetSelectedNotations();
      setSelectedCell(clickedCell, true);
    }
  }

  function selectNotation(uuid: string) {
    const n = notationStore.getNotation(uuid)!;
    if (!n) return;
    if (isPracticeBoard() && !isPracticeLayer(n)) return;
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
      case "FREESKETCH":
        selectFreeSketchNotation(uuid);
        break;
      case "CIRCLE":
        selectCircleNotation(uuid);
        break;
      case "EXPONENT":
      case "LOGBASE":
      case "IMAGE":
      case "TEXT":
      case "ANNOTATION":
      case "SYMBOL":
      case "SQRTSYMBOL": {
        selectPointOrRectNotation(n);
        break;
      }
    }
  }

  return {
    selectClickedPosition,
    trySelectNotationAtPointer,
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
