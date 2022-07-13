export default {
  methods: {
    symbolMixin_addSymbol(value, type) {
      let symbol = {
        value: value,
        type: type,
      };
      symbol.col = this.getSelctedRect().col;
      symbol.row = this.getSelctedRect().row;

      this.$store
        .dispatch("addNotation", symbol)
        .then((symbol) => {
          this.userOperationsMixin_syncOutgoingSaveNotation(symbol);
        })
        .then(() => {
          let nextRect = this.matrixMixin_getNextRect();
          if (!!nextRect) {
            nextRect.type = "rect";
            this.$store.dispatch("setSelectedRect", nextRect);
            this.userOperationsMixin_syncOutgoingSelectedPosition(nextRect);
          }
        })
        .catch((e) => {
          console.error(e);
        });
    },
  },
};
