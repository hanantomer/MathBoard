import Vue from "vue";
import dbSyncMixin from "../Mixins/dbSyncMixin";

const helper = {
  // findFractionSymbolById: function (state, id) {
  //   return state.symbols.find((n) => n.id === id);
  // },
  findFractionByCoordinates: function (state, rect) {
    return state.fractions.find((n) => n.col == rect.col && n.row == rect.row);
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
    addFraction(state, fraction) {
      Vue.set(fraction, "selected", false);
      let oldFraction = helper.findFractionByCoordinates(state, fraction);
      if (!!oldFraction) {
        delete oldFraction.value;
        Vue.set(oldFraction, "value", fraction.value);
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
        fractions.forEach((fraction) => {
          context.commit("addFraction", fraction);
        });
      });
    },
    saveFraction(context, fraction) {
      let exsitingFraction = helper.findFractionByCoordinates(
        context.state,
        context.rootState.rectStore.selectedRect
      );
      if (!exsitingFraction) {
        fraction = { ...fraction, ...context.rootState.rectStore.selectedRect };
      }
      return dbSyncMixin.methods.saveFraction(fraction).then((fraction) => {
        context.commit("addFraction", fraction);
        return fraction;
      });
    },
    syncIncomingAddedFraction(context, fraction) {
      context.commit("addFraction", fraction);
    },
    syncIncomingDeletedFraction(context, fraction) {
      context.commit("removeFraction", fraction);
    },
    syncIncomingUpdatedFraction(context, fraction) {
      context.commit("saveFraction", fraction);
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
