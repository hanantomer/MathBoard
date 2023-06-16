// notations of current board(lesson, question or answers)
//  questions of current lesson
import { defineStore } from "pinia";
import useDbHelper from "../../Helpers/dbHelper";
import { Notation, PointNotation, LineNotation, RectNotation } from "../../Helpers/responseTypes";
import { PointCoordinates } from "../../../../math-common/src/globals";
import { EditMode, NotationShape,  NotationTypeShape } from "../../../../math-common/src/enum";
import useNotationHelper from "./notationHelper";
import { useLessonStore } from "./lessonStore";
import { useQuestionStore } from "./questionStore";
import { useAnswerStore } from "./answerStore";
import { BoardType, NotationType } from "../../../../math-common/src/enum";
import { useUserStore } from "./userStore";
import { error } from "console";
import { reactive } from "vue";
const userStore = useUserStore();
const dbHelper = useDbHelper();
const lessonStore = useLessonStore();
const questionStore = useQuestionStore();
const answerStore = useAnswerStore();
const helper = useNotationHelper();

type Board = {
  uuid: string;
  type: BoardType;
}


export const useNotationStore = defineStore("notation", () => {
  let parent: Board = reactive<Board>({ type: BoardType.LESSON, uuid: "" });
  let notations: Map<String, Notation> = reactive(<Map<String, Notation>>{});
  let activeCell: PointCoordinates | null = reactive({ col: -1, row: -1 });
  let activeNotation: Notation | null = <Notation | null>reactive({});
  const cellOccupationMatrix: (Notation | null)[][] =
    helper.createCellOccupationMatrix();
  let selectedNotations: string[] = reactive([]);
  let editMode = reactive(EditMode.SYMBOL.valueOf);

  function getNotations<T>(notationShape: NotationShape): T[] {
    return Array.from(notations.values()).filter((n) => {
      NotationTypeShape.get(n.notationType) == notationShape
    }) as T[];
  }


  async function loadLessonNotations() {
    parent.type = BoardType.LESSON;
    parent.uuid = lessonStore.currentLesson?.uuid;

    notations = reactive(
      helper.getNotationsByBoard(parent.uuid, BoardType.LESSON)
    );
  }

  async function loadQuestionNotations() {
    (parent.type = BoardType.QUESTION),
      (parent.uuid = questionStore.currentQuestion.uuid);

    notations = reactive(
      helper.getNotationsByBoard(parent.uuid, BoardType.LESSON)
    );
  }

  async function loadAnswerNotations() {
    (parent.type = BoardType.ANSWER),
      (parent.uuid = answerStore.currentAnswer.uuid);

    notations = reactive(
      helper.getNotationsByBoard(parent.uuid, BoardType.LESSON)
    );
  }

  async function addNotation<T extends Notation>(
    notation: T
  ): Promise<Notation | null> {
    notation.userId = userStore.currentUser.id;

    let overlappedSameTypeNotation = helper.findOverlapNotationsOfSameType(
      notations,
      notation
    );

    if (overlappedSameTypeNotation) {
      setNotationAttributes(overlappedSameTypeNotation, notation);

      await dbHelper.updateNotation(overlappedSameTypeNotation);
      notations.set(
        overlappedSameTypeNotation.uuid,
        overlappedSameTypeNotation
      );
      return overlappedSameTypeNotation;
    }

    let overlappedAnyTypeNotation: Notation | undefined =
      helper.findOverlapNotationsOfAnyType(notations, notation);

    // don't allow override of other type notation
    if (overlappedAnyTypeNotation) {
      return null;
    }

    // no overlapping -> add
    let newNotation = await dbHelper.addNotation(notation);
    notations.set(newNotation.uuid, newNotation);
    return newNotation;
  }

  async function syncIncomingAddedNotation(notation: Notation) {
    notations.set(notation.uuid, notation);
  }

  async function syncIncomingRemovedNotation(notation: Notation) {
    notations.delete(notation.uuid);
  }

  async function syncIncomingUpdatedtNotation(notation: Notation) {
    notations.set(notation.uuid, notation);
  }

  async function removeSymbolsByCell(coordinates: PointCoordinates) {
    let symbolsAtCell = helper
      .findNotationsByCellCoordinates(
        notations,
        coordinates,
        userStore.currentUser.id
      )
      .filter(
        (n) =>
          n.notationType === NotationType.SYMBOL ||
          n.notationType === NotationType.SIGN
      );

    if (!symbolsAtCell) return;

    symbolsAtCell.forEach(async (n) => {
      await dbHelper.removeNotation(n).then(() => notations.delete(n.uuid));
    });

    return symbolsAtCell;
  }

  // remove notations wich overlaps with a rect(multiple cells)
  async function removeNotationsByRect(rectNotaion: RectNotation) {
    let notationsAtRectCoordinates = helper.findNotationsByRectCoordinates(
      notations,
      rectNotaion
    );
    if (notationsAtRectCoordinates) {
      notationsAtRectCoordinates.forEach(async (n) => {
        n.boardType = parent.type;
        await dbHelper.removeNotation(n).then(() => notations.delete(n.uuid));
      });
    }
    return notationsAtRectCoordinates;
  }

  async function removeActiveNotation(): Promise<string | null> {
    if (activeNotation == null) return null;

    await dbHelper.removeNotation(activeNotation);
    notations.delete(activeNotation.uuid);
    let deletedNotationUUId = activeNotation.uuid;
    activeNotation = null;
    return deletedNotationUUId;
  }

  async function removeSelectedNotations() {
    selectedNotations.forEach(async (uuid) => {
      let n = notations.get(uuid);
      if (!n) return;
      await dbHelper.removeNotation(n);
      notations.delete(uuid);
    });
    this.selectedNotations.length = 0;
  }

  async function selectNotation(pointCoordinates: PointCoordinates) {
    selectedNotations.length = 0;

    helper
      .findNotationsByCellCoordinates(
        notations,
        pointCoordinates,
        userStore.currentUser.uuid
      )
      .forEach((n) => {
        selectedNotations.push(n.uuid);
      });
  }

  // move without persistence - called during  mouse move  - don't bother the database during move
  async function moveSelectedNotations(deltaX: number, deltaY: number) {
    selectedNotations.forEach((uuid) => {
      let n = notations.get(uuid);
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
    selectedNotations.forEach((uuid) => {
      let n = notations.get(uuid);
      if (!n) return;
      if (helper.isNotationInQuestionArea(n, cellOccupationMatrix)) {
        return;
      }
    });

    selectedNotations.forEach(async (uuid) => {
      let n = notations.get(uuid);
      if (!n) return;
      await dbHelper.updateNotation(n);
    });

    selectedNotations.length = 0;
  }

  async function updateNotation(notation: Notation) {
    // disallow update for student in question area
    if (helper.isNotationInQuestionArea(notation, cellOccupationMatrix)) {
      return;
    }

    await dbHelper.updateNotation(notation);
    notations.set(notation.uuid, notation);
  }

  async function setActiveNotation(activeNotation: Notation) {
    if (
      // disallow activation of question rows for student
      helper.isNotationInQuestionArea(activeNotation, cellOccupationMatrix)
    ) {
      return;
    }

    activeNotation = activeNotation;
  }

  async function setActiveCell(newActiveCell: PointCoordinates) {

    if (activeCell != newActiveCell) {
      return;
    }

    if (
      // disallow activation of question cells for student
      helper.isCellInQuestionArea(
        parent.type,
        newActiveCell,
        cellOccupationMatrix
      )
    ) {
      return;
    }

    activeCell = newActiveCell;
  }

  async function removeAllNotations() {
    notations.clear();
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

  function setCurrentEditMode(neweEditMode: EditMode) {
    editMode = neweEditMode.valueOf;
  }

  return {
    editMode,
    setCurrentEditMode,
    parent,
    notations,
    getNotations,
    activeCell,
    activeNotation,
    setActiveCell,
    setActiveNotation,
    removeActiveNotation,
    selectedNotations,
    selectNotation,
    loadAnswerNotations,
    loadLessonNotations,
    loadQuestionNotations,
    addNotation,
    updateNotation,
    removeNotationsByRect,
    removeSymbolsByCell,
    syncIncomingRemovedNotation,
    syncIncomingAddedNotation,
    syncIncomingUpdatedtNotation,
    updateSelectedNotationCoordinates,
    moveSelectedNotations,
  };
});



