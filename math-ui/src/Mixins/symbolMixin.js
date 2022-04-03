export default {
  methods: {
    symbolMixin_addSymbol(value) {
      let symbol = {
        ExerciseId: this.exerciseId,
        UserId: this.$store.getters.getUser.id,
        value: value,
        type: "symbol",
      };
      symbol.col = this.getcurrentRect().col;
      symbol.row = this.getcurrentRect().row;

      this.$store
        .dispatch("addSymbol", symbol)
        .then(() => {
          this.userOperationsMixin_syncOutgoingSaveNotation(symbol);
          let nextRect = this.matrixMixin_getNextRect();
          if (!!nextRect) {
            nextRect.type = "rect";
            this.userOperationsMixin_syncOutgoingCurrentPosition(nextRect);
          }
        })
        .catch((e) => {
          console.error(e);
        });
    },
  },
};
