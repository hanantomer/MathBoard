///TODO - create notation family and move helper functions outside

// notations of current board(lesson, question or answers)
import Vue from "vue";
import dbSyncMixin from "../Mixins/dbSyncMixin";
import BoardType from "../Mixins/boardType";
import NotationType from "../Mixins/notationType";
import globals from "../globals.js";

const helper = {
  // matrix which marks in true each occupied cell
  createCellOccupationMatrix: function () {
    let rowArr = new Array(globals.rowsNum).fill(0);
    rowArr.forEach((row, rowIndex) => {
      let colArr = new Array(globals.colsNum).fill(0);
      colArr.forEach((col, colIndex) => {
        colArr[colIndex] = null;
      });
      rowArr[rowIndex] = colArr;
    });
    return rowArr;
  },
  updateOccupationMatrix: function (matrix, notation, oldNotation) {
    switch (notation.type) {
      case NotationType.SYMBOL:
      case NotationType.SIGN:
      case NotationType.POWER:
        matrix[notation.row][notation.col] = notation;
        // clean matrix pointer to old notation
        if (!!oldNotation) {
          matrix[oldNotation.row][oldNotation.col] = null;
        }
        break;
      case NotationType.FRACTION:
      case NotationType.SQRT:
        for (let col = notation.fromCol; col <= notation.toCol; col++) {
          matrix[parseInt(notation.row)][parseInt(col)] = notation;
        }
        // clean matrix pointer to old notation
        if (!!oldNotation) {
          for (let col = oldNotation.fromCol; col <= oldNotation.toCol; col++) {
            matrix[parseInt(oldNotation.row)][parseInt(col)] = null;
          }
        }
      case NotationType.TEXT:
      case NotationType.IMAGE:
      case NotationType.GEO:
        for (let row = notation.fromRow; row <= notation.toRow; row++) {
          for (let col = notation.fromCol; col <= notation.toCol; col++) {
            matrix[parseInt(row)][parseInt(col)] = notation;
          }
        }
        // clean matrix pointer to old notation
        if (!!oldNotation) {
          for (let row = oldNotation.fromRow; row <= oldNotation.toRow; row++) {
            for (
              let col = oldNotation.fromCol;
              col <= oldNotation.toCol;
              col++
            ) {
              matrix[parseInt(row)][parseInt(col)] = null;
            }
          }
        }
    }
  },

  // return true for student in question and row is inside question area
  isStudentInQuestionArea(context, col, row) {
    return (
      row &&
      col &&
      context.getters.getParent.boardType === BoardType.QUESTION &&
      !context.getters.isTeacher &&
      context.state.cellOccupationMatrix[parseInt(row)][parseInt(col)]
        ?.boardType === BoardType.QUESTION
    );
  },

  // point
  pointAtPointCoordinates: function (point1Coordinates, point2Coordinates) {
    return (
      point1Coordinates.col == point2Coordinates.col &&
      point1Coordinates.row == point2Coordinates.row
    );
  },

  pointAtLineCoordinates: function (pointCoordinates, lineCoordinates) {
    return (
      pointCoordinates.col >= lineCoordinates.fromCol &&
      pointCoordinates.col <= lineCoordinates.toCol &&
      pointCoordinates.row == lineCoordinates.row
    );
  },

  pointAtRectCoordinates: function (pointCoordinates, rectCoordinates) {
    return (
      pointCoordinates.col >= rectCoordinates.fromCol &&
      pointCoordinates.col <= rectCoordinates.toCol &&
      pointCoordinates.row >= rectCoordinates.fromRow &&
      pointCoordinates.row <= rectCoordinates.toRow
    );
  },

  // line
  lineAtPointCoordinates: function (lineCoordinates, pointCoordinates) {
    return (
      lineCoordinates.fromCol <= pointCoordinates.col &&
      lineCoordinates.toCol >= pointCoordinates.col &&
      lineCoordinates.row == pointCoordinates.row
    );
  },

  lineAtLineCoordinates: function (line1Coordinates, line2Coordinates) {
    return (
      ((line1Coordinates.fromCol >= line2Coordinates.fromCol &&
        line1Coordinates.fromCol <= line2Coordinates.toCol) ||
        (line1Coordinates.toCol >= line2Coordinates.fromCol &&
          line1Coordinates.toCol <= line2Coordinates.toCol)) &&
      line1Coordinates.row == line2Coordinates.row
    );
  },

  lineAtRectCoordinates: function (lineCoordinates, rectCoordinates) {
    return (
      ((lineCoordinates.fromCol >= rectCoordinates.fromCol &&
        lineCoordinates.fromCol <= rectCoordinates.toCol) ||
        (lineCoordinates.toCol >= rectCoordinates.fromCol &&
          lineCoordinates.toCol <= rectCoordinates.toCol)) &&
      lineCoordinates.row >= rectCoordinates.fromRow &&
      lineCoordinates.row <= rectCoordinates.toRow
    );
  },

  // rect
  rectAtPointCoordinates: function (rectCoordinates, pointCoordinates) {
    return (
      rectCoordinates.fromCol <= pointCoordinates.col &&
      rectCoordinates.toCol >= pointCoordinates.col &&
      rectCoordinates.fromRow <= pointCoordinates.row &&
      rectCoordinates.toRow >= pointCoordinates.row
    );
  },

  rectAtLineCoordinates: function (rectCoordinates, lineCoordinates) {
    return (
      ((rectCoordinates.fromCol >= lineCoordinates.fromCol &&
        rectCoordinates.fromCol <= lineCoordinates.toCol) ||
        (rectCoordinates.toCol >= lineCoordinates.fromCol &&
          rectCoordinates.toCol <= lineCoordinates.toCol)) &&
      rectCoordinates.fromRow <= lineCoordinates.row &&
      rectCoordinates.toRow >= lineCoordinates.row
    );
  },

  rectAtRectCoordinates: function (rect1Coordinates, rect2Coordinates) {
    return (
      ((rect1Coordinates.fromCol >= rect2Coordinates.fromCol &&
        rect1Coordinates.fromCol <= rect2Coordinates.toCol) ||
        (rect1Coordinates.toCol >= rect2Coordinates.fromCol &&
          rect1Coordinates.toCol <= rect2Coordinates.toCol)) &&
      ((rect1Coordinates.fromRow >= rect2Coordinates.fromRow &&
        rect1Coordinates.fromRow <= rect2Coordinates.toRow) ||
        (rect1Coordinates.toRow >= rect2Coordinates.fromRow &&
          rect1Coordinates.toRow <= rect2Coordinates.toRow))
    );
  },

  // return a list of notations wich overlap given point coordinates
  findNotationsByCellCoordinates: function (state, pointCoordinates) {
    return Object.entries(state.notations)
      .map((n) => n[1])
      .filter((n) =>
        n.type == NotationType.SYMBOL ||
        n.type == NotationType.POWER ||
        n.type == NotationType.SIGN
          ? helper.pointAtPointCoordinates(
              {
                col: n.col,
                row: n.row,
              },
              pointCoordinates
            )
          : n.type == NotationType.FRACTION || n.type == NotationType.SQRT
          ? helper.lineAtPointCoordinates(
              {
                fromCol: n.fromCol,
                toCol: n.toCol,
                row: n.row,
              },
              pointCoordinates
            )
          : n.type == NotationType.TEXT
          ? helper.rectAtPointCoordinates(
              {
                fromCol: n.fromCol,
                toCol: n.toCol,
                fromRow: n.fromRow,
                toRow: n.toRow,
              },
              pointCoordinates
            )
          : false
      );
  },

  // return a list of notations wich overlap given rect coordinates
  findNotationsByRectCoordinates: function (state, rectCoordinates) {
    return Object.entries(state.notations)
      .map((n) => n[1])
      .filter((n) =>
        n.type == NotationType.SYMBOL ||
        n.type == NotationType.POWER ||
        n.type == NotationType.SIGN
          ? helper.pointAtRectCoordinates(
              {
                col: n.col,
                row: n.row,
              },
              rectCoordinates
            )
          : n.type == NotationType.FRACTION || n.type == NotationType.SQRT
          ? helper.lineAtRectCoordinates(
              {
                fromCol: n.fromCol,
                toCol: n.toCol,
                row: n.row,
              },
              rectCoordinates
            )
          : n.type == NotationType.TEXT
          ? helper.rectAtRectCoordinates(
              {
                fromCol: n.fromCol,
                toCol: n.toCol,
                fromRow: n.fromRow,
                toRow: n.toRow,
              },
              rectCoordinates
            )
          : false
      );
  },

  // return a list of notations wich overlap given line coordinates
  findNotationsByLineCoordinates: function (state, lineCoordinates) {
    return Object.entries(state.notations)
      .map((n) => n[1])
      .filter((n) =>
        n.type == NotationType.SYMBOL ||
        n.type == NotationType.POWER ||
        n.type == NotationType.SIGN
          ? helper.pointAtLineCoordinates(
              {
                col: n.col,
                row: n.row,
              },
              lineCoordinates
            )
          : n.type == NotationType.FRACTION || n.type == NotationType.SQRT
          ? helper.lineAtLineCoordinates(
              {
                fromCol: n.fromCol,
                toCol: n.toCol,
                row: n.row,
              },
              lineCoordinates
            )
          : n.type == NotationType.TEXT
          ? helper.rectAtLineCoordinates(
              {
                fromCol: n.fromCol,
                toCol: n.toCol,
                fromRow: n.fromRow,
                toRow: n.toRow,
              },
              lineCoordinates
            )
          : false
      );
  },

  findOverlapNotationsOfSameType(state, notation) {
    return Object.entries(state.notations)
      .map((n) => n[1])
      .filter((n1) => n1.type === notation.type)
      .filter((n2) => {
        switch (notation.type) {
          case NotationType.SYMBOL:
          case NotationType.SIGN:
          case NotationType.POWER:
            return helper.pointAtPointCoordinates(
              { col: notation.col, row: notation.row },
              n2
            );
          case NotationType.FRACTION:
          case NotationType.SQRT:
            return helper.lineAtLineCoordinates(
              {
                fromCol: notation.fromCol,
                toCol: notation.toCol,
                row: notation.row,
              },
              n2
            );
          case NotationType.TEXT:
          case NotationType.IMAGE:
          case NotationType.GEO:
            return helper.rectAtRectCoordinates(
              {
                fromCol: notation.fromCol,
                toCol: notation.toCol,
                fromRow: notation.fromRow,
                toRow: notation.toRow,
              },
              n2
            );
        }
      });
  },

  findOverlapNotationsOfAnyType(state, notation) {
    return Object.entries(state.notations)
      .map((n) => n[1])
      .filter((n2) => {
        switch (notation.type) {
          case NotationType.SYMBOL:
          case NotationType.POWER:
            return (
              helper.pointAtPointCoordinates(
                { col: notation.col, row: notation.row },
                n2
              ) ??
              helper.lineAtPointCoordinates(
                { col: notation.col, row: notation.row },
                n2
              ) ??
              helper.rectAtPointCoordinates(
                { col: notation.col, row: notation.row },
                n2
              )
            );
          case NotationType.FRACTION:
          case NotationType.SQRT:
            return (
              helper.lineAtPointCoordinates(
                {
                  fromCol: notation.fromCol,
                  toCol: notation.toCol,
                  row: notation.row,
                },
                n2
              ) ??
              helper.lineAtLineCoordinates(
                {
                  fromCol: notation.fromCol,
                  toCol: notation.toCol,
                  row: notation.row,
                },
                n2
              ) ??
              helper.lineAtRectCoordinates(
                {
                  fromCol: notation.fromCol,
                  toCol: notation.toCol,
                  row: notation.row,
                },
                n2
              )
            );

          case NotationType.TEXT:
          case NotationType.IMAGE:
          case NotationType.GEO:
            return (
              helper.pointAtRectCoordinates(
                {
                  fromCol: notation.fromCol,
                  toCol: notation.toCol,
                  fromRow: notation.fromRow,
                  toRow: notation.toRow,
                },
                n2
              ) ??
              helper.lineAtRectCoordinates(
                {
                  fromCol: notation.fromCol,
                  toCol: notation.toCol,
                  fromRow: notation.fromRow,
                  toRow: notation.toRow,
                },
                n2
              ) ??
              helper.rectAtRectCoordinates(
                {
                  fromCol: notation.fromCol,
                  toCol: notation.toCol,
                  fromRow: notation.fromRow,
                  toRow: notation.toRow,
                },
                n2
              )
            );
        }
      });
  },

  async loadNotationType(context, parentUUId, notationType, boardType) {
    let notations = await dbSyncMixin.methods.getNotations(
      notationType,
      boardType,
      parentUUId
    );

    if (notations?.data?.length === 0) return;

    notations?.data?.forEach((notation) => {
      notation.type = notationType;
      context.commit("setNotation", notation);
    });
  },

  async loadNotations(context, boardType) {
    let parentUUId = context.getters.getParent.uuid;
    await helper.loadNotationType(
      context,
      parentUUId,
      NotationType.SYMBOL,
      boardType
    );
    await helper.loadNotationType(
      context,
      parentUUId,
      NotationType.SIGN,
      boardType
    );
    await helper.loadNotationType(
      context,
      parentUUId,
      NotationType.POWER,
      boardType
    );
    await helper.loadNotationType(
      context,
      parentUUId,
      NotationType.FRACTION,
      boardType
    );
    await helper.loadNotationType(
      context,
      parentUUId,
      NotationType.SQRT,
      boardType
    );
    await helper.loadNotationType(
      context,
      parentUUId,
      NotationType.TEXT,
      boardType
    );
    await helper.loadNotationType(
      context,
      parentUUId,
      NotationType.IMAGE,
      boardType
    );
  },

  deActivateAllNotations(state) {
    Object.entries(state.notations)
      .map((n) => n[1])
      .filter((n) => !!n.active)
      .forEach((n) => {
        Vue.set(n, "active", false);
      });
  },
};

export default {
  modules: {
    dbSyncMixin,
  },
  state: {
    parent: { Id: null, boardType: BoardType.NONE },
    notations: {},
    activeCell: {},
    cellOccupationMatrix: helper.createCellOccupationMatrix(),
  },
  getters: {
    getParent: (state) => {
      return state.parent;
    },
    getSelectedNotations: (state) => {
      return Object.values(state.notations).filter((v) => v.selected === true);
    },
    getNotations: (state) => {
      return state.notations;
    },
    getActiveNotation: (state) => {
      return Object.entries(state.notations)
        .map((n) => n[1])
        .find((n) => !!n.active);
    },
    getActiveCell: (state) => {
      return state.activeCell;
    },
  },
  mutations: {
    setParent(state, parent) {
      state.parent = parent;
    },
    setNotation(state, notation) {
      let oldNotation = state.notations[notation.type + notation.id];
      //notation.selected = false;
      // for answer, notation.boardType is populated
      if (!notation.boardType) notation.boardType = state.parent.boardType;
      Vue.set(state.notations, notation.type + notation.id, notation);

      helper.updateOccupationMatrix(
        state.cellOccupationMatrix,
        notation,
        oldNotation
      );
    },
    removeNotation(state, notation) {
      Vue.delete(state.notations, notation.type + notation.id);
    },
    selectNotation(state, pointCoordinates) {
      let notations = helper.findNotationsByCellCoordinates(
        state,
        pointCoordinates
      );
      notations.forEach((n) => {
        Vue.set(state.notations, n.type + n.id, { ...n, selected: true });
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
      helper.deActivateAllNotations(state);
      Vue.set(activeNotation, "active", true);
      Vue.set(state, "activeCell", {});
    },
    setActiveCell(state, activeCell) {
      Vue.set(state, "activeCell", activeCell);
      helper.deActivateAllNotations(state);
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
      if (!context.getters.getUser.authorized && !context.getters.isTeacher)
        return;

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
        if (!!notation.col) oldNotation.col = notation.col;
        if (!!notation.fromCol) oldNotation.fromCol = notation.fromCol;
        if (!!notation.toCol) oldNotation.toCol = notation.toCol;
        if (!!notation.row) oldNotation.row = notation.row;
        if (!!notation.fromRow) oldNotation.row = notation.row;
        if (!!notation.toRow) oldNotation.toRow = notation.toRow;

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
    removeNotationsByCell(context, cell) {
      let notationsAtCell = helper.findNotationsByCellCoordinates(
        context.state,
        cell
      );
      if (!!notationsAtCell) {
        notationsAtCell.forEach(async (n) => {
          n.boardType = context.getters.getParent.boardType;
          await dbSyncMixin.methods
            .removeNotation(n)
            .then(() => context.commit("removeNotation", n));
        });
      }
      return notationsAtCell;
    },

    // remove notations wich overlaps with a rect(multiple cells)
    removeNotationsByRect(context, rect) {
      let notationsAtRectCoordinates = helper.findNotationsByRectCoordinates(
        context.state,
        rect
      );
      if (!!notationsAtRectCoordinates) {
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
      await dbSyncMixin.methods.removeNotation(notationToDelete);
      context.commit("removeNotation", notationToDelete);
      return notationToDelete;
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
              notation[1].col += delta.rectDeltaX;
              notation[1].row += delta.rectDeltaY;
              context.commit("setNotation", notation[1]);
              break;
            case NotationType.FRACTION:
            case NotationType.SQRT:
              notation[1].fromCol += delta.rectDeltaX;
              notation[1].toCol += delta.rectDeltaX;
              notation[1].row += delta.rectDeltaY;
              context.commit("setNotation", notation[1]);
              break;
            case NotationType.TEXT:
            case NotationType.IMAGE:
            case NotationType.GEO: {
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
