/// TOD unite with symbol mixin

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
      this.romoveActiveCellNotations();
      this.romoveActiveNotations();
    },
    async romoveActiveCellNotations() {
      let cell = this.getActiveCell();
      let notationsToDelete = await this.$store.dispatch(
        "removeNotationsByCell",
        cell
      );
      if (!!notationsToDelete) {
        notationsToDelete.forEach((notation) =>
          this.userOperationsMixin_syncOutgoingRemoveNotation(notation)
        );
      }
    },
    async romoveActiveNotations() {
      let notationToDelete = await this.$store.dispatch("removeActiveNotation");
      if (!!notationToDelete) {
        this.userOperationsMixin_syncOutgoingRemoveNotation(notationToDelete);
      }
    },
  },
};
