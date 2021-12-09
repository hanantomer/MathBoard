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
    mixin_updateSelection(e) {
      this.mixin_hideCursor();
      var p = this.mixin_getSVGCoordinates(e.clientX, e.clientY);
      this.selectionPosition.x2 = p.x;
      this.selectionPosition.y2 = p.y;
    },
    async mixin_moveSelection(e) {
      var p = this.mixin_getSVGCoordinates(e.clientX, e.clientY);
      if (this.dragPostion.x === 0) {
        this.dragPostion.x = p.x;
        this.dragPostion.y = p.y;
      } else {
        const deltaX = p.x - this.dragPostion.x;
        const deltaY = p.y - this.dragPostion.y;
        this.moveSelectedNotations({
          deltaX,
          deltaY,
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
    mixin_resetSelection: function () {
      this.selectionPosition.x1 = this.selectionPosition.x2 = this.selectionPosition.y1 = this.selectionPosition.y2 = 0;
    },
    mixin_startSelection: function (e) {
      this.selectionActive = true;
      var p = this.mixin_getSVGCoordinates(e.clientX, e.clientY);
      this.selectionPosition.x2 = this.selectionPosition.x1 = p.x;
      this.selectionPosition.y2 = this.selectionPosition.y1 = p.y;
    },

    mixin_mouseMove(e) {
      if (e.buttons !== 1) {
        return;
      }

      // has selection and not during selection TODO: check if both required
      if (this.isAnnotationSelected && this.selectionActive === false) {
        this.mixin_moveSelection(e);
      } else {
        this.mixin_updateSelection(e);
      }
    },
    mixin_mouseUp(e) {
      if (this.isAnnotationSelected && this.selectionActive === false) {
        this.mixin_endMove(e);
      } else {
        this.mixin_endSelect(e);
      }
    },
    mixin_endMove(e) {
      this.dragPostion.x = 0;
      this.dragPostion.y = 0;
      this.updateNotation;
      this.updateSelectedNotations().then(() =>
        this.mixin_syncOutgoingUpdateSelectedNotations()
      );
    },
    mixin_endSelect: function (e) {
      if (
        this.selectionActive &&
        this.selectionPosition.x2 != this.selectionPosition.x1
      ) {
        this.selectionActive = false;
        this.svg.selectAll("text").each((datum) => {
          if (
            !!datum.id &&
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
