const width = 1000;
const numberOfCols = 100;
const rowHeight = 20;
//const xStart = 10;
//const yStart = 10;
var p;

function getHorizontalStep() {
  return Math.round(width / numberOfCols);
}

export default {
  methods: {
    // positionMixin_getSVGCoordinates: function (x, y) {
    //   if (!p) {
    //     p = svg.createSVGPoint();
    //   }
    //   p.x = x;
    //   p.y = y;
    //   let ctm = this.svg.node().getScreenCTM().inverse();
    //   let psvg = p.matrixTransform(ctm);
    //   return psvg;
    // },
    // positionMixin_getClickedNoramalizedPosition: function (clickedPosition) {
    //   let p = this.positionMixin_getSVGCoordinates(
    //     clickedPosition.x,
    //     clickedPosition.y
    //   );
    //   let horizontalStep = getHorizontalStep();
    //   let xNormalized =
    //     Math.round(clickedPosition.x / horizontalStep) * horizontalStep;
    //   let yNormalized = Math.round(clickedPosition.y / rowHeight) * rowHeight;
    //   return { x: xNormalized, y: yNormalized };
    // },
  },
};
