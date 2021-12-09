const width = 1000;
const numberOfCols = 100;
const rowHeight = 20;
const xStart = 10;
const yStart = 10;

function getHorizontalStep() {
  return Math.round(width / numberOfCols);
}

export default {
  methods: {
    mixin_getSVGCoordinates: function (x, y) {
      var p = svg.createSVGPoint();
      p.x = x;
      p.y = y;
      var ctm = this.svg.node().getScreenCTM().inverse();
      var p = p.matrixTransform(ctm);
      return p;
    },

    mixin_getClickedNoramalizedPosition: function (clickedPosition) {
      let horizontalStep = getHorizontalStep();
      let xNormalized =
        Math.round(clickedPosition.x / horizontalStep) * horizontalStep;
      let yNormalized = Math.round(clickedPosition.y / rowHeight) * rowHeight;
      return { x: xNormalized, y: yNormalized };
    },
    mixin_getNext: function (symbol, currentPosition) {
      if (!currentPosition.x) {
        currentPosition.x = 0;
        currentPosition.x = y;
      }
      let coeficient = 1;
      switch (symbol) {
        case ")" || "(": {
          coeficient = 0.45;
          break;
        }

        default: {
          coeficient = 0.85;
        }
      }
      let horizontalStep = getHorizontalStep() * coeficient;

      let nextPosition = currentPosition;
      if (nextPosition.x + horizontalStep > width) {
        nextPosition.y += rowHeight;
        nextPosition.x = xStart;
      } else {
        nextPosition.x += Math.round(horizontalStep);
      }

      nextPosition.x = Math.max(xStart, nextPosition.x);
      nextPosition.y = Math.max(yStart, nextPosition.y);
      return nextPosition;
    },
  },
};
