import Vue from "vue";
import dbSyncMixin from "../Mixins/dbSyncMixin";

Object.defineProperty(String.prototype, "capitalize", {
  value: function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
  },
  enumerable: false,
});

const BoardType = Object.freeze({
  LESSON: "lesson",
  EXERCISE: "exercise",
  ANSWER: "answer",
  NONE: "none",
});

const helper = {
  findNotationByCoordinates: function (state, coordinates) {
    return Object.entries(state.notations).find(
      (e) => e[1].col == coordinates.col && e[1].row == coordinates.row
    );
  },

  loadNotationType(context, currentType) {
    dbSyncMixin.methods
      .getNotations(context.getters.getParent, currentType)
      .then((notations) => {
        notations.data.forEach((notation) => {
          notation.type = currentType;
          context.commit("addNotation", notation);
        });
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
  },
  getters: {
    getParent(state) {
      return state.parent;
    },
    getSelectedNotations: (state) => {
      return Object.values(state.notations).filter((v) => v.selected === true);
    },
    getNotationByRectCoordinates(state) {
      return (coordinates) => {
        // return function to allow argument
        return helper.findNotationByCoordinates(state, coordinates);
      };
    },
  },
  mutations: {
    setParent(state, parent) {
      state.parent = parent;
    },
    addNotation(state, notation) {
      notation.selected = false;
      Vue.set(state.notations, notation.type + notation.id, notation);
    },
    removeNotation(state, notation) {
      Vue.delete(state.notations, notation);
    },
    selectNotation(state, coordinates) {
      let notation = helper.findNotationByCoordinates(state, coordinates);
      Vue.set(state.notations, notation[0], { ...notation[1], selected: true });
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
          Vue.set(state.notations, notation[0], {
            ...notation[1],
            col: notation[1].col + payload.rectDeltaX,
            row: notation[1].row + payload.rectDeltaY,
          });
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
      context.commit("removeAllNotations");

      helper.loadNotationType(context, "symbol");
      helper.loadNotationType(context, "power");
      helper.loadNotationType(context, "fractionLine");
      helper.loadNotationType(context, "sqrtLine");
    },

    addNotation(context, notation) {
      notation.UserId = context.getters.getUser.id;
      notation.boardType = context.getters.getParent.boardType;
      notation[notation.boardType.capitalize() + "Id"] =
        context.getters.getParent.id;
      dbSyncMixin.methods.saveNotation(notation).then((notation) => {
        context.commit("addNotation", notation);
        return notation;
      });
    },
    syncIncomingAddedNotation(context, notation) {
      context.commit("addNotation", notation);
    },
    syncIncomingRemovedNotation(context, notation) {
      context.commit("removeNotation", notation);
    },
    syncIncomingUpdatedNotation(context, notation) {
      context.commit("addNotation", notation);
    },
    removeNotation(context, coordinates) {
      let notationsAtCoordinates = helper.findNotationByCoordinates(
        context.state,
        coordinates
      );
      dbSyncMixin.methods
        .removeNotation(notation[1])
        .then(() =>
          context.commit("removeNotation", notationsAtCoordinates[0])
        );
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
        dbSyncMixin.methods.updateNotationCoordinates(notation);
      });
      context.commit("unselectAllNotations");
    },
  },
};
