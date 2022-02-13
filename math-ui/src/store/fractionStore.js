import Vue from "vue";
import dbSyncMixin from "../Mixins/dbSyncMixin";

const helper = {
  // findFractionSymbolById: function (state, id) {
  //   return state.symbols.find((n) => n.id === id);
  // },
  findFractionByCoordinates: function (state, rect) {
    return state.symbols.find((n) => n.col == rect.col && n.row == rect.row);
  },
};

export default {
  modules: {
    dbSyncMixin,
  },
  state: {
    fractions: [],
  },
  getters: {
    getFractions: (state) => {
      return state.fractions;
    },
    getSelectedFractions: (state) => {
      return state.fractions.filter((n) => !!n && n.selected == true);
    },
    getFractionByRectCoordinates(state) {
      return (rect) => {
        return helper.findFratcionByCoordinates(state, rect);
      };
    },
  },
  mutations: {
    upsertFraction(state, fraction) {
      ///TODO - remove fraction if all values are removed
      let oldFraction = helper.findFractionById(state, fraction.id);
      if (!!oldFraction) {
        delete oldFraction.col; // for reactivity
        delete oldFraction.row;
        delete oldFraction.values;
        Vue.set(oldFraction, "col", oldFraction.col);
        Vue.set(oldFraction, "row", oldFraction.row);
        Vue.set(oldFraction, "nominatorValues", oldFraction.nominatorValues);
        Vue.set(
          oldFraction,
          "deNominatorValues",
          oldFraction.deNominatorValues
        );
      } else {
        state.fractions.push(fraction);
      }
    },

    updateSelectedFractionCoordinates(state) {
      state.fractions
        .filter((fraction) => fraction.selected === true)
        .forEach(
          async (fraction) =>
            await dbSyncMixin.methods.updateFractionCoordinates(fraction)
        );
    },
    selectFraction(state, id) {
      let symbol = helper.findFractionById(state, id);
      delete fraction.selected; // for reactivity
      Vue.set(fraction, "selected", true);
    },
    unselectAllFractions(state) {
      state.fractions
        .filter((n) => n.selected === true)
        .forEach((n) => {
          delete n.selected; // for reactivity
          Vue.set(n, "selected", false);
        });
    },
    moveSelectedFractions(state, payload) {
      /// toDO - check here and in symbol that new place hodls all values
      state.symbols
        .filter((symbol) => !!symbol.selected)
        .forEach((symbol) => {
          let col = symbol.col;
          let row = symbol.row;
          delete symbol.col;
          delete symbol.row;
          Vue.set(symbol, "col", col + payload.rectDeltaX);
          Vue.set(symbol, "row", row + payload.rectDeltaY);
        });
    },
    removeAllFractions(state) {
      state.symbols = [];
    },
  },
  actions: {
    async loadFractions(context, exerciseId) {
      context.commit("removeAllFractions");
      dbSyncMixin.methods.getAllFractions(exerciseId).then((fractions) => {
        symbols.forEach((fraction) => {
          context.commit("addFraction", fraction);
        });
      });
    },
    upsertFraction(context, symbol) {
      return dbSyncMixin.methods.upsertFraction(fraction);
    },
    syncIncomingAddedFraction(context, fraction) {
      context.commit("addFraction", fraction);
    },
    syncIncomingDeletedFraction(context, fraction) {
      context.commit("removeFraction", fraction);
    },
    syncIncomingUpdatedFraction(context, fraction) {
      context.commit("upsertFraction", fraction);
    },
    removeFraction(context, fraction) {
      dbSyncMixin.methods.removeSymbol(fraction);
    },
    selectFraction(context, id) {
      context.commit("selectFraction", id);
    },
    unselectAllSymbols(context) {
      context.commit("unselectAllFractions");
    },
    moveSelectedFractions(context, payload) {
      context.commit("moveSelectedFractions", payload);
    },
    updateSelectedFractionCoordinates(context, payload) {
      context.commit("updateSelectedFractionCoordinates", payload);
    },
  },
};
