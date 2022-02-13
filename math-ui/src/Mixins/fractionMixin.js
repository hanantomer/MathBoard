export default {
  data: function () {
    return {};
  },
  methods: {
    fractionMixin_upsertFraction(f) {
      let fraction = {
        ExerciseId: this.exerciseId,
        nominatorValues: f.nominatorValues,
        deNominatorValues: f.deNominatorValues,
      };

      //TODO remov symbol type number or whatever

      symbol = Object.assign(symbol, this.getSelectedRect());

      this.$store
        .dispatch("upsertFraction", symbol)
        .then((symbol) => {
          this.mixin_syncOutgoingFractionAdding(symbol);

          let nextRect = this.matrixMixin_selectNextRect();
          if (!!nextRect) {
            this.mixin_syncOutgoingSelectedRect(nextRect);
          }
        })
        .catch((e) => {
          console.error(e);
        });
    },
  },
};
