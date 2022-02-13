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
    selectedRect: { x: 10, y: 20 },
  },
  getters: {
    getSymbols: (state) => {
      return state.symbols;
    },
    getSelectedRect: (state) => {
      return state.selectedRect;
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
    upsertSymbol(state, symbol) {
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

    setSelectedRect(state, selectedRect) {
      Vue.set(state, "selectedRect", selectedRect);
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

    addLine(state, line) {
      Vue.set(line, "selected", false);
      let oldLine = helper.findLineByCoordinates(state, line);
      if (!oldLine) {
        state.lines.push(line);
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
      context.commit("removeAllLines");
      dbSyncMixin.methods.getAllLines(exerciseId).then((liness) => {
        symbols.forEach((line) => {
          context.commit("addLine", line);
        });
      });
    },

    async loadSymbols(context, exerciseId) {
      context.commit("removeAllSymbols");
      dbSyncMixin.methods.getAllSymbols(exerciseId).then((symbols) => {
        symbols.forEach((symbol) => {
          context.commit("addSymbol", symbol);
        });
      });
    },
    upsertSymbol(context, symbol) {
      return dbSyncMixin.methods.upsertSymbol(symbol);
    },
    syncIncomingAddedSymbol(context, symbol) {
      context.commit("addSymbol", symbol);
    },
    syncIncomingDeletedSymbol(context, symbol) {
      context.commit("removeSymbol", symbol);
    },
    syncIncomingUpdatedSymbol(context, symbol) {
      context.commit("upsertSymbol", symbol);
    },
    removeSymbol(context, symbol) {
      dbSyncMixin.methods.removeSymbol(symbol);
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
    setSelectedRect(context, payload) {
      context.commit("setSelectedRect", payload);
    },
    setDimensions(context, payload) {
      context.commit("setNumberOfCols", payload.numberOfCols);
      context.commit("setNumberOfRows", payload.numberOfRows);
    },
  },
};
