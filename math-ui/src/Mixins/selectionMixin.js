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
    updateSelection(e) {
      this.cursorMixin_hide();
      var p = this.positionMixin_getSVGCoordinates(e.clientX, e.clientY);
      this.selectionPosition.x2 = p.x;
      this.selectionPosition.y2 = p.y;
    },
    async moveSelection(e) {
      var p = this.positionMixin_getSVGCoordinates(e.clientX, e.clientY);
      console.log(p.x);
      if (this.dragPostion.x === 0) {
        this.dragPostion.x = p.x;
        this.dragPostion.y = p.y;
      } else {
        const deltaX = p.x - this.dragPostion.x;
        const deltaY = p.y - this.dragPostion.y;
        await this.moveSelectedNotations({
          deltaX: deltaX,
          deltaY: deltaY,
        }).then(() => {
          this.selectionPosition.x1 += deltaX;
          this.selectionPosition.y1 += deltaY;
          this.selectionPosition.x2 += deltaX;
          this.selectionPosition.y2 += deltaY;
          this.dragPostion.x = p.x;
          this.dragPostion.y = p.y;
        });
      }
    },
    selectionMixin_reset: function () {
      this.selectionPosition.x1 = this.selectionPosition.x2 = this.selectionPosition.y1 = this.selectionPosition.y2 = 0;
    },
    selectionMixin_start: function (e) {
      this.selectionActive = true;
      var p = this.positionMixin_getSVGCoordinates(e.clientX, e.clientY);
      this.selectionPosition.x2 = this.selectionPosition.x1 = p.x;
      this.selectionPosition.y2 = this.selectionPosition.y1 = p.y;
    },

    // selectionMixin_update(e) {
    //   if (this.selectionActive && e.buttons === 1) {
    //     this.cursorMixin_hide();
    //     var p = this.positionMixin_getSVGCoordinates(e.clientX, e.clientY);
    //     this.selectionPosition.x2 = p.x;
    //     this.selectionPosition.y2 = p.y;
    //   }
    // },
    async selectionMixin_move(e) {
      if (e.buttons !== 1) {
        return;
      }

      if (this.isAnnotationSelected && this.selectionActive == false) {
        this.moveSelection(e);
      } else {
        this.updateSelection(e);
      }
    },
    selectionMixin_mouseup(e) {
      if (this.isAnnotationSelected && this.selectionActive == false) {
        this.endMove(e);
      } else {
        this.endSelect(e);
      }
    },
    endMove(e) {
      this.dragPostion.x = 0;
      this.dragPostion.y = 0;
      this.updateSelectedNotations();
    },
    endSelect: function (e) {
      if (
        this.selectionActive &&
        this.selectionPosition.x2 != this.selectionPosition.x1
      ) {
        this.selectionActive = false;
        this.svg.selectAll("text").each((datum) => {
          if (
            datum.x > this.selectionPosition.x1 &&
            datum.x < this.selectionPosition.x2 &&
            datum.y > this.selectionPosition.y1 &&
            datum.y < this.selectionPosition.y2
          ) {
            this.selectNotation(datum.id);
          }
        });
      }
    },
  },
};
