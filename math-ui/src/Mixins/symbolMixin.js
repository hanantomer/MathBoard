export default {
  data: function () {
    return {};
  },
  methods: {
    symbolMixin_setCurrentRect(e) {
      let normalizedClickedPosition = this.positionMixin_getClickedNoramalizedPosition(
        {
          x: e.clientX,
          y: e.clientY,
        }
      );
      let selectedRect = this.mixin_selectRectByClickedPosition(
        normalizedClickedPosition
      );
      this.mixin_syncOutgoingSelectedRect(selectedRect);
    },
    symbolMixin_removeSymbol: function (e) {
      let rect = this.matrixMixin_findRect(e.clientX, e.clientY);
      if (!rect) return;

      let symbolAtRectPosition = this.$store.getters.getSymbolByRectCoordinates(
        {
          row: rect.parentNode.attributes.row.value,
          col: rect.attributes.col.value,
        }
      );
      if (!symbolAtRectPosition) return;

      this.$store
        .dispatch("removeSymbol", symbolAtRectPosition)
        .then(() => {
          this.mixin_syncOutgoingSymbolsDeletion(symbolAtRectPosition);
        })
        .catch((e) => {
          console.error(e);
        });
    },
  },
};
