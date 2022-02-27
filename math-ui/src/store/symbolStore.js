import Vue from "vue";
import dbSyncMixin from "../Mixins/dbSyncMixin";

const helper = {
  findSymbolById: function (state, id) {
    return state.symbols.find((n) => n.id === id);
  },
  findSymbolByCoordinates: function (state, rect) {
    return state.symbols.find((n) => n.col == rect.col && n.row == rect.row);
  },
};

export default {
  modules: {
    dbSyncMixin,
  },
  state: {
    symbols: [],
  },
  getters: {
    getSymbols: (state) => {
      return state.symbols;
    },
    // at least one symbol is selected
    isAnySymbolSelected(state) {
      return state.symbols.find((e) => e.selected === true);
    },
    getSelectedSymbols: (state) => {
      return state.symbols.filter((n) => !!n && n.selected == true);
    },
    getSymbolByRectCoordinates(state) {
      return (rect) => {
        return helper.findSymbolByCoordinates(state, rect);
      };
    },
  },
  mutations: {
    saveSymbol(state, symbol) {
      let oldSymbol = helper.findSymbolById(state, symbol.id);
      if (!!oldSymbol) {
        delete oldSymbol.col; // for reactivity
        delete oldSymbol.row;
        Vue.set(oldSymbol, "col", symbol.col);
        Vue.set(oldSymbol, "row", symbol.row);
      } else {
        state.symbols.push(symbol);
      }
    },
    addSymbol(state, symbol) {
      Vue.set(symbol, "selected", false);
      let oldSymbol = helper.findSymbolByCoordinates(state, symbol);
      if (!!oldSymbol) {
        delete oldSymbol.value;
        Vue.set(oldSymbol, "value", symbol.value);
      } else {
        state.symbols.push(symbol);
      }
    },
    removeSymbol(state, symbol) {
      state.symbols = state.symbols.filter(
        (n) => !(n.col === symbol.col && n.row === symbol.row)
      );
    },
    updateSelectedSymbolCoordinates(state) {
      state.symbols
        .filter((symbol) => symbol.selected === true)
        .forEach(
          async (symbol) =>
            await dbSyncMixin.methods.updateSymbolCoordinates(symbol)
        );
    },
    selectSymbol(state, id) {
      let symbol = helper.findSymbolById(state, id);
      delete symbol.selected; // for reactivity
      Vue.set(symbol, "selected", true);
    },
    unselectAllSymbols(state) {
      state.symbols
        .filter((n) => n.selected === true)
        .forEach((n) => {
          delete n.selected; // for reactivity
          Vue.set(n, "selected", false);
        });
    },
    moveSelectedSymbols(state, payload) {
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
    removeAllSymbols(state, payload) {
      state.symbols = [];
    },
  },
  actions: {
    async loadSymbols(context, exerciseId) {
      context.commit("removeAllSymbols");
      dbSyncMixin.methods.getAllSymbols(exerciseId).then((symbols) => {
        symbols.forEach((symbol) => {
          context.commit("addSymbol", symbol);
        });
      });
    },
    addSymbol(context, symbol) {
      dbSyncMixin.methods.saveSymbol(symbol).then((symbol) => {
        context.commit("addSymbol", symbol);
        return symbol;
      });
    },
    syncIncomingAddedSymbol(context, symbol) {
      context.commit("addSymbol", symbol);
    },
    syncIncomingDeletedSymbol(context, symbol) {
      context.commit("removeSymbol", symbol);
    },
    syncIncomingUpdatedSymbol(context, symbol) {
      context.commit("saveSymbol", symbol);
    },
    removeSymbol(context, symbol) {
      dbSyncMixin.methods
        .removeSymbol(symbol)
        .then(() => context.commit("removeSymbol", symbol));
    },
    selectSymbol(context, id) {
      context.commit("selectSymbol", id);
    },
    unselectAllSymbols(context) {
      context.commit("unselectAllSymbols");
    },
    moveSelectedSymbols(context, payload) {
      context.commit("moveSelectedSymbols", payload);
    },
    updateSelectedSymbolCoordinates(context, payload) {
      context.commit("updateSelectedSymbolCoordinates", payload);
    },
  },
};
