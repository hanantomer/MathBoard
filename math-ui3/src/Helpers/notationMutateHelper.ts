//  questions of current lesson
import { EditMode } from "common/enum";
import useDbHelper from "../helpers/dbHelper";

import {
  PointNotationAttributes,
  LineNotationAttributes,
  RectNotationAttributes,
} from "common/baseTypes";

import { CellCoordinates } from "common/globals";

import {
  NotationShape,
  NotationTypeShape,
} from "common/enum";

import { BoardType, NotationType } from "common/enum";
import { useUserStore } from "../store/pinia/userStore";
import { useNotationStore } from "../store/pinia/notationStore";
import { onMounted } from "vue"

import useAuthHelper from "./authHelper";
import useUserOutgoingOperations from "./userOutgoingOperationsHelper";
import useMatrixHelper from "../helpers/matrixHelper";

import {
  BaseNotation,
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
    userUUId: string
  ) {
    return n1.col == n2.col && n1.row == n2.row && n1.user.uuid === userUUId;
  }

  function pointAtLineCoordinates(
    pointNotation: PointNotationAttributes,
    lineCoordinates: LineAttributes,
    userUUId: string
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
    userUUId: string
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
    userUUId: string
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
    userUUId: string
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
    userUUId: string
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
    userUUId: string
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
    userUUId: string
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
    userUUId: string
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
    let notationsMap = notationStore.getNotations();
    return Object.entries(notationsMap)
      .map((n: BaseNotation[]) => n[1])
      .filter((n: BaseNotation) =>
        n.notationType == NotationType.SYMBOL || // maybe replace type with reflection
        n.notationType == NotationType.POWER ||
        n.notationType == NotationType.SIGN
          ? pointAtCellCoordinates(
              n as PointNotationAttributes,
              cellCoordinates,
              userUUId
            )
          : n.notationType == NotationType.FRACTION ||
            n.notationType == NotationType.SQRT
          ? lineAtCellCoordinates(
              n as LineNotationAttributes,
              cellCoordinates,
              userUUId
            )
          : n.notationType == NotationType.TEXT
          ? rectAtCellCoordinates(
              n as RectNotationAttributes,
              cellCoordinates,
              userUUId
            )
          : false
      );
  }

  // return a list of notations wich overlap given rect coordinates
  function findNotationsByRectCoordinates(
    notationsMap: Map<String, BaseNotation>,
    rectCoordinates: RectAttributes
  ) {
    return Object.entries(notationsMap)
      .map((n: BaseNotation[]) => n[1])
      .filter((n: BaseNotation) =>
        n.notationType == NotationType.SYMBOL ||
        n.notationType == NotationType.POWER ||
        n.notationType == NotationType.SIGN
          ? pointAtRectCoordinates(
              n as PointNotationAttributes,
              rectCoordinates,
              userStore.getCurrentUser().uuid
            )
          : n.notationType == NotationType.FRACTION ||
            n.notationType == NotationType.SQRT
          ? lineAtRectCoordinates(
              n as LineNotationAttributes,
              rectCoordinates,
              userStore.getCurrentUser().uuid
            )
          : n.notationType == NotationType.TEXT
          ? rectAtRectCoordinates(
              n as RectNotationAttributes,
              rectCoordinates,
              userStore.getCurrentUser().uuid
            )
          : false
      );
  }

  // return a list of notations wich overlap given line coordinates
  function findNotationsByLineCoordinates(
    notationsMap: Map<String, BaseNotation>,
    lineCoordinates: LineNotationAttributes
  ) {
    return Object.entries(notationsMap)
      .map((n: BaseNotation[]) => n[1])
      .filter((n: BaseNotation) =>
        n.notationType == NotationType.SYMBOL ||
        n.notationType == NotationType.POWER ||
        n.notationType == NotationType.SIGN
          ? pointAtLineCoordinates(
              n as PointNotationAttributes,
              lineCoordinates,
              userStore.getCurrentUser().uuid
            )
          : n.notationType == NotationType.FRACTION ||
            n.notationType == NotationType.SQRT
          ? lineAtLineCoordinates(
              n as LineNotationAttributes,
              lineCoordinates,
              userStore.getCurrentUser().uuid
            )
          : n.notationType == NotationType.TEXT
          ? rectAtLineCoordinates(
              n as RectNotationAttributes,
              lineCoordinates,
              userStore.getCurrentUser().uuid
            )
          : false
      );
  }

  function findOverlapNotationsOfSameType(
    notation: BaseNotation
  ): BaseNotation | undefined {
    let notationsMap = notationStore.getNotations();
    return Object.entries(notationsMap)
      .map((n: BaseNotation[]) => n[1])
      .filter((n1: BaseNotation) => n1.notationType === notation.notationType)
      .find((n2: BaseNotation) => {
        switch (notation.notationType) {
          case NotationType.SYMBOL:
          case NotationType.SIGN:
          case NotationType.POWER:
            return pointAtCellCoordinates(
              notation as PointNotationAttributes,
              n2 as PointNotationAttributes,
              userStore.getCurrentUser().uuid
            );
          case NotationType.FRACTION:
          case NotationType.SQRT:
            return lineAtLineCoordinates(
              notation as LineNotationAttributes,
              n2 as LineNotationAttributes,
              userStore.getCurrentUser().uuid
            );
          case NotationType.TEXT:
          case NotationType.IMAGE:
          case NotationType.GEO:
            return rectAtRectCoordinates(
              notation as RectNotationAttributes,
              n2 as RectNotationAttributes,
              userStore.getCurrentUser().uuid
            );
        }
      });
  }

  function findOverlapNotationsOfAnyType(
    notation: BaseNotation
  ): BaseNotation | undefined {
    let notationsMap = notationStore.getNotations();
    return Object.entries(notationsMap)
      .map((n: BaseNotation[]) => n[1])
      .find((n2: BaseNotation) => {
        switch (notation.notationType) {
          case NotationType.SYMBOL:
          case NotationType.POWER:
            return (
              pointAtCellCoordinates(
                notation as PointNotationAttributes,
                n2 as PointNotationAttributes,
                userStore.getCurrentUser().uuid
              ) ??
              lineAtCellCoordinates(
                notation as LineNotationAttributes,
                n2 as PointNotationAttributes,
                userStore.getCurrentUser().uuid
              ) ??
              rectAtCellCoordinates(
                notation as RectNotationAttributes,
                n2 as PointNotationAttributes,
                userStore.getCurrentUser().uuid
              )
            );
          case NotationType.FRACTION:
          case NotationType.SQRT:
            return (
              lineAtCellCoordinates(
                notation as LineNotationAttributes,
                n2 as PointNotationAttributes,
                userStore.getCurrentUser().uuid
              ) ??
              lineAtLineCoordinates(
                notation as LineNotationAttributes,
                n2 as LineNotationAttributes,
                userStore.getCurrentUser().uuid
              ) ??
              lineAtRectCoordinates(
                notation as LineNotationAttributes,
                n2 as RectNotationAttributes,
                userStore.getCurrentUser().uuid
              )
            );

          case NotationType.TEXT:
          case NotationType.IMAGE:
          case NotationType.GEO:
            return (
              pointAtRectCoordinates(
                notation as PointNotationAttributes,
                n2 as RectNotationAttributes,
                userStore.getCurrentUser().uuid
              ) ??
              lineAtRectCoordinates(
                notation as LineNotationAttributes,
                n2 as RectNotationAttributes,
                userStore.getCurrentUser().uuid
              ) ??
              rectAtRectCoordinates(
                notation as RectNotationAttributes,
                n2 as RectNotationAttributes,
                userStore.getCurrentUser().uuid
              )
            );
        }
      });
  }

  async function removeSymbolsByCell(
    coordinates: CellCoordinates
  ): Promise<BaseNotation[]> {
    let symbolsAtCell = findNotationsByCellCoordinates(coordinates).filter(
      (n: BaseNotation) =>
        n.notationType === NotationType.SYMBOL ||
        n.notationType === NotationType.SIGN
    );

    if (!symbolsAtCell) return [];

    symbolsAtCell.forEach(async (n: BaseNotation) => {
      await dbHelper
        .removeNotation(n)
        .then(() => notationStore.getNotations().delete(n.uuid));
    });

    return symbolsAtCell;
  }


  ///TODO - check if needs to return notation
  async function removeActiveNotation(): Promise<BaseNotation | null> {

    if (!authHelper.canEdit()) {
      return null;
    }

    if (notationStore.getActiveNotation() == null) return null;

    await dbHelper.removeNotation(notationStore.getActiveNotation() as BaseNotation);

    notationStore.getNotations().delete(notationStore.getActiveNotation()!.uuid);

    let deletedNotationUUId = notationStore.getActiveNotation()?.uuid;

    notationStore.setActiveNotation(null);

    if (!deletedNotationUUId) return null;

    let deletedNotation = notationStore.getNotations().get(deletedNotationUUId!);

    if(deletedNotation)
        userOutgoingOperations.syncOutgoingRemoveNotation(deletedNotation);

    return deletedNotation ? deletedNotation : null;
  }

  async function removeSelectedNotations() {
    if (!authHelper.canEdit)
      return;

    notationStore.getSelectedNotations().forEach(async (uuid: string) => {
      let n = notationStore.getNotations().get(uuid);
      if (!n) return;
      await dbHelper.removeNotation(n);
      notationStore.getNotations().delete(uuid);
      userOutgoingOperations.syncOutgoingRemoveNotation(n);
    });
    this.resetSelectedNotations();
  }

  async function selectNotation(CellCoordinates: CellCoordinates) {
    notationStore.resetSelectedNotations();

    findNotationsByCellCoordinates(CellCoordinates).forEach((n: BaseNotation) => {
      notationStore.getSelectedNotations().push(n.uuid);
    });
  }

  // move without persistence - called during  mouse move  - don't bother the database during move
  async function moveSelectedNotations(deltaX: number, deltaY: number) {
    notationStore.getSelectedNotations().forEach((uuid: string) => {
      let n = notationStore.getNotations().get(uuid);
      if (!n?.notationType) return;
      switch (NotationTypeShape.get(n.notationType)) {
        case NotationShape.POINT: {
          (n as PointNotationAttributes).col += deltaX;
          (n as PointNotationAttributes).row += deltaY;
          break;
        }
        case NotationShape.LINE: {
          (n as LineNotationAttributes).fromCol += deltaX;
          (n as LineNotationAttributes).toCol += deltaX;
          (n as LineNotationAttributes).row += deltaY;
          break;
        }
        case NotationShape.RECT: {
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
    notationStore.getSelectedNotations().forEach((uuid: string) => {
      let n = notationStore.getNotations().get(uuid);
      if (!n) return;
      if (isNotationInQuestionArea(n)) {
        return;
      }
    });

    notationStore.getSelectedNotations().forEach(async (uuid: string) => {
      let n = notationStore.getNotations().get(uuid);

      if (!n) return;

      if (isNotationInQuestionArea(n)) return;

      await dbHelper.updateNotation(n);

      userOutgoingOperations.syncOutgoingUpdateSelectedNotation(n);
    });

    notationStore.resetSelectedNotations();
  }

  async function updateNotation(notation: BaseNotation) {
    // disallow update for student in question area
    if (isNotationInQuestionArea(notation)) {
      return;
    }

    await dbHelper.updateNotation(notation);
    notationStore.getNotations().set(notation.uuid, notation);
  }

  async function addNotation<T extends BaseNotation>(
    notation: T
  ): Promise<BaseNotation | null> {

    //notation.user.uuid = userStore.getCurrentUser().uuid;

    let overlappedSameTypeNotation = findOverlapNotationsOfSameType(notation);

    if (overlappedSameTypeNotation) {
      setNotationAttributes(overlappedSameTypeNotation, notation);

      await dbHelper.updateNotation(overlappedSameTypeNotation);
      notationStore.getNotations().set(
        overlappedSameTypeNotation.uuid,
        overlappedSameTypeNotation
      );
      return overlappedSameTypeNotation;
    }

    let overlappedAnyTypeNotation: BaseNotation | undefined =
      findOverlapNotationsOfAnyType(notation);

    // don't allow override of other type notation
    if (overlappedAnyTypeNotation) {
      return null;
    }

    // no overlapping -> add
    let newNotation = await dbHelper.addNotation(notation);
    notationStore.getNotations().set(newNotation.uuid, newNotation);
    return newNotation;
  }

  async function syncIncomingAddedNotation(notation: BaseNotation) {
    notationStore.getNotations().set(notation.uuid, notation);
  }

  async function syncIncomingRemovedNotation(notation: BaseNotation) {
    notationStore.getNotations().delete(notation.uuid);
  }

  async function syncIncomingUpdatedtNotation(notation: BaseNotation) {
    notationStore.getNotations().set(notation.uuid, notation);
  }

  async function removeAllNotations() {
    notationStore.getNotations().clear();
  }

  function setNotationAttributes(
    existingNotation: BaseNotation,
    notation: BaseNotation
  ) {


    switch (NotationTypeShape.get(existingNotation.notationType)) {
      case NotationShape.POINT: {
        (existingNotation as PointNotationAttributes).col = (
          notation as PointNotationAttributes
        ).col;
        (existingNotation as PointNotationAttributes).row = (
          notation as PointNotationAttributes
        ).row;
        if (existingNotation.notationType == NotationType.SYMBOL) {
         ///TODO: update symbol or power values (create corresponding types in advance)
        }
        break;
      }
      case NotationShape.LINE: {
        (existingNotation as LineNotationAttributes).fromCol = (
          notation as LineNotationAttributes
        ).fromCol;
        (existingNotation as LineNotationAttributes).toCol = (
          notation as LineNotationAttributes
        ).toCol;
        (existingNotation as LineNotationAttributes).row = (notation as LineNotationAttributes).row;
        break;
      }
      case NotationShape.RECT: {
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
  function isNotationInQuestionArea(notation: BaseNotation | null): boolean {
    if (!notation) return false;
    switch (NotationTypeShape.get(notation.notationType)) {
      case NotationShape.POINT: {
        let pointNotation = notation as PointNotationAttributes;
        return (
          notation?.boardType === BoardType.ANSWER &&
          !userStore.isTeacher() &&
          notationStore.getCellOccupationMatrix()
            .at(pointNotation.row)
            ?.at(pointNotation.col)?.boardType == BoardType.QUESTION
        );
      }
      case NotationShape.LINE: {
        let lineNotation = notation as LineNotationAttributes;
        for (
          let i: number = lineNotation.fromCol;
          i <= lineNotation.toCol;
          i++
        ) {
          if (
            notation?.boardType === BoardType.ANSWER &&
            !userStore.isTeacher() &&
            notationStore.getCellOccupationMatrix().at(lineNotation.row)?.at(i)
              ?.boardType == BoardType.QUESTION
          )
            return true;
        }
      }
      case NotationShape.RECT: {
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
              notation?.boardType === BoardType.ANSWER &&
              !userStore.isTeacher() &&
              notationStore.getCellOccupationMatrix().at(j)?.at(i)?.boardType ==
                BoardType.QUESTION
            )
              return true;
          }
        }
      }
    }
    return false;
  }

  async function setActiveNotation(activeNotation: BaseNotation | null) {
    // disallow activation of question rows for student
    if (isNotationInQuestionArea(activeNotation)) return;
    notationStore.setActiveNotation(activeNotation);
  }

  async function setActiveCell(newActiveCell: CellCoordinates | null) {
    if (notationStore.getActiveCell() != newActiveCell) {
      return;
    }

    if (// disallow activation of question cells for student
      isCellInQuestionArea(newActiveCell)) {
      return;
    }

    notationStore.setActiveCell(newActiveCell);
  }

  async function removeNotationsByRect(rectNotaion: RectNotationAttributes) {
    let notationsAtRectCoordinates = findNotationsByRectCoordinates(
      notationStore.getNotations(),
      rectNotaion
    );

    if (!notationsAtRectCoordinates) return;

    notationsAtRectCoordinates.forEach(async (n: BaseNotation) => {
      n.boardType = notationStore.getParent().type;
      await dbHelper
        .removeNotation(n)
        .then(() => notationStore.getNotations().delete(n.uuid));
    });
  }

  function isCellInQuestionArea(
    CellCoordinates: CellCoordinates | null
  ): boolean | null{
    return (
      notationStore.getParent().type == BoardType.ANSWER &&
      !userStore.isTeacher() &&
      CellCoordinates &&
      notationStore.getCellOccupationMatrix()
        .at(CellCoordinates.row)
        ?.at(CellCoordinates.col)?.boardType == BoardType.QUESTION
    );
  }


  function addMarkNotation() {
    if (notationStore.getEditMode().value == EditMode.CHECKMARK) {
      addSymbolNotation("&#x2714");
      return;
    }

    if (notationStore.getEditMode().value == EditMode.SEMICHECKMARK) {
      addSymbolNotation("&#x237B");
      return;
    }

    if (notationStore.getEditMode().value == EditMode.XMARK) {
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
      null
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
    if (!notationStore.getActiveCell()) return;

    let notationsToDelete = await removeSymbolsByCell(notationStore.getActiveCell()!);

    if (!notationsToDelete) return;

    notationsToDelete.forEach((notation: BaseNotation) => {
      userOutgoingOperations.syncOutgoingRemoveNotation(notation);
    });
  }

  function addImageNotation(
    fromCol: number,
    toCol: number,
    fromRow: number,
    toRow: number,
    base64Value: string
  ) {

    let notation: RectNotationAttributes = {
      fromCol: fromCol,
      toCol: toCol,
      fromRow: fromRow,
      toRow: toRow,
      value: base64Value,
      boardType: notationStore.getParent().type,
      notationType: NotationType.IMAGE,
      user: userStore.getCurrentUser(),
      createdAt: new Date(),
      id: -1,
      uuid: "",
    };

    addNotation(notation);
      // .then(() => {
      //   if (notationStore.getParent().type === BoardType.LESSON) {
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
   value: string)
 {

   let notation: RectNotationAttributes = {
     fromCol: fromCol,
     toCol: toCol,
     fromRow: fromRow,
     toRow: toRow,
     value: value,
     boardType: notationStore.getParent().type,
     notationType: NotationType.TEXT,
     user: userStore.getCurrentUser(),
     createdAt: new Date(),
     id: -1,
     uuid: "",
   };

   addNotation(notation)

   // notationStore.resetActiveCell();
  };


  function addSymbolNotation(value: string) {
    if (!notationStore.getActiveCell()) return;

    let notation: PointNotationAttributes = {
      col: notationStore.getActiveCell()!.col,
      row: notationStore.getActiveCell()!.row,
      value: value,
      boardType: notationStore.getParent().type,
      notationType: NotationType.SYMBOL,
      user: userStore.getCurrentUser(),
      createdAt: new Date(),
      id: -1,
      uuid: "",
    };

    addNotation(notation);
    // if (notationStore.getParent().type === BoardType.LESSON) {
    //   userOutgoingOperations.syncOutgoingSaveNotation(notation);
    // }

    if (notationStore.getEditMode().value == EditMode.SYMBOL) {
      matrixHelper.setNextRect(1, 0);
    }
  }

  function addSqrtNotation(coordinates: LineAttributes) {

    let notation: LineNotationAttributes = {
      fromCol: coordinates.fromCol,
      toCol: coordinates.fromCol,
      row: coordinates.row,
      boardType: notationStore.getParent().type,
      notationType: NotationType.SQRT,
      user: userStore.getCurrentUser(),
      createdAt: new Date(),
      id: -1,
      uuid: "",
    };

    addNotation(notation);
    //if (notationStore.getParent().type === BoardType.LESSON) {
    //   userOutgoingOperations.syncOutgoingSaveNotation(notation);
    // }
  }

  function addFractiontNotation(coordinates: LineAttributes)  {
    let notation: LineNotationAttributes = {
      fromCol: coordinates.fromCol,
      toCol: coordinates.fromCol,
      row: coordinates.row,
      boardType: notationStore.getParent().type,
      notationType: NotationType.FRACTION,
      user: userStore.getCurrentUser(),
      createdAt: new Date(),
      id: -1,
      uuid: "",
    };
    addNotation(notation);
      // if (notationStore.getParent().type === BoardType.LESSON) {
      //   userOutgoingOperations.syncOutgoingSaveNotation(notation);
      // }
  }



  function setCurrentEditMode(editMode: EditMode) {
    notationStore.setCurrentEditMode(editMode);
  }


  return {
    selectNotation,
    setActiveCell,
    setActiveNotation,
    addSymbolNotation,
    addMarkNotation,
    addImageNotation,
    addTextNotation,
    addFractiontNotation,
    addSqrtNotation,
    removeActiveOrSelectedNotations,
    moveSelectedNotations,
    updateSelectedNotationCoordinates,
    setCurrentEditMode
  };
}
