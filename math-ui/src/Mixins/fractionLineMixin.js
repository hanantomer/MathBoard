export default {
  data: function () {
    return {
      fractionLinePosition: {
        x1: 0,
        x2: 0,
        y: 0,
      },
    };
  },
  computed: {
    fractionLineLeft: function () {
      return (
        Math.min(this.fractionLinePosition.x1, this.fractionLinePosition.x2) +
        "px"
      );
    },
    fractionLineWidth: function () {
      return (
        Math.abs(this.fractionLinePosition.x2 - this.fractionLinePosition.x1) +
        "px"
      );
    },
    fractionLineTop: function () {
      return this.fractionLinePosition.y + "px";
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
