import useApiHelper from "../helpers/apiHelper";

import {
  PointNotationAttributes,
  RectNotationAttributes,
  PointNotationCreationAttributes,
  RectNotationCreationAttributes,
  NotationCreationAttributes,
  LineNotationAttributes,
  CurveAttributes,
  CircleAttributes,
  LineAttributes,
  CurveNotationAttributes,
  CircleNotationAttributes,
  LineNotationCreationAttributes,
  CurveNotationCreationAttributes,
  CircleNotationCreationAttributes,
  AnnotationNotationCreationAttributes,
  SqrtNotationCreationAttributes,
  isCellNotation,
  isRect,
  MultiCellAttributes,
  SqrtNotationAttributes,
  DotCoordinates,
  AnnotationNotationAttributes,
} from "common/baseTypes";

import { clonedNotationUUIdPrefix } from "common/globals";

import { LessonNotationAttributes } from "common/lessonTypes";
import { matrixDimensions } from "common/globals";
import { CellAttributes } from "common/baseTypes";
import { NotationType, SelectionMoveDirection } from "common/unions";
import { useUserStore } from "../store/pinia/userStore";
import { useNotationStore } from "../store/pinia/notationStore";
import { useCellStore } from "../store/pinia/cellStore";
import { useEditModeStore } from "../store/pinia/editModeStore";
import useAuthorizationHelper from "./authorizationHelper";
import useUserOutgoingOperations from "./userOutgoingOperationsHelper";
import useMatrixCellHelper from "../helpers/matrixCellHelper";
import useScreenHelper from "../helpers/screenHelper";

import { NotationAttributes, RectAttributes } from "common/baseTypes";

import useSelectionHelper from "../helpers/selectionHelper";
const selectionHelper = useSelectionHelper();

const matrixCellHelper = useMatrixCellHelper();
const screenHelper = useScreenHelper();
const userStore = useUserStore();
const apiHelper = useApiHelper();
const notationStore = useNotationStore();
const cellStore = useCellStore();
const editModeStore = useEditModeStore();
const authorizationHelper = useAuthorizationHelper();
const userOutgoingOperations = useUserOutgoingOperations();

let deleteKeyLock = false; // Add lock variable at the top with other variables

export default function notationMutateHelper() {
  function pointAtCellCoordinates(
    n1: PointNotationAttributes,
    n2: CellAttributes,
    userUUId: string,
  ) {
    return n1.col == n2.col && n1.row == n2.row && n1.user.uuid === userUUId;
  }

  function pointAtRectCoordinates(
    pointNotation: PointNotationAttributes,
    rectCoordinates: RectAttributes,
    userUUId: string,
  ) {
    return (
      pointNotation.col >= rectCoordinates.fromCol &&
      pointNotation.col <= rectCoordinates.toCol &&
      pointNotation.row >= rectCoordinates.fromRow &&
      pointNotation.row <= rectCoordinates.toRow &&
      pointNotation.user.uuid == userUUId
    );
  }

  // rect
  function rectAtCellCoordinates(
    rectNotation: RectNotationAttributes,
    CellAttributes: CellAttributes,
    userUUId: string,
  ) {
    return (
      rectNotation.fromCol <= CellAttributes.col &&
      rectNotation.toCol >= CellAttributes.col &&
      rectNotation.fromRow <= CellAttributes.row &&
      rectNotation.toRow >= CellAttributes.row &&
      rectNotation.user.uuid == userUUId
    );
  }

  function rectAtRectCoordinates(
    rectNotation: RectNotationAttributes,
    rectCoordinates: RectAttributes,
    userUUId: string,
  ) {
    return (
      ((rectNotation.fromCol >= rectCoordinates.fromCol &&
        rectNotation.fromCol <= rectCoordinates.toCol) ||
        (rectNotation.toCol >= rectCoordinates.fromCol &&
          rectNotation.toCol <= rectCoordinates.toCol)) &&
      ((rectNotation.fromRow >= rectCoordinates.fromRow &&
        rectNotation.fromRow <= rectCoordinates.toRow) ||
        (rectNotation.toRow >= rectCoordinates.fromRow &&
          rectNotation.toRow <= rectCoordinates.toRow)) &&
      rectNotation.user.uuid == userUUId
    );
  }

  function findNotationsByCellCoordinates(cellCoordinates: CellAttributes) {
    let userUUId = getUserUUId();

    return notationStore
      .getNotations()
      .filter((n: NotationAttributes) =>
        n.notationType === "ANNOTATION" ||
        n.notationType === "EXPONENT" ||
        n.notationType === "SIGN" ||
        n.notationType === "SYMBOL" ||
        n.notationType === "SQRT" ||
        n.notationType === "SQRTSYMBOL"
          ? pointAtCellCoordinates(
              n as PointNotationAttributes,
              cellCoordinates,
              userUUId,
            )
          : n.notationType === "TEXT" || n.notationType === "IMAGE"
          ? rectAtCellCoordinates(
              n as RectNotationAttributes,
              cellCoordinates,
              userUUId,
            )
          : false,
      );
  }

  function findOverlapCellNotation(
    notation: PointNotationCreationAttributes,
  ): PointNotationAttributes | undefined {
    return notationStore
      .getPointNotations()
      .find((n2: PointNotationAttributes) => {
        return (
          n2.value !== "." &&
          n2.value !== "(" &&
          n2.value !== ")" &&
          pointAtCellCoordinates(
            notation as PointNotationAttributes,
            n2,
            getUserUUId(),
          )
        );
      });
  }

  function findOverlapRectNotation(
    notation: RectNotationCreationAttributes,
  ): RectNotationAttributes | undefined {
    return notationStore
      .getRectNotations()
      .find((n2: RectNotationAttributes) => {
        return rectAtRectCoordinates(
          notation as RectNotationAttributes,
          n2,
          getUserUUId(),
        );
      });
  }

  function findOverlapNotationsOfAnyTypeButLine(
    notation: NotationCreationAttributes,
  ): NotationAttributes | undefined {
    return notationStore.getNotations().find((n2: NotationAttributes) => {
      if (isCellNotation(n2.notationType))
        return (
          ((n2 as PointNotationAttributes).value !== "." &&
            (n2 as PointNotationAttributes).value !== "(" &&
            (n2 as PointNotationAttributes).value !== ")" &&
            pointAtCellCoordinates(
              notation as PointNotationAttributes,
              n2 as PointNotationAttributes,
              getUserUUId(),
            )) ??
          rectAtCellCoordinates(
            notation as RectNotationAttributes,
            n2 as PointNotationAttributes,
            getUserUUId(),
          )
        );

      if (isRect(n2.notationType))
        return (
          pointAtRectCoordinates(
            notation as PointNotationAttributes,
            n2 as RectNotationAttributes,
            getUserUUId(),
          ) ??
          rectAtRectCoordinates(
            notation as RectNotationAttributes,
            n2 as RectNotationAttributes,
            getUserUUId(),
          )
        );
    });
  }

  async function selectNotationByCoordinates(CellAttributes: CellAttributes) {
    findNotationsByCellCoordinates(CellAttributes).forEach(
      (n: NotationAttributes) => {
        notationStore.selectNotation(n.uuid);
      },
    );
  }

  async function selectNotation(uuid: string) {
    notationStore.selectNotation(uuid);
  }

  function canMoveSelectedNotations(
    deltaCol: number,
    deltaRow: number,
  ): boolean {
    notationStore.getSelectedNotations().forEach((n: NotationAttributes) => {
      if (isNotationInQuestionArea(n, deltaCol, deltaRow)) return false;

      if (isCellNotation(n.notationType)) {
        if (
          (n as PointNotationAttributes).col + deltaCol >
          matrixDimensions.colsNum
        ) {
          return false;
        }

        if ((n as PointNotationAttributes).col + deltaCol < 1) return false;

        if (
          (n as PointNotationAttributes).row + deltaRow >
          matrixDimensions.rowsNum
        ) {
          return false;
        }

        if ((n as PointNotationAttributes).row + deltaRow < 1) return false;

        return true;
      }

      switch (n.notationType) {
        case "LINE": {
          const n1 = n as LineNotationAttributes;
          if (n1.p2x + deltaCol * getColWidth() > getMostRightCoordinate()) {
            return false;
          }

          if (n1.p1x + deltaCol * getColWidth() < 1) {
            return false;
          }

          if (n1.p2x + deltaRow * getRowHeight() > matrixDimensions.rowsNum) {
            return false;
          }

          if (n1.p1y + deltaRow * getRowHeight() < 1) {
            return false;
          }

          if (n1.p2y + deltaRow * getRowHeight() > getMostBottomCoordinate()) {
            return false;
          }
        }

        case "TEXT":
        case "IMAGE": {
          if (
            (n as RectNotationAttributes).toCol + deltaCol >
            matrixDimensions.colsNum
          )
            return false;
          if ((n as RectNotationAttributes).fromCol + deltaCol < 1)
            return false;
          if (
            (n as RectNotationAttributes).toRow + deltaRow >
            matrixDimensions.rowsNum
          )
            return false;
          if ((n as RectNotationAttributes).fromRow + deltaRow < 1)
            return false;
          break;
        }
      }
    });

    return true;
  }

  function moveSelectedNotationsAtPixelScale(
    deltaX: number,
    deltaY: number,
  ): boolean {
    notationStore.getSelectedNotations().forEach((n: NotationAttributes) => {
      switch (n.notationType) {
        case "LINE": {
          (n as LineNotationAttributes).p1x += deltaX;
          (n as LineNotationAttributes).p2x += deltaX;
          (n as LineNotationAttributes).p1y += deltaY;
          (n as LineNotationAttributes).p2y += deltaY;
          break;
        }
        case "CURVE": {
          (n as CurveNotationAttributes).p1x += deltaX;
          (n as CurveNotationAttributes).p2x += deltaX;
          (n as CurveNotationAttributes).p1y += deltaY;
          (n as CurveNotationAttributes).p2y += deltaY;
          (n as CurveNotationAttributes).cpx += deltaX;
          (n as CurveNotationAttributes).cpy += deltaY;
          break;
        }
        case "CIRCLE": {
          (n as CircleNotationAttributes).cx += deltaX;
          (n as CircleNotationAttributes).cy += deltaY;
          break;
        }

        case "ANNOTATION": {
          (n as AnnotationNotationAttributes).x += deltaX;
          (n as AnnotationNotationAttributes).y += deltaY;
          break;
        }
      }
      notationStore.addNotation(n, true);
    });
    return true;
  }

  function moveSelectedNotationsAtCellScale(
    deltaCol: number,
    deltaRow: number,
    keepOriginal: boolean,
  ): boolean {
    if (keepOriginal) {
      notationStore.cloneSelectedNotations();
    }

    notationStore.getSelectedNotations().forEach((n: NotationAttributes) => {
      const deltaX = deltaCol * cellStore.getCellHorizontalWidth();
      const deltaY = deltaRow * cellStore.getCellVerticalHeight();
      switch (n.notationType) {
        case "EXPONENT":
        case "LOGBASE":
        case "SIGN":
        case "SQRTSYMBOL":
        case "SYMBOL": {
          (n as PointNotationAttributes).col += deltaCol;
          (n as PointNotationAttributes).row += deltaRow;
          break;
        }
        case "LINE":
          (n as unknown as LineAttributes).p1x += deltaX;
          (n as unknown as LineAttributes).p2x += deltaX;
          (n as unknown as LineAttributes).p1y += deltaY;
          (n as unknown as LineAttributes).p2y += deltaY;
          break;

        case "ANNOTATION":
          (n as unknown as AnnotationNotationAttributes).x += deltaX;
          (n as unknown as AnnotationNotationAttributes).y += deltaY;
          break;

        case "SQRT": {
          (n as unknown as MultiCellAttributes).fromCol += deltaCol;
          (n as unknown as MultiCellAttributes).toCol += deltaCol;
          (n as unknown as MultiCellAttributes).row += deltaRow;
          break;
        }
        case "IMAGE":
        case "TEXT": {
          (n as RectNotationAttributes).fromCol += deltaCol;
          (n as RectNotationAttributes).toCol += deltaCol;
          (n as RectNotationAttributes).fromRow += deltaRow;
          (n as RectNotationAttributes).toRow += deltaRow;
          break;
        }
      }
      notationStore.addNotation(n, true);
    });
    return true;
  }

  /*
  function moveSelectedNotations(
    deltaX: number,
    deltaY: number,
    deltaCol: number,
    deltaRow: number,
    keepOriginal: boolean,
  ): boolean {
    //if (!canMoveSelectedNotations(deltaCol, deltaRow)) return false;

    if (deltaX !== 0 || deltaY !== 0) {
      return moveSelectedPixelNotations(deltaX, deltaY);
    }

    return moveSelectedNotationsAtCellScale(deltaCol, deltaRow, keepOriginal);
  }
  */

  function saveMovedNotations(moveDirection: SelectionMoveDirection) {
    const notations = getSelectedNotationsSortedByDirection(moveDirection);

    if (!notations || notations.length === 0) return;

    // Check if these are cloned notations that need to be inserted
    const isClonedNotation =
      notations[0].uuid.indexOf(clonedNotationUUIdPrefix) === 0;

    if (isClonedNotation) {
      insertMovedNotations(notations);
    } else {
      updateMovedNotations(notations);
    }

    // const currentTime = Date.now();
    // if (
    //   lastUpdateCoordinatesTime == null ||
    //   lastUpdateCoordinatesTime - currentTime > updateCoordinatesInterval
    // ) {
    //   if (updateCoordinatesHandle) window.clearTimeout(updateCoordinatesHandle);

    //   updateCoordinatesHandle = window.setTimeout(
    //     saveMovedNotationsDelayed,
    //     updateCoordinatesInterval,
    //     notations,
    //   );
    // }
    // lastUpdateCoordinatesTime = Date.now();
  }

  async function saveMovedNotationsDelayed(notations: NotationAttributes[]) {
    if (!notations || notations.length === 0) return;

    // Check if these are cloned notations that need to be inserted
    const isClonedNotation =
      notations[0].uuid.indexOf(clonedNotationUUIdPrefix) === 0;

    if (isClonedNotation) {
      await insertMovedNotations(notations);
    } else {
      await updateMovedNotations(notations);
    }
  }

  async function insertMovedNotations(notations: NotationAttributes[]) {
    await Promise.all(
      notations.map(async (notation) => {
        notationStore.deleteNotation(notation.uuid);

        delete (notation as any).uuid;

        if ((notation as any).lesson) {
          (notation as any).parentUUId = (notation as any).lesson.uuid;
          delete (notation as any).lesson;
        }

        if ((notation as any).question) {
          (notation as any).parentUUId = (notation as any).question.uuid;
          delete (notation as any).question;
        }

        if ((notation as any).answer) {
          (notation as any).parentUUId = (notation as any).answer.uuid;
          delete (notation as any).answer;
        }

        addNotation(notation) as any;
      }),
    );
  }

  async function updateMovedNotations(notations: NotationAttributes[]) {
    await Promise.all(
      notations.map(async (notation) => {
        const attributes = getNotationCoordinates(notation);
        if (!attributes) return;
        updateNotation(notation);
      }),
    );
  }

  function getNotationCoordinates(notation: any) {
    const cooerdinates =
      // point
      "col" in notation
        ? {
            col: (notation as any)["col"],
            row: (notation as any)["row"],
          }
        : // line
        "fromCol" in notation && "row" in notation
        ? {
            fromCol: (notation as any)["fromCol"],
            toCol: (notation as any)["toCol"],
            row: (notation as any)["row"],
          }
        : // rect
        "fromRow" in notation && "fromCol" in notation
        ? {
            fromCol: (notation as any)["fromCol"],
            toCol: (notation as any)["toCol"],
            fromRow: (notation as any)["fromRow"],
            toRow: (notation as any)["toRow"],
          }
        : // horizontal line
        "p1x" in notation && "p2x" in notation && "py" in notation
        ? {
            p1x: (notation as any)["p1x"],
            p2x: (notation as any)["p2x"],
            py: (notation as any)["py"],
          }
        : // vertical line
        "px" in notation && "p1y" in notation && "p2y" in notation
        ? {
            px: (notation as any)["px"],
            p1y: (notation as any)["p1y"],
            p2y: (notation as any)["p2y"],
          }
        : // sloped line
        "p1x" in notation &&
          "p2x" in notation &&
          "p1y" in notation &&
          "p2y" in notation
        ? {
            p1x: (notation as any)["p1x"],
            p2x: (notation as any)["p2x"],
            p1y: (notation as any)["p1y"],
            p2y: (notation as any)["p2y"],
          }
        : // sloped line
        "p1x" in notation &&
          "p2x" in notation &&
          "p1y" in notation &&
          "p2y" in notation &&
          "cpx" in notation &&
          "cpy" in notation
        ? {
            p1x: (notation as any)["p1x"],
            p2x: (notation as any)["p2x"],
            p1y: (notation as any)["p1y"],
            p2y: (notation as any)["p2y"],
            cpx: (notation as any)["cpx"],
            cpy: (notation as any)["cpy"],
          }
        : // circle
        "cx" in notation && "cy" in notation && "r" in notation
        ? {
            cx: Math.round((notation as any)["cx"]),
            cy: Math.round((notation as any)["cy"]),
            r: Math.round((notation as any)["r"]),
          }
        : // annotation
        "x" in notation && "y" in notation
        ? {
            x: Math.round((notation as any)["x"]),
            y: Math.round((notation as any)["y"]),
          }
        : null;

    return cooerdinates;
  }

  // sort selected notations that we first update the outer and the the inner
  // in order to avoid integrity constraint violation
  // for example: if we move 2 notations to the left, we must first update the left one
  // or the noation to the right will try to occupy the same cell of the left one.
  function getSelectedNotationsSortedByDirection(
    moveDirection: SelectionMoveDirection,
  ) {
    return moveDirection === "LEFT"
      ? notationStore
          .getSelectedNotations()
          .sort(
            (n1: any, n2: any) =>
              (n1.col ?? n1.fromCol) - (n2.col ?? n2.fromCol),
          )
      : moveDirection === "RIGHT"
      ? notationStore
          .getSelectedNotations()
          .sort(
            (n1: any, n2: any) =>
              (n2.col ?? n2.fromCol) - (n1.col ?? n1.fromCol),
          )
      : moveDirection === "TOP"
      ? notationStore
          .getSelectedNotations()
          .sort(
            (n1: any, n2: any) =>
              (n1.row ?? n1.fromRow) - (n2.row ?? n2.fromRow),
          )
      : moveDirection === "BOTTOM"
      ? notationStore
          .getSelectedNotations()
          .sort(
            (n1: any, n2: any) =>
              (n2.row ?? n2.fromRow) - (n1.row ?? n1.fromRow),
          )
      : notationStore.getSelectedNotations();
  }

  async function updateSqrtNotation(sqrtNotation: SqrtNotationAttributes) {
    transposeSqrtCoordinatesIfNeeded(sqrtNotation);
    await apiHelper.updateSqrtNotationAttributes(sqrtNotation);
    notationStore.addNotation(sqrtNotation, true);
    userOutgoingOperations.syncOutgoingUpdateNotation(sqrtNotation);
  }


  async function updateLineNotation(lineNotation: LineNotationAttributes) {
    await apiHelper.updateLineNotationAttributes(lineNotation);
    notationStore.addNotation(lineNotation, true);
    userOutgoingOperations.syncOutgoingUpdateNotation(lineNotation);
  }

  async function updateCurveNotation(curveNotation: CurveNotationAttributes) {
    await apiHelper.updateCurveNotationAttributes(curveNotation);
    notationStore.addNotation(curveNotation, true);
    userOutgoingOperations.syncOutgoingUpdateNotation(curveNotation);
  }

  async function updateCircleNotation(circle: CircleNotationAttributes) {
    await apiHelper.updateCircleNotationAttributes(circle);
    notationStore.addNotation(circle, true);
    userOutgoingOperations.syncOutgoingUpdateNotation(circle);
  }

  function addCellNotation(notation: PointNotationCreationAttributes) {
    //    editModeStore.setDefaultEditMode();
    notationStore.resetSelectedNotations();

    if (isCellInQuestionArea(notation)) {
      return;
    }

    let overlappedSameTypeNotation = findOverlapCellNotation(notation);

    // update
    if (overlappedSameTypeNotation) {
      return updateFromExistingNotation(overlappedSameTypeNotation, notation);
    }

    let overlappedAnyTypeNotation: NotationAttributes | undefined =
      findOverlapNotationsOfAnyTypeButLine(notation);

    // don't allow override of other type notation
    if (overlappedAnyTypeNotation) {
      return;
    }

    addNotation(notation);
  }

  function addLineNotation(
   lineAttributes: LineAttributes,
  ) {

    let lineNotation: LineNotationCreationAttributes = {
      ...lineAttributes,
      boardType: notationStore.getParent().type,
      parentUUId: notationStore.getParent().uuid,
      notationType: "LINE",
      user: userStore.getCurrentUser()!,
    };


    // allow adding more lines if polygon
    if (editModeStore.getEditMode() === "POLYGON_DRAWING") {
      editModeStore.setEditMode("POLYGON_STARTED");
    }

    notationStore.resetSelectedNotations();

    addNotation(lineNotation);
  }

  ///TODO : check if real needed or just one upsert notation for all types
  function upsertSqrtNotation(notation: SqrtNotationCreationAttributes) {

    notationStore.resetSelectedNotations();

    addNotation(notation);
  }

  function upsertRectNotation(newNotation: RectNotationCreationAttributes) {
    //    editModeStore.setDefaultEditMode();
    notationStore.resetSelectedNotations();

    let overlappedSameTypeNotation = findOverlapRectNotation(newNotation);

    // update
    if (overlappedSameTypeNotation) {
      updateFromExistingNotation(overlappedSameTypeNotation, newNotation);
    }

    //let overlappedAnyTypeNotation: NotationAttributes | undefined =
    //  findOverlapNotationsOfAnyTypeButLine(newNotation);

    // don't allow override of other type notation
    //if (overlappedAnyTypeNotation) {
    //  return;
    // }

    addNotation(newNotation);
  }

  function updateFromExistingNotation(
    existingNotation: NotationAttributes,
    notation: NotationCreationAttributes,
  ) {
    // dont update a question notation from within answer and vice versa
    if (existingNotation.boardType !== notation.boardType) {
      return;
    }

    setNotationAttributes(existingNotation, notation);

    apiHelper.updateNotationValue(existingNotation);

    notationStore.addNotation(existingNotation, true);

    userOutgoingOperations.syncOutgoingUpdateNotation(existingNotation);
  }

  async function addNotation(
    notation: NotationCreationAttributes,
  ): Promise<string> {
    try {
      const newNotation = await apiHelper.addNotation(notation);
      newNotation.notationType = notation.notationType;
      notationStore.addNotation(newNotation, true);

      // sync to other participants
      if (notationStore.getParent().type === "LESSON") {
        userOutgoingOperations.syncOutgoingAddNotation(newNotation);
      }
      return newNotation.uuid;
    } catch (error) {
      console.error("Error adding notation:", error);
      return "";
    }
  }

  function setNotationAttributes(
    existingNotation: NotationAttributes,
    notation: NotationCreationAttributes,
  ) {
    switch (existingNotation.notationType) {
      case "ANNOTATION":
      case "EXPONENT":
      case "SIGN":
      case "SQRTSYMBOL":
      case "SYMBOL": {
        (existingNotation as PointNotationAttributes).col = (
          notation as PointNotationAttributes
        ).col;
        (existingNotation as PointNotationAttributes).row = (
          notation as PointNotationAttributes
        ).row;
        (existingNotation as PointNotationAttributes).value = (
          notation as PointNotationAttributes
        ).value;
        break;
      }
       case "LINE": {
        const n1 = existingNotation as LineNotationAttributes;
        const n = notation as LineNotationAttributes;

        n1.p1x = n.p1x;
        n1.p2x = n.p2x;
        n1.p1y = n.p1y;
        n1.p2y = n.p2y;

        break;
      }

      case "IMAGE":
      case "TEXT": {
        const n1 = existingNotation as RectNotationAttributes;
        const n = notation as RectNotationAttributes;

        n1.fromCol = n.fromCol;
        n1.toCol = n.toCol;
        n1.fromRow = n.fromRow;
        n1.toRow = n.toRow;

        break;
      }
    }
  }

  // return true if 1. student in question and 2. notation coordinates are within question area
  function isNotationInQuestionArea(
    notation: NotationAttributes | null,
    delatX: number,
    delatY: number,
  ): boolean {
    if (!notation) return false;
    switch (notation.notationType) {
      case "EXPONENT":
      case "ANNOTATION":
      case "SIGN":
      case "SQRTSYMBOL":
      case "SYMBOL": {
        let pointNotation = notation as PointNotationAttributes;
        return (
          notation?.boardType === "ANSWER" &&
          !userStore.isTeacher() &&
          notationStore
            .getNotationsAtCell({
              col: pointNotation.col + delatX,
              row: pointNotation.row + delatY,
            })
            ?.find((n: NotationAttributes) => n.boardType == "QUESTION") != null
        );
      }

      case "IMAGE":
      case "TEXT": {
        let rectNotation = notation as RectNotationAttributes;
        for (
          let col: number = rectNotation.fromCol + delatX;
          col <= rectNotation.toCol + delatX;
          col++
        ) {
          for (
            let row: number = rectNotation.fromRow + delatY;
            row <= rectNotation.toRow + delatY;
            row++
          ) {
            if (
              notation?.boardType === "ANSWER" &&
              !userStore.isTeacher() &&
              notationStore
                .getNotationsAtCell({
                  col: col,
                  row: row,
                })
                ?.find((n: NotationAttributes) => n.boardType == "QUESTION") !=
                null
            )
              return true;
          }
        }
      }
    }
    return false;
  }

  function isCellInQuestionArea(
    pointAttributes: CellAttributes | null,
  ): boolean | null {
    return (
      notationStore.getParent().type == "ANSWER" &&
      !userStore.isTeacher() &&
      pointAttributes &&
      notationStore
        .getNotationsAtCell({
          col: pointAttributes.col,
          row: pointAttributes.row,
        })
        ?.find((n: NotationAttributes) => n.boardType == "QUESTION") != null
    );
  }

  function addMarkNotation(e: MouseEvent) {
    if (!authorizationHelper.canEdit()) return;

    const position = { x: e.pageX, y: e.pageY };

    let clickedCell = screenHelper.getCell(position);

    if (!clickedCell) return;

    selectionHelper.setSelectedCell(clickedCell, false);

    if (editModeStore.getEditMode() == "CHECKMARK_STARTED") {
      addSymbolNotation("&#x2714");
      return;
    }

    if (editModeStore.getEditMode() == "SEMICHECKMARK_STARTED") {
      addSymbolNotation("&#x237B");
      return;
    }

    if (editModeStore.getEditMode() == "XMARK_STARTED") {
      addSymbolNotation("&#x2718");
      return;
    }
  }

  async function deleteSelectedNotations() {
    if (!authorizationHelper.canEdit()) return;

    notationStore
      .getSelectedNotations()
      .forEach(async (n: NotationAttributes) => {
        // from db
        await apiHelper.deleteNotation(n);
      });

    notationStore
      .getSelectedNotations()
      .forEach(async (n: NotationAttributes) => {
        //from store
        notationStore.deleteNotation(n.uuid);

        // publish
        if (notationStore.getParent().type === "LESSON") {
          userOutgoingOperations.syncOutgoingRemoveNotation(
            n.uuid,
            (n as LessonNotationAttributes).lesson.uuid,
          );
        }
      });
  }

  function addImageNotation(
    fromCol: number,
    toCol: number,
    fromRow: number,
    toRow: number,
    base64Value: string,
  ) {
    let notation: RectNotationCreationAttributes = {
      fromCol: fromCol,
      toCol: toCol,
      fromRow: fromRow,
      toRow: toRow,
      value: base64Value,
      boardType: notationStore.getParent().type,
      parentUUId: notationStore.getParent().uuid,
      notationType: "IMAGE",
      user: userStore.getCurrentUser()!,
    };

    upsertRectNotation(notation);

    cellStore.resetSelectedCell();
  }

  function addTextNotation(value: string, textCells: RectAttributes) {
    let notation: RectNotationCreationAttributes = {
      fromCol: textCells.fromCol,
      toCol: textCells.toCol,
      fromRow: textCells.fromRow,
      toRow: textCells.toRow,
      value: value,
      boardType: notationStore.getParent().type,
      parentUUId: notationStore.getParent().uuid,
      notationType: "TEXT",
      user: userStore.getCurrentUser()!,
    };

    upsertRectNotation(notation);
  }

  function addAnnotationNotation(value: string, point: DotCoordinates) {
    let notation: AnnotationNotationCreationAttributes = {
      x: point.x,
      y: point.y,
      value: value,
      boardType: notationStore.getParent().type,
      parentUUId: notationStore.getParent().uuid,
      notationType: "ANNOTATION",
      user: userStore.getCurrentUser()!,
    };

    addNotation(notation); /// TODO: check if need to check cell occupation
  }

  function addExponentNotation(exponent: string, clickedCell: CellAttributes) {
    let notation: PointNotationCreationAttributes = {
      col: clickedCell!.col,
      row: clickedCell!.row,
      value: exponent,
      boardType: notationStore.getParent().type,
      parentUUId: notationStore.getParent().uuid,
      notationType: "EXPONENT",
      user: userStore.getCurrentUser()!,
    };
    addCellNotation(notation);
    if (!clickedCell) return;
    selectionHelper.setSelectedCell(clickedCell, false);
  }

  function addSymbolNotation(value: string) {
    const symbolCell = getSelectedCell();
    if (!symbolCell) return;

    // Check previous cell for "log"
    const previousCell = {
      col: symbolCell.col - 1,
      row: symbolCell.row,
    };

    const previousNotations = notationStore.getNotationsAtCell(previousCell);
    const isLogBase = previousNotations.some(
      (n) =>
        n.notationType === "SYMBOL" &&
        (n as PointNotationAttributes).value === "log",
    );

    let notation: PointNotationCreationAttributes = {
      col: symbolCell.col,
      row: symbolCell.row,
      value: value,
      boardType: notationStore.getParent().type,
      parentUUId: notationStore.getParent().uuid,
      notationType: isLogBase ? "LOGBASE" : "SYMBOL",
      user: userStore.getCurrentUser()!,
    };

    addCellNotation(notation);

    if (notation.value != ".") {
      matrixCellHelper.setNextCell(1, 0);
    }
  }

  function getSelectedCell(): CellAttributes | null {
    if (notationStore.getSelectedNotations().length) {
      let point =
        notationStore.getSelectedNotations()[0] as PointNotationAttributes;
      return { col: point.col, row: point.row };
    }

    return cellStore.getSelectedCell();
  }

  function addSqrtNotation(
    sqrtAttributes: MultiCellAttributes,
    notationType: NotationType,
  ) {
    transposeSqrtCoordinatesIfNeeded(sqrtAttributes);

    let sqrtNotation: SqrtNotationCreationAttributes = {
      fromCol: sqrtAttributes.fromCol,
      toCol: sqrtAttributes.toCol,
      row: sqrtAttributes.row,
      boardType: notationStore.getParent().type,
      parentUUId: notationStore.getParent().uuid,
      notationType: notationType,
      user: userStore.getCurrentUser()!,
    };

    upsertSqrtNotation(sqrtNotation);
  }


  async function addCurveNotation(
    curveAttributes: CurveAttributes,
  ): Promise<string> {
    let curveNotation: CurveNotationCreationAttributes = {
      p1x: curveAttributes.p1x,
      p2x: curveAttributes.p2x,
      p1y: curveAttributes.p1y,
      p2y: curveAttributes.p2y,
      cpx: curveAttributes.cpx,
      cpy: curveAttributes.cpy,
      boardType: notationStore.getParent().type,
      parentUUId: notationStore.getParent().uuid,
      notationType: "CURVE",
      user: userStore.getCurrentUser()!,
    };
    notationStore.resetSelectedNotations();
    return await addNotation(curveNotation);
  }

  function addCircleNotation(circleAttributes: CircleAttributes) {
    let circleNotation: CircleNotationCreationAttributes = {
      cx: circleAttributes.cx,
      cy: circleAttributes.cy,
      r: circleAttributes.r,
      boardType: notationStore.getParent().type,
      parentUUId: notationStore.getParent().uuid,
      notationType: "CIRCLE",
      user: userStore.getCurrentUser()!,
    };
    notationStore.resetSelectedNotations();
    addNotation(circleNotation);
  }

  function cloneNotation(notation: Readonly<NotationAttributes>) {
    let clonedNotation = { ...notation } as any;
    clonedNotation.id = undefined;
    delete clonedNotation.uuid;
    clonedNotation.parentUUId = notationStore.getParent().uuid; // in case you paste from lesson to question, parent will be taken from the target

    switch (notation.notationType) {
      case "SQRT":
      case "LINE":
        return addLineNotation(clonedNotation);
      case "CURVE":
        return addCurveNotation(clonedNotation);
      case "CIRCLE":
        return addCircleNotation(clonedNotation);
      case "ANNOTATION":
      case "SIGN":
      case "SQRTSYMBOL":
      case "SYMBOL":
        return addCellNotation(clonedNotation);
      case "IMAGE":
      case "TEXT":
        return upsertRectNotation(clonedNotation);
    }
  }

  function getUserUUId(): string {
    return userStore.getCurrentUser()!.uuid;
  }

  function transposeSqrtCoordinatesIfNeeded(notation: MultiCellAttributes) {
    if (notation.fromCol > notation.toCol) {
      const fromCol = notation.fromCol;
      notation.fromCol = notation.toCol;
      notation.toCol = fromCol;
    }
  }

  async function updateNotation(notation: NotationAttributes) {
    notationStore.addNotation(notation, true);
    await apiHelper.updateNotation(notation);
    userOutgoingOperations.syncOutgoingUpdateNotation(notation);
  }

  function getMostRightCoordinate() {
    return matrixDimensions.colsNum * cellStore.getCellHorizontalWidth();
  }

  function getMostBottomCoordinate() {
    return matrixDimensions.rowsNum * cellStore.getCellVerticalHeight();
  }

  function getColWidth(): number {
    return cellStore.getCellHorizontalWidth();
  }

  function getRowHeight(): number {
    return cellStore.getCellVerticalHeight();
  }

  async function handleDeleteKey() {
    // Check if function is already running
    if (deleteKeyLock) {
      return;
    }

    try {
      deleteKeyLock = true;

      if (notationStore.getSelectedNotations().length) {
        await deleteSelectedNotations();
      }

      if (editModeStore.getEditMode() === "AREA_SELECTED") {
        return;
      }

      await collapseNotationsToSelectedCell();
      notationStore.selectNotationsOfCells([cellStore.getSelectedCell()]);
    } finally {
      // Always release the lock
      deleteKeyLock = false;
    }
  }

  function collapseNotationsToSelectedCell() {
    const cell = cellStore.getSelectedCell();
    if (!cell) return;

    for (
      let col = cellStore.getSelectedCell().col;
      col < matrixDimensions.colsNum;
      col++
    ) {
      const notations = notationStore.getNotationsAtCell({
        row: cell.row,
        col: col,
      });
      if (notations.length === 1) {
        const notation = notations[0];

        if (
          notation.notationType !== "SIGN" &&
          notation.notationType !== "EXPONENT" &&
          notation.notationType !== "SYMBOL"
        ) {
          break;
        }

        (notation as PointNotationAttributes).col--;
        updateNotation(notation);
      }
    }
  }

  return {
    addCircleNotation,
    addCurveNotation,
    addImageNotation,
    addMarkNotation,
    addLineNotation,
    addSymbolNotation,
    addTextNotation,
    addAnnotationNotation,
    addSqrtNotation,
    addExponentNotation,
    cloneNotation,
    deleteSelectedNotations,
    moveSelectedNotationsAtPixelScale,
    moveSelectedNotationsAtCellScale,
    handleDeleteKey,
    isNotationInQuestionArea,
    isCellInQuestionArea,
    updateSqrtNotation,
    updateLineNotation,
    updateCurveNotation,
    updateCircleNotation,
    updateNotation,
    selectNotation,
    selectNotationByCoordinates,
    saveMovedNotations,
  };
}
