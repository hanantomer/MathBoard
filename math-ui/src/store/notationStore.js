import Vue from "vue";
import dbSyncMixin from "../Mixins/dbSyncMixin";

const helper = {
  findNotationByTypeAndId: function (state, type, id) {
    return state.notations.keys.find((k) => k.id == type + id);
  },
  findNotationByCoordinates: function (state, coordinates) {
    return state.notations.keys.find(
      (k) =>
        state.notations[k].col == coordinates.col &&
        state.notations[k].row == coordinates.row
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
      notation.selected = true;
    },
    unselectAllNotations(state) {
      state.notations
        .filter((n) => n.selected === true)
        .forEach((n) => {
          n.selected = false;
        });
    },
    moveSelectedNotations(state, payload) {
      state.notations
        .filter((notation) => !!notation.selected)
        .forEach((notation) => {
          let col = notation.col;
          let row = notation.row;
          delete notation.col;
          delete notation.row;
          Vue.set(notation, "col", col + payload.rectDeltaX);
          Vue.set(notation, "row", row + payload.rectDeltaY);
        });
    },
    removeAllNotations(state) {
      state.notations = [];
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
