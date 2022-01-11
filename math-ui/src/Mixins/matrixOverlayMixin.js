import * as d3 from "d3";

/// TODO encapsulate in data
var opacity = 1;
var opacity;
var colsNum = 60;
var rowsNum = 50;
var squareSize = 20;
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

//https://stackoverflow.com/questions/30755696/get-svg-object-s-at-given-coordinates
function findRect(x, y) {
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
}

export default {
  methods: {
    mixin_setMatrix: function () {
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
          return "translate(0, " + squareSize * i + ")";
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
          return i * squareSize;
        })
        .attr("id", (d, r, i, j) => {
          return `rect_${d}_${i}`;
        })
        .attr("width", squareSize)
        .attr("height", squareSize);
    },
    mixin_toggleMatrixOverlay: function () {
      if (opacity === 1) opacity = 0.1;
      else opacity = 1;

      topLevelGroup.selectAll("rect").attr("stroke-opacity", opacity);
    },
    mixin_selectRectByClickedPosition(position) {
      let clickedRect = findRect(position.x, position.y);

      toglleSelectedRect(clickedRect);

      return {
        col: selectedRect.attributes.col.value,
        row: selectedRect.parentNode.attributes.row.value,
      };
    },
    mixin_selectRectByCoordinates(coordinates) {
      let rect = document
        .querySelector(`g[row="${coordinates.row}"]`)
        .querySelector(`rect[col="${coordinates.col}"]`);

      toglleSelectedRect(rect);
    },

    mixin_selectNextRect() {
      let col = selectedRect.col;
      if (col !== colsNum) {
        col += 1;
      } else {
        if (selectedRect.row === rowsNum) {
          col = -1;
        }
      }
      let row = selectedRect.row;
      if (col === colsNum && row != rowsNum) {
        row += 1;
      }

      if (col > 0 && row > 0) {
        return {
          x: col,
          y: row,
        };
      }
    },
  },
};
