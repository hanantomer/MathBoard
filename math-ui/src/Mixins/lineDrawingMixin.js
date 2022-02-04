export default {
  data: function () {
    return {
      lineDrawingPosition: {
        x1: 0,
        x2: 0,
        y: 0,
      },
    };
  },
  methods: {
    //drawMixin_startLineDrawing: function (e) {
    //  this.lineDrawingPosition.x2 = this.lineDrawingPosition.x1 = e.clientX;
    //},
    drawMixin_drawLine: function (e) {
      this.lineDrawingPosition.x2 = e.clientX;
      if (this.lineDrawingPosition.x2 < this.lineDrawingPosition.x1) {
        // transpose x1 and x2 if needed
        let x1Temp = this.lineDrawingPosition.x1;
        this.lineDrawingPosition.x1 = this.lineDrawingPosition.x2;
        this.lineDrawingPosition.x1 = x1Temp;
      }
      this.SetLine(this.lineDrawingPosition);
    },
  },
};
