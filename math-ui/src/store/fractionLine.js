import dbSyncMixin from "../Mixins/dbSyncMixin";

const helper = {
  findLineByCoordinates: function (state, line) {
    return state.lines.find(
      (n) =>
        (n.x1 >= line.x1 && n.x1 <= line.x2) ||
        (n.x2 <= line.x2 && n.x2 >= line.x2)
    );
  },
};

export default {
  modules: {
    dbSyncMixin,
  },
  state: {
    lines: [],
  },
  getters: {
    getLines: (state) => {
      return state.lines;
    },
    isAnyLineSelected(state) {
      return state.lines.find((e) => e.selected === true);
    },
    getSelectedLines: (state) => {
      return state.lines.filter((n) => !!n && n.selected == true);
    },
  },
  mutations: {
    addLine(state, line) {
      Vue.set(line, "selected", false);
      let oldLine = helper.findLineByCoordinates(state, line);
      if (!!oldLine) {
        oldLine.x1 = line.x1;
        oldLine.x2 = line.x2;
      } else {
        state.lines.push(line);
      }
    },
    selectLine(state, id) {
      let line = helper.findLineById(state, id);
      delete line.selected; // for reactivity
      Vue.set(line, "selected", true);
    },
    unselectAllLines(state) {
      state.lines
        .filter((n) => n.selected === true)
        .forEach((n) => {
          delete n.selected; // for reactivity
          Vue.set(n, "selected", false);
        });
    },
  },
  actions: {
    async loadLines(context, exerciseId) {
      context.commit("removeAllLines");
      dbSyncMixin.methods.getAllLines(exerciseId).then((liness) => {
        symbols.forEach((line) => {
          context.commit("addLine", line);
        });
      });
    },
    removeSelectedLines(context) {
      // commit is called by syncIncomingDeletedNotaion
      dbSyncMixin.methods.removeLines(context.getters.getSelectedLines);
    },
    selectLine(context, id) {
      context.commit("selectLine", id);
    },
    unselectAllLines(context) {
      context.commit("unselectAllLines");
    },
    moveSelectedLines(context, payload) {
      context.commit("moveSelectedLines", payload);
    },
    updateSelectedLineCoordinates(context, payload) {
      context.commit("updateSelectedLineCoordinates", payload);
    },
  },
};
