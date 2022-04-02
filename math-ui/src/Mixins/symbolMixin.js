export default {
  methods: {
    symbolMixin_addSymbol(value) {
      let symbol = {
        ExerciseId: this.exerciseId,
        UserId: this.$store.getters.getUser.id,
        value: value,
        //        isNumber: !isNaN(parseInt(value)),
        type: "symbol",
      };

      symbol = Object.assign(symbol, this.getcurrentRect());

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
