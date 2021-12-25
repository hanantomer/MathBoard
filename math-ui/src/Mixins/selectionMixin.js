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
      //const boundBox = e.target.getBoundingClientRect();
      this.mixin_hideCursor();
      //var p = this.mixin_getSVGCoordinates(e.clientX, e.clientY);
      this.selectionPosition.x2 = e.clientX;
      this.selectionPosition.y2 = e.clientY - 50;
    },
    async mixin_moveSelection(e) {
      //const boundBox = e.target.getBoundingClientRect();
      //var p = this.mixin_getSVGCoordinates(e.clientX, e.clientY);
      if (this.dragPostion.x === 0) {
        this.dragPostion.x = e.clientX;
        this.dragPostion.y = e.clientY;
      } else {
        const deltaX = e.clientX - this.dragPostion.x;
        const deltaY = e.clientY - this.dragPostion.y;
        this.moveSelectedNotations({
          deltaX,
          deltaY,
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
      const boundBox = e.target.getBoundingClientRect();
      //var pSvg = this.mixin_getSVGCoordinates(e.clientX, e.clientY);
      this.selectionPosition.x2 = this.selectionPosition.x1 = e.clientX;
      //this.selectionPosition.x2 += 10;
      this.selectionPosition.y2 = this.selectionPosition.y1 = e.clientY - 50;
      //this.selectionPosition.y2 += 10;
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
    mixin_canvasMouseUp(e) {
      if (this.selectionActive) {
        this.mixin_endSelect(e);
      }
    },
    mixin_svgMouseUp(e) {
      if (this.isAnnotationSelected && this.selectionActive === false) {
        this.mixin_endMove(e);
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
            datum.x > p1.x &&
            datum.x < p2.x &&
            datum.y > p1.y + 50 &&
            datum.y < p2.y + 50
          ) {
            this.selectNotation(datum.id);
          }
        });
      }
    },
  },
};
