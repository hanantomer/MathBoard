import * as d3 from "d3";

export default {
  computed: {
    fontSize: function () {
      return `${this.rectSize / 25}em`;
    },
  },
  data: function () {
    return {
      opacity: 1,
      colsNum: 48,
      rowsNum: 24,
      rectSize: 30,
      matrix: [],
      topLevelGroup: null,
      prevSelectedNotation: null,
      selectedRecColor: "lightcyan",
      borderColor: "lightgray",
      svgns: "http://www.w3.org/2000/svg",
    };
  },
  methods: {
    reRenderMathJax() {
      window.MathJax.typeset();
    },
    toggleSelectedNotation(clickedNotation) {
      if (!clickedNotation) return;
      if (!!this.prevSelectedNotation)
        this.prevSelectedNotation.style.fill = "";
      this.prevSelectedNotation = clickedNotation;

      clickedNotation.style.fill =
        clickedNotation.style.fill == this.selectedRecColor
          ? ""
          : this.selectedRecColor;
    },
    //https://stackoverflow.com/questions/22428484/get-element-from-point-when-you-have-overlapping-elements
    matrixMixin_findClickedObject(p, tagName) {
      var elements = [];
      var display = [];
      var item = document.elementFromPoint(p.x, p.y);
      while (
        item &&
        item !== document.body &&
        item !== window &&
        item !== document &&
        item !== document.documentElement
      ) {
        elements.push(item);
        display.push(item.style.display);
        item.style.display = "none";
        item = document.elementFromPoint(p.x, p.y);
      }
      for (var i = 0; i < elements.length; i++) {
        elements[i].style.display = display[i];
      }
      return elements.find((e) => e.tagName == tagName);
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
        .data(this.matrix[0])
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
    matrixMixin_selectRectByCoordinates(clickedCoordinates) {
      let rect = document
        .querySelector(`g[row="${clickedCoordinates.row}"]`)
        .querySelector(`rect[col="${clickedCoordinates.col}"]`);

      if (rect) this.toggleSelectedNotation(rect, clickedCoordinates);
    },
    matrixMixin_getRectSize() {
      return this.rectSize;
    },
    matrixMixin_getNextRect() {
      if (!this.prevSelectedNotation) {
        return;
      }
      let col = parseInt(this.prevSelectedNotation.attributes.col.value);
      let row = parseInt(
        this.prevSelectedNotation.parentNode.attributes.row.value
      );
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
    updateNotation: function (n) {
      n.setAttribute("col", (n) => {
        return n.col;
      })
        .setAttribute("row", (n) => {
          return n.row;
        })
        .setAttribute("x", (n, i) => {
          return this.getNotationXposByCol(n.col);
        })
        .setAttribute("y", (n) => {
          return this.getNotationXposByCol(n.row);
        });
    },
    removeNotation: function (notation) {
      document.getElementById(n.id + n.type).remove();
    },
    matrixMixin_refreshScreen(notations) {
      this.svg
        .selectAll("foreignObject")
        .data(Object.values(notations))
        .join(
          (enter) => {
            return this.showNotations(enter);
          },
          (update) => {
            return this.updateNotations(update);
          },
          (exit) => {
            return this.removeNotations(exit);
          }
        );
    },
    showNotations: function (enter) {
      return enter
        .append("foreignObject")
        .attr("id", (n) => {
          return n.type + n.id;
        })
        .attr("col", (n) => {
          return n.type === "symbol" ? n.col : n.fromCol;
        })
        .attr("row", (n) => {
          return n.row;
        })
        .attr("x", (n, i) => {
          return this.getNotationXposByCol(
            n.type === "symbol" ? n.col : n.fromCol
          );
        })
        .attr("y", (n) => {
          return n.type === "symbol"
            ? this.getNotationYposByRow(n.row)
            : this.getNotationYposByRow(n.row - 1);
        })
        .attr("width", (n) => {
          return n.type === "symbol"
            ? this.rectSize
            : (n.toCol - n.fromCol) * this.rectSize;
        })
        .attr("height", this.rectSize)
        .style("font-size", (n) => {
          return this.fontSize;
        })
        .html((n) => {
          if (n.type === "fractionLine") {
            return `<span style='display:inline-block;border-bottom: solid 2px;width:${
              (n.toCol - n.fromCol) * this.rectSize
            }px;margin-top:${this.rectSize - 1}px'></span>`;
          }
          return !!n.value ? "$$sqrt" + n.value + "$$" : "";
        });
    },
    updateNotations: function (update) {
      ///TODO move common code to function
      return update
        .style("color", (n) => {
          return n.selected ? "red" : "black";
        })
        .attr("x", (n, i) => {
          return this.getNotationXposByCol(
            n.type === "symbol" ? n.col : n.fromCol
          );
        })
        .attr("y", (n) => {
          return n.type === "symbol"
            ? this.getNotationYposByRow(n.row)
            : this.getNotationYposByRow(n.row - 1);
        })
        .html((n) => {
          if (n.type === "fractionLine") {
            return `<span style='display:inline-block;border-bottom: solid 2px;width:${
              (n.toCol - n.fromCol) * this.rectSize
            }px;margin-top:${this.rectSize - 1}px'></span>`;
          }
          return !!n.value ? "$$" + n.value + "$$" : "";
        });
    },
    removeNotations: function (exit) {
      return exit
        .transition()
        .duration(10)
        .attr("r", 0)
        .style("opacity", 0)
        .attr("cx", 1000)
        .on("end", function () {
          d3.select(this).remove();
        });
    },
  },
};
