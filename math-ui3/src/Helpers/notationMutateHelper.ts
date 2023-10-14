//  questions of current lesson
import { EditMode } from "common/unions";
import useDbHelper from "../helpers/dbHelper";

import {
  PointNotationAttributes,
  LineNotationAttributes,
  RectNotationAttributes,
  PointNotationCreationAttributes,
  LineNotationCreationAttributes,
  RectNotationCreationAttributes,
  NotationCreationAttributes,
} from "common/baseTypes";

import { CellCoordinates } from "common/globals";

import { NotationTypeShape } from "common/unions";

import { useUserStore } from "../store/pinia/userStore";
import { useNotationStore } from "../store/pinia/notationStore";
import { onMounted } from "vue";

import useAuthHelper from "./authHelper";
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
const authHelper = useAuthHelper();
const userOutgoingOperations = useUserOutgoingOperations();

export default function notationMutateHelper() {
  /// TODO deal with mutations which originate from user incoming synchronisation
  onMounted(() => {
    notationStore.$subscribe((mutation, state) => {
      console.log("a change happened");
      console.log(mutation, state);
    });
  });

  function pointAtCellCoordinates(
    n1: PointNotationAttributes,
    n2: CellCoordinates,
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
    cellCoordinates: CellCoordinates,
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
    CellCoordinates: CellCoordinates,
    userUUId: string,
  ) {
    return (
      rectNotation.fromCol <= CellCoordinates.col &&
      rectNotation.toCol >= CellCoordinates.col &&
      rectNotation.fromRow <= CellCoordinates.row &&
      rectNotation.toRow >= CellCoordinates.row &&
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

  function findNotationsByCellCoordinates(cellCoordinates: CellCoordinates) {
    let userUUId = userStore.getCurrentUser().uuid;
    let notationsMap = notationStore.getNotations().value;
    return Array.from(notationsMap.values()).filter((n: NotationAttributes) =>
      n.notationType == "SYMBOL" ||
      n.notationType == "POWER" ||
      n.notationType == "SIGN"
        ? pointAtCellCoordinates(
            n as PointNotationAttributes,
            cellCoordinates,
            userUUId,
          )
        : n.notationType == "FRACTION" || n.notationType == "SQRT"
        ? lineAtCellCoordinates(
            n as LineNotationAttributes,
            cellCoordinates,
            userUUId,
          )
        : n.notationType == "TEXT"
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
    notationsMap: Map<String, NotationAttributes>,
    rectCoordinates: RectAttributes,
  ) {
    return Object.entries(notationsMap)
      .map((n: NotationAttributes[]) => n[1])
      .filter((n: NotationAttributes) =>
        n.notationType == "SYMBOL" ||
        n.notationType == "POWER" ||
        n.notationType == "SIGN"
          ? pointAtRectCoordinates(
              n as PointNotationAttributes,
              rectCoordinates,
              userStore.getCurrentUser().uuid,
            )
          : n.notationType == "FRACTION" || n.notationType == "SQRT"
          ? lineAtRectCoordinates(
              n as LineNotationAttributes,
              rectCoordinates,
              userStore.getCurrentUser().uuid,
            )
          : n.notationType == "TEXT"
          ? rectAtRectCoordinates(
              n as RectNotationAttributes,
              rectCoordinates,
              userStore.getCurrentUser().uuid,
            )
          : false,
      );
  }

  // return a list of notations wich overlap given line coordinates
  function findNotationsByLineCoordinates(
    notationsMap: Map<String, NotationAttributes>,
    lineCoordinates: LineNotationAttributes,
  ) {
    return Object.entries(notationsMap)
      .map((n: NotationAttributes[]) => n[1])
      .filter((n: NotationAttributes) =>
        n.notationType == "SYMBOL" ||
        n.notationType == "POWER" ||
        n.notationType == "SIGN"
          ? pointAtLineCoordinates(
              n as PointNotationAttributes,
              lineCoordinates,
              userStore.getCurrentUser().uuid,
            )
          : n.notationType == "FRACTION" || n.notationType == "SQRT"
          ? lineAtLineCoordinates(
              n as LineNotationAttributes,
              lineCoordinates,
              userStore.getCurrentUser().uuid,
            )
          : n.notationType == "TEXT"
          ? rectAtLineCoordinates(
              n as RectNotationAttributes,
              lineCoordinates,
              userStore.getCurrentUser().uuid,
            )
          : false,
      );
  }

  function findOverlapNotationsOfSameType(
    notation: NotationCreationAttributes,
  ): NotationAttributes | undefined {
    let notationsMap = notationStore.getNotations();
    return Object.entries(notationsMap)
      .map((n: NotationAttributes[]) => n[1])
      .filter(
        (n1: NotationAttributes) => n1.notationType === notation.notationType,
      )
      .find((n2: NotationAttributes) => {
        switch (notation.notationType) {
          case "SYMBOL":
          case "SIGN":
          case "POWER":
            return pointAtCellCoordinates(
              notation as PointNotationAttributes,
              n2 as PointNotationAttributes,
              userStore.getCurrentUser().uuid,
            );
          case "FRACTION":
          case "SQRT":
            return lineAtLineCoordinates(
              notation as LineNotationAttributes,
              n2 as LineNotationAttributes,
              userStore.getCurrentUser().uuid,
            );
          case "TEXT":
          case "IMAGE":
          case "GEO":
            return rectAtRectCoordinates(
              notation as RectNotationAttributes,
              n2 as RectNotationAttributes,
              userStore.getCurrentUser().uuid,
            );
        }
      });
  }

  function findOverlapNotationsOfAnyType(
    notation: NotationCreationAttributes,
  ): NotationAttributes | undefined {
    let notationsMap = notationStore.getNotations();
    return Object.entries(notationsMap)
      .map((n: NotationAttributes[]) => n[1])
      .find((n2: NotationAttributes) => {
        switch (notation.notationType) {
          case "SYMBOL":
          case "POWER":
            return (
              pointAtCellCoordinates(
                notation as PointNotationAttributes,
                n2 as PointNotationAttributes,
                userStore.getCurrentUser().uuid,
              ) ??
              lineAtCellCoordinates(
                notation as LineNotationAttributes,
                n2 as PointNotationAttributes,
                userStore.getCurrentUser().uuid,
              ) ??
              rectAtCellCoordinates(
                notation as RectNotationAttributes,
                n2 as PointNotationAttributes,
                userStore.getCurrentUser().uuid,
              )
            );
          case "FRACTION":
          case "SQRT":
            return (
              lineAtCellCoordinates(
                notation as LineNotationAttributes,
                n2 as PointNotationAttributes,
                userStore.getCurrentUser().uuid,
              ) ??
              lineAtLineCoordinates(
                notation as LineNotationAttributes,
                n2 as LineNotationAttributes,
                userStore.getCurrentUser().uuid,
              ) ??
              lineAtRectCoordinates(
                notation as LineNotationAttributes,
                n2 as RectNotationAttributes,
                userStore.getCurrentUser().uuid,
              )
            );

          case "TEXT":
          case "IMAGE":
          case "GEO":
            return (
              pointAtRectCoordinates(
                notation as PointNotationAttributes,
                n2 as RectNotationAttributes,
                userStore.getCurrentUser().uuid,
              ) ??
              lineAtRectCoordinates(
                notation as LineNotationAttributes,
                n2 as RectNotationAttributes,
                userStore.getCurrentUser().uuid,
              ) ??
              rectAtRectCoordinates(
                notation as RectNotationAttributes,
                n2 as RectNotationAttributes,
                userStore.getCurrentUser().uuid,
              )
            );
        }
      });
  }

  async function removeSymbolsByCell(
    coordinates: CellCoordinates,
  ): Promise<NotationAttributes[]> {
    let symbolsAtCell = findNotationsByCellCoordinates(coordinates).filter(
      (n: NotationAttributes) =>
        n.notationType === "SYMBOL" || n.notationType === "SIGN",
    );

    if (!symbolsAtCell) return [];

    symbolsAtCell.forEach(async (n: NotationAttributes) => {
      await dbHelper
        .removeNotation(n)
        .then(() => notationStore.getNotations().value.delete(n.uuid));
    });

    return symbolsAtCell;
  }

  ///TODO - check if needs to return notation
  async function removeActiveNotation(): Promise<NotationAttributes | null> {
    if (!authHelper.canEdit()) {
      return null;
    }

    if (!notationStore.getActiveNotation()) return null;

    const activeNotation = notationStore.getActiveNotation().value!;

    // from db
    await dbHelper.removeNotation(activeNotation);

    let deletedNotationUUId = activeNotation.uuid;

    // from store
    notationStore.setActiveNotation(null);

    if (!deletedNotationUUId) return null;

    let deletedNotation = notationStore
      .getNotations()
      .value.get(deletedNotationUUId!);

    // publish
    if (deletedNotation)
      userOutgoingOperations.syncOutgoingRemoveNotation(deletedNotation.uuid);

    return deletedNotation ? deletedNotation : null;
  }

  async function removeSelectedNotations() {
    if (!authHelper.canEdit) return;

    notationStore.getSelectedNotations().forEach(async (n) => {
      if (!n) return;
      // from db
      await dbHelper.removeNotation(n);

      //from store
      notationStore.getNotations().value.delete(n.uuid);

      // publish
      userOutgoingOperations.syncOutgoingRemoveNotation(n.uuid);
    });

    this.resetSelectedNotations();
  }

  async function selectNotation(CellCoordinates: CellCoordinates) {
    findNotationsByCellCoordinates(CellCoordinates).forEach(
      (n: NotationAttributes) => {
        notationStore.selectNotation(n.uuid);
      },
    );
  }

  // move without persistence - called during  mouse move  - don't bother the database during move
  async function moveSelectedNotations(deltaX: number, deltaY: number) {
    notationStore.getSelectedNotations().forEach((n) => {
      if (!n?.notationType) return;
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
  }

  // move selected notations with persistence - called upon muose up
  async function updateSelectedNotationCoordinates() {
    // disallow update during answer if any notation overlaps question area
    notationStore.getSelectedNotations().forEach((n) => {
      if (!n) return;
      if (isNotationInQuestionArea(n)) {
        return;
      }
    });

    notationStore.getSelectedNotations().forEach(async (n) => {
      if (!n) return;

      if (isNotationInQuestionArea(n)) return;

      await dbHelper.updateNotationCoordinates(n);

      userOutgoingOperations.syncOutgoingUpdateSelectedNotation(n);
    });

    notationStore.resetSelectedNotations();
  }

  // async function updateNotation(notation: NotationAttributes) {
  //   // disallow update for student in question area
  //   if (isNotationInQuestionArea(notation)) {
  //     return;
  //   }

  //   await dbHelper.updateNotation(notation);
  //   notationStore.getNotations().value.set(notation.uuid, notation);
  // }

  async function addNotation<T extends NotationCreationAttributes>(
    notation: T,
  ): Promise<NotationAttributes | null> {
    let overlappedSameTypeNotation = findOverlapNotationsOfSameType(notation);

    if (overlappedSameTypeNotation) {
      setNotationAttributes(overlappedSameTypeNotation, notation);

      await dbHelper.updateNotationValue(overlappedSameTypeNotation);
      notationStore
        .getNotations()
        .value.set(overlappedSameTypeNotation.uuid, overlappedSameTypeNotation);
      return overlappedSameTypeNotation;
    }

    let overlappedAnyTypeNotation: NotationAttributes | undefined =
      findOverlapNotationsOfAnyType(notation);

    // don't allow override of other type notation
    if (overlappedAnyTypeNotation) {
      return null;
    }

    // no overlapping -> add
    let newNotation = await dbHelper.addNotation(notation);
    notationStore.addNotation({
      ...newNotation,
      notationType: notation.notationType,
    });
    return newNotation;
  }

  async function syncIncomingAddedNotation(notation: NotationAttributes) {
    notationStore.getNotations().value.set(notation.uuid, notation);
  }

  async function syncIncomingRemovedNotation(notation: NotationAttributes) {
    notationStore.getNotations().value.delete(notation.uuid);
  }

  async function syncIncomingUpdatedtNotation(notation: NotationAttributes) {
    notationStore.getNotations().value.set(notation.uuid, notation);
  }

  async function removeAllNotations() {
    notationStore.getNotations().value.clear();
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
        if (existingNotation.notationType == "SYMBOL") {
          ///TODO: update symbol or power values (create corresponding types in advance)
        }
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
        break;
      }
    }
  }
  /// TODO move board type check outside
  // return true for student in question and point coordinates are within question area
  function isNotationInQuestionArea(
    notation: NotationAttributes | null,
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
            .at(pointNotation.row)
            ?.at(pointNotation.col)?.boardType == "QUESTION"
        );
      }
      case "LINE": {
        let lineNotation = notation as LineNotationAttributes;
        for (
          let i: number = lineNotation.fromCol;
          i <= lineNotation.toCol;
          i++
        ) {
          if (
            notation?.boardType === "ANSWER" &&
            !userStore.isTeacher() &&
            notationStore.getCellOccupationMatrix().at(lineNotation.row)?.at(i)
              ?.boardType == "QUESTION"
          )
            return true;
        }
      }
      case "RECT": {
        let rectNotation = notation as RectNotationAttributes;
        for (
          let i: number = rectNotation.fromCol;
          i <= rectNotation.toCol;
          i++
        ) {
          for (
            let j: number = rectNotation.fromRow;
            i <= rectNotation.toRow;
            j++
          ) {
            if (
              notation?.boardType === "ANSWER" &&
              !userStore.isTeacher() &&
              notationStore.getCellOccupationMatrix().at(j)?.at(i)?.boardType ==
                "QUESTION"
            )
              return true;
          }
        }
      }
    }
    return false;
  }

  async function removeNotationsByRect(rectNotaion: RectNotationAttributes) {
    let notationsAtRectCoordinates = findNotationsByRectCoordinates(
      notationStore.getNotations().value,
      rectNotaion,
    );

    if (!notationsAtRectCoordinates) return;

    notationsAtRectCoordinates.forEach(async (n: NotationAttributes) => {
      n.boardType = notationStore.getParent().value.type;
      await dbHelper
        .removeNotation(n)
        .then(() => notationStore.getNotations().value.delete(n.uuid));
    });
  }

  function isCellInQuestionArea(
    CellCoordinates: CellCoordinates | null,
  ): boolean | null {
    return (
      notationStore.getParent().value.type == "ANSWER" &&
      !userStore.isTeacher() &&
      CellCoordinates &&
      notationStore
        .getCellOccupationMatrix()
        .at(CellCoordinates.row)
        ?.at(CellCoordinates.col)?.boardType == "QUESTION"
    );
  }

  function addMarkNotation() {
    if (notationStore.getEditMode().value == "CHECKMARK") {
      addSymbolNotation("&#x2714");
      return;
    }

    if (notationStore.getEditMode().value == "SEMICHECKMARK") {
      addSymbolNotation("&#x237B");
      return;
    }

    if (notationStore.getEditMode().value == "XMARK") {
      addSymbolNotation("&#x2718");
      return;
    }
  }

  function removeNotationsAtMousePosition(e: MouseEvent) {
    let rectAtMousePosition: any = matrixHelper.findClickedObject(
      {
        x: e.clientX,
        y: e.clientY,
      },
      "rect",
      null,
    );

    if (!rectAtMousePosition) return;

    removeSymbolsByCell({
      row: rectAtMousePosition.parentNode?.attributes?.row.value,
      col: rectAtMousePosition.attributes.col.value,
    });
  }

  function removeActiveOrSelectedNotations() {
    if (notationStore.getActiveCell()) {
      removeActiveCellNotations();
    }
    if (notationStore.getActiveNotation()) {
      removeActiveNotation();
    }
    if (notationStore.getActiveNotation()) {
      removeSelectedNotations();
    }
  }

  async function removeActiveCellNotations() {
    if (!notationStore.getActiveCell().value) return;

    let notationsToDelete = await removeSymbolsByCell(
      notationStore.getActiveCell().value!,
    );

    if (!notationsToDelete) return;

    notationsToDelete.forEach((notation: NotationAttributes) => {
      userOutgoingOperations.syncOutgoingRemoveNotation(notation.uuid);
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
      boardType: notationStore.getParent().value.type,
      parentUUId: notationStore.getParent().value.uuid,
      notationType: "IMAGE",
      user: userStore.getCurrentUser(),
    };

    addNotation(notation);
    // .then(() => {
    //   if (notationStore.getParent().type === "LESSON") {
    //     userOutgoingOperations.syncOutgoingSaveNotation(notation);
    //   }
    // })
    // .catch((e) => {
    //   console.error(e);
    // });

    notationStore.resetActiveCell();
  }

  function addTextNotation(
    fromCol: number,
    toCol: number,
    fromRow: number,
    toRow: number,
    value: string,
  ) {
    let notation: RectNotationCreationAttributes = {
      fromCol: fromCol,
      toCol: toCol,
      fromRow: fromRow,
      toRow: toRow,
      value: value,
      boardType: notationStore.getParent().value.type,
      parentUUId: notationStore.getParent().value.uuid,
      notationType: "TEXT",
      user: userStore.getCurrentUser(),
    };

    addNotation(notation);

    // notationStore.resetActiveCell();
  }

  function addSymbolNotation(value: string) {
    if (!notationStore.getActiveCell().value) return;

    let notation: PointNotationCreationAttributes = {
      col: notationStore.getActiveCell().value!.col,
      row: notationStore.getActiveCell().value!.row,
      value: value,
      boardType: notationStore.getParent().value.type,
      parentUUId: notationStore.getParent().value.uuid,
      notationType: "SYMBOL",
      user: userStore.getCurrentUser(),
    };

    addNotation(notation);
    // if (notationStore.getParent().type === "LESSON") {
    //   userOutgoingOperations.syncOutgoingSaveNotation(notation);
    // }

    if (notationStore.getEditMode().value == "SYMBOL") {
      matrixHelper.setNextRect(1, 0);
    }
  }

  function addSqrtNotation(coordinates: LineAttributes) {
    let notation: LineNotationCreationAttributes = {
      fromCol: coordinates.fromCol,
      toCol: coordinates.fromCol,
      row: coordinates.row,
      boardType: notationStore.getParent().value.type,
      parentUUId: notationStore.getParent().value.uuid,
      notationType: "SQRT",
      user: userStore.getCurrentUser(),
    };

    addNotation(notation);
    //if (notationStore.getParent().type === "LESSON") {
    //   userOutgoingOperations.syncOutgoingSaveNotation(notation);
    // }
  }

  function addFractiontNotation(coordinates: LineAttributes) {
    let notation: LineNotationCreationAttributes = {
      fromCol: coordinates.fromCol,
      toCol: coordinates.fromCol,
      row: coordinates.row,
      boardType: notationStore.getParent().value.type,
      parentUUId: notationStore.getParent().value.uuid,
      notationType: "FRACTION",
      user: userStore.getCurrentUser(),
    };

    addNotation(notation);
    // if (notationStore.getParent().type === "LESSON") {
    //   userOutgoingOperations.syncOutgoingSaveNotation(notation);
    // }
  }

  return {
    selectNotation,
    isNotationInQuestionArea,
    isCellInQuestionArea,
    removeNotationsByRect,
    addSymbolNotation,
    addMarkNotation,
    addImageNotation,
    addTextNotation,
    addFractiontNotation,
    addSqrtNotation,
    removeActiveOrSelectedNotations,
    moveSelectedNotations,
    updateSelectedNotationCoordinates,
  };
}
