import NotationType from "./notationType";
import { mapActions } from "vuex";
import { mapState } from "vuex";
import * as d3 from "d3";

export default {
  computed: {
    ...mapState({
      prevActiveRect: (state) => state.activeRectStore.prevActiveRect,
    }),
    fontSize: function () {
      return `${this.rectSize / 25}em`;
    },
    powerFontSize: function () {
      return `${this.rectSize / 50}em`;
    },
    sqrtFontSize: function () {
      return `${this.rectSize / 20}em`;
    },
  },
  data: function () {
    return {
      opacity: 1,
      colsNum: 44,
      rowsNum: 24,
      rectSize: 30,
      lineHeight: 4,
      topLevelGroup: null,
      activeRectColor: "lightcyan",
      borderColor: "lightgray",
      svgns: "http://www.w3.org/2000/svg",
    };
  },
  methods: {
    ...mapActions({
      setPrevActiveRect: "setPrevActiveRect",
    }),

    $isLine(notationType) {
      return (
        notationType === NotationType.FRACTION ||
        notationType === NotationType.SQRT ||
        notationType === NotationType.SQRTSYMBOL ||
        notationType === NotationType.LEFT_HANDLE ||
        notationType === NotationType.RIGHT_HANDLE
      );
    },
    reRenderMathJax() {
      window.MathJax.typeset();
    },
    async $toggleActiveRect(clickedNotation) {
      if (!clickedNotation) return;
      if (!!this.prevActiveRect) this.prevActiveRect.style.fill = "";
      await this.setPrevActiveRect(clickedNotation);
      clickedNotation.style.fill = this.activeRectColor;
    },
    matrixMixin_unselectPreviouslySelectedtRect() {
      if (!!this.prevActiveRect) this.prevActiveRect.style.fill = "";
    },
    //https://stackoverflow.com/questions/22428484/get-element-from-point-when-you-have-overlapping-elements
    matrixMixin_findClickedObject(point, tagName, notationType) {
      var elements = [];
      var display = [];
      var item = document.elementFromPoint(point.x, point.y);
      var prevItem = null;
      var idx = 0;

      while (
        idx++ < 50 &&
        item &&
        (!prevItem || item != prevItem) &&
        item !== document.body &&
        item !== window &&
        item !== document &&
        item !== document.documentElement
      ) {
        elements.push(item);
        display.push(item.style.display);
        item.style.display = "none";
        prevItem = item;
        item = document.elementFromPoint(point.x, point.y);
      }
      for (var i = 0; i < elements.length; i++) {
        elements[i].style.display = display[i];
      }
      return elements.find(
        (item) =>
          item.tagName == tagName &&
          (!notationType || notationType == item.attributes.type.value)
      );
    },
    matrixMixin_setMatrix() {
      for (var row = 0; row < this.rowsNum; row++) {
        this.matrix.push(d3.range(this.colsNum));
      }

      this.topLevelGroup = d3
        .select("#" + this.svgId)
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
    matrixMixin_activateRectByCoordinates(clickedCoordinates) {
      let rect = document
        .querySelector(
          `svg[id="${this.svgId}"] g[row="${clickedCoordinates.row}"]`
        )
        .querySelector(
          `rect[col="${clickedCoordinates.col ?? clickedCoordinates.fromCol}"]`
        );

      if (rect) this.$toggleActiveRect(rect, clickedCoordinates);
    },
    matrixMixin_getRectSize() {
      return this.rectSize;
    },
    getNextRect(horizontalStep, verticalStep) {
      if (!this.prevActiveRect) {
        return;
      }

      let col = parseInt(this.prevActiveRect.attributes.col.value);
      let nextCol = col;

      let row = parseInt(this.prevActiveRect.parentNode.attributes.row.value);
      let nextRow = row;

      if (col + horizontalStep < this.colsNum && col + horizontalStep >= 0) {
        nextCol += horizontalStep;
      }

      if (col + horizontalStep >= this.colsNum && row != this.rowsNum) {
        nextRow += 1;
        nextCol = 0;
      }

      if (row + verticalStep < this.rowsNum && row + verticalStep >= 0) {
        nextRow += verticalStep;
      }

      if (row + verticalStep >= this.rowsNum || row + verticalStep < 0) {
        nextCol = 0;
        nextRow = 0;
      }

      return {
        col: nextCol,
        row: nextRow,
      };
    },
    matrixMixin_setNextRect(horizontalStep, verticalStep) {
      let nextRect = this.getNextRect(horizontalStep, verticalStep);
      if (!!nextRect) {
        nextRect.type = "rect";
        this.$store.dispatch("setActiveRect", nextRect);
        this.userOperationsMixin_syncOutgoingSelectedPosition(nextRect);
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
          return this.getNotationXposByCol(n.col ?? n.fromCol);
        })
        .setAttribute("y", (n) => {
          return this.getNotationXposByCol(n.row);
        });
    },
    removeNotation: function (n) {
      document.getElementById(n.id + n.type).remove();
    },
    enrichNotations: function (notations) {
      let enrichedNotations = [];
      for (const key in notations) {
        if (Object.hasOwnProperty.call(notations, key)) {
          const element = notations[key];
          enrichedNotations.push(element);
          if (element.type === "sqrt") {
            let sqrtElement = { ...element };
            sqrtElement.type = NotationType.SQRTSYMBOL;
            enrichedNotations.push(sqrtElement);
          }
        }
      }
      return enrichedNotations;
    },
    matrixMixin_refreshScreen(notations, svgId) {
      try {
        notations = this.enrichNotations(notations);
      } catch {} // cant check if observer has properties
      d3.select("#" + svgId)
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
        .attr("type", (n) => {
          return n.type;
        })
        .attr("id", (n) => {
          return this.$id(n);
        })
        .attr("col", (n) => {
          return this.$col(n);
        })
        .attr("row", (n) => {
          return this.$row(n);
        })
        .attr("x", (n) => {
          return this.$x(n);
        })
        .attr("y", (n) => {
          return this.$y(n);
        })
        .attr("width", (n) => {
          return this.$width(n);
        })
        .attr("height", (n) => {
          return this.$height(n);
        })
        .style("font-size", (n) => {
          return this.$fontSize(n);
        })
        .style("color", (n) => {
          return this.$color(n);
        })
        .html((n) => {
          return this.$html(n);
        });
    },
    $id(n) {
      return n.type + n.id;
    },
    $col(n) {
      return this.$isLine(n.type) ? n.fromCol : n.col;
    },
    $row(n) {
      return n.row;
    },
    $x(n) {
      let col = this.$col(n);

      if (n.type === NotationType.SQRTSYMBOL) {
        return this.getNotationXposByCol(col) - Math.round(this.rectSize / 3);
      }

      if (n.type === NotationType.POWER) {
        return this.getNotationXposByCol(col) - this.rectSize / 3;
      }
      return this.getNotationXposByCol(col);
    },
    $y(n) {
      if (n.type === NotationType.SYMBOL) {
        return this.getNotationYposByRow(n.row);
      }

      if (n.type === NotationType.POWER) {
        return this.getNotationYposByRow(n.row) - 5;
      }

      if (n.type === NotationType.FRACTION || n.type === NotationType.SQRT) {
        return this.getNotationYposByRow(n.row) - 4;
      }

      if (n.type === NotationType.SQRTSYMBOL || n.type === "sqrt") {
        return this.getNotationYposByRow(n.row) - 4;
      }
    },
    $width(n) {
      if (
        n.type === NotationType.SYMBOL ||
        n.type === NotationType.SQRTSYMBOL ||
        n.type === NotationType.POWER
      )
        return this.rectSize;

      if (n.type === NotationType.FRACTION || n.type === NotationType.SQRT)
        return (n.toCol - n.fromCol) * this.rectSize;
    },
    $height(n) {
      if (
        n.type === NotationType.SYMBOL ||
        n.type === NotationType.SQRTSYMBOL ||
        n.type === NotationType.POWER
      )
        return this.rectSize;

      if (n.type === NotationType.FRACTION || n.type === NotationType.SQRT)
        return this.lineHeight;
    },
    $fontSize(n) {
      return n.type === NotationType.POWER ? this.powerFontSize : this.fontSize;
    },
    $color(n) {
      return n.selected ? "red" : "black";
    },
    $html(n) {
      if (n.type === NotationType.FRACTION || n.type === NotationType.SQRT) {
        return `<span class=line style='width:${
          (n.toCol - n.fromCol) * this.rectSize
        }px;'></span>`;
      }
      if (n.type === NotationType.SQRTSYMBOL) {
        return `<p style='position:relative;left:-3px; font-size:1.4em'>&#x221A;</p>`;
      }
      return !!n.value ? "$$" + n.value + "$$" : "";
    },
    updateNotations: function (update) {
      return update
        .style("color", (n) => {
          return this.$color(n);
        })
        .attr("x", (n, i) => {
          return this.$x(n);
        })
        .attr("y", (n) => {
          return this.$y(n);
        })
        .attr("col", (n) => {
          return this.$col(n);
        })
        .attr("row", (n) => {
          return this.$row(n);
        })
        .attr("width", (n) => {
          return this.$width(n);
        })
        .html((n) => {
          return this.$html(n);
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
