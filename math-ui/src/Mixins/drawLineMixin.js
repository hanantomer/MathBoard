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
    lineLeftHandleLeft: function () {
      return Math.min(this.linePosition.x1, this.linePosition.x2) - 5 + "px";
    },
    lineRightHandleLeft: function () {
      return Math.max(this.linePosition.x1, this.linePosition.x2) - 5 + "px";
    },
    drawLineWidth: function () {
      return Math.abs(this.linePosition.x2 - this.linePosition.x1) + "px";
    },
    drawLineTop: function () {
      return this.linePosition.y + "px";
    },
    lineHandleTop: function () {
      return this.linePosition.y - 5 + "px";
    },
  },
  methods: {
    getNearestRow: function (clickedYPos) {
      let clickedRow = Math.round(clickedYPos / this.matrixMixin_getRectSize());
      return clickedRow * this.matrixMixin_getRectSize();
    },
    // either fraction or sqrt
    addLine: function (row, fromCol, toCol, lineType) {
      let line = {
        type: lineType,
      };
      line.row = row;
      line.fromCol = fromCol;
      line.toCol = toCol;

      this.$store
        .dispatch("addNotation", line)
        .then((line) => {
          this.userOperationsMixin_syncOutgoingSaveNotation(line);
        })
        .catch((e) => {
          console.error(e);
        });
    },
    drawLineMixin_startLineEditing: function (selectedLine) {
      let storedNotation = this.getNotations()[selectedLine.id];
      ///TODO handle null

      this.linePosition.x1 = this.getNotationXposByCol(storedNotation.fromCol);

      this.linePosition.x2 =
        this.linePosition.x1 +
        (storedNotation.toCol - storedNotation.fromCol) *
          this.matrixMixin_getRectSize();

      this.linePosition.y = this.getNotationYposByRow(storedNotation.row);
    },
    drawLineMixin_startLineDrawing: function (e) {
      let x = e.offsetX;
      let y = this.getNearestRow(e.offsetY);
      this.linePosition.x2 = this.linePosition.x1 = x;
      this.linePosition.y = y;
    },
    drawLineMixin_UpdateLineWidth: function (e) {
      this.linePosition.x2 = e.offsetX;
    },
    drawLine_reset: function () {
      this.linePosition.x1 = this.linePosition.x2 = this.linePosition.y = 0;
    },
    drawLineMixin_endDrawLine: function (lineType) {
      if (this.linePosition.x2 != this.linePosition.x1) {
        let fromCol = Math.floor(
          this.linePosition.x1 / this.matrixMixin_getRectSize()
        );

        let toCol = Math.ceil(
          this.linePosition.x2 / this.matrixMixin_getRectSize()
        );

        let row = Math.round(
          this.linePosition.y / this.matrixMixin_getRectSize()
        );

        this.addLine(row, fromCol, toCol, lineType);
      }
    },
  },
};
