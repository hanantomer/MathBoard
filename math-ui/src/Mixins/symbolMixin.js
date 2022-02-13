export default {
  data: function () {
    return {};
  },
  methods: {
    symbolMixin_upsertSymbol(s) {
      let symbol = {
        ExerciseId: this.exerciseId,
        value: s,
        isNumber: !isNaN(parseInt(s)),
      };

      symbol = Object.assign(symbol, this.getSelectedRect());

      this.$store
        .dispatch("upsertSymbol", symbol)
        .then((symbol) => {
          this.mixin_syncOutgoingSymbolUpsert(symbol);

          let nextRect = this.matrixMixin_selectNextRect();
          if (!!nextRect) {
            this.mixin_syncOutgoingSelectedRect(nextRect);
          }
        })
        .catch((e) => {
          console.error(e);
        });
    },

    symbolMixin_removeSymbol: function (e) {
      let rectToremove = this.mixin_getRectByClickedPosition({
        x: e.clientX,
        y: e.clientY,
      });
      if (!rectToremove) return;

      let symbolAtRectPosition = this.$store.getters.getSymbolByRectCoordinates(
        rectToremove
      );
      if (!symbolAtRectPosition) return;

      this.$store
        .dispatch("removeSymbol", symbolAtRectPosition)
        .then(() => {
          this.mixin_syncOutgoingSymbolsDeletion(symbolAtRectPosition);
        })
        .catch((e) => {
          console.error(e);
        });
    },
  },
};
