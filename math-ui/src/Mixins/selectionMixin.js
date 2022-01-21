export default {
  data: function () {
    return {
      selectionPosition: {
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 0,
      },
      selectionActive: false,
      dragPostion: {
        x: 0,
        y: 0,
      },
    };
  },
  methods: {
    // extend or shrink selection area
    updateSelectionArea(e) {
      this.mixin_hideCursor();
      this.selectionPosition.x2 = e.clientX;
      this.selectionPosition.y2 = e.clientY - 50;
    },
    //move selection area
    async mixin_moveSelection(e) {
      let rectSize = this.mixin_getRectSize();
      if (this.dragPostion.x === 0) {
        this.dragPostion.x = e.clientX;
        this.dragPostion.y = e.clientY;
      } else {
        const deltaX = e.clientX - this.dragPostion.x;
        const deltaY = e.clientY - this.dragPostion.y;

        // consider meaningfull move only
        if (deltaX < rectSize && deltaY < rectSize) {
          return;
        }

        this.moveSelectedSymbols({
          deltaX,
          deltaY,
          rectSize,
        }).then(() => {
          this.selectionPosition.x1 += deltaX;
          this.selectionPosition.y1 += deltaY;
          this.selectionPosition.x2 += deltaX;
          this.selectionPosition.y2 += deltaY;
          this.dragPostion.x = e.clientX;
          this.dragPostion.y = e.clientY;
        });
      }
    },
    mixin_resetSelection: function () {
      this.selectionPosition.x1 = this.selectionPosition.x2 = this.selectionPosition.y1 = this.selectionPosition.y2 = 0;
    },
    mixin_startSelection: function (e) {
      this.selectionActive = true;
      this.selectionPosition.x2 = this.selectionPosition.x1 = e.clientX;
      this.selectionPosition.y2 = this.selectionPosition.y1 = e.clientY - 50;
    },
    mixin_mouseMove(e) {
      if (e.buttons !== 1) {
        return;
      }
      // during move
      if (this.isAnySymbolSelected && this.selectionActive === false) {
        this.mixin_moveSelection(e);
      }
      // during selection
      if (this.selectionActive === true) {
        this.updateSelectionArea(e);
      }
    },
    mixin_canvasMouseUp(e) {
      if (this.selectionActive) {
        this.mixin_endSelect(e);
      }
    },
    mixin_endMove(e) {
      this.dragPostion.x = 0;
      this.dragPostion.y = 0;
      this.updateSelectedSymbolCoordinates().then(() =>
        this.mixin_syncOutgoingUpdateSelectedSymbols()
      );
    },
    mixin_endSelect: function (e) {
      if (
        this.selectionActive &&
        this.selectionPosition.x2 != this.selectionPosition.x1
      ) {
        this.selectionActive = false;
        var p1 = this.mixin_getSVGCoordinates(
          this.selectionPosition.x1,
          this.selectionPosition.y1
        );
        var p2 = this.mixin_getSVGCoordinates(
          this.selectionPosition.x2,
          this.selectionPosition.y2
        );

        this.svg.selectAll("text").each((datum) => {
          if (
            !!datum.id &&
            this.$getXpos(datum.col) > p1.x &&
            this.$getXpos(datum.col) < p2.x &&
            this.$getYpos(datum.row) > p1.y + 50 &&
            this.$getYpos(datum.row) < p2.y + 50
          ) {
            this.selectSymbol(datum.id);
          }
        });
      }
    },
  },
};
