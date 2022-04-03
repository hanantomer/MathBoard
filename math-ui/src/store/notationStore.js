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
    // at least one notation is selected
    isAnyNotationSelected(state) {
      return state.notations.keys.find(
        (k) => state.notations[k].selected === true
      );
    },
    getSelectedNotations: (state) => {
      return state.notations.keys.filter(
        (k) => state.notations[k].selected === true
      );
    },
    getNotationByRectCoordinates(state) {
      return (coordinates) => {
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
      let indexToRemove = state.notations.findIndex(
        (n) => n.col === notation.col && n.row === notation.row
      );
      state.notations.splice(indexToRemove, 1);
    },
    selectNotation(state, coordinates) {
      let notation = helper.findNotationByCoordinates(state, coordinates);
      Vue.set(state.notations, notation[0], { ...notation[1], selected: true });
    },
    unselectAllNotations(state) {
      Object.entries(state.notations)
        .filter((n) => n.selected === true)
        .forEach((n) => {
          n.selected = false;
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
    async loadNotations(context, exerciseId) {
      context.commit("removeAllNotations");
      dbSyncMixin.methods.getAllSymbols(exerciseId).then((symbols) => {
        symbols.forEach((symbol) => {
          context.commit("addNotation", { ...symbol, type: "symbol" });
        });
      });
      dbSyncMixin.methods.getAllFractions(exerciseId).then((fractions) => {
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
    removeNotation(context, notation) {
      dbSyncMixin.methods
        .removeNotation(notation)
        .then(() => context.commit("removeNotation", notation));
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
      context.state.notations
        .filter((notation) => notation.selected === true)
        .forEach(
          async (notation) =>
            await dbSyncMixin.methods.updateNotationCoordinates(notation)
        );
    },
  },
};
