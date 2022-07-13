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
      let selectedNotations = this.getSelectedNotations();
      this.$store
        .dispatch("updateSelectedNotationCoordinates")
        .then(() =>
          selectedNotations.forEach((n) =>
            this.userOperationsMixin_syncOutgoingUpdateSelectedNotation(n)
          )
        );
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
      this.romoveNotations(this.getSelctedRect());
    },
    async romoveNotations(rect) {
      let notationsToDelete = await this.$store.dispatch(
        "removeNotations",
        rect
      );
      if (!!notationsToDelete) {
        notationsToDelete.forEach((notation) =>
          this.userOperationsMixin_syncOutgoingRemoveNotation(notation)
        );
      }
    },
  },
};
