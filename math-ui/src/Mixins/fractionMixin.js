export default {
  data: function () {
    return {};
  },
  methods: {
    fractionMixin_saveFraction(fraction) {
      this.$store
        .dispatch("addFraction", fraction)
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
    fractionMixin_getFractionCharacterXpos(col, charPos) {
      return (
        col * this.matrixMixin_getRectSize() +
        (charPos * this.matrixMixin_getRectSize()) / 2 +
        5
      );
    },
  },
};
