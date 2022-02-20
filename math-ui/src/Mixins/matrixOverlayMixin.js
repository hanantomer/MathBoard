import * as d3 from "d3";

/// TODO encapsulate in data
var opacity = 1;
var colsNum = 25;
var rowsNum = 25;
var rectSize = 40;
var matrix = [];
var topLevelGroup;
var prevSelectedRect = null;
var SelectedFractionRectId = "SelectedFractionRectId";
var selectedRecColor = "lightcyan";
const svgns = "http://www.w3.org/2000/svg";

function toggleSelectedRect(clickedRect, coordinates) {
  if (!!prevSelectedRect) prevSelectedRect.style.fill = "";
  prevSelectedRect = clickedRect;

  if (!!document.getElementById(SelectedFractionRectId))
    document.getElementById(SelectedFractionRectId).remove();

  clickedRect.style.fill =
    clickedRect.style.fill == selectedRecColor ? "" : selectedRecColor;

  if (!!coordinates.fractionPosition) {
    document.remove;
    let fractionRect = document.createElementNS(svgns, "rect");
    fractionRect.setAttribute("id", SelectedFractionRectId);
    fractionRect.setAttribute("width", rectSize / 2);
    fractionRect.setAttribute("height", rectSize / 2);
    fractionRect.setAttribute("stroke-opacity", opacity);
    fractionRect.setAttribute("fill", "transparent");
    fractionRect.style.stroke = "lightgray";

    if (
      coordinates.fractionPosition === "TopLeft" ||
      coordinates.fractionPosition === "BottomLeft"
    ) {
      fractionRect.setAttribute("x", clickedRect.x.baseVal.value);
    } else {
      fractionRect.setAttribute(
        "x",
        clickedRect.x.baseVal.value + rectSize / 2
      );
    }

    if (
      coordinates.fractionPosition === "BottomLeft" ||
      coordinates.fractionPosition === "BottomRight"
    ) {
      fractionRect.setAttribute("y", rectSize / 2);
    }

    clickedRect.parentNode.appendChild(fractionRect);
  }
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
    mixin_getRectByClickedPosition(position) {
      let clickedRect = this.matrixMixin_findRect(position.x, position.y);

      if (clickedRect)
        return {
          col: clickedRect.attributes.col.value,
          row: clickedRect.parentNode.attributes.row.value,
        };
    },
    mixin_getFractionRectByClickedPosition(position) {
      let clickedRect = this.matrixMixin_findRect(position.x, position.y);
      let rectCoordinates = clickedRect.getBoundingClientRect();
      if (clickedRect) {
        let isUpperPartClicked =
          position.y - rectCoordinates.y < rectCoordinates.height / 2;
        let isLeftPartClicked =
          position.x - rectCoordinates.x < rectCoordinates.width / 2;

        return {
          fractionPosition: isUpperPartClicked
            ? isLeftPartClicked
              ? "TopLeft"
              : "TopRight"
            : isLeftPartClicked
            ? "BottomLeft"
            : "BottomRight",
          col: clickedRect.attributes.col.value,
          row: clickedRect.parentNode.attributes.row.value,
        };
      }
    },
    matrixMixin_selectRectByCoordinates(coordinates) {
      let rect = document
        .querySelector(`g[row="${coordinates.row}"]`)
        .querySelector(`rect[col="${coordinates.col}"]`);

      toggleSelectedRect(rect, coordinates);
    },

    matrixMixin_getRectSize() {
      return rectSize;
    },

    matrixMixin_selectNextRect() {
      let col = parseInt(prevSelectedRect.attributes.col.value);
      let row = parseInt(prevSelectedRect.parentNode.attributes.row.value);
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
