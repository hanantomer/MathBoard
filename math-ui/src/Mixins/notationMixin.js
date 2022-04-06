export default {
  methods: {
    getNotationXposByCol(col) {
      return col * this.matrixMixin_getRectSize();
    },
    getNotationYposByRow(row) {
      return row * this.matrixMixin_getRectSize();
    },
    notationMixin_moveSelection: function (e) {
      this.selectionMixin_endMoveSelection(e);
      this.$store
        .dispatch("updateSelectedNotationCoordinates")
        .then(() =>
          this.userOperationsMixin_syncOutgoingUpdateSelectedNotations()
        );
    },
    notationMixin_removeNotation: function (e) {
      let currentRect = this.matrixMixin_findClickedObject(
        {
          x: e.clientX,
          y: e.clientY,
        },
        "rect"
      );

      if (!currentRect) return;

      let notationAtRectPosition = this.$store.getters.getNotationByRectCoordinates(
        {
          row: currentRect.parentNode.attributes.row.value,
          col: currentRect.attributes.col.value,
        }
      );
      if (!notationAtRectPosition) return;

      this.$store
        .dispatch("removeNotation", {
          col: notationAtRectPosition[1].col,
          row: notationAtRectPosition[1].row,
        })
        .then(() => {
          this.userOperationsMixin_syncOutgoingRemoveNotation([
            notationAtRectPosition[1],
          ]);
        })
        .catch((e) => {
          console.error(e);
        });
    },
  },
};
