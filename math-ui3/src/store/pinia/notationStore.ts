// notations of current board(lesson, question or answers)
//  questions of current lesson
import { defineStore } from "pinia";
import Lesson from "../../../../math-db/src/models/lesson/lesson.model";
import {  dbSync, Notation } from "../../Mixins/dbSyncMixin";

/*
import {
  Notation,
  Point,
  Line,
  Rect,
  LessonPointNotation,
  LessonLineNotation,
  LessonRectNotation,
  QuestionPointNotation,
  QuestionLineNotation,
  QuestionRectNotation,
  AnswerPointNotation,
  AnswerLineNotation,
  AnswerRectNotation
} from "../../Mixins/notationTypes";
*/

import { helper } from "./notationHelper";

import { useLessonStore } from "./lessonStore";
const lessonStore = useLessonStore();

import { useQuestionStore } from "./questionStore";
const questionStore = useQuestionStore();

import { useAnswerStore } from "./answerStore";
const answerStore = useAnswerStore();

import {
  BoardType,
  NotationType,
} from "../../../../math-common/src/enum";
import { useUserStore } from "./userStore";
const userStore = useUserStore();
const db = dbSync();

interface Board {
  uuid: string;
  type: BoardType;
}

const useNotationStore = defineStore("notation", {
  state: () => ({
    parent: <Board>{},
    notations: <Map<String, Notation>>{},
    activeCell: {},
    activeNotation: <Notation>{},
    cellOccupationMatrix: helper.createCellOccupationMatrix(),
  }),

  getters: {
    getParent: function (): Board {
      return this.parent;
    },
    getSelectedNotations: function (): Notation[] {
      return Object.values(this.notations).filter((v) => v.selected === true);
    },
    getNotations: function (): Map<String, Notation> {
      return this.notations;
    },
    getActiveNotation: function (): Notation {
      return this.activeNotation;
    },
    getActiveCell: function (): any {
      return this.activeCell;
    },
  },

  actions: {
    async loadLessonNotations() {
      this.parent = {
        type: BoardType.LESSON,
        uuid: lessonStore.getCurrentLesson.uuid,
      };

      this.notations = helper.getNotationsByBoard(
        this.parent.uuid,
        BoardType.LESSON
      );
    },

    async loadQuestionNotations() {
      this.parent = {
        type: BoardType.QUESTION,
        uuid: questionStore.getCurrentQuestion.uuid,
      };

      this.notations = helper.getNotationsByBoard(
        this.parent.uuid,
        BoardType.QUESTION
      );
    },

    async loadAnswerNotations() {
      this.parent = {
        type: BoardType.ANSWER,
        uuid: answerStore.getCurrentAnswer.uuid,
      };

      this.notations = helper.getNotationsByBoard(
        this.parent.uuid,
        BoardType.ANSWER
      );
    },

    async addPointNotation(notation: LessonPointNotation) {
      notation.userId = userStore.getCurrentUser.id;
      //notation.boardType = this.getParent.type;

      let overlappedSameTypeNotation: Notation | undefined =
        helper.findOverlapNotationsOfSameType(this.notations, notation);

      if (overlappedSameTypeNotation) {
        let oldNotation = overlappedSameTypeNotation as LessonPointNotation;
        oldNotation.col = notation.col;
        oldNotation.row = notation.row;
        oldNotation.value = notation.value;
        oldNotation = await dbSyncMixin.methods.updateNotation(oldNotation);
        this.notations.set(oldNotation.uuid, oldNotation);
        return notation;
      }

      let overlappedAnyTypeNotation: Notation | undefined =
        helper.findOverlapNotationsOfAnyType(this.notations, notation);

      // don't allow override of other type notation
      if (overlappedAnyTypeNotation) {
        return null;
      }

      // no overlapping -> add
      notation = await db.saveNotation(notation);
      context.commit("setNotation", notation);
      return notation;

      if (overlappedSameTypeNotations?.length > 0) {
        let oldNotation = overlappedSameTypeNotations[0];
        oldNotation.value = notation.value;
        if (notation.col) oldNotation.col = notation.col;
        if (notation.fromCol) oldNotation.fromCol = notation.fromCol;
        if (notation.toCol) oldNotation.toCol = notation.toCol;
        if (notation.row) oldNotation.row = notation.row;
        if (notation.fromRow) oldNotation.fromRow = notation.fromRow;
        if (notation.toRow) oldNotation.toRow = notation.toRow;

        notation = await dbSyncMixin.methods.updateNotation(
          overlappedSameTypeNotations[0]
        );
        context.commit("setNotation", notation);
        return notation;
      }

      // notation overlaps with other notation of other type => ignore
      let overlappedAnyTypeNotations = helper.findOverlapNotationsOfAnyType(
        context.state,
        notation
      );

      if (overlappedAnyTypeNotations?.length > 0) {
        return null;
      }

      // no overlapping -> add
      notation = await dbSyncMixin.methods.saveNotation(notation);
      context.commit("setNotation", notation);
      return notation;
    },

    async addNotation(notation: NotationInterface) {
      notation.UserId = userStore.getCurrentUser.id;
      notation.boardType = this.getParent.type;

      if (typeof notation === PointN)
        /// how to dynamically set parent UUID?

        notation[notation.boardType.capitalize() + "UUId"] =
          context.getters.getParent.uuid;

      let overlappedSameTypeNotations = helper.findOverlapNotationsOfSameType(
        context.state,
        notation
      );

      if (overlappedSameTypeNotations?.length > 0) {
        let oldNotation = overlappedSameTypeNotations[0];
        oldNotation.value = notation.value;
        if (notation.col) oldNotation.col = notation.col;
        if (notation.fromCol) oldNotation.fromCol = notation.fromCol;
        if (notation.toCol) oldNotation.toCol = notation.toCol;
        if (notation.row) oldNotation.row = notation.row;
        if (notation.fromRow) oldNotation.fromRow = notation.fromRow;
        if (notation.toRow) oldNotation.toRow = notation.toRow;

        notation = await dbSyncMixin.methods.updateNotation(
          overlappedSameTypeNotations[0]
        );
        context.commit("setNotation", notation);
        return notation;
      }

      // notation overlaps with other notation of other type => ignore
      let overlappedAnyTypeNotations = helper.findOverlapNotationsOfAnyType(
        context.state,
        notation
      );

      if (overlappedAnyTypeNotations?.length > 0) {
        return null;
      }

      // no overlapping -> add
      notation = await dbSyncMixin.methods.saveNotation(notation);
      context.commit("setNotation", notation);
      return notation;
    },

    syncIncomingAddedNotation(context, notation) {
      context.commit("setNotation", notation);
    },
    syncIncomingRemovedNotation(context, notation) {
      context.commit("removeNotation", notation);
    },
    syncIncomingUpdatedNotation(context, notation) {
      context.commit("setNotation", notation);
    },
    removeSymbolsByCell(context, cell) {
      let symbolsAtCell = helper
        .findNotationsByCellCoordinates(context.state, cell)
        .filter(
          (n) => n.type === NotationType.SYMBOL || n.type === NotationType.SIGN
        );

      if (!symbolsAtCell) return;

      symbolsAtCell.forEach(async (n) => {
        n.boardType = context.getters.getParent.boardType;
        await dbSyncMixin.methods
          .removeNotation(n)
          .then(() => context.commit("removeNotation", n));
      });

      return symbolsAtCell;
    },

    // remove notations wich overlaps with a rect(multiple cells)
    removeNotationsByRect(context, rect) {
      let notationsAtRectCoordinates = helper.findNotationsByRectCoordinates(
        context.state,
        rect
      );
      if (notationsAtRectCoordinates) {
        notationsAtRectCoordinates.forEach(async (n) => {
          n.boardType = context.getters.getParent.boardType;
          await dbSyncMixin.methods
            .removeNotation(n)
            .then(() => context.commit("removeNotation", n));
        });
      }
      return notationsAtRectCoordinates;
    },

    async removeActiveNotation(context) {
      let notationToDelete = context.getters.getActiveNotation;
      if (!notationToDelete) return;
      dbSyncMixin.methods.removeNotation(notationToDelete);
      context.commit("removeNotation", notationToDelete);
      return notationToDelete;
    },

    async removeSelectedNotations(context) {
      let notationsToDelete = [...context.getters.getSelectedNotations];
      if (!notationsToDelete) return;

      notationsToDelete.forEach(async (n) => {
        await dbSyncMixin.methods.removeNotation(n);
        context.commit("removeNotation", n);
      });
      return notationsToDelete;
    },

    selectNotation(context, pointCoordinates) {
      context.commit("selectNotation", pointCoordinates);
    },
    unselectAllNotations(context) {
      context.commit("unselectAllNotations");
    },

    // move without persistence - called during  mouse move  - don't bother the database during move
    moveSelectedNotations(context, delta) {
      console.debug(`${delta.rectDeltaX}`);
      Object.entries(context.state.notations)
        .filter((notation) => !!notation[1].selected)
        .forEach((notation) => {
          switch (notation[1].type) {
            case NotationType.SYMBOL:
            case NotationType.SIGN:
            case NotationType.POWER:
              notation.UserId = context.getters.getUser.id;
              notation[1].col += delta.rectDeltaX;
              notation[1].row += delta.rectDeltaY;
              context.commit("setNotation", notation[1]);
              break;
            case NotationType.FRACTION:
            case NotationType.SQRT:
              notation.UserId = context.getters.getUser.id;
              notation[1].fromCol += delta.rectDeltaX;
              notation[1].toCol += delta.rectDeltaX;
              notation[1].row += delta.rectDeltaY;
              context.commit("setNotation", notation[1]);
              break;
            case NotationType.TEXT:
            case NotationType.IMAGE:
            case NotationType.GEO: {
              notation.UserId = context.getters.getUser.id;
              notation[1].fromCol += delta.rectDeltaX;
              notation[1].toCol += delta.rectDeltaX;
              notation[1].fromRow += delta.rectDeltaY;
              notation[1].toRow += delta.rectDeltaY;
              context.commit("setNotation", notation[1]);
              break;
            }
          }
        });
    },

    // move selected notations with persistence - called upon muose up
    updateSelectedNotationCoordinates(context) {
      // disallow update if any notation overlaps question area

      context.getters.getSelectedNotations.forEach(async (notation) => {
        if (
          helper.isStudentInQuestionArea(
            context,
            notation.col,
            notation.row ?? notation.toRow
          )
        ) {
          return;
        }
      });

      context.getters.getSelectedNotations.forEach(async (notation) => {
        await dbSyncMixin.methods.updateNotation(notation);
      });
      context.commit("unselectAllNotations");
    },

    async updateNotation(context, notation) {
      notation.UserId = context.getters.getUser.id;
      // disallow update for student in question area

      if (
        helper.isStudentInQuestionArea(
          context,
          notation.col,
          notation.row ?? notation.toRow
        )
      ) {
        return;
      }
      await dbSyncMixin.methods.updateNotation(notation);
      context.commit("setNotation", notation);
    },

    async setActiveNotation(context, activeNotation) {
      if (
        // disallow activation of question rows for student
        helper.isStudentInQuestionArea(
          context,
          activeNotation.col ?? activeNotation.fromCol,
          activeNotation.row ?? activeNotation.fromRow
        )
      ) {
        return;
      }
      context.commit("setActiveNotation", activeNotation);
    },

    setActiveCell(context, activeCell) {
      if (
        // disallow activation of question rows for student
        activeCell.row &&
        helper.isStudentInQuestionArea(context, activeCell.col, activeCell.row)
      ) {
        return;
      }
      context.commit("setActiveCell", activeCell);
    },

    removeAllNotations() {
      this.notations.clear();
    },
  },
});


/*
  mutations: {

    setParent(state, newParent) {
      Vue.set(state, "parent", newParent);
    },

    setNotation(state, notation) {
      if (!notation.boardType) notation.boardType = state.parent.boardType;

      Vue.set(
        state.notations,
        notation.boardType + notation.type + notation.id,
        notation
      );

      // add aditinal erase sign to teacher overrides
      if (
        state.cellOccupationMatrix[parseInt(notation.row)][
          parseInt(notation.col)
        ]?.boardType === BoardType.ANSWER
      ) {
        if (
          (this.getters.isTeacher && // teacher correction when viewing students` answer
            this.getters.getUser.id == notation.UserId) ||
          (!this.getters.isTeacher && // teacher correction when students edits answer
            this.getters.getUser.id !== notation.UserId)
        ) {
          notation.value = "/" + notation.value; // to mark that studnts` symbol is incorrect
        }
      }

      helper.addToOccupationMatrix(state.cellOccupationMatrix, notation);
    },


    removeNotation(state, notation) {
      helper.removeFromOccupationMatrix(state.cellOccupationMatrix, notation);

      Vue.delete(
        state.notations,
        notation.boardType + notation.type + notation.id
      );
    },
    selectNotation(state, pointCoordinates) {
      let notations = helper.findNotationsByCellCoordinates(
        state,
        pointCoordinates
      );
      notations.forEach((n) => {
        Vue.set(state.notations, n.boardType + n.type + n.id, {
          ...n,
          selected: true,
        });
      });
    },
    unselectAllNotations(state) {
      Object.entries(state.notations)
        .filter((n) => n[1].selected === true)
        .forEach((n) => {
          Vue.set(state.notations[n[0]], "selected", false);
        });
    },
    removeAllNotations(state) {
      state.notations = {};
    },
    // for notations with more than single cell
    setActiveNotation(state, activeNotation) {
      //helper.deActivateAllNotations(state);
      if (state.activeNotation) delete state.activeNotation.selected;
      Vue.set(activeNotation, "active", true);
      Vue.set(state, "activeNotation", activeNotation);
      Vue.set(state, "activeCell", null);
    },
    setActiveCell(state, activeCell) {
      Vue.set(state, "activeCell", activeCell);
      Vue.set(state, "activeNotation", null);
      //helper.deActivateAllNotations(state);
    },
  },
  actions: {
    async loadLessonNotations(context) {
      context.commit("setParent", {
        boardType: BoardType.LESSON,
        uuid: context.getters.getCurrentLesson.uuid,
      });
      await context.dispatch("removeAllNotations");
      helper.loadNotations(context, BoardType.LESSON);
    },

    async loadQuestionNotations(context) {
      context.commit("setParent", {
        boardType: BoardType.QUESTION,
        uuid: context.getters.getCurrentQuestion.uuid,
      });

      await context.dispatch("removeAllNotations");
      await helper.loadNotations(context, BoardType.QUESTION);
    },

    async loadAnswerNotations(context) {
      context.commit("setParent", {
        boardType: BoardType.ANSWER,
        uuid: context.getters.getCurrentAnswer.uuid,
      });

      await helper.loadNotations(context, BoardType.ANSWER);
    },

    async addNotation(context, notation) {
      notation.UserId = context.getters.getUser.id;
      notation.boardType = context.getters.getParent.boardType;
      notation[notation.boardType.capitalize() + "UUId"] =
        context.getters.getParent.uuid;

      let overlappedSameTypeNotations = helper.findOverlapNotationsOfSameType(
        context.state,
        notation
      );

      if (overlappedSameTypeNotations?.length > 0) {
        let oldNotation = overlappedSameTypeNotations[0];
        oldNotation.value = notation.value;
        if (notation.col) oldNotation.col = notation.col;
        if (notation.fromCol) oldNotation.fromCol = notation.fromCol;
        if (notation.toCol) oldNotation.toCol = notation.toCol;
        if (notation.row) oldNotation.row = notation.row;
        if (notation.fromRow) oldNotation.fromRow = notation.fromRow;
        if (notation.toRow) oldNotation.toRow = notation.toRow;

        notation = await dbSyncMixin.methods.updateNotation(
          overlappedSameTypeNotations[0]
        );
        context.commit("setNotation", notation);
        return notation;
      }

      // notation overlaps with other notation of other type => ignore
      let overlappedAnyTypeNotations = helper.findOverlapNotationsOfAnyType(
        context.state,
        notation
      );

      if (overlappedAnyTypeNotations?.length > 0) {
        return null;
      }

      // no overlapping -> add
      notation = await dbSyncMixin.methods.saveNotation(notation);
      context.commit("setNotation", notation);
      return notation;
    },

    syncIncomingAddedNotation(context, notation) {
      context.commit("setNotation", notation);
    },
    syncIncomingRemovedNotation(context, notation) {
      context.commit("removeNotation", notation);
    },
    syncIncomingUpdatedNotation(context, notation) {
      context.commit("setNotation", notation);
    },
    removeSymbolsByCell(context, cell) {
      let symbolsAtCell = helper
        .findNotationsByCellCoordinates(context.state, cell)
        .filter(
          (n) => n.type === NotationType.SYMBOL || n.type === NotationType.SIGN
        );

      if (!symbolsAtCell) return;

      symbolsAtCell.forEach(async (n) => {
        n.boardType = context.getters.getParent.boardType;
        await dbSyncMixin.methods
          .removeNotation(n)
          .then(() => context.commit("removeNotation", n));
      });

      return symbolsAtCell;
    },

    // remove notations wich overlaps with a rect(multiple cells)
    removeNotationsByRect(context, rect) {
      let notationsAtRectCoordinates = helper.findNotationsByRectCoordinates(
        context.state,
        rect
      );
      if (notationsAtRectCoordinates) {
        notationsAtRectCoordinates.forEach(async (n) => {
          n.boardType = context.getters.getParent.boardType;
          await dbSyncMixin.methods
            .removeNotation(n)
            .then(() => context.commit("removeNotation", n));
        });
      }
      return notationsAtRectCoordinates;
    },

    async removeActiveNotation(context) {
      let notationToDelete = context.getters.getActiveNotation;
      if (!notationToDelete) return;
      dbSyncMixin.methods.removeNotation(notationToDelete);
      context.commit("removeNotation", notationToDelete);
      return notationToDelete;
    },

    async removeSelectedNotations(context) {
      let notationsToDelete = [...context.getters.getSelectedNotations];
      if (!notationsToDelete) return;

      notationsToDelete.forEach(async (n) => {
        await dbSyncMixin.methods.removeNotation(n);
        context.commit("removeNotation", n);
      });
      return notationsToDelete;
    },

    selectNotation(context, pointCoordinates) {
      context.commit("selectNotation", pointCoordinates);
    },
    unselectAllNotations(context) {
      context.commit("unselectAllNotations");
    },

    // move without persistence - called during  mouse move  - don't bother the database during move
    moveSelectedNotations(context, delta) {
      console.debug(`${delta.rectDeltaX}`);
      Object.entries(context.state.notations)
        .filter((notation) => !!notation[1].selected)
        .forEach((notation) => {
          switch (notation[1].type) {
            case NotationType.SYMBOL:
            case NotationType.SIGN:
            case NotationType.POWER:
              notation.UserId = context.getters.getUser.id;
              notation[1].col += delta.rectDeltaX;
              notation[1].row += delta.rectDeltaY;
              context.commit("setNotation", notation[1]);
              break;
            case NotationType.FRACTION:
            case NotationType.SQRT:
              notation.UserId = context.getters.getUser.id;
              notation[1].fromCol += delta.rectDeltaX;
              notation[1].toCol += delta.rectDeltaX;
              notation[1].row += delta.rectDeltaY;
              context.commit("setNotation", notation[1]);
              break;
            case NotationType.TEXT:
            case NotationType.IMAGE:
            case NotationType.GEO: {
              notation.UserId = context.getters.getUser.id;
              notation[1].fromCol += delta.rectDeltaX;
              notation[1].toCol += delta.rectDeltaX;
              notation[1].fromRow += delta.rectDeltaY;
              notation[1].toRow += delta.rectDeltaY;
              context.commit("setNotation", notation[1]);
              break;
            }
          }
        });
    },

    // move selected notations with persistence - called upon muose up
    updateSelectedNotationCoordinates(context) {
      // disallow update if any notation overlaps question area

      context.getters.getSelectedNotations.forEach(async (notation) => {
        if (
          helper.isStudentInQuestionArea(
            context,
            notation.col,
            notation.row ?? notation.toRow
          )
        ) {
          return;
        }
      });

      context.getters.getSelectedNotations.forEach(async (notation) => {
        await dbSyncMixin.methods.updateNotation(notation);
      });
      context.commit("unselectAllNotations");
    },

    async updateNotation(context, notation) {
      notation.UserId = context.getters.getUser.id;
      // disallow update for student in question area

      if (
        helper.isStudentInQuestionArea(
          context,
          notation.col,
          notation.row ?? notation.toRow
        )
      ) {
        return;
      }
      await dbSyncMixin.methods.updateNotation(notation);
      context.commit("setNotation", notation);
    },

    async setActiveNotation(context, activeNotation) {
      if (
        // disallow activation of question rows for student
        helper.isStudentInQuestionArea(
          context,
          activeNotation.col ?? activeNotation.fromCol,
          activeNotation.row ?? activeNotation.fromRow
        )
      ) {
        return;
      }
      context.commit("setActiveNotation", activeNotation);
    },

    setActiveCell(context, activeCell) {
      if (
        // disallow activation of question rows for student
        activeCell.row &&
        helper.isStudentInQuestionArea(context, activeCell.col, activeCell.row)
      ) {
        return;
      }
      context.commit("setActiveCell", activeCell);
    },

    removeAllNotations(context) {
      context.commit("removeAllNotations");
    },
  },
};
*/
