import * as d3 from "d3";

export default {
  data: function () {
    return {
      opacity: 1,
      colsNum: 25,
      rowsNum: 25,
      rectSize: 40,
      matrix: [],
      topLevelGroup: null,
      prevSelectedRect: null,
      prevFractionPosition: "TopLeft",
      SelectedFractionRectId: "SelectedFractionRectId",
      selectedRecColor: "lightcyan",
      borderColor: "lightgray",
      svgns: "http://www.w3.org/2000/svg",
    };
  },
  methods: {
    createFractionRect(clickedCoordinates, clickedRect) {
      let fractionRect = document.createElementNS(this.svgns, "rect");
      fractionRect.setAttribute("id", this.SelectedFractionRectId);
      fractionRect.setAttribute("width", this.rectSize / 2);
      fractionRect.setAttribute("height", this.rectSize / 2);
      fractionRect.setAttribute("stroke-opacity", this.opacity);
      fractionRect.setAttribute("fill", "transparent");
      fractionRect.style.stroke = this.borderColor;

      if (
        clickedCoordinates.fractionPosition === "TopLeft" ||
        clickedCoordinates.fractionPosition === "BottomLeft"
      ) {
        fractionRect.setAttribute("x", clickedRect.x.baseVal.value);
      } else {
        fractionRect.setAttribute(
          "x",
          clickedRect.x.baseVal.value + this.rectSize / 2
        );
      }

      if (
        clickedCoordinates.fractionPosition === "BottomLeft" ||
        clickedCoordinates.fractionPosition === "BottomRight"
      ) {
        fractionRect.setAttribute("y", this.rectSize / 2);
      }

      clickedRect.parentNode.appendChild(fractionRect);
    },
    toggleSelectedRect(clickedRect, clickedCoordinates) {
      if (!!this.prevSelectedRect) this.prevSelectedRect.style.fill = "";
      this.prevSelectedRect = clickedRect;

      if (!!document.getElementById(this.SelectedFractionRectId))
        document.getElementById(this.SelectedFractionRectId).remove();

      clickedRect.style.fill =
        clickedRect.style.fill == this.selectedRecColor
          ? ""
          : this.selectedRecColor;

      if (!!clickedCoordinates.fractionPosition) {
        this.createFractionRect(clickedCoordinates, clickedRect);
      }
    },
    //https://stackoverflow.com/questions/30755696/get-svg-object-s-at-given-coordinates
    matrixMixin_findRect(x, y) {
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
    matrixMixin_setMatrix() {
      for (var row = 0; row < this.rowsNum; row++) {
        this.matrix.push(d3.range(this.colsNum));
      }

      this.topLevelGroup = d3
        .select("svg")
        .selectAll("g")
        .data(this.matrix)
        .enter()
        .append("g")
        .attr("row", (d, i) => {
          return i;
        })
        .lower()
        .attr("transform", (d, i) => {
          return "translate(0, " + this.rectSize * i + ")";
        });

      this.topLevelGroup
        .selectAll("rect")
        .data(this.matrix)
        .enter()
        .append("rect")
        .attr("fill", "white")
        .attr("stroke-opacity", this.opacity)
        .style("stroke", "lightgray")
        .attr("col", (d, i) => {
          return i;
        })
        .attr("x", (d, i) => {
          return i * this.rectSize;
        })
        .attr("width", this.rectSize)
        .attr("height", this.rectSize);
    },
    matrixMixin_toggleMatrixOverlay() {
      if (this.opacity === 1) this.opacity = 0.1;
      else this.opacity = 1;

      this.topLevelGroup.selectAll("rect").attr("stroke-opacity", this.opacity);
    },
    mixin_getRectByClickedPosition(position) {
      let clickedRect = this.matrixMixin_findRect(position.x, position.y);

      if (clickedRect)
        return {
          col: clickedRect.attributes.col.value,
          row: clickedRect.parentNode.attributes.row.value,
        };
    },
    matrixMixin_getFractionRectByClickedPosition(position) {
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
    matrixMixin_selectRectByCoordinates(clickedCoordinates) {
      let rect = document
        .querySelector(`g[row="${clickedCoordinates.row}"]`)
        .querySelector(`rect[col="${clickedCoordinates.col}"]`);

      this.toggleSelectedRect(rect, clickedCoordinates);
    },
    matrixMixin_getRectSize() {
      return this.rectSize;
    },
    matrixMixin_getNextRect() {
      let col = parseInt(this.prevSelectedRect.attributes.col.value);
      let row = parseInt(this.prevSelectedRect.parentNode.attributes.row.value);
      if (col != this.colsNum) {
        col += 1;
      } else {
        if (row == this.rowsNum) {
          col = -1;
        }
      }

      if (col == this.colsNum && row != this.rowsNum) {
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
    matrixMixin_getNextFractionRect() {
      let col = parseInt(this.prevSelectedRect.attributes.col.value);
      let row = parseInt(this.prevSelectedRect.parentNode.attributes.row.value);
      let nextFractionPosition = {};
      switch (this.prevFractionPosition) {
        case "TopLeft":
          nextFractionPosition = "TopRight";
          break;
        case "TopRight":
          nextFractionPosition = "BottomLeft";
          break;
        case "BottomLeft":
          nextFractionPosition = "BottomRight";
          break;
        case "BottomRight":
          return this.matrixMixin_getNextRect();
      }
      this.prevFractionPosition = nextFractionPosition;
      return {
        col: col,
        row: row,
        fractionPosition: nextFractionPosition,
      };
    },
  },
};
