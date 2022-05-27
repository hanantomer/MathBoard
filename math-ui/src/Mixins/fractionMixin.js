export default {
  methods: {
    fractionMixin_saveFraction(nominatorValue, denominatorValue) {
      let fraction = {
        LessonId: this.lessonId,
        UserId: this.$store.getters.getUser.id,
        nominatorValue: nominatorValue,
        denominatorValue: denominatorValue,
        type: "fraction",
        col: this.getcurrentRect().col,
        row: this.getcurrentRect().row,
      };

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
