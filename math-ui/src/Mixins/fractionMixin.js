export default {
  data: function () {
    return {};
  },
  methods: {
    fractionMixin_saveFraction(symbol) {
      symbol.isFraction = true;
      this.$store
        .dispatch("addNotation", symbol)
        .then((fraction) => {
          this.mixin_syncOutgoingSaveNotation(fraction);

          let nextRect = this.matrixMixin_getNextFractionRect();
          if (!!nextRect) {
            this.mixin_syncOutgoingSelectRect(nextRect);
          }
        })
        .catch((e) => {
          console.error(e);
        });
    },
    getFractionCharacterXpos(col, charPos) {
      return (
        col * this.matrixMixin_getRectSize() +
        (charPos * this.matrixMixin_getRectSize()) / 2 +
        5
      );
    },
  },
};
