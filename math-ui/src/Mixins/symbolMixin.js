export default {
  data: function () {
    return { symbolFontSize: "1.8em" };
  },
  methods: {
    symbolMixin_createSymbol(s) {
      let symbol = {
        ExerciseId: this.exerciseId,
        value: s,
        isNumber: !isNaN(parseInt(s)),
      };

      symbol = Object.assign(symbol, this.getSelectedRect());

      this.$store
        .dispatch("addSymbol", symbol)
        .then(() => {
          this.mixin_syncOutgoingSaveNotation(symbol);
          let nextRect = this.matrixMixin_getNextRect();
          if (!!nextRect) {
            this.mixin_syncOutgoingSelectRect(nextRect);
          }
        })
        .catch((e) => {
          console.error(e);
        });
    },
    symbolMixin_moveSelection: function (e) {
      this.selectionMixin_endMoveSelection(e);
      this.$store
        .dispatch("updateSelectedNotationCoordinates")
        .then(() => this.mixin_syncOutgoingUpdateSelectedNotations());
    },
    symbolMixin_removeSymbol: function (e) {
      let rectToremove = this.mixin_getRectByClickedPosition({
        x: e.clientX,
        y: e.clientY,
      });
      if (!rectToremove) return;

      let symbolAtRectPosition = this.$store.getters.getNotationByRectCoordinates(
        rectToremove
      );
      if (!symbolAtRectPosition) return;

      this.$store
        .dispatch("removeNotation", symbolAtRectPosition)
        .then(() => {
          this.mixin_syncOutgoingRemoveNotation(symbolAtRectPosition);
        })
        .catch((e) => {
          console.error(e);
        });
    },
    getSymbolXposByCol(col) {
      return col * this.matrixMixin_getRectSize() + 10;
    },
    getSymbolYposByRow(row) {
      return row * this.matrixMixin_getRectSize() + 10;
    },
  },
};
