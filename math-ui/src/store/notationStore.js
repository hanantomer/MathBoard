import Vue from "vue";
import dbSyncMixin from "../Mixins/dbSyncMixin";

const helper = {
  findNotationByTypeAndId: function (state, type, id) {
    return Object.values(state.notations).find((v) => v.id == type + id);
  },
  findNotationByCoordinates: function (state, coordinates) {
    return Object.entries(state.notations).find(
      (e) => e[1].col == coordinates.col && e[1].row == coordinates.row
    );
  },
};

export default {
  modules: {
    dbSyncMixin,
  },
  state: {
    notations: {},
  },
  getters: {
    getNotations: (state) => {
      return state.notations;
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
    async loadNotations(context, lessonId) {
      context.commit("removeAllNotations");
      dbSyncMixin.methods.getAllSymbols(lessonId).then((symbols) => {
        symbols.forEach((symbol) => {
          context.commit("addNotation", { ...symbol, type: "symbol" });
        });
      });
      dbSyncMixin.methods.getAllFractions(lessonId).then((fractions) => {
        fractions.forEach((fraction) => {
          context.commit("addNotation", { ...fraction, type: "fraction" });
        });
      });
    },
    addSymbol(context, symbol) {
      dbSyncMixin.methods.saveSymbol(symbol).then((symbol) => {
        context.commit("addNotation", symbol);
        return symbol;
      });
    },
    addFraction(context, fraction) {
      return dbSyncMixin.methods.saveFraction(fraction).then((fraction) => {
        context.commit("addNotation", fraction);
        return fraction;
      });
    },
    syncIncomingAddedNotation(context, notation) {
      context.commit("addNotation", notation);
    },
    syncIncomingDeletedNotation(context, notation) {
      context.commit("removeNotation", notation);
    },
    syncIncomingUpdatedNotation(context, notation) {
      context.commit("addNotation", notation);
    },
    removeNotation(context, coordinates) {
      let notation = helper.findNotationByCoordinates(
        context.state,
        coordinates
      );
      dbSyncMixin.methods
        .removeNotation(notation[1])
        .then(() => context.commit("removeNotation", notation[0]));
    },
    selectNotation(context, coordinates) {
      context.commit("selectNotation", coordinates);
    },
    unselectAllNotations(context) {
      context.commit("unselectAllNotations");
    },
    // move without persistence - called during  mouse move  - don't bother the database during move
    moveSelectedNotations(context, payload) {
      context.commit("moveSelectedNotations", payload);
    },
    // move with persistence - called upon muose up
    updateSelectedNotationCoordinates(context, payload) {
      context.getters.getSelectedNotations.forEach(async (notation) => {
        dbSyncMixin.methods.updateNotationCoordinates(notation);
      });
      context.commit("unselectAllNotations");
    },
  },
};
