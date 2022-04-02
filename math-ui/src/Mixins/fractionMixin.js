export default {
  data: function () {
    return {};
  },
  methods: {
    fractionMixin_saveFraction(nimnatorValue, denominatorValue) {
      let fraction = {
        ExerciseId: this.exerciseId,
        UserId: this.$store.getters.getUser.id,
        nimnatorValue: nimnatorValue,
        denominatorValue: denominatorValue,
        type: "fraction",
      };

      fraction = Object.assign(fraction, this.getcurrentRect());

      this.$store
        .dispatch("addFraction", fraction)
        .then((fraction) => {
          this.userOperationsMixin_syncOutgoingSaveNotation(fraction);
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
