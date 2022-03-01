import Vue from "vue";
import dbSyncMixin from "../Mixins/dbSyncMixin";

const helper = {
  findNotationById: function (state, id) {
    return state.notations.find((n) => n.id === id);
  },
  findNotationByCoordinates: function (state, rect) {
    return state.notations.find((n) => n.col == rect.col && n.row == rect.row);
  },
};

export default {
  modules: {
    dbSyncMixin,
  },
  state: {
    notations: [],
  },
  getters: {
    getNotations: (state) => {
      return state.notations;
    },
    // at least one notation is selected
    isAnyNotationSelected(state) {
      return state.notations.find((e) => e.selected === true);
    },
    getSelectedNotations: (state) => {
      return state.notations.filter((n) => !!n && n.selected == true);
    },
    getNotationByRectCoordinates(state) {
      return (rect) => {
        return helper.findNotationByCoordinates(state, rect);
      };
    },
  },
  mutations: {
    saveNotation(state, notation) {
      let oldNotation = helper.findNotationById(state, notation.id);
      if (!!oldNotation) {
        delete oldNotation.col; // for reactivity
        delete oldNotation.row;
        Vue.set(oldNotation, "col", notation.col);
        Vue.set(oldNotation, "row", notation.row);
      } else {
        state.notations.push(notation);
      }
    },
    addNotation(state, notation) {
      Vue.set(notation, "selected", false);
      let oldNotation = helper.findNotationByCoordinates(state, notation);
      if (!!oldNotation) {
        delete oldNotation.value;
        Vue.set(oldNotation, "value", notation.value);
      } else {
        state.notations.push(notation);
      }
    },
    removeNotation(state, notation) {
      state.notations = state.notations.filter(
        (n) => !(n.col === notation.col && n.row === notation.row)
      );
    },
    updateSelectedNotationCoordinates(state) {
      state.notations
        .filter((notation) => notation.selected === true)
        .forEach(
          async (notation) =>
            await dbSyncMixin.methods.updateNotationCoordinates(notation)
        );
    },
    selectNotation(state, id) {
      let notation = helper.findNotationById(state, id);
      delete notation.selected; // for reactivity
      Vue.set(notation, "selected", true);
    },
    unselectAllNotations(state) {
      state.notations
        .filter((n) => n.selected === true)
        .forEach((n) => {
          delete n.selected; // for reactivity
          Vue.set(n, "selected", false);
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
    removeAllNotations(state, payload) {
      state.notations = [];
    },
  },
  actions: {
    async loadNotations(context, exerciseId) {
      context.commit("removeAllNotations");
      dbSyncMixin.methods.getAllSymbols(exerciseId).then((symbols) => {
        symbols.forEach((symbol) => {
          context.commit("addNotation", symbol);
        });
      });
      dbSyncMixin.methods.getAllFractions(exerciseId).then((fractions) => {
        fractions.forEach((fraction) => {
          context.commit("addNotation", fraction);
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
      dbSyncMixin.methods.saveFraction(fraction).then((fraction) => {
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
      context.commit("saveNotation", notation);
    },
    removeNotation(context, notation) {
      dbSyncMixin.methods
        .removeNotation(notation)
        .then(() => context.commit("removeNotation", notation));
    },
    selectNotation(context, id) {
      context.commit("selectNotation", id);
    },
    unselectAllNotations(context) {
      context.commit("unselectAllNotations");
    },
    moveSelectedNotations(context, payload) {
      context.commit("moveSelectedNotations", payload);
    },
    updateSelectedNotationCoordinates(context, payload) {
      context.commit("updateSelectedNotationCoordinates", payload);
    },
  },
};
