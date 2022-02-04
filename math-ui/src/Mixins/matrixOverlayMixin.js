import * as d3 from "d3";

/// TODO encapsulate in data
var opacity = 1;
var opacity;
var colsNum = 50;
var rowsNum = 50;
var rectSize = 20;
var matrix = [];
var topLevelGroup;
var selectedRect = null;
var selectedRecColor = "lightcyan";

function toglleSelectedRect(clickedRect) {
  if (!!selectedRect) selectedRect.style.fill = "";
  selectedRect = clickedRect;
  clickedRect.style.fill =
    clickedRect.style.fill == selectedRecColor ? "" : selectedRecColor;
}

export default {
  methods: {
    //https://stackoverflow.com/questions/30755696/get-svg-object-s-at-given-coordinates
    matrixMixin_findRect: function (x, y) {
      var elements = [],
        current = document.elementFromPoint(x, y);
      while (current && current.nearestViewportElement) {
        elements.push(current);
        // hide the element and look again
        current.style.display = "none";
        current = document.elementFromPoint(x, y);
      }
      // restore the display
      elements.forEach(function (elm) {
        elm.style.display = "";
      });
      return elements.find((e) => e.tagName == "rect");
    },
    matrixMixin_setMatrix: function () {
      for (var row = 0; row < rowsNum; row++) {
        matrix.push(d3.range(colsNum));
      }

      topLevelGroup = d3
        .select("svg")
        .selectAll("g")
        .data(matrix)
        .enter()
        .append("g")
        .attr("row", (d, i) => {
          return i;
        })
        .lower()
        .attr("transform", (d, i) => {
          return "translate(0, " + rectSize * i + ")";
        });

      topLevelGroup
        .selectAll("rect")
        .data(matrix)
        .enter()
        .append("rect")
        .attr("fill", "white")
        .attr("stroke-opacity", opacity)
        .style("stroke", "lightgray")
        .attr("col", (d, i) => {
          return i;
        })
        .attr("x", (d, i) => {
          return i * rectSize;
        })
        .attr("width", rectSize)
        .attr("height", rectSize);
    },
    matrixMixin_toggleMatrixOverlay: function () {
      if (opacity === 1) opacity = 0.1;
      else opacity = 1;

      topLevelGroup.selectAll("rect").attr("stroke-opacity", opacity);
    },
    mixin_selectRectByClickedPosition(position) {
      let clickedRect = this.matrixMixin_findRect(position.x, position.y);

      toglleSelectedRect(clickedRect);

      return {
        col: selectedRect.attributes.col.value,
        row: selectedRect.parentNode.attributes.row.value,
      };
    },
    matrixMixin_selectRectByCoordinates(coordinates) {
      let rect = document
        .querySelector(`g[row="${coordinates.row}"]`)
        .querySelector(`rect[col="${coordinates.col}"]`);

      toglleSelectedRect(rect);
    },

    matrixMixin_getRectSize() {
      return rectSize;
    },

    matrixMixin_selectNextRect() {
      let col = parseInt(selectedRect.attributes.col.value);
      let row = parseInt(selectedRect.parentNode.attributes.row.value);
      if (col != colsNum) {
        col += 1;
      } else {
        if (row == rowsNum) {
          col = -1;
        }
      }

      if (col == colsNum && row != rowsNum) {
        row += 1;
        col = 0;
      }

      if (col >= 0 && row >= 0) {
        return {
          col: col,
          row: row,
        };
      }
    },
  },
};
