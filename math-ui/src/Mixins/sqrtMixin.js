export default {
  ///TODO same as fraction line position
  data: function () {
    return {
      sqrtLinePosition: {
        x1: 0,
        x2: 0,
        y: 0,
      },
    };
  },
  computed: {
    sqrtLineLeft: function () {
      return (
        Math.min(this.sqrtLinePosition.x1, this.sqrtLinePosition.x2) + "px"
      );
    },
    sqrtLineWidth: function () {
      return (
        Math.abs(this.sqrtLinePosition.x2 - this.sqrtLinePosition.x1) + "px"
      );
    },
    sqrtLineTop: function () {
      return this.sqrtLinePosition.y + "px";
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
    addFractionLine: function (row, fromCol, toCol) {
      let fractionLine = {
        type: "fractionLine",
      };
      fractionLine.row = row;
      fractionLine.fromCol = fromCol;
      fractionLine.toCol = toCol;

      this.$store
        .dispatch("addNotation", fractionLine)
        .then(() => {
          //          this.userOperationsMixin_syncOutgoingSaveFractionLine(fractionLine);
        })
        .catch((e) => {
          console.error(e);
        });
    },
    fractionLineMixin_startLineDrawing: function (e) {
      let x = e.clientX;
      let y = this.getNearestRow(e.clientY);
      this.fractionLinePosition.x2 = this.fractionLinePosition.x1 = x;
      this.fractionLinePosition.y = y;
    },
    fractionLineMixin_UpdateSelectionArea: function (e) {
      this.fractionLinePosition.x2 = e.clientX;
    },
    fractionLine_reset: function (e) {
      this.x1 = this.x2 = this.y = 0;
    },
    fractionLineMixin_endDrawLine: function (e) {
      let svgBoundingRec = this.getSvgBoundingRect();
      if (this.fractionLinePosition.x2 != this.fractionLinePosition.x1) {
        let fromCol =
          Math.floor(
            (this.fractionLinePosition.x1 - svgBoundingRec.x) /
              this.matrixMixin_getRectSize()
          ) + 1;
        let toCol = Math.ceil(
          (this.fractionLinePosition.x2 - svgBoundingRec.x) /
            this.matrixMixin_getRectSize()
        );
        let row = Math.round(
          (this.fractionLinePosition.y - this.getHeaderHeight()) /
            this.matrixMixin_getRectSize()
        );
        this.addFractionLine(row, fromCol, toCol);
      }
    },
  },
};
