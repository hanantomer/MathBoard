import useDbHelper from "../helpers/dbHelper";

import {
  PointNotationAttributes,
  LineNotationAttributes,
  RectNotationAttributes,
  PointNotationCreationAttributes,
  LineNotationCreationAttributes,
  RectNotationCreationAttributes,
  NotationCreationAttributes,
  TriangleNotationCreationAttributes,
  TriangleAttributes,
} from "common/baseTypes";

import { matrixDimensions } from "common/globals";
import { PointAttributes } from "common/baseTypes";
import { NotationType, NotationTypeShape, MoveDirection } from "common/unions";
import { useUserStore } from "../store/pinia/userStore";
import { useNotationStore } from "../store/pinia/notationStore";
import { useEditModeStore } from "../store/pinia/editModeStore";
import useAuthorizationHelper from "./authorizationHelper";
import useUserOutgoingOperations from "./userOutgoingOperationsHelper";
import useMatrixHelper from "../helpers/matrixHelper";

import {
  NotationAttributes,
  LineAttributes,
  RectAttributes,
} from "common/baseTypes";

const matrixHelper = useMatrixHelper();
const userStore = useUserStore();
const dbHelper = useDbHelper();
const notationStore = useNotationStore();
const editModeStore = useEditModeStore();
const authorizationHelper = useAuthorizationHelper();
const userOutgoingOperations = useUserOutgoingOperations();

export default function notationMutateHelper() {
  function pointAtCellCoordinates(
    n1: PointNotationAttributes,
    n2: PointAttributes,
    userUUId: string,
  ) {
    return n1.col == n2.col && n1.row == n2.row && n1.user.uuid === userUUId;
  }

  function pointAtLineCoordinates(
    pointNotation: PointNotationAttributes,
    lineCoordinates: LineAttributes,
    userUUId: string,
  ) {
    return (
      pointNotation.col >= lineCoordinates.fromCol &&
      pointNotation.col <= lineCoordinates.toCol &&
      pointNotation.row == lineCoordinates.row &&
      pointNotation.user.uuid == userUUId
    );
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

  // line
  function lineAtCellCoordinates(
    lineCoordinates: LineNotationAttributes,
    cellCoordinates: PointAttributes,
    userUUId: string,
  ) {
    return (
      lineCoordinates.fromCol <= cellCoordinates.col &&
      lineCoordinates.toCol >= cellCoordinates.col &&
      lineCoordinates.row == cellCoordinates.row &&
      lineCoordinates.user.uuid == userUUId
    );
  }

  function lineAtLineCoordinates(
    line1Coordinates: LineNotationAttributes,
    line2Coordinates: LineNotationAttributes,
    userUUId: string,
  ) {
    return (
      ((line1Coordinates.fromCol >= line2Coordinates.fromCol &&
        line1Coordinates.fromCol <= line2Coordinates.toCol) ||
        (line1Coordinates.toCol >= line2Coordinates.fromCol &&
          line1Coordinates.toCol <= line2Coordinates.toCol)) &&
      line1Coordinates.row == line2Coordinates.row &&
      line1Coordinates.user.uuid == userUUId
    );
  }

  function lineAtRectCoordinates(
    lineNotation: LineNotationAttributes,
    rectCoordinates: RectAttributes,
    userUUId: string,
  ) {
    return (
      ((lineNotation.fromCol >= rectCoordinates.fromCol &&
        lineNotation.fromCol <= rectCoordinates.toCol) ||
        (lineNotation.toCol >= rectCoordinates.fromCol &&
          lineNotation.toCol <= rectCoordinates.toCol)) &&
      lineNotation.row >= rectCoordinates.fromRow &&
      lineNotation.row <= rectCoordinates.toRow &&
      lineNotation.user.uuid == userUUId
    );
  }

  // rect
  function rectAtCellCoordinates(
    rectNotation: RectNotationAttributes,
    PointAttributes: PointAttributes,
    userUUId: string,
  ) {
    return (
      rectNotation.fromCol <= PointAttributes.col &&
      rectNotation.toCol >= PointAttributes.col &&
      rectNotation.fromRow <= PointAttributes.row &&
      rectNotation.toRow >= PointAttributes.row &&
      rectNotation.user.uuid == userUUId
    );
  }

  function rectAtLineCoordinates(
    rectNotation: RectNotationAttributes,
    lineCoordinates: LineAttributes,
    userUUId: string,
  ) {
    return (
      ((rectNotation.fromCol >= lineCoordinates.fromCol &&
        rectNotation.fromCol <= lineCoordinates.toCol) ||
        (rectNotation.toCol >= lineCoordinates.fromCol &&
          rectNotation.toCol <= lineCoordinates.toCol)) &&
      rectNotation.fromRow <= lineCoordinates.row &&
      rectNotation.toRow >= lineCoordinates.row &&
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

  function findNotationsByCellCoordinates(cellCoordinates: PointAttributes) {
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
          : NotationTypeShape.get(n.notationType) === "LINE"
          ? lineAtCellCoordinates(
              n as LineNotationAttributes,
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

  // return a list of notations wich overlap given rect coordinates
  function findNotationsByRectCoordinates(
    notations: NotationAttributes[],
    rectCoordinates: RectAttributes,
  ) {
    return notations.filter((n: NotationAttributes) =>
      n.notationType == "SYMBOL" ||
      n.notationType == "EXPONENT" ||
      n.notationType == "SIGN"
        ? pointAtRectCoordinates(
            n as PointNotationAttributes,
            rectCoordinates,
            getUserUUId(),
          )
        : n.notationType == "FRACTION" || n.notationType == "SQRT"
        ? lineAtRectCoordinates(
            n as LineNotationAttributes,
            rectCoordinates,
            getUserUUId(),
          )
        : n.notationType == "TEXT"
        ? rectAtRectCoordinates(
            n as RectNotationAttributes,
            rectCoordinates,
            getUserUUId(),
          )
        : false,
    );
  }

  // return a list of notations wich overlap given line coordinates
  function findNotationsByLineCoordinates(
    notationsMap: Map<String, NotationAttributes>,
    lineCoordinates: LineNotationAttributes,
  ) {
    return (
      Object.values(notationsMap)
        //.map((n: NotationAttributes[]) => n[1])
        .filter((n: NotationAttributes) =>
          n.notationType == "SYMBOL" ||
          n.notationType == "EXPONENT" ||
          n.notationType == "SIGN"
            ? pointAtLineCoordinates(
                n as PointNotationAttributes,
                lineCoordinates,
                getUserUUId(),
              )
            : n.notationType == "FRACTION" || n.notationType == "SQRT"
            ? lineAtLineCoordinates(
                n as LineNotationAttributes,
                lineCoordinates,
                getUserUUId(),
              )
            : n.notationType == "TEXT"
            ? rectAtLineCoordinates(
                n as RectNotationAttributes,
                lineCoordinates,
                getUserUUId(),
              )
            : false,
        )
    );
  }

  function findOverlapNotationsOfSameType(
    notation: NotationCreationAttributes,
  ): NotationAttributes | undefined {
    return notationStore
      .getNotations()
      .filter(
        (n1: NotationAttributes) => n1.notationType === notation.notationType,
      )
      .find((n2: NotationAttributes) => {
        switch (NotationTypeShape.get(notation.notationType)) {
          case "POINT":
            return pointAtCellCoordinates(
              notation as PointNotationAttributes,
              n2 as PointNotationAttributes,
              getUserUUId(),
            );
          case "LINE":
            return lineAtLineCoordinates(
              notation as LineNotationAttributes,
              n2 as LineNotationAttributes,
              getUserUUId(),
            );
          case "RECT":
            return rectAtRectCoordinates(
              notation as RectNotationAttributes,
              n2 as RectNotationAttributes,
              getUserUUId(),
            );
        }
      });
  }

  function findOverlapNotationsOfAnyType(
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
            lineAtCellCoordinates(
              notation as LineNotationAttributes,
              n2 as PointNotationAttributes,
              getUserUUId(),
            ) ??
            rectAtCellCoordinates(
              notation as RectNotationAttributes,
              n2 as PointNotationAttributes,
              getUserUUId(),
            )
          );
        case "LINE":
          return (
            // lineAtCellCoordinates(
            //   notation as LineNotationAttributes,
            //   n2 as PointNotationAttributes,
            //   getUserUUId(),
            // ) ??
            lineAtLineCoordinates(
              notation as LineNotationAttributes,
              n2 as LineNotationAttributes,
              getUserUUId(),
            ) ??
            lineAtRectCoordinates(
              notation as LineNotationAttributes,
              n2 as RectNotationAttributes,
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
            lineAtRectCoordinates(
              notation as LineNotationAttributes,
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

  async function selectNotationByCoordinates(PointAttributes: PointAttributes) {
    findNotationsByCellCoordinates(PointAttributes).forEach(
      (n: NotationAttributes) => {
        notationStore.selectNotation(n.uuid);
      },
    );
  }

  async function selectNotation(uuid: string) {
    notationStore.selectNotation(uuid);
  }

  function canMoveSelectedNotations(deltaX: number, deltaY: number): boolean {
    notationStore.getSelectedNotations().forEach((n) => {
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
        case "LINE": {
          if (
            (n as LineNotationAttributes).toCol + deltaX >
            matrixDimensions.colsNum
          )
            return false;
          if ((n as LineNotationAttributes).fromCol + deltaX < 1) return false;
          if (
            (n as LineNotationAttributes).row + deltaY >
            matrixDimensions.rowsNum
          )
            return false;
          if ((n as LineNotationAttributes).row + deltaY < 1) return false;
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
  function moveSelectedNotations(deltaX: number, deltaY: number, keepOriginal: boolean): boolean {
    if (!canMoveSelectedNotations(deltaX, deltaY)) return false;

    if (keepOriginal) {
      notationStore.cloneSelectedNotations();
    }

    notationStore.getSelectedNotations().forEach((n) => {
      switch (NotationTypeShape.get(n.notationType)) {
        case "POINT": {
          (n as PointNotationAttributes).col += deltaX;
          (n as PointNotationAttributes).row += deltaY;
          break;
        }
        case "LINE": {
          (n as LineNotationAttributes).fromCol += deltaX;
          (n as LineNotationAttributes).toCol += deltaX;
          (n as LineNotationAttributes).row += deltaY;
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

    notationStore.getSelectedNotations().forEach(async (n) => {
      userOutgoingOperations.syncOutgoingUpdateNotation(n);
    });

    //notationStore.resetSelectedNotations();
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

  async function updateLineNotation(lineNotation: LineNotationAttributes) {
    // disallow update for student in question area
    if (isLineNotationInQuestionArea(lineNotation)) {
      return;
    }

    await dbHelper.updateLineAttributes(lineNotation);
    notationStore.addNotation(lineNotation);
  }

  async function upsertNotation<T extends NotationCreationAttributes>(
    notation: T,
  ) {
    editModeStore.resetEditMode();
    notationStore.resetSelectedNotations();

    let overlappedSameTypeNotation = findOverlapNotationsOfSameType(notation);

    // update
    if (overlappedSameTypeNotation) {
      // dont update a question notation from within answer and vice versa
      if (overlappedSameTypeNotation.boardType !== notation.boardType) {
        return;
      }

      setNotationAttributes(overlappedSameTypeNotation, notation);

      await dbHelper.updateNotationValue(overlappedSameTypeNotation);

      notationStore.addNotation(overlappedSameTypeNotation);

      userOutgoingOperations.syncOutgoingUpdateNotation(
        overlappedSameTypeNotation,
      );
    }

    let overlappedAnyTypeNotation: NotationAttributes | undefined =
      findOverlapNotationsOfAnyType(notation);

    // don't allow override of other type notation
    if (overlappedAnyTypeNotation) {
      return;
    }

    // no overlapping -> insert
    let newNotation = await dbHelper.addNotation(notation);
    newNotation.notationType = notation.notationType;
    notationStore.addNotation(newNotation);

    // sync to other participants
    if (notationStore.getParent().type === "LESSON") {
      userOutgoingOperations.syncOutgoingAddNotation(newNotation);
    }
  }

  async function syncIncomingAddedNotation(notation: NotationAttributes) {
    notationStore.addNotation(notation);
  }

  async function syncIncomingRemovedNotation(notation: NotationAttributes) {
    notationStore.deleteNotation(notation.uuid);
  }

  async function syncIncomingUpdatedtNotation(notation: NotationAttributes) {
    notationStore.addNotation(notation);
  }

  async function clearNotations() {
    notationStore.clearNotations();
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
      case "LINE": {
        (existingNotation as LineNotationAttributes).fromCol = (
          notation as LineNotationAttributes
        ).fromCol;

        (existingNotation as LineNotationAttributes).toCol = (
          notation as LineNotationAttributes
        ).toCol;

        (existingNotation as LineNotationAttributes).row = (
          notation as LineNotationAttributes
        ).row;

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

  function isLineNotationInQuestionArea(
    lineNotation: LineNotationAttributes,
  ): boolean {
    for (let i: number = lineNotation.fromCol; i <= lineNotation.toCol; i++) {
      if (
        lineNotation.boardType === "ANSWER" &&
        !userStore.isTeacher() &&
        notationStore.getCellOccupationMatrix().at(lineNotation.row)?.at(i)
          ?.boardType == "QUESTION"
      )
        return true;
    }
    return false;
  }

  // return true for 1. student in question and 2. notation coordinates are within question area
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
            .getCellOccupationMatrix()
            .at(pointNotation.row + delatY)
            ?.at(pointNotation.col + delatX)?.boardType == "QUESTION"
        );
      }

      case "LINE": {
        let lineNotation = notation as LineNotationAttributes;
        for (
          let col: number = lineNotation.fromCol + delatX;
          col <= lineNotation.toCol + delatX;
          col++
        ) {
          if (
            notation?.boardType === "ANSWER" &&
            !userStore.isTeacher() &&
            notationStore
              .getCellOccupationMatrix()
              .at(lineNotation.row + delatY)
              ?.at(col)?.boardType == "QUESTION"
          )
            return true;
        }
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
              notationStore.getCellOccupationMatrix().at(row)?.at(col)
                ?.boardType == "QUESTION"
            )
              return true;
          }
        }
      }
    }
    return false;
  }

  function isCellInQuestionArea(
    PointAttributes: PointAttributes | null,
  ): boolean | null {
    return (
      notationStore.getParent().type == "ANSWER" &&
      !userStore.isTeacher() &&
      PointAttributes &&
      notationStore
        .getCellOccupationMatrix()
        .at(PointAttributes.row)
        ?.at(PointAttributes.col)?.boardType == "QUESTION"
    );
  }

  function addMarkNotation() {
    if (editModeStore.getEditMode() == "CHECKMARK") {
      upsertSymbolNotation("&#x2714");
      return;
    }

    if (editModeStore.getEditMode() == "SEMICHECKMARK") {
      upsertSymbolNotation("&#x237B");
      return;
    }

    if (editModeStore.getEditMode() == "XMARK") {
      upsertSymbolNotation("&#x2718");
      return;
    }
  }

  function deleteSelectedNotations() {
    if (!authorizationHelper.canEdit()) return;

    notationStore.getSelectedNotations().forEach(async (n) => {
      // from db
      await dbHelper.removeNotation(n);
    });

    notationStore.getSelectedNotations().forEach(async (n) => {
      //from store
      notationStore.deleteNotation(n.uuid);

      // publish
      userOutgoingOperations.syncOutgoingRemoveNotation(n.uuid, n.parentUUId);
    });
  }

  // async function removeSelectedCellNotations() {
  //   if (!notationStore.getSelectedCell()) return;

  //   let notationsToDelete = await removeSymbolsByCell(
  //     notationStore.getSelectedCell()!,
  //   );

  //   if (!notationsToDelete) return;

  //   notationsToDelete.forEach((notation: NotationAttributes) => {
  //     userOutgoingOperations.syncOutgoingRemoveNotation(
  //       notation.uuid,
  //       notation.parentUUId,
  //     );
  //   });
  // }

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

    upsertNotation(notation);

    notationStore.resetSelectedCell();
  }

  function upsertTriangleNotation(triangle: TriangleAttributes) {
    const rectCell = getRectCell();
    if (!rectCell) return;

    let fromCol = rectCell.col;
    let toCol = rectCell.col + matrixHelper.getGeoRectSize();
    let fromRow = rectCell.row;
    let toRow = rectCell.row + Math.floor(matrixHelper.getGeoRectSize());

    let notation: TriangleNotationCreationAttributes = {
      fromCol: fromCol,
      toCol: toCol,
      fromRow: fromRow,
      toRow: toRow,
      A: triangle.A,
      B: triangle.B,
      C: triangle.C,
      boardType: notationStore.getParent().type,
      parentUUId: notationStore.getParent().uuid,
      notationType: "TRIANGLE",
      user: userStore.getCurrentUser()!,
    };

    upsertNotation(notation);
  }

  function upsertTextNotation(value: string) {
    const rectCell = getRectCell();
    if (!rectCell) return;

    let fromCol = rectCell.col;
    let toCol =
      rectCell.col + Math.floor(matrixHelper.getFreeTextRectWidth(value));
    let fromRow = rectCell.row;
    let toRow =
      rectCell.row + Math.floor(matrixHelper.getFreeTextRectHeight(value));

    let notation: RectNotationCreationAttributes = {
      fromCol: fromCol,
      toCol: toCol,
      fromRow: fromRow,
      toRow: toRow,
      value: value,
      boardType: notationStore.getParent().type,
      parentUUId: notationStore.getParent().uuid,
      notationType: "TEXT",
      user: userStore.getCurrentUser()!,
    };

    upsertNotation(notation);
  }

  // function upsertExponentNotation(exponent: ExponentAttributes) {
  //   const exponentCell = getSelectedCell();
  //   if (!exponentCell) return;

  //   let notation: ExponentNotationCreationAttributes = {
  //     col: exponentCell.col,
  //     row: exponentCell.row,
  //     base: exponent.base,
  //     exponent: exponent.exponent,
  //     boardType: notationStore.getParent().type,
  //     parentUUId: notationStore.getParent().uuid,
  //     notationType: "EXPONENT",
  //     user: userStore.getCurrentUser()!,
  //   };

  //   upsertNotation(notation);
  // }

  function upsertSymbolNotation(value: string) {
    const symbolCell = getSelectedCell();
    if (!symbolCell) return;

    const notationType: NotationType =
      editModeStore.getEditMode() === "EXPONENT" ? "EXPONENT" : "SYMBOL";

    let notation: PointNotationCreationAttributes = {
      col: symbolCell.col,
      row: symbolCell.row,
      value: value,
      boardType: notationStore.getParent().type,
      parentUUId: notationStore.getParent().uuid,
      notationType: notationType,
      user: userStore.getCurrentUser()!,
    };

    upsertNotation(notation);

    matrixHelper.setNextCell(1, 0);
  }

  function getSelectedCell(): PointAttributes | null {
    if (notationStore.getSelectedNotations().length) {
      let point =
        notationStore.getSelectedNotations()[0] as PointNotationAttributes;
      return { col: point.col, row: point.row };
    }

    return notationStore.getSelectedCell();
  }

  function getRectCell(): PointAttributes | null {
    if (notationStore.getSelectedNotations().length) {
      const rect =
        notationStore.getSelectedNotations()[0] as RectNotationAttributes;
      return { col: rect.fromCol, row: rect.fromRow };
    }

    return notationStore.getSelectedCell();
  }

  function addLineNotation(
    coordinates: LineAttributes,
    notationType: NotationType,
  ) {
    let notation: LineNotationCreationAttributes = {
      fromCol: coordinates.fromCol,
      toCol: coordinates.toCol,
      row: coordinates.row,
      boardType: notationStore.getParent().type,
      parentUUId: notationStore.getParent().uuid,
      notationType: notationType,
      user: userStore.getCurrentUser()!,
    };

    upsertNotation(notation);
  }

  function cloneNotation(notation: Readonly<NotationAttributes>) {
    let clonedNotation = { ...notation } as any;
    clonedNotation.id = undefined;
    delete clonedNotation.uuid;
    clonedNotation.parentUUId = notationStore.getParent().uuid; // in case you paste from lesson to question
    console.log("adding notation:" + { ...clonedNotation });
    upsertNotation(clonedNotation);
  }

  function getUserUUId(): string {
    return userStore.getCurrentUser()!.uuid;
  }

  return {
    selectNotation,
    selectNotationByCoordinates,
    isNotationInQuestionArea,
    isCellInQuestionArea,
    upsertSymbolNotation,
    addMarkNotation,
    addImageNotation,
    upsertTextNotation, // text can be modified
    upsertTriangleNotation,
    addLineNotation,
    deleteSelectedNotations,
    moveSelectedNotations,
    saveMovedNotations,
    updateLineNotation,
    cloneNotation,
  };
}
