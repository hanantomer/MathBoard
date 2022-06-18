/// manages line drawing when adding fraction line or sqrt
export default {
  data: function () {
    return {
      linePosition: {
        x1: 0,
        x2: 0,
        y: 0,
      },
    };
  },
  computed: {
    drawLineLeft: function () {
      return Math.min(this.linePosition.x1, this.linePosition.x2) + "px";
    },
    drawLineWidth: function () {
      return Math.abs(this.linePosition.x2 - this.linePosition.x1) + "px";
    },
    drawLineTop: function () {
      return this.linePosition.y + "px";
    },
  },
  methods: {
    getSvgBoundingRect() {
      return document.getElementsByTagName("svg")[0].getBoundingClientRect();
    },
    getNearestRow: function (clickedYPos) {
      let clickedRow = Math.round(clickedYPos / this.matrixMixin_getRectSize());
      return (
        clickedRow * this.matrixMixin_getRectSize() - this.getHeaderHeight() - 8
      );
    },
    addLine: function (row, fromCol, toCol, lineType) {
      let line = {
        type: lineType,
      };
      line.row = row;
      line.fromCol = fromCol;
      line.toCol = toCol;

      this.$store
        .dispatch("addNotation", line)
        .then(() => {
          //          this.userOperationsMixin_syncOutgoingSaveFractionLine(fractionLine);
          ///TODO sync operation
        })
        .catch((e) => {
          console.error(e);
        });
    },
    drawLineMixin_startLineDrawing: function (e) {
      let x = e.clientX;
      let y = this.getNearestRow(e.clientY);
      this.linePosition.x2 = this.linePosition.x1 = x;
      this.linePosition.y = y;
    },
    drawLineMixin_UpdateSelectionArea: function (e) {
      this.linePosition.x2 = e.clientX;
    },
    drawLine_reset: function () {
      this.linePosition.x1 = this.linePosition.x2 = this.linePosition.y = 0;
    },
    drawLineMixin_endDrawLine: function (lineType) {
      let svgBoundingRec = this.getSvgBoundingRect();
      if (this.linePosition.x2 != this.linePosition.x1) {
        let fromCol =
          Math.floor(
            (this.linePosition.x1 - svgBoundingRec.x) /
              this.matrixMixin_getRectSize()
          ) + 1;
        let toCol = Math.ceil(
          (this.linePosition.x2 - svgBoundingRec.x) /
            this.matrixMixin_getRectSize()
        );
        let row = Math.round(
          (this.linePosition.y - this.getHeaderHeight()) /
            this.matrixMixin_getRectSize()
        );
        this.addLine(row, fromCol, toCol, lineType);
      }
    },
  },
};
