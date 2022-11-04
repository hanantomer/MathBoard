// notations of current board(lesson, question or answers)
import Vue from "vue";
import dbSyncMixin from "../Mixins/dbSyncMixin";
import BoardType from "../Mixins/boardType";
import NotationType from "../Mixins/notationType";

Object.defineProperty(String.prototype, "capitalize", {
  value: function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
  },
  enumerable: false,
});

const helper = {
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

  loadNotationType(context, currentType) {
    dbSyncMixin.methods
      .getNotations(context.getters.getParent, currentType)
      .then((notations) => {
        notations.data.forEach((notation) => {
          notation.type = currentType;
          context.commit("setNotation", notation);
        });
      });
  },

  loadNotations(context) {
    context.commit("removeAllNotations");
    helper.loadNotationType(context, NotationType.SYMBOL);
    helper.loadNotationType(context, NotationType.SIGN);
    helper.loadNotationType(context, NotationType.POWER);
    helper.loadNotationType(context, NotationType.FRACTION);
    helper.loadNotationType(context, NotationType.SQRT);
    helper.loadNotationType(context, NotationType.TEXT);
  },
};

export default {
  modules: {
    dbSyncMixin,
  },
  state: {
    parent: { Id: null, boardType: BoardType.NONE },
    notations: {},
  },
  getters: {
    getParent(state) {
      return state.parent;
    },
    getSelectedNotations: (state) => {
      return Object.values(state.notations).filter((v) => v.selected === true);
    },
    getNotations(state) {
      return state.notations;
    },
    getLastNotation(state) {
      return Object.values(state.notations).length === 0
        ? null
        : Object.values(state.notations).slice(-1)[0];
    },
    lastNotationIsSingular(state) {
      return Object.values(state.notations).length === 0
        ? null
        : Object.values(state.notations).slice(-1)[0].value.length === 1;
    },
  },
  mutations: {
    setParent(state, parent) {
      state.parent = parent;
    },
    setNotation(state, notation) {
      notation.selected = false;
      notation.boardType = state.parent.boardType;
      Vue.set(state.notations, notation.type + notation.id, notation);
    },
    removeNotation(state, notation) {
      Vue.delete(state.notations, notation);
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
    moveSelectedNotations(state, payload) {
      Object.entries(state.notations)
        .filter((notation) => !!notation[1].selected)
        .forEach((notation) => {
          switch (notation[1].type) {
            case NotationType.SYMBOL:
            case NotationType.SIGN:
            case NotationType.POWER:
              {
                Vue.set(state.notations, notation[0], {
                  ...notation[1],
                  col: notation[1].col + payload.rectDeltaX,
                  row: notation[1].row + payload.rectDeltaY,
                });
              }
              break;
            case NotationType.FRACTION:
            case NotationType.SQRT:
              {
                Vue.set(state.notations, notation[0], {
                  ...notation[1],
                  fromCol: notation[1].fromCol + payload.rectDeltaX,
                  toCol: notation[1].toCol + payload.rectDeltaX,
                  row: notation[1].row + payload.rectDeltaY,
                });
              }
              break;
            case NotationType.TEXT:
            case NotationType.IMAGE:
            case NotationType.GEO: {
              Vue.set(state.notations, notation[0], {
                ...notation[1],
                fromCol: notation[1].fromCol + payload.rectDeltaX,
                toCol: notation[1].toCol + payload.rectDeltaX,
                fromRow: notation[1].fromRow + payload.rectDeltaY,
                toRow: notation[1].toRow + payload.rectDeltaY,
              });
              break;
            }
          }
        });
    },
    removeAllNotations(state) {
      state.notations = {};
    },
  },
  actions: {
    async loadLessonNotations(context, parentId) {
      context.commit("setParent", {
        boardType: BoardType.LESSON,
        id: parentId,
      });
      helper.loadNotations(context);
    },

    async loadQuestionNotations(context, parentId) {
      context.commit("setParent", {
        boardType: BoardType.QUESTION,
        id: parentId,
      });
      helper.loadNotations(context);
    },

    async addNotation(context, notation) {
      notation.UserId = context.getters.getUser.id;
      notation.boardType = context.getters.getParent.boardType;
      notation[notation.boardType.capitalize() + "Id"] =
        context.getters.getParent.id;

      // notation overlaps with other notation of same type => update
      // let overlappedSameTypeNotations = helper.findOverlapNotationsOfSameType(
      //   context.state,
      //   notation
      // );
      // if (overlappedSameTypeNotations?.length) {
      //   notation.id = overlappedSameTypeNotations[0].id;
      //   await dbSyncMixin.methods.updateNotation(notation);
      //   context.commit("setNotation", notation);
      //   return notation;
      // }

      // notation overlaps with other notation of other type => ignore
      let overlappedAnyTypeNotations = helper.findOverlapNotationsOfAnyType(
        context.state,
        notation
      );
      if (overlappedAnyTypeNotations?.length) {
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
      context.commit("removeNotation", notation.type + notation.id);
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
            .then(() => context.commit("removeNotation", n.type + n.id));
        });
      }
      return notationsAtCell;
    },

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
            .then(() => context.commit("removeNotation", n.type + n.id));
        });
      }
      return notationsAtRectCoordinates;
    },

    selectNotation(context, pointCoordinates) {
      context.commit("selectNotation", pointCoordinates);
    },
    unselectAllNotations(context) {
      context.commit("unselectAllNotations");
    },
    // move without persistence - called during  mouse move  - don't bother the database during move
    moveSelectedNotations(context, notations) {
      context.commit("moveSelectedNotations", notations);
    },
    // move with persistence - called upon muose up
    updateSelectedNotationCoordinates(context) {
      context.getters.getSelectedNotations.forEach(async (notation) => {
        await dbSyncMixin.methods.updateNotation(notation);
      });
      context.commit("unselectAllNotations");
    },
    async updateNotation(context, notation) {
      await dbSyncMixin.methods.updateNotation(notation);
      context.commit("setNotation", notation);
    },
  },
};
