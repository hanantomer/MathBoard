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

import { NotationType, NotationTypeShape } from "common/unions";

import { useUserStore } from "../store/pinia/userStore";
import { useNotationStore } from "../store/pinia/notationStore";
import { onMounted } from "vue";

import useAuthHelper from "./authHelper";
import useUserOutgoingOperations from "./userOutgoingOperationsHelper";
import useMatrixHelper from "../helpers/matrixHelper";
import useElementFinderHelper from "../helpers/elementFinderHelper";

import {
  NotationAttributes,
  LineAttributes,
  RectAttributes,
} from "common/baseTypes";

const matrixHelper = useMatrixHelper();
const elementFinderHelper = useElementFinderHelper();
const userStore = useUserStore();
const dbHelper = useDbHelper();
const notationStore = useNotationStore();
const authHelper = useAuthHelper();
const userOutgoingOperations = useUserOutgoingOperations();

export default function notationMutateHelper() {
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

    return notationStore
      .getNotations()
      .filter((n: NotationAttributes) =>
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
    notations: NotationAttributes[],
    rectCoordinates: RectAttributes,
  ) {
    return notations.filter((n: NotationAttributes) =>
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
    return notationStore
      .getNotations()
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
    return notationStore.getNotations().find((n2: NotationAttributes) => {
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
        .then(() => notationStore.removeNotation(n.uuid));
    });

    return symbolsAtCell;
  }

  async function removeSelectedNotations() {
    if (!authHelper.canEdit) return;

    notationStore.getSelectedNotations().forEach(async (n) => {
      if (!n) return;
      // from db
      await dbHelper.removeNotation(n);

      //from store
      notationStore.removeNotation(n.uuid);

      // publish
      userOutgoingOperations.syncOutgoingRemoveNotation(n.uuid, n.parentUUId);
    });
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

      await dbHelper.updateNotationCoordinates(n);

      userOutgoingOperations.syncOutgoingUpdateNotation(n);
    });

    notationStore.resetSelectedNotations();
  }

  async function updateLineNotation(lineNotation: LineNotationAttributes) {
    // disallow update for student in question area
    if (isLineNotationInQuestionArea(lineNotation)) {
      return;
    }

    await dbHelper.updateLineAttributes(lineNotation);
    notationStore.setNotation(lineNotation);
  }

  async function addNotation<T extends NotationCreationAttributes>(
    notation: T,
  ) {
    let overlappedSameTypeNotation = findOverlapNotationsOfSameType(notation);

    if (overlappedSameTypeNotation) {
      setNotationAttributes(overlappedSameTypeNotation, notation);

      await dbHelper.updateNotationValue(overlappedSameTypeNotation);

      notationStore.setNotation(overlappedSameTypeNotation);

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

    // no overlapping -> add
    // TODO divert and typify lesson, question, answer
    let newNotation = await dbHelper.addNotation(notation);
    notationStore.addNotation({
      ...newNotation,
      notationType: notation.notationType,
    });

    // sync to other participants
    if (notationStore.getParent().type === "LESSON") {
      userOutgoingOperations.syncOutgoingAddNotation(newNotation);
    }
  }

  async function syncIncomingAddedNotation(notation: NotationAttributes) {
    notationStore.setNotation(notation);
  }

  async function syncIncomingRemovedNotation(notation: NotationAttributes) {
    notationStore.removeNotation(notation.uuid);
  }

  async function syncIncomingUpdatedtNotation(notation: NotationAttributes) {
    notationStore.setNotation(notation);
  }

  async function removeAllNotations() {
    notationStore.removeAllNotations();
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

  // return true for 1. student in question and 2. point coordinates are within question area
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

      case "RECT": {
        let rectNotation = notation as RectNotationAttributes;
        for (
          let col: number = rectNotation.fromCol;
          col <= rectNotation.toCol;
          col++
        ) {
          for (
            let row: number = rectNotation.fromRow;
            row <= rectNotation.toRow;
            row++
          ) {
            if (
              notation?.boardType === "ANSWER" &&
              !userStore.isTeacher() &&
              notationStore.getCellOccupationMatrix().at(row)?.at(col)?.boardType ==
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
      notationStore.getNotations(),
      rectNotaion,
    );

    if (!notationsAtRectCoordinates) return;

    notationsAtRectCoordinates.forEach(async (n: NotationAttributes) => {
      n.boardType = notationStore.getParent().type;
      await dbHelper
        .removeNotation(n)
        .then(() => notationStore.removeNotation(n.uuid));
    });
  }

  function isCellInQuestionArea(
    CellCoordinates: CellCoordinates | null,
  ): boolean | null {
    return (
      notationStore.getParent().type == "ANSWER" &&
      !userStore.isTeacher() &&
      CellCoordinates &&
      notationStore
        .getCellOccupationMatrix()
        .at(CellCoordinates.row)
        ?.at(CellCoordinates.col)?.boardType == "QUESTION"
    );
  }

  function addMarkNotation() {
    if (notationStore.getEditMode() == "CHECKMARK") {
      addSymbolNotation("&#x2714");
      return;
    }

    if (notationStore.getEditMode() == "SEMICHECKMARK") {
      addSymbolNotation("&#x237B");
      return;
    }

    if (notationStore.getEditMode() == "XMARK") {
      addSymbolNotation("&#x2718");
      return;
    }
  }

  function removeNotationsAtMousePosition(e: MouseEvent) {
    let rectAtMousePosition: any = elementFinderHelper.findClickedObject(
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
      return;
    }
    //if (notationStore.getActiveNotation()) {
    //   removeActiveNotation();
    //   return;
    //}
    if (notationStore.getSelectedNotations()) {
      removeSelectedNotations();
      return;
    }
  }

  async function removeActiveCellNotations() {
    if (!notationStore.getActiveCell()) return;

    let notationsToDelete = await removeSymbolsByCell(
      notationStore.getActiveCell()!,
    );

    if (!notationsToDelete) return;

    notationsToDelete.forEach((notation: NotationAttributes) => {
      userOutgoingOperations.syncOutgoingRemoveNotation(
        notation.uuid,
        notation.parentUUId,
      );
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
      user: userStore.getCurrentUser(),
    };

    addNotation(notation);

    notationStore.resetActiveCell();
  }

  function addTextNotation(value: string) {
    let activeCell = notationStore.getActiveCell();
    if (!activeCell) return;

    let fromCol = activeCell.col;
    let toCol =
      activeCell.col + Math.floor(matrixHelper.getFreeTextRectWidth(value));
    let fromRow = activeCell.row;
    let toRow =
      activeCell.row + Math.floor(matrixHelper.getFreeTextRectHeight(value));

    let notation: RectNotationCreationAttributes = {
      fromCol: fromCol,
      toCol: toCol,
      fromRow: fromRow,
      toRow: toRow,
      value: value,
      boardType: notationStore.getParent().type,
      parentUUId: notationStore.getParent().uuid,
      notationType: "TEXT",
      user: userStore.getCurrentUser(),
    };

    addNotation(notation);

    // notationStore.resetActiveCell();
  }

  function addSymbolNotation(value: string) {
    if (!notationStore.getActiveCell()) return;

    let notation: PointNotationCreationAttributes = {
      col: notationStore.getActiveCell()!.col,
      row: notationStore.getActiveCell()!.row,
      value: value,
      boardType: notationStore.getParent().type,
      parentUUId: notationStore.getParent().uuid,
      notationType: "SYMBOL",
      user: userStore.getCurrentUser(),
    };

    addNotation(notation);

    if (notationStore.getEditMode() == "SYMBOL") {
      matrixHelper.setNextRect(1, 0);
    }
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
      user: userStore.getCurrentUser(),
    };

    addNotation(notation);
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
    addLineNotation,
    removeActiveOrSelectedNotations,
    moveSelectedNotations,
    updateSelectedNotationCoordinates,
    updateLineNotation,
  };
}
