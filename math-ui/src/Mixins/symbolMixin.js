export default {
  methods: {
    symbolMixin_addSymbol(value) {
      let symbol = {
        value: value,
        type: "symbol",
      };
      symbol.col = this.getcurrentRect().col;
      symbol.row = this.getcurrentRect().row;

      this.$store
        .dispatch("addNotation", symbol)
        .then(() => {
          this.userOperationsMixin_syncOutgoingSaveNotation(symbol);
        })
        .then(() => {
          let nextRect = this.matrixMixin_getNextRect();
          if (!!nextRect) {
            nextRect.type = "rect";
            this.$store.dispatch("setCurrentRect", nextRect);
            this.userOperationsMixin_syncOutgoingCurrentPosition(nextRect);
          }
        })
        .catch((e) => {
          console.error(e);
        });
    },
  },
};
