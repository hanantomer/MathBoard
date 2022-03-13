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
      prevSelectedNotation: null,
      selectedRecColor: "lightcyan",
      borderColor: "lightgray",
      svgns: "http://www.w3.org/2000/svg",
    };
  },
  methods: {
    toggleSelectedNotation(clickedNotation, clickedCoordinates) {
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

      this.toggleSelectedNotation(rect, clickedCoordinates);
    },
    matrixMixin_selectFractionByCoordinates(clickedCoordinates) {
      let rect = document.querySelector(
        `foreignObject[row="${clickedCoordinates.row}", col="${clickedCoordinates.col}"]`
      );

      this.toggleSelectedNotation(rect, clickedCoordinates);
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
    showSymbols: function (enter, that) {
      return enter
        .append("text")
        .attr("id", (n) => {
          return n.id;
        })
        .attr("x", (n, i) => {
          return this.getSymbolXposByCol(n.col);
        })
        .attr("y", (n) => {
          return this.getSymbolYposByRow(n.row);
        })
        .attr("dy", "0.65em")
        .attr("dx", "0.25em")
        .attr("font-size", (n) => {
          return that.symbolFontSize;
        })
        .text((n) => {
          return !!n.value ? n.value : "";
        });
    },
    updateSymbols: function (update) {
      return update
        .attr("fill", (n) => {
          return n.selected ? "red" : "black";
        })
        .attr("x", (n, i) => {
          return this.getSymbolXposByCol(n.col);
        })
        .attr("y", (n) => {
          return this.getSymbolYposByRow(n.row);
        })
        .text((n) => {
          return n.value;
        });
    },
    removeSymbols: function (exit) {
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
    showFractions: function (enter, that) {
      enter
        .append("foreignObject")
        .attr("col", (n) => {
          return n.col;
        })
        .attr("row", (n) => {
          return n.row;
        })
        .attr("x", (n, i) => {
          return this.getSymbolXposByCol(n.col) - 5;
        })
        .attr("y", (n) => {
          return this.getSymbolYposByRow(n.row) - 10;
        })
        .attr("width", (n) => {
          return !!n.nominatorValue ? this.rectSize : 0;
        })
        .attr("height", this.rectSize)
        .append("xhtml:div")
        .style("font-weight", "bold")
        .style("font-size", "0.85em")
        .html((n) => {
          if (!n.nominatorValue) {
            return;
          }
          let textWidth = Math.max(
            n.nominatorValue.length,
            n.denominatorValue.length
          );
          return (
            "<div style='text-align: center'>" +
            n.nominatorValue +
            "</div>" +
            `<hr style='margin:auto;border: 1px solid black;width:${
              textWidth * 8
            }px'>` +
            "<div style='text-align: center'>" +
            n.denominatorValue +
            "</div>"
          );
        });
    },

    matrixMixin_refreshScreen(data) {
      let that = this;
      this.svg
        .selectAll("text")
        .data(data)
        .join(
          (enter) => {
            return this.showSymbols(enter, that);
          },
          (update) => {
            return this.updateSymbols(update);
          },
          (exit) => {
            return this.removeSymbols(exit);
          }
        );

      this.svg
        .selectAll("foreignObject")
        .data(data)
        .join(
          (enter) => {
            return this.showFractions(enter, that);
          },
          (update) => {
            //return this.updateFractions(update);
          },
          (exit) => {
            //return reomoveFractions(exit);
          }
        );
    },
  },
};
