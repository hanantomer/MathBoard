//  questions of current lesson
import { EditMode } from "../../../math-common/src/enum";
import useDbHelper from "../helpers/dbHelper";

import {
  Notation,
  PointNotation,
  LineNotation,
  RectNotation,
  SqrtNotation,
  FractionNotation,
} from "../helpers/responseTypes";

import {
  LineCoordinates,
  RectCoordinates,
  CellCoordinates,
} from "../../../math-common/src/globals";

import {
  NotationShape,
  NotationTypeShape,
} from "../../../math-common/src/enum";

import { BoardType, NotationType } from "../../../math-common/src/enum";
import { useUserStore } from "../store/pinia/userStore";
import { error } from "console";
import { useNotationStore } from "../store/pinia/notationStore";
import { onMounted } from "vue"

import AnswerImage from "../../../math-db/src/models/answer/rect/answerImage.model";
import LessonImage from "../../../math-db/src/models/lesson/rect/lessonImage.model";
import QuestionImage from "../../../math-db/src/models/question/rect/questionImage.model";

import AnswerText from "../../../math-db/src/models/answer/rect/answerText.model";
import LessonText from "../../../math-db/src/models/lesson/rect/lessonText.model";
import QuestionText from "../../../math-db/src/models/question/rect/questionText.model";


import AnswerSymbol from "../../../math-db/src/models/answer/point/answerSymbol.model";
import LessonSymbol from "../../../math-db/src/models/lesson/point/lessonSymbol.model";
import QuestionSymbol from "../../../math-db/src/models/question/point/questionSymbol.model";
import useAuthHelper from "./authHelper";
import useUserOutgoingOperations from "./userOutgoingOperationsHelper";
import useMatrixHelper from "../helpers/matrixHelper";

import LessonSqrt from "../../../math-db/src/models/lesson/line/lessonSqrt.model";
import AnswerSqrt from "../../../math-db/src/models/answer/line/answerSqrt.model";
import QuestionSqrt from "../../../math-db/src/models/question/line/questionSqrt.model";

import LessonFraction from "../../../math-db/src/models/lesson/line/lessonFraction.model";
import AnswerFraction from "../../../math-db/src/models/answer/line/answerFraction.model";
import QuestionFraction from "../../../math-db/src/models/question/line/questionFraction.model";


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
    n1: PointNotation,
    n2: CellCoordinates,
    userUUId: string
  ) {
    return n1.col == n2.col && n1.row == n2.row && n1.user.uuid === userUUId;
  }

  function pointAtLineCoordinates(
    pointNotation: PointNotation,
    lineCoordinates: LineCoordinates,
    userId: number
  ) {
    return (
      pointNotation.col >= lineCoordinates.fromCol &&
      pointNotation.col <= lineCoordinates.toCol &&
      pointNotation.row == lineCoordinates.row &&
      pointNotation.userId == userId
    );
  }

  function pointAtRectCoordinates(
    pointNotation: PointNotation,
    rectCoordinates: RectCoordinates,
    userId: number
  ) {
    return (
      pointNotation.col >= rectCoordinates.fromCol &&
      pointNotation.col <= rectCoordinates.toCol &&
      pointNotation.row >= rectCoordinates.fromRow &&
      pointNotation.row <= rectCoordinates.toRow &&
      pointNotation.userId == userId
    );
  }

  // line
  function lineAtCellCoordinates(
    lineCoordinates: LineNotation,
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
    line1Coordinates: LineNotation,
    line2Coordinates: LineNotation,
    userId: number
  ) {
    return (
      ((line1Coordinates.fromCol >= line2Coordinates.fromCol &&
        line1Coordinates.fromCol <= line2Coordinates.toCol) ||
        (line1Coordinates.toCol >= line2Coordinates.fromCol &&
          line1Coordinates.toCol <= line2Coordinates.toCol)) &&
      line1Coordinates.row == line2Coordinates.row &&
      line1Coordinates.userId == userId
    );
  }

  function lineAtRectCoordinates(
    lineNotation: LineNotation,
    rectCoordinates: RectCoordinates,
    userId: number
  ) {
    return (
      ((lineNotation.fromCol >= rectCoordinates.fromCol &&
        lineNotation.fromCol <= rectCoordinates.toCol) ||
        (lineNotation.toCol >= rectCoordinates.fromCol &&
          lineNotation.toCol <= rectCoordinates.toCol)) &&
      lineNotation.row >= rectCoordinates.fromRow &&
      lineNotation.row <= rectCoordinates.toRow &&
      lineNotation.userId == userId
    );
  }

  // rect
  function rectAtCellCoordinates(
    rectNotation: RectNotation,
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
    rectNotation: RectNotation,
    lineCoordinates: LineCoordinates,
    userId: number
  ) {
    return (
      ((rectNotation.fromCol >= lineCoordinates.fromCol &&
        rectNotation.fromCol <= lineCoordinates.toCol) ||
        (rectNotation.toCol >= lineCoordinates.fromCol &&
          rectNotation.toCol <= lineCoordinates.toCol)) &&
      rectNotation.fromRow <= lineCoordinates.row &&
      rectNotation.toRow >= lineCoordinates.row &&
      rectNotation.userId == userId
    );
  }

  function rectAtRectCoordinates(
    rectNotation: RectNotation,
    rectCoordinates: RectCoordinates,
    userId: number
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
      rectNotation.userId == userId
    );
  }

  function findNotationsByCellCoordinates(cellCoordinates: CellCoordinates) {
    let userUUId = userStore.currentUser.uuid;
    let notationsMap = notationStore.notations;
    return Object.entries(notationsMap)
      .map((n: Notation[]) => n[1])
      .filter((n: Notation) =>
        n.notationType == NotationType.SYMBOL || // maybe replace type with reflection
        n.notationType == NotationType.POWER ||
        n.notationType == NotationType.SIGN
          ? pointAtCellCoordinates(
              n as PointNotation,
              cellCoordinates,
              userUUId
            )
          : n.notationType == NotationType.FRACTION ||
            n.notationType == NotationType.SQRT
          ? lineAtCellCoordinates(n as LineNotation, cellCoordinates, userUUId)
          : n.notationType == NotationType.TEXT
          ? rectAtCellCoordinates(n as RectNotation, cellCoordinates, userUUId)
          : false
      );
  }

  // return a list of notations wich overlap given rect coordinates
  function findNotationsByRectCoordinates(
    notationsMap: Map<String, Notation>,
    rectCoordinates: RectCoordinates
  ) {
    return Object.entries(notationsMap)
      .map((n: Notation[]) => n[1])
      .filter((n: Notation) =>
        n.notationType == NotationType.SYMBOL ||
        n.notationType == NotationType.POWER ||
        n.notationType == NotationType.SIGN
          ? pointAtRectCoordinates(
              n as PointNotation,
              rectCoordinates,
              userStore.currentUser.id
            )
          : n.notationType == NotationType.FRACTION ||
            n.notationType == NotationType.SQRT
          ? lineAtRectCoordinates(
              n as LineNotation,
              rectCoordinates,
              userStore.currentUser.id
            )
          : n.notationType == NotationType.TEXT
          ? rectAtRectCoordinates(
              n as RectNotation,
              rectCoordinates,
              userStore.currentUser.id
            )
          : false
      );
  }

  // return a list of notations wich overlap given line coordinates
  function findNotationsByLineCoordinates(
    notationsMap: Map<String, Notation>,
    lineCoordinates: LineNotation
  ) {
    return Object.entries(notationsMap)
      .map((n: Notation[]) => n[1])
      .filter((n: Notation) =>
        n.notationType == NotationType.SYMBOL ||
        n.notationType == NotationType.POWER ||
        n.notationType == NotationType.SIGN
          ? pointAtLineCoordinates(
              n as PointNotation,
              lineCoordinates,
              userStore.currentUser.id
            )
          : n.notationType == NotationType.FRACTION ||
            n.notationType == NotationType.SQRT
          ? lineAtLineCoordinates(
              n as LineNotation,
              lineCoordinates,
              userStore.currentUser.id
            )
          : n.notationType == NotationType.TEXT
          ? rectAtLineCoordinates(
              n as RectNotation,
              lineCoordinates,
              userStore.currentUser.id
            )
          : false
      );
  }

  function findOverlapNotationsOfSameType(
    notation: Notation
  ): Notation | undefined {
    let notationsMap = notationStore.notations;
    return Object.entries(notationsMap)
      .map((n: Notation[]) => n[1])
      .filter((n1: Notation) => n1.notationType === notation.notationType)
      .find((n2: Notation) => {
        switch (notation.notationType) {
          case NotationType.SYMBOL:
          case NotationType.SIGN:
          case NotationType.POWER:
            return pointAtCellCoordinates(
              notation as PointNotation,
              n2 as PointNotation,
              userStore.currentUser.id
            );
          case NotationType.FRACTION:
          case NotationType.SQRT:
            return lineAtLineCoordinates(
              notation as LineNotation,
              n2 as LineNotation,
              userStore.currentUser.id
            );
          case NotationType.TEXT:
          case NotationType.IMAGE:
          case NotationType.GEO:
            return rectAtRectCoordinates(
              notation as RectNotation,
              n2 as RectCoordinates,
              userStore.currentUser.id
            );
        }
      });
  }

  function findOverlapNotationsOfAnyType(
    notation: Notation
  ): Notation | undefined {
    let notationsMap = notationStore.notations;
    return Object.entries(notationsMap)
      .map((n: Notation[]) => n[1])
      .find((n2: Notation) => {
        switch (notation.notationType) {
          case NotationType.SYMBOL:
          case NotationType.POWER:
            return (
              pointAtCellCoordinates(
                notation as PointNotation,
                n2 as PointNotation,
                userStore.currentUser.id
              ) ??
              lineAtCellCoordinates(
                notation as LineNotation,
                n2 as PointNotation,
                userStore.currentUser.id
              ) ??
              rectAtCellCoordinates(
                notation as RectNotation,
                n2 as PointNotation,
                userStore.currentUser.id
              )
            );
          case NotationType.FRACTION:
          case NotationType.SQRT:
            return (
              lineAtCellCoordinates(
                notation as LineNotation,
                n2 as PointNotation,
                userStore.currentUser.id
              ) ??
              lineAtLineCoordinates(
                notation as LineNotation,
                n2 as LineNotation,
                userStore.currentUser.id
              ) ??
              lineAtRectCoordinates(
                notation as LineNotation,
                n2 as RectCoordinates,
                userStore.currentUser.id
              )
            );

          case NotationType.TEXT:
          case NotationType.IMAGE:
          case NotationType.GEO:
            return (
              pointAtRectCoordinates(
                notation as PointNotation,
                n2 as RectCoordinates,
                userStore.currentUser.id
              ) ??
              lineAtRectCoordinates(
                notation as LineNotation,
                n2 as RectCoordinates,
                userStore.currentUser.id
              ) ??
              rectAtRectCoordinates(
                notation as RectNotation,
                n2 as RectCoordinates,
                userStore.currentUser.id
              )
            );
        }
      });
  }

  async function removeSymbolsByCell(
    coordinates: CellCoordinates
  ): Promise<Notation[]> {
    let symbolsAtCell = findNotationsByCellCoordinates(coordinates).filter(
      (n: Notation) =>
        n.notationType === NotationType.SYMBOL ||
        n.notationType === NotationType.SIGN
    );

    if (!symbolsAtCell) return [];

    symbolsAtCell.forEach(async (n: Notation) => {
      await dbHelper
        .removeNotation(n)
        .then(() => notationStore.notations.delete(n.uuid));
    });

    return symbolsAtCell;
  }


  ///TODO - check if needs to return notation
  async function removeActiveNotation(): Promise<Notation | null> {

    if (!authHelper.canEdit()) {
      return null;
    }

    if (notationStore.activeNotation == null) return null;

    await dbHelper.removeNotation(notationStore.activeNotation);

    notationStore.notations.delete(notationStore.activeNotation.uuid);

    let deletedNotationUUId = notationStore.activeNotation.uuid;

    notationStore.activeNotation = null;

    let deletedNotation = notationStore.notations.get(deletedNotationUUId);

    if(deletedNotation)
        userOutgoingOperations.syncOutgoingRemoveNotation(deletedNotation);

    return deletedNotation ? deletedNotation : null;
  }

  async function removeSelectedNotations() {
    if (!authHelper.canEdit)
      return;

    notationStore.selectedNotations.forEach(async (uuid) => {
      let n = notationStore.notations.get(uuid);
      if (!n) return;
      await dbHelper.removeNotation(n);
      notationStore.notations.delete(uuid);
      userOutgoingOperations.syncOutgoingRemoveNotation(n);
    });
    this.selectedNotations.length = 0;
  }

  async function selectNotation(CellCoordinates: CellCoordinates) {
    notationStore.selectedNotations.length = 0;

    findNotationsByCellCoordinates(CellCoordinates).forEach((n: Notation) => {
      notationStore.selectedNotations.push(n.uuid);
    });
  }

  // move without persistence - called during  mouse move  - don't bother the database during move
  async function moveSelectedNotations(deltaX: number, deltaY: number) {
    notationStore.selectedNotations.forEach((uuid) => {
      let n = notationStore.notations.get(uuid);
      if (!n) return;
      switch (NotationTypeShape.get(n.notationType)) {
        case NotationShape.POINT: {
          (n as PointNotation).col += deltaX;
          (n as PointNotation).row += deltaY;
          break;
        }
        case NotationShape.LINE: {
          (n as LineNotation).fromCol += deltaX;
          (n as LineNotation).toCol += deltaX;
          (n as LineNotation).row += deltaY;
          break;
        }
        case NotationShape.RECT: {
          (n as RectNotation).fromCol += deltaX;
          (n as RectNotation).toCol += deltaX;
          (n as RectNotation).fromRow += deltaY;
          (n as RectNotation).toRow += deltaY;
          break;
        }
      }
    });
  }

  // move selected notations with persistence - called upon muose up
  async function updateSelectedNotationCoordinates() {
    // disallow update during answer if any notation overlaps question area
    notationStore.selectedNotations.forEach((uuid) => {
      let n = notationStore.notations.get(uuid);
      if (!n) return;
      if (isNotationInQuestionArea(n)) {
        return;
      }
    });

    notationStore.selectedNotations.forEach(async (uuid) => {
      let n = notationStore.notations.get(uuid);

      if (!n) return;

      if (isNotationInQuestionArea(n)) return;

      await dbHelper.updateNotation(n);

      userOutgoingOperations.syncOutgoingUpdateSelectedNotation(n);
    });

    notationStore.selectedNotations.length = 0;
  }

  async function updateNotation(notation: Notation) {
    // disallow update for student in question area
    if (isNotationInQuestionArea(notation)) {
      return;
    }

    await dbHelper.updateNotation(notation);
    notationStore.notations.set(notation.uuid, notation);
  }

  async function addNotation<T extends Notation>(
    notation: T
  ): Promise<Notation | null> {
    notation.userId = userStore.currentUser.id;

    let overlappedSameTypeNotation = findOverlapNotationsOfSameType(notation);

    if (overlappedSameTypeNotation) {
      setNotationAttributes(overlappedSameTypeNotation, notation);

      await dbHelper.updateNotation(overlappedSameTypeNotation);
      notationStore.notations.set(
        overlappedSameTypeNotation.uuid,
        overlappedSameTypeNotation
      );
      return overlappedSameTypeNotation;
    }

    let overlappedAnyTypeNotation: Notation | undefined =
      findOverlapNotationsOfAnyType(notation);

    // don't allow override of other type notation
    if (overlappedAnyTypeNotation) {
      return null;
    }

    // no overlapping -> add
    let newNotation = await dbHelper.addNotation(notation);
    notationStore.notations.set(newNotation.uuid, newNotation);
    return newNotation;
  }

  async function syncIncomingAddedNotation(notation: Notation) {
    notationStore.notations.set(notation.uuid, notation);
  }

  async function syncIncomingRemovedNotation(notation: Notation) {
    notationStore.notations.delete(notation.uuid);
  }

  async function syncIncomingUpdatedtNotation(notation: Notation) {
    notationStore.notations.set(notation.uuid, notation);
  }

  async function removeAllNotations() {
    notationStore.notations.clear();
  }

  function setNotationAttributes(
    existingNotation: Notation,
    notation: Notation
  ) {
    if (existingNotation.notationType != notation.notationType)
      throw error(
        "setNotationAttributes arguments must be of the same notation type"
      );

    switch (NotationTypeShape.get(existingNotation.notationType)) {
      case NotationShape.POINT: {
        (existingNotation as PointNotation).col = (
          notation as PointNotation
        ).col;
        (existingNotation as PointNotation).row = (
          notation as PointNotation
        ).row;
        (existingNotation as PointNotation).value = (
          notation as PointNotation
        ).value;
        break;
      }
      case NotationShape.LINE: {
        (existingNotation as LineNotation).fromCol = (
          notation as LineNotation
        ).fromCol;
        (existingNotation as LineNotation).toCol = (
          notation as LineNotation
        ).toCol;
        (existingNotation as LineNotation).row = (notation as LineNotation).row;
        break;
      }
      case NotationShape.RECT: {
        (existingNotation as RectNotation).fromCol = (
          notation as RectNotation
        ).fromCol;
        (existingNotation as RectNotation).toCol = (
          notation as RectNotation
        ).toCol;
        (existingNotation as RectNotation).fromRow = (
          notation as RectNotation
        ).fromRow;
        (existingNotation as RectNotation).toRow = (
          notation as RectNotation
        ).toRow;
        break;
      }
    }
  }
  /// TODO move board type check outside
  // return true for student in question and point coordinates are within question area
  function isNotationInQuestionArea(notation: Notation | null): boolean {
    if (!notation) return false;
    switch (NotationTypeShape.get(notation.notationType)) {
      case NotationShape.POINT: {
        let pointNotation = notation as PointNotation;
        return (
          notation?.boardType === BoardType.ANSWER &&
          !userStore.isTeacher &&
          notationStore.cellOccupationMatrix
            .at(pointNotation.row)
            ?.at(pointNotation.col)?.boardType == BoardType.QUESTION
        );
      }
      case NotationShape.LINE: {
        let lineNotation = notation as LineNotation;
        for (
          let i: number = lineNotation.fromCol;
          i <= lineNotation.toCol;
          i++
        ) {
          if (
            notation?.boardType === BoardType.ANSWER &&
            !userStore.isTeacher &&
            notationStore.cellOccupationMatrix.at(lineNotation.row)?.at(i)
              ?.boardType == BoardType.QUESTION
          )
            return true;
        }
      }
      case NotationShape.RECT: {
        let rectNotation = notation as RectNotation;
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
              !userStore.isTeacher &&
              notationStore.cellOccupationMatrix.at(j)?.at(i)?.boardType ==
                BoardType.QUESTION
            )
              return true;
          }
        }
      }
    }
    return false;
  }

  async function setActiveNotation(activeNotation: Notation | null) {
    // disallow activation of question rows for student
    if (isNotationInQuestionArea(activeNotation)) return;
    notationStore.activeNotation = activeNotation;
  }

  async function setActiveCell(newActiveCell: CellCoordinates | null) {
    if (notationStore.activeCell != newActiveCell) {
      return;
    }

    if (// disallow activation of question cells for student
      isCellInQuestionArea(newActiveCell)) {
      return;
    }

    notationStore.setActiveCell(newActiveCell);
  }

  async function removeNotationsByRect(rectNotaion: RectNotation) {
    let notationsAtRectCoordinates = findNotationsByRectCoordinates(
      notationStore.notations,
      rectNotaion
    );

    if (!notationsAtRectCoordinates) return;

    notationsAtRectCoordinates.forEach(async (n: Notation) => {
      n.boardType = notationStore.parent.type;
      await dbHelper
        .removeNotation(n)
        .then(() => notationStore.notations.delete(n.uuid));
    });
  }

  function isCellInQuestionArea(
    CellCoordinates: CellCoordinates | null
  ): boolean {
    return (
      notationStore.parent.type == BoardType.ANSWER &&
      !userStore.isTeacher &&
      CellCoordinates &&
      notationStore.cellOccupationMatrix
        .at(CellCoordinates.row)
        ?.at(CellCoordinates.col)?.boardType == BoardType.QUESTION
    );
  }


  function addMarkNotation() {
    if (notationStore.editMode == EditMode.CHECKMARK) {
      addSymbolNotation("&#x2714");
      return;
    }

    if (notationStore.editMode == EditMode.SEMICHECKMARK) {
      addSymbolNotation("&#x237B");
      return;
    }

    if (notationStore.editMode == EditMode.XMARK) {
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
    if (notationStore.activeCell) {
      removeActiveCellNotations();
    }
    if (notationStore.activeNotation) {
      removeActiveNotation();
    }
    if (notationStore.activeNotation) {
      removeSelectedNotations();
    }
  }

  async function removeActiveCellNotations() {
    if (!notationStore.activeCell) return;

    let notationsToDelete = await removeSymbolsByCell(notationStore.activeCell);

    if (!notationsToDelete) return;

    notationsToDelete.forEach((notation: Notation) => {
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
    let notation: RectNotation;

    switch (notationStore.parent.type) {
      case BoardType.ANSWER: {
        notation = new AnswerImage();
        break;
      }

      case BoardType.LESSON: {
        notation = new LessonImage();
        break;
      }

      case BoardType.QUESTION: {
        notation = new QuestionImage();
      }
    }

    notation.fromCol = fromCol;
    notation.toCol = toCol;
    notation.fromRow = fromRow;
    notation.toRow = toRow;
    notation.value = base64Value;

    addNotation(notation)
      .then(() => {
        if (notationStore.parent.type === BoardType.LESSON) {
          userOutgoingOperations.syncOutgoingSaveNotation(notation);
        }
      })
      .catch((e) => {
        console.error(e);
      });

    notationStore.resetActiveCell();
  }

 function addTextNotation(
   fromCol: number,
   toCol: number,
   fromRow: number,
   toRow: number,
   value: string)
 {
    let notation: RectNotation;

    switch (notationStore.parent.type) {
      case BoardType.ANSWER: {
        notation = new AnswerText();
        break;
      }

      case BoardType.LESSON: {
        notation = new LessonText();
        break;
      }

      case BoardType.QUESTION: {
        notation = new QuestionText();
      }
    }

    notation.fromCol = fromCol;
    notation.toCol = toCol;
    notation.fromRow = fromRow;
    notation.toRow = toRow;
    notation.value = value;

    addNotation(notation)
      .then(() => {
        if (notationStore.parent.type === BoardType.LESSON) {
          userOutgoingOperations.syncOutgoingSaveNotation(notation);
        }
      })
      .catch((e) => {
        console.error(e);
      });

    notationStore.resetActiveCell();
  };


  function addSymbolNotation(value: string) {
    if (!notationStore.activeCell) return;

    let notation: PointNotation;

    switch (notationStore.parent.type) {
      case BoardType.ANSWER: {
        notation = new AnswerSymbol();
        break;
      }

      case BoardType.LESSON: {
        notation = new LessonSymbol();
        break;
      }

      case BoardType.QUESTION: {
        notation = new QuestionSymbol();
      }
    }

    notation.col = notationStore.activeCell.col;
    notation.row = notationStore.activeCell.row;

    addNotation(notation);
    if (notationStore.parent.type === BoardType.LESSON) {
      userOutgoingOperations.syncOutgoingSaveNotation(notation);
    }

    if (notationStore.editMode == EditMode.SYMBOL) {
      matrixHelper.setNextRect(1, 0);
    }
  }

  function addSqrtNotation(coordinates: LineCoordinates) {

    let notation: SqrtNotation;

    switch (notationStore.parent.type) {
      case BoardType.ANSWER: {
        notation = new AnswerSqrt();
        break;
      }

      case BoardType.LESSON: {
        notation = new LessonSqrt();
        break;
      }

      case BoardType.QUESTION: {
        notation = new QuestionSqrt();
      }
    }

    notation.fromCol = coordinates.fromCol;
    notation.toCol = coordinates.toCol;
    notation.row = coordinates.row;

    addNotation(notation);
    if (notationStore.parent.type === BoardType.LESSON) {
      userOutgoingOperations.syncOutgoingSaveNotation(notation);
    }
  }

    function addFractiontNotation(coordinates: LineCoordinates)  {
      let notation: FractionNotation;

      switch (notationStore.parent.type) {
        case BoardType.ANSWER: {
          notation = new AnswerFraction();
          break;
        }

        case BoardType.LESSON: {
          notation = new LessonFraction();
          break;
        }

        case BoardType.QUESTION: {
          notation = new QuestionFraction();
        }
      }

      notation.fromCol = coordinates.fromCol;
      notation.toCol = coordinates.toCol;
      notation.row = coordinates.row;

      addNotation(notation);
      if (notationStore.parent.type === BoardType.LESSON) {
        userOutgoingOperations.syncOutgoingSaveNotation(notation);
      }
    }



  function setCurrentEditMode(editMode: EditMode) {
    notationStore.editMode = editMode;
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
