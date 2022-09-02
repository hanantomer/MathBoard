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
          this.matrixMixin_setNextRect(1, 0);
        })
        .catch((e) => {
          console.error(e);
        });
    },
  },
};
