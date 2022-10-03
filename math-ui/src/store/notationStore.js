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
  symbolAtCoordinates: function (coordinates, symbolCoordinates) {
    return (
      coordinates.col == symbolCoordinates.col &&
      coordinates.row == symbolCoordinates.row
    );
  },
  lineAtCoordinates: function (coordinates, lineCoordinates) {
    return (
      coordinates.col >= lineCoordinates.fromCol &&
      coordinates.col <= lineCoordinates.toCol &&
      coordinates.row <= lineCoordinates.row + 1 &&
      coordinates.row >= lineCoordinates.row - 1
    );
  },
  findNotationsByCoordinates: function (state, coordinates) {
    return Object.entries(state.notations)
      .map((n) => n[1])
      .filter((n) =>
        n.type == "symbol" || n.type == "power"
          ? helper.symbolAtCoordinates(coordinates, {
              col: n.col,
              row: n.row,
            })
          : helper.lineAtCoordinates(coordinates, {
              fromCol: n.fromCol,
              toCol: n.toCol,
              row: n.row,
            })
      );
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
    helper.loadNotationType(context, NotationType.POWER);
    helper.loadNotationType(context, NotationType.FRACTION);
    helper.loadNotationType(context, NotationType.SQRT);
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
    selectNotation(state, coordinates) {
      let notations = helper.findNotationsByCoordinates(state, coordinates);
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
          if (notation[1].type === "symbol") {
            Vue.set(state.notations, notation[0], {
              ...notation[1],
              col: notation[1].col + payload.rectDeltaX,
              row: notation[1].row + payload.rectDeltaY,
            });
          } else {
            // sqrt or fraction line
            Vue.set(state.notations, notation[0], {
              ...notation[1],
              fromCol: notation[1].fromCol + payload.rectDeltaX,
              row: notation[1].row + payload.rectDeltaY,
            });
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
    removeNotations(context, coordinates) {
      let notationsAtCoordinates = helper.findNotationsByCoordinates(
        context.state,
        coordinates
      );
      if (!!notationsAtCoordinates) {
        notationsAtCoordinates.forEach(async (n) => {
          n.boardType = context.getters.getParent.boardType;
          await dbSyncMixin.methods
            .removeNotation(n)
            .then(() => context.commit("removeNotation", n.type + n.id));
        });
      }
      return notationsAtCoordinates;
    },
    selectNotation(context, coordinates) {
      context.commit("selectNotation", coordinates);
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
  },
};
