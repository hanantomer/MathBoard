export default {
  methods: {
    getNotationXposByCol(col) {
      return col * this.matrixMixin_getRectSize();
    },
    getNotationYposByRow(row) {
      return row * this.matrixMixin_getRectSize();
    },
    notationMixin_removeNotationsAtMousePosition: function (e) {
      let rectAtMousePosition = this.matrixMixin_findClickedObject(
        {
          x: e.clientX,
          y: e.clientY,
        },
        "rect"
      );
      if (!rectAtMousePosition) return;
      this.romoveNotations({
        row: rectAtMousePosition.parentNode.attributes.row.value,
        col: rectAtMousePosition.attributes.col.value,
      });
    },
    notationMixin_removeNotationAtSeletedPosition() {
      this.romoveNotations(this.getActiveCellArr()[0]);
    },
    async romoveNotations(point) {
      let notationsToDelete = await this.$store.dispatch(
        "removeNotationsByCell",
        point
      );
      if (!!notationsToDelete) {
        notationsToDelete.forEach((notation) =>
          this.userOperationsMixin_syncOutgoingRemoveNotation(notation)
        );
      }
    },
  },
};
