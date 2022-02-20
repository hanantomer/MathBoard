export default {
  data: function () {
    return {};
  },
  methods: {
    fractionMixin_saveFraction(symbol) {
      this.$store
        .dispatch("saveFraction", symbol)
        .then((fraction) => {
          this.mixin_syncOutgoingFractionAdding(symbol);

          let nextRect = this.matrixMixin_selectNextFractionRect();
          if (!!nextRect) {
            this.mixin_syncOutgoingSelectedFractionRect(nextRect);
          }
        })
        .catch((e) => {
          console.error(e);
        });
    },
  },
};
