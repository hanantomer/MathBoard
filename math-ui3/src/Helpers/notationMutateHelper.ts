import useDbHelper from "../helpers/dbHelper";

import {
  PointNotationAttributes,
  RectNotationAttributes,
  PointNotationCreationAttributes,
  RectNotationCreationAttributes,
  NotationCreationAttributes,
  HorizontalLineNotationAttributes,
  VerticalLineNotationAttributes,
  SlopeLineNotationAttributes,
  CurveAttributes,
  HorizontalLineAttributes,
  VerticalLineAttributes,
  SlopeLineAttributes,
  CurveNotationAttributes,
  HorizontalLineNotationCreationAttributes,
  VerticalLineNotationCreationAttributes,
  SlopeLineNotationCreationAttributes,
  CurveNotationCreationAttributes,
  ExponentNotationCreationAttributes,
  AnnotationNotationCreationAttributes,
  SqrtNotationCreationAttributes,
  isCurve,
  isLine,
  isPoint,
  isRect,
  ExponentNotationAttributes,
  MultiCellAttributes,
  SqrtNotationAttributes,
} from "common/baseTypes";

import { matrixDimensions } from "common/globals";
import { CellAttributes } from "common/baseTypes";
import { NotationType, MoveDirection } from "common/unions";
import { useUserStore } from "../store/pinia/userStore";
import { useNotationStore } from "../store/pinia/notationStore";
import { useCellStore } from "../store/pinia/cellStore";
import { useEditModeStore } from "../store/pinia/editModeStore";
import useAuthorizationHelper from "./authorizationHelper";
import useUserOutgoingOperations from "./userOutgoingOperationsHelper";
import useMatrixCellHelper from "../helpers/matrixCellHelper";

import { NotationAttributes, RectAttributes } from "common/baseTypes";

const matrixCellHelper = useMatrixCellHelper();
const userStore = useUserStore();
const dbHelper = useDbHelper();
const notationStore = useNotationStore();
const cellStore = useCellStore();
const editModeStore = useEditModeStore();
const authorizationHelper = useAuthorizationHelper();
const userOutgoingOperations = useUserOutgoingOperations();

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

  function findOverlapPointNotation(
    notation: PointNotationCreationAttributes,
  ): PointNotationAttributes | undefined {
    return notationStore
      .getNotationAtCoordinates()
      .find((n2: PointNotationAttributes) => {
        return pointAtCellCoordinates(
          notation as PointNotationAttributes,
          n2,
          getUserUUId(),
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
      if (isPoint(n2.notationType))
        return (
          pointAtCellCoordinates(
            notation as PointNotationAttributes,
            n2 as PointNotationAttributes,
            getUserUUId(),
          ) ??
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

      if (isPoint(n.notationType)) {
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
        case "HORIZONTALLINE": {
          const n1 = n as HorizontalLineNotationAttributes;
          if (n1.p2x + deltaCol * getColWidth() > getMostRightCoordinate()) {
            return false;
          }

          if (n1.p1x + deltaCol * getColWidth() < 1) return false;

          if (n1.py + deltaRow * getRowHeight() > getMostBottomCoordinate()) {
            return false;
          }

          if (n1.p2x + deltaCol * getColWidth() < 1) {
            return false;
          }
        }

        case "VERTICALLINE": {
          const n1 = n as VerticalLineNotationAttributes;
          if (n1.px + deltaCol * getColWidth() > getMostRightCoordinate()) {
            return false;
          }

          if (n1.p2y + deltaRow * getRowHeight() > matrixDimensions.rowsNum) {
            return false;
          }

          if (n1.p1y + deltaRow * getRowHeight() < 1) {
            return false;
          }

          if (n1.p2y + deltaRow * getRowHeight() > getMostBottomCoordinate()) {
            return false;
          }
        }

        case "SLOPELINE": {
          const n1 = n as SlopeLineNotationAttributes;
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
  // move without persistence - called during  mouse move - don't bother the database during move
  function moveSelectedNotations(
    deltaCol: number,
    deltaRow: number,
    keepOriginal: boolean,
  ): boolean {
    if (!canMoveSelectedNotations(deltaCol, deltaRow)) return false;

    if (keepOriginal) {
      notationStore.cloneSelectedNotations();
    }

    notationStore.getSelectedNotations().forEach((n: NotationAttributes) => {
      switch (n.notationType) {
        case "ANNOTATION":
        case "SIGN":
        case "SQRTSYMBOL":
        case "SYMBOL": {
          (n as PointNotationAttributes).col += deltaCol;
          (n as PointNotationAttributes).row += deltaRow;
          break;
        }

        case "HORIZONTALLINE": {
          (n as HorizontalLineNotationAttributes).p1x +=
            deltaCol * cellStore.getCellHorizontalWidth();
          (n as HorizontalLineNotationAttributes).p2x +=
            deltaCol * cellStore.getCellHorizontalWidth();
          (n as HorizontalLineNotationAttributes).py +=
            deltaRow * cellStore.getCellVerticalHeight();
          break;
        }
        case "VERTICALLINE": {
          (n as VerticalLineNotationAttributes).px +=
            deltaCol * cellStore.getCellHorizontalWidth();
          (n as VerticalLineNotationAttributes).p1y +=
            deltaRow * cellStore.getCellVerticalHeight();
          (n as VerticalLineNotationAttributes).p2y +=
            deltaRow * cellStore.getCellVerticalHeight();
          break;
        }
        case "SLOPELINE": {
          (n as SlopeLineNotationAttributes).p1x +=
            deltaCol * cellStore.getCellHorizontalWidth();
          (n as SlopeLineNotationAttributes).p2x +=
            deltaCol * cellStore.getCellHorizontalWidth();
          (n as SlopeLineNotationAttributes).p1y +=
            deltaCol * cellStore.getCellHorizontalWidth();
          (n as SlopeLineNotationAttributes).p2y +=
            deltaRow * cellStore.getCellVerticalHeight();
          break;
        }

        case "CONVEXCURVE":
        case "CONCAVECURVE": {
          (n as CurveNotationAttributes).p1x +=
            deltaCol * cellStore.getCellHorizontalWidth();
          (n as CurveNotationAttributes).p2x +=
            deltaCol * cellStore.getCellHorizontalWidth();
          (n as CurveNotationAttributes).p1y +=
            deltaRow * cellStore.getCellVerticalHeight();
          (n as CurveNotationAttributes).p2y +=
            deltaRow * cellStore.getCellVerticalHeight();
          break;
        }

        case "SQRT":
        case "EXPONENT": {
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
    });
    return true;
  }

  // move selected notations with persistence - called upon muose up
  async function saveMovedNotations(moveDirection: MoveDirection) {
    await dbHelper.saveMovedNotations(
      getSelectedNotationsSortedByDirection(moveDirection),
    );

    notationStore
      .getSelectedNotations()
      .forEach(async (n: NotationAttributes) => {
        notationStore.addNotation(n);
        userOutgoingOperations.syncOutgoingUpdateNotation(n);
      });
  }

  // sort selected notations that we first update the outer and the the inner
  // in order to avoid integrity constraint violation
  // for example: if we move 2 notations to the left, we must first update the left one
  // or the noation to the right will try to occupy the same cell of the left one.
  function getSelectedNotationsSortedByDirection(moveDirection: MoveDirection) {
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

  async function updateHorizontalLineNotation(
    lineNotation: HorizontalLineNotationAttributes,
  ) {
    transposeHorizontalCoordinatesIfNeeded(lineNotation);
    await dbHelper.updateHorizontalLineNotationAttributes(lineNotation);
    notationStore.addNotation(lineNotation);
  }

  async function updateSqrtNotation(sqrtNotation: SqrtNotationAttributes) {
    transposeSqrtCoordinatesIfNeeded(sqrtNotation);
    await dbHelper.updateSqrtNotationAttributes(sqrtNotation);
    notationStore.addNotation(sqrtNotation);
  }

  async function updateVerticalLineNotation(
    lineNotation: VerticalLineNotationAttributes,
  ) {
    transposeVerticalCoordinatesIfNeeded(lineNotation);
    await dbHelper.updateVerticalLineNotationAttributes(lineNotation);
    notationStore.addNotation(lineNotation);
  }

  async function updateSlopeLineNotation(
    lineNotation: SlopeLineNotationAttributes,
  ) {
    await dbHelper.updateSlopeLineNotationAttributes(lineNotation);
    notationStore.addNotation(lineNotation);
  }

  async function updateCurveNotation(curve: CurveNotationAttributes) {
    await dbHelper.updateCurveNotationAttributes(curve);
    notationStore.addNotation(curve);
  }

  function addPointNotation(notation: PointNotationCreationAttributes) {
    editModeStore.setDefaultEditMode();
    notationStore.resetSelectedNotations();

    let overlappedSameTypeNotation = findOverlapPointNotation(notation);

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

  function upsertLineNotation(
    notation:
      | HorizontalLineNotationCreationAttributes
      | VerticalLineNotationCreationAttributes
      | SlopeLineNotationCreationAttributes,
  ) {
    editModeStore.setDefaultEditMode();
    notationStore.resetSelectedNotations();

    let overlappedAnyTypeNotation: NotationAttributes | undefined =
      findOverlapNotationsOfAnyTypeButLine(notation);

    // don't allow override of other type notation
    if (overlappedAnyTypeNotation) {
      return;
    }

    addNotation(notation);
  }

  ///TODO : check if real needed or just one upsert notation for all types
  function upsertSqrtNotation(notation: SqrtNotationCreationAttributes) {
    editModeStore.setDefaultEditMode();
    notationStore.resetSelectedNotations();

    let overlappedAnyTypeNotation: NotationAttributes | undefined =
      findOverlapNotationsOfAnyTypeButLine(notation);

    // don't allow override of other type notation
    if (overlappedAnyTypeNotation) {
      return;
    }

    addNotation(notation);
  }

  function upsertCurveNotation(notation: CurveNotationCreationAttributes) {
    editModeStore.setDefaultEditMode();
    notationStore.resetSelectedNotations();

    let overlappedAnyTypeNotation: NotationAttributes | undefined =
      findOverlapNotationsOfAnyTypeButLine(notation);

    // don't allow override of other type notation
    if (overlappedAnyTypeNotation) {
      return;
    }

    addNotation(notation);
  }

  function upsertRectNotation(newNotation: RectNotationCreationAttributes) {
    editModeStore.setDefaultEditMode();
    notationStore.resetSelectedNotations();

    let overlappedSameTypeNotation = findOverlapRectNotation(newNotation);

    // update
    if (overlappedSameTypeNotation) {
      updateFromExistingNotation(overlappedSameTypeNotation, newNotation);
    }

    let overlappedAnyTypeNotation: NotationAttributes | undefined =
      findOverlapNotationsOfAnyTypeButLine(newNotation);

    // don't allow override of other type notation
    if (overlappedAnyTypeNotation) {
      return;
    }

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

    dbHelper.updateNotationValue(existingNotation);

    notationStore.addNotation(existingNotation);

    userOutgoingOperations.syncOutgoingUpdateNotation(existingNotation);
  }

  function addNotation(notation: NotationCreationAttributes) {
    dbHelper.addNotation(notation).then((newNotation) => {
      newNotation.notationType = notation.notationType;
      notationStore.addNotation(newNotation);

      // sync to other participants
      if (notationStore.getParent().type === "LESSON") {
        userOutgoingOperations.syncOutgoingAddNotation(newNotation);
      }
    });
  }

  function setNotationAttributes(
    existingNotation: NotationAttributes,
    notation: NotationCreationAttributes,
  ) {
    switch (existingNotation.notationType) {
      case "ANNOTATION":
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
      case "HORIZONTALLINE": {
        const n1 = existingNotation as HorizontalLineNotationAttributes;
        const n = notation as HorizontalLineNotationAttributes;

        n1.p1x = n.p1x;
        n1.p2x = n.p2x;
        n1.py = n.py;

        break;
      }
      case "VERTICALLINE": {
        const n1 = existingNotation as VerticalLineNotationAttributes;
        const n = notation as VerticalLineNotationAttributes;

        n1.p1y = n.p1y;
        n1.p2y = n.p2y;
        n1.px = n.px;

        break;
      }
      case "SLOPELINE": {
        const n1 = existingNotation as SlopeLineNotationAttributes;
        const n = notation as SlopeLineNotationAttributes;

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

      case "EXPONENT": {
        const multiCell = notation as unknown as MultiCellAttributes;
        return (
          notation?.boardType === "ANSWER" &&
          !userStore.isTeacher() &&
          notationStore
            .getNotationsAtCell({
              col: multiCell.fromCol + delatX,
              row: multiCell.row + delatY,
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

  function addMarkNotation() {
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

  function deleteSelectedNotations() {
    if (!authorizationHelper.canEdit()) return;

    notationStore
      .getSelectedNotations()
      .forEach(async (n: NotationAttributes) => {
        // from db
        await dbHelper.removeNotation(n);
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
            n.parentUUId,
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

  function addAnnotationNotation(
    value: string,
    annotationCells: CellAttributes,
  ) {
    let notation: AnnotationNotationCreationAttributes = {
      col: annotationCells.col,
      row: annotationCells.row,
      value: value,
      boardType: notationStore.getParent().type,
      parentUUId: notationStore.getParent().uuid,
      notationType: "ANNOTATION",
      user: userStore.getCurrentUser()!,
    };

    addPointNotation(notation);
  }

  function addExponentNotation(base: string, exponent: string) {
    let notation: ExponentNotationCreationAttributes = {
      fromCol: getSelectedCell()!.col,
      toCol: getSelectedCell()!.col + exponent.length + 1,
      row: getSelectedCell()!.row,
      base: base,
      exponent: exponent,
      boardType: notationStore.getParent().type,
      parentUUId: notationStore.getParent().uuid,
      notationType: "EXPONENT",
      user: userStore.getCurrentUser()!,
    };

    addNotation(notation);
    matrixCellHelper.setNextCell(base.length + 1, 0);
  }

  function addSymbolNotation(value: string) {
    const symbolCell = getSelectedCell();
    if (!symbolCell) return;

    let notation: PointNotationCreationAttributes = {
      col: symbolCell.col,
      row: symbolCell.row,
      value: value,
      boardType: notationStore.getParent().type,
      parentUUId: notationStore.getParent().uuid,
      notationType: "SYMBOL",
      user: userStore.getCurrentUser()!,
    };

    addPointNotation(notation);

    matrixCellHelper.setNextCell(1, 0);
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

  function addHorizontalLineNotation(
    horizontalLineAttributes: HorizontalLineAttributes,
    notationType: NotationType,
  ) {
    transposeHorizontalCoordinatesIfNeeded(horizontalLineAttributes);

    let lineNotation: HorizontalLineNotationCreationAttributes = {
      p1x: horizontalLineAttributes.p1x,
      p2x: horizontalLineAttributes.p2x,
      py: horizontalLineAttributes.py,
      boardType: notationStore.getParent().type,
      parentUUId: notationStore.getParent().uuid,
      notationType: notationType,
      user: userStore.getCurrentUser()!,
    };

    upsertLineNotation(lineNotation);
  }

  function addVerticalLineNotation(
    verticalLineAttributes: VerticalLineAttributes,
    notationType: NotationType,
  ) {
    transposeVerticalCoordinatesIfNeeded(verticalLineAttributes);

    let notation: VerticalLineNotationCreationAttributes = {
      px: verticalLineAttributes.px,
      p1y: verticalLineAttributes.p1y,
      p2y: verticalLineAttributes.p2y,
      boardType: notationStore.getParent().type,
      parentUUId: notationStore.getParent().uuid,
      notationType: notationType,
      user: userStore.getCurrentUser()!,
    };

    upsertLineNotation(notation);
  }

  function addSlopeLineNotation(
    slopeLineAttributes: SlopeLineAttributes,
    notationType: NotationType,
  ) {
    let lineNotation: SlopeLineNotationCreationAttributes = {
      p1x: slopeLineAttributes.p1x,
      p2x: slopeLineAttributes.p2x,
      p1y: slopeLineAttributes.p1y,
      p2y: slopeLineAttributes.p2y,
      boardType: notationStore.getParent().type,
      parentUUId: notationStore.getParent().uuid,
      notationType: notationType,
      user: userStore.getCurrentUser()!,
    };
    upsertLineNotation(lineNotation);
  }

  function addCurveNotation(
    curveAttributes: CurveAttributes,
    notationType: NotationType,
  ) {
    let curveNotation: CurveNotationCreationAttributes = {
      p1x: curveAttributes.p1x,
      p2x: curveAttributes.p2x,
      p1y: curveAttributes.p1y,
      p2y: curveAttributes.p2y,
      cpx: curveAttributes.cpx,
      cpy: curveAttributes.cpy,
      boardType: notationStore.getParent().type,
      parentUUId: notationStore.getParent().uuid,
      notationType: notationType,
      user: userStore.getCurrentUser()!,
    };
    upsertCurveNotation(curveNotation);
  }

  function cloneNotation(notation: Readonly<NotationAttributes>) {
    let clonedNotation = { ...notation } as any;
    clonedNotation.id = undefined;
    delete clonedNotation.uuid;
    clonedNotation.parentUUId = notationStore.getParent().uuid; // in case you paste from lesson to question, parent will be taken from the target

    switch (notation.notationType) {
      case "SQRT":
      case "HORIZONTALLINE":
      case "VERTICALLINE":
      case "SLOPELINE":
        return upsertLineNotation(clonedNotation);
      case "CONCAVECURVE":
      case "CONVEXCURVE":
        return upsertCurveNotation(clonedNotation);
      case "ANNOTATION":
      case "SIGN":
      case "SQRTSYMBOL":
      case "SYMBOL":
        return addPointNotation(clonedNotation);
      case "IMAGE":
      case "TEXT":
        return upsertRectNotation(clonedNotation);
    }
  }

  function getUserUUId(): string {
    return userStore.getCurrentUser()!.uuid;
  }

  function transposeVerticalCoordinatesIfNeeded(
    coordinates: VerticalLineAttributes,
  ) {
    if (coordinates.p1y > coordinates.p2y) {
      const y1 = coordinates.p1y;
      coordinates.p1y = coordinates.p2y;
      coordinates.p2y = y1;
    }
  }

  function transposeHorizontalCoordinatesIfNeeded(
    coordinates: HorizontalLineAttributes,
  ) {
    if (coordinates.p1x > coordinates.p2x) {
      const x1 = coordinates.p1x;
      coordinates.p1x = coordinates.p2x;
      coordinates.p2x = x1;
    }
  }

  function transposeSqrtCoordinatesIfNeeded(notation: MultiCellAttributes) {
    if (notation.fromCol > notation.toCol) {
      const fromCol = notation.fromCol;
      notation.fromCol = notation.toCol;
      notation.toCol = fromCol;
    }
  }

  async function updateNotation(notation: NotationAttributes) {
    notationStore.addNotation(notation);
    await dbHelper.updateNotation(notation);
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

  return {
    addCurveNotation,
    addHorizontalLineNotation,
    addImageNotation,
    addMarkNotation,
    addVerticalLineNotation,
    addSlopeLineNotation,
    addSymbolNotation,
    addTextNotation,
    addAnnotationNotation,
    addSqrtNotation,
    addExponentNotation,
    cloneNotation,
    deleteSelectedNotations,
    moveSelectedNotations,
    isNotationInQuestionArea,
    isCellInQuestionArea,
    updateHorizontalLineNotation,
    updateSqrtNotation,
    updateVerticalLineNotation,
    updateSlopeLineNotation,
    updateCurveNotation,
    updateNotation,
    selectNotation,
    selectNotationByCoordinates,
    saveMovedNotations,
  };
}
