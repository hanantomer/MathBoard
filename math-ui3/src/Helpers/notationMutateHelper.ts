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
} from "common/baseTypes";

import { matrixDimensions } from "common/globals";
import { CellAttributes } from "common/baseTypes";
import { NotationType, NotationTypeShape, MoveDirection } from "common/unions";
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

type colSpan = { fromCol: number; toCol: number };

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
        NotationTypeShape.get(n.notationType) === "POINT"
          ? pointAtCellCoordinates(
              n as PointNotationAttributes,
              cellCoordinates,
              userUUId,
            )
          : NotationTypeShape.get(n.notationType) === "RECT"
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
      .getNotationAtCoordinatess()
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
      switch (NotationTypeShape.get(notation.notationType)) {
        case "POINT":
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

        case "RECT":
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
      }
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

  function canMoveSelectedNotations(deltaX: number, deltaY: number): boolean {
    notationStore.getSelectedNotations().forEach((n: NotationAttributes) => {
      if (isNotationInQuestionArea(n, deltaX, deltaY)) return false;

      switch (NotationTypeShape.get(n.notationType)) {
        case "POINT": {
          if (
            (n as PointNotationAttributes).col + deltaX >
            matrixDimensions.colsNum
          )
            return false;
          if ((n as PointNotationAttributes).col + deltaX < 1) return false;
          if (
            (n as PointNotationAttributes).row + deltaY >
            matrixDimensions.rowsNum
          )
            return false;
          if ((n as PointNotationAttributes).row + deltaY < 1) return false;
          break;
        }
        case "HORIZONTAL_LINE": {
          if (
            (n as HorizontalLineNotationAttributes).toCol + deltaX >
            matrixDimensions.colsNum
          )
            return false;
          if ((n as HorizontalLineNotationAttributes).fromCol + deltaX < 1)
            return false;
          if (
            (n as HorizontalLineNotationAttributes).row + deltaY >
            matrixDimensions.rowsNum
          )
            return false;
          if ((n as HorizontalLineNotationAttributes).row + deltaY < 1)
            return false;
        }
        case "VERTICAL_LINE": {
          if (
            (n as VerticalLineNotationAttributes).col + deltaX >
            matrixDimensions.colsNum
          )
            return false;
          if (
            (n as VerticalLineNotationAttributes).fromRow + deltaY >
            matrixDimensions.rowsNum
          )
            return false;
          if ((n as VerticalLineNotationAttributes).fromRow + deltaY < 1)
            return false;
          if (
            (n as VerticalLineNotationAttributes).toRow + deltaY >
            matrixDimensions.colsNum
          )
            return false;
          break;
        }

        case "SLOPE_LINE": {
          if (
            (n as HorizontalLineNotationAttributes).toCol + deltaX >
            matrixDimensions.colsNum
          )
            return false;
          if ((n as HorizontalLineNotationAttributes).fromCol + deltaX < 1)
            return false;

          if (
            (n as SlopeLineNotationAttributes).fromRow + deltaY >
            matrixDimensions.rowsNum
          )
            return false;
          if ((n as SlopeLineNotationAttributes).fromRow + deltaY < 1)
            return false;
          if (
            (n as SlopeLineNotationAttributes).toRow + deltaY >
            matrixDimensions.colsNum
          )
            return false;
          break;
        }

        case "RECT": {
          if (
            (n as RectNotationAttributes).toCol + deltaX >
            matrixDimensions.colsNum
          )
            return false;
          if ((n as RectNotationAttributes).fromCol + deltaX < 1) return false;
          if (
            (n as RectNotationAttributes).toRow + deltaY >
            matrixDimensions.rowsNum
          )
            return false;
          if ((n as RectNotationAttributes).fromRow + deltaY < 1) return false;
          break;
        }
      }
    });

    return true;
  }
  // move without persistence - called during  mouse move  - don't bother the database during move
  function moveSelectedNotations(
    deltaX: number,
    deltaY: number,
    keepOriginal: boolean,
  ): boolean {
    if (!canMoveSelectedNotations(deltaX, deltaY)) return false;

    if (keepOriginal) {
      notationStore.cloneSelectedNotations();
    }

    notationStore.getSelectedNotations().forEach((n: NotationAttributes) => {
      switch (NotationTypeShape.get(n.notationType)) {
        case "POINT": {
          (n as PointNotationAttributes).col += deltaX;
          (n as PointNotationAttributes).row += deltaY;
          break;
        }
        case "HORIZONTAL_LINE": {
          (n as HorizontalLineNotationAttributes).fromCol += deltaX;
          (n as HorizontalLineNotationAttributes).toCol += deltaX;
          (n as HorizontalLineNotationAttributes).row += deltaY;
          break;
        }
        case "VERTICAL_LINE": {
          (n as VerticalLineNotationAttributes).col += deltaX;
          (n as VerticalLineNotationAttributes).fromRow += deltaX;
          (n as VerticalLineNotationAttributes).toRow += deltaY;
          break;
        }
        case "SLOPE_LINE": {
          (n as SlopeLineNotationAttributes).fromCol += deltaX;
          (n as SlopeLineNotationAttributes).toCol += deltaX;
          (n as SlopeLineNotationAttributes).fromRow += deltaX;
          (n as SlopeLineNotationAttributes).toRow += deltaY;
          break;
        }

        case "RECT": {
          (n as RectNotationAttributes).fromCol += deltaX;
          (n as RectNotationAttributes).toCol += deltaX;
          (n as RectNotationAttributes).fromRow += deltaY;
          (n as RectNotationAttributes).toRow += deltaY;
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
    await dbHelper.updateHorizontalLineAttributes(lineNotation);
    notationStore.addNotation(lineNotation);
  }

  async function updateVerticalLineNotation(
    lineNotation: VerticalLineNotationAttributes,
  ) {
    transposeVerticalCoordinatesIfNeeded(lineNotation);
    await dbHelper.updateVerticalLineAttributes(lineNotation);
    notationStore.addNotation(lineNotation);
  }

  async function updateSlopeLineNotation(
    lineNotation: SlopeLineNotationAttributes,
  ) {
    await dbHelper.updateSlopeLineAttributes(lineNotation);
    notationStore.addNotation(lineNotation);
  }

  async function updateCurveNotation(curve: CurveNotationAttributes) {
    await dbHelper.updateCurveAttributes(curve);
    notationStore.addNotation(curve);
  }

  function upsertPointNotation(notation: PointNotationCreationAttributes) {
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
    switch (NotationTypeShape.get(existingNotation.notationType)) {
      case "POINT": {
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
      case "HORIZONTAL_LINE": {
        (existingNotation as HorizontalLineNotationAttributes).fromCol = (
          notation as HorizontalLineNotationAttributes
        ).fromCol;

        (existingNotation as HorizontalLineNotationAttributes).toCol = (
          notation as HorizontalLineNotationAttributes
        ).toCol;

        (existingNotation as HorizontalLineNotationAttributes).row = (
          notation as HorizontalLineNotationAttributes
        ).row;

        break;
      }
      case "VERTICAL_LINE": {
        (existingNotation as VerticalLineNotationAttributes).col = (
          notation as VerticalLineNotationAttributes
        ).col;

        (existingNotation as VerticalLineNotationAttributes).fromRow = (
          notation as VerticalLineNotationAttributes
        ).fromRow;

        (existingNotation as VerticalLineNotationAttributes).toRow = (
          notation as VerticalLineNotationAttributes
        ).toRow;

        break;
      }
      case "SLOPE_LINE": {
        (existingNotation as SlopeLineNotationAttributes).fromCol = (
          notation as SlopeLineNotationAttributes
        ).fromCol;

        (existingNotation as SlopeLineNotationAttributes).toCol = (
          notation as SlopeLineNotationAttributes
        ).toCol;

        (existingNotation as SlopeLineNotationAttributes).fromRow = (
          notation as SlopeLineNotationAttributes
        ).fromRow;

        (existingNotation as SlopeLineNotationAttributes).toRow = (
          notation as SlopeLineNotationAttributes
        ).toRow;

        break;
      }

      case "RECT": {
        (existingNotation as RectNotationAttributes).fromCol = (
          notation as RectNotationAttributes
        ).fromCol;

        (existingNotation as RectNotationAttributes).toCol = (
          notation as RectNotationAttributes
        ).toCol;

        (existingNotation as RectNotationAttributes).fromRow = (
          notation as RectNotationAttributes
        ).fromRow;

        (existingNotation as RectNotationAttributes).toRow = (
          notation as RectNotationAttributes
        ).toRow;

        (existingNotation as RectNotationAttributes).value = (
          notation as RectNotationAttributes
        ).value;

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
    switch (NotationTypeShape.get(notation.notationType)) {
      case "POINT": {
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

      case "RECT": {
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
      upsertSymbolNotation("&#x2714");
      return;
    }

    if (editModeStore.getEditMode() == "SEMICHECKMARK_STARTED") {
      upsertSymbolNotation("&#x237B");
      return;
    }

    if (editModeStore.getEditMode() == "XMARK_STARTED") {
      upsertSymbolNotation("&#x2718");
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

  function upsertTextNotation(value: string, textCells: RectAttributes) {
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

  function upsertAnnotationNotation(
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

    upsertPointNotation(notation);
  }

  function upsertExponentNotation(base: string, exponent: string) {
    let notation: ExponentNotationCreationAttributes = {
      col: getSelectedCell()!.col,
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

  function upsertSymbolNotation(value: string) {
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

    upsertPointNotation(notation);

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

  function addHorizontalLineNotation(
    horizontalLineAttributes: HorizontalLineAttributes,
    notationType: NotationType,
  ) {
    transposeHorizontalCoordinatesIfNeeded(horizontalLineAttributes);

    let lineNotation: HorizontalLineNotationCreationAttributes = {
      fromCol: horizontalLineAttributes.fromCol,
      toCol: horizontalLineAttributes.toCol,
      row: horizontalLineAttributes.row,
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
      col: verticalLineAttributes.col,
      fromRow: verticalLineAttributes.fromRow,
      toRow: verticalLineAttributes.toRow,
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
      fromCol: slopeLineAttributes.fromCol,
      toCol: slopeLineAttributes.toCol,
      fromRow: slopeLineAttributes.fromRow,
      toRow: slopeLineAttributes.toRow,
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

    switch (NotationTypeShape.get(notation.notationType)) {
      case "HORIZONTAL_LINE":
      case "VERTICAL_LINE":
      case "SLOPE_LINE":
        return upsertLineNotation(clonedNotation);
      case "CONVEX_CURVE":
      case "CONCAVE_CURVE":
        return upsertCurveNotation(clonedNotation);
      case "POINT":
        return upsertPointNotation(clonedNotation);
      case "RECT":
        return upsertRectNotation(clonedNotation);
    }
  }

  function getUserUUId(): string {
    return userStore.getCurrentUser()!.uuid;
  }

  function transposeVerticalCoordinatesIfNeeded(
    coordinates: VerticalLineAttributes,
  ) {
    if (coordinates.fromRow > coordinates.toRow) {
      const fromRow = coordinates.fromRow;
      coordinates.fromRow = coordinates.toRow;
      coordinates.toRow = fromRow;
    }
  }

  function transposeHorizontalCoordinatesIfNeeded(
    coordinates: HorizontalLineAttributes,
  ) {
    if (coordinates.fromCol > coordinates.toCol) {
      const fromCol = coordinates.fromCol;
      coordinates.fromCol = coordinates.toCol;
      coordinates.toCol = fromCol;
    }
  }

  async function updateNotation(notation: NotationAttributes) {
    notationStore.addNotation(notation);
    await dbHelper.updateNotation(notation);
    userOutgoingOperations.syncOutgoingUpdateNotation(notation);
  }

  return {
    addCurveNotation,
    addHorizontalLineNotation,
    addImageNotation,
    addMarkNotation,
    addVerticalLineNotation,
    addSlopeLineNotation,
    cloneNotation,
    deleteSelectedNotations,
    moveSelectedNotations,
    isNotationInQuestionArea,
    isCellInQuestionArea,
    updateHorizontalLineNotation,
    updateVerticalLineNotation,
    updateSlopeLineNotation,
    updateCurveNotation,
    updateNotation,
    upsertSymbolNotation,
    upsertTextNotation,
    upsertAnnotationNotation,
    upsertExponentNotation,
    selectNotation,
    selectNotationByCoordinates,
    saveMovedNotations,
  };
}
