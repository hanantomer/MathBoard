import NotationType from "./notationType";
import { mapActions, mapGetters, mapState } from "vuex";
import * as d3 from "d3";
import BoardType from "../Mixins/boardType";

export default {
  mounted: function () {
    if (!this.svgId) return; // component not loaded yet
    this.rectSize = Math.min(
      Math.floor(
        document.getElementById(this.svgId).clientWidth / this.colsNum
      ),
      Math.floor(
        document.getElementById(this.svgId).clientHeight / this.rowsNum
      )
    );
    let textMeasurementEl = document.createElement("canvas");
    window.textMeasurementCtx = textMeasurementEl.getContext("2d");
    window.textMeasurementCtx.font = window
      .getComputedStyle(this.$el, null)
      .getPropertyValue("font");
  },
  computed: {
    ...mapState({
      prevActiveCell: (state) => state.notationStore.prevActiveCell,
    }),
    fontSize: function () {
      return `${this.rectSize / 25}em`;
    },
    textFontSize: function () {
      return window
        .getComputedStyle(this.$el, null)
        .getPropertyValue("font-size");
    },
    powerFontSize: function () {
      return `${this.rectSize / 50}em`;
    },
    signFontSize: function () {
      return `${this.rectSize / 28}em`;
    },

    sqrtFontSize: function () {
      return `${this.rectSize / 20}em`;
    },
  },
  data: function () {
    return {
      opacity: 1,
      colsNum: 35,
      rowsNum: 20,
      rectSize: 25,
      lineHeight: 4,
      topLevelGroup: null,
      svgns: "http://www.w3.org/2000/svg",
      svgWidth: "1400px",
      svgHeight: "700px",
    };
  },
  methods: {
    ...mapGetters({
      getActiveNotation: "getActiveNotation",
      getCurrentLesson: "getCurrentLesson",
      getParent: "getParent",
    }),
    ...mapActions({
      setPrevActiveCell: "setPrevActiveCell",
    }),
    freeTextRectWidth(value) {
      return window.textMeasurementCtx.measureText(value).width / this.rectSize;
    },
    freeTextRectHeight(value) {
      return (
        (this.textFontSize.replace("px", "") * value.split(/\r*\n/).length) /
        this.rectSize
      );
    },
    $isRect(notationType) {
      return (
        notationType === NotationType.TEXT ||
        notationType === NotationType.IMAGE
      );
    },
    $isLine(notationType) {
      return (
        notationType === NotationType.FRACTION ||
        notationType === NotationType.SQRT ||
        notationType === NotationType.SQRTSYMBOL ||
        notationType === NotationType.LEFT_HANDLE ||
        notationType === NotationType.RIGHT_HANDLE
      );
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
      // render rows
      for (var row = 0; row < this.rowsNum; row++) {
        this.matrix.push(d3.range(this.colsNum));
      }

      // render rectangles
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
        })
        .selectAll("rect")
        .data((r) => r)
        .enter()
        .append("rect")
        .attr("fill", (a, i, d) => {
          return "white";
        })
        .attr("stroke-opacity", this.opacity)
        .attr("stroke", "lightgray")
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
    matrixMixin_getRectSize() {
      return this.rectSize;
    },
    getNextRect(horizontalStep, verticalStep) {
      if (!this.getActiveCell()?.col) {
        return;
      }

      let col = parseInt(this.getActiveCell().col);
      let row = parseInt(this.getActiveCell().row);
      let nextCol = parseInt(col);
      let nextRow = parseInt(row);

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
        this.$store.dispatch("setActiveCell", nextRect);
        if (this.getParent().boardType === BoardType.LESSON) {
          this.userOperationsMixin_syncOutgoingActiveCell(nextRect);
        }
      }
    },
    matrixMixin_findRect(rect) {
      return document
        .querySelector(`g[row='${rect.row}']`)
        .querySelector(`rect[col='${rect.col}']`);
    },
    updateNotation: function (n) {
      n.setAttribute("col", (n) => {
        return n.col;
      })
        .setAttribute("fromCol", (n) => {
          return n.fromCol;
        })
        .setAttribute("toCol", (n) => {
          return n.toCol;
        })
        .setAttribute("fromRow", (n) => {
          return n.fromRow;
        })
        .setAttribute("toRow", (n) => {
          return n.toRow;
        })
        .setAttribute("row", (n) => {
          return n.row;
        })
        .setAttribute("x", (n, i) => {
          return this.getNotationXposByCol(n.col ?? n.fromCol);
        })
        .setAttribute("y", (n) => {
          return this.getNotationXposByCol(n.row ?? n.fromRow);
        });
    },
    removeNotation: function (n) {
      document.getElementById(n.id + n.type).remove();
    },
    enrichNotations: async function (notations) {
      let enrichedNotations = [];
      for (const key in notations) {
        if (Object.hasOwnProperty.call(notations, key)) {
          const element = notations[key];
          enrichedNotations.push(element);
          // add sqrt symbol
          if (element.type === NotationType.SQRT) {
            let sqrtElement = { ...element };
            sqrtElement.type = NotationType.SQRTSYMBOL;
            enrichedNotations.push(sqrtElement);
          }
          // calculate image dimensions
          // if (element.type === NotationType.IMAGE) {
          //   let image = new Image();
          //   this.loadImage(image, element.value);
          //   element.toCol = Math.round(
          //     image.width / this.rectSize + element.fromCol
          //   );

          //   element.toRow = Math.round(
          //     image.height / this.rectSize + element.fromRow
          //   );
          // }
        }
      }
      return enrichedNotations;
    },
    async matrixMixin_refreshScreen(notations, svgId) {
      try {
        notations = await this.enrichNotations(notations);
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
    /// TODO addNotation?
    showNotations: function (enter) {
      return (
        enter
          .append("foreignObject")
          .attr("type", (n) => {
            return n.type;
          })
          .attr("id", (n) => {
            return this.$id(n);
          })
          .attr("col", (n) => {
            return n.col;
          })
          .attr("fromCol", (n) => {
            return n.fromCol;
          })
          .attr("toCol", (n) => {
            return n.toCol;
          })
          .attr("row", (n) => {
            return n.row;
          })
          .attr("fromRow", (n) => {
            return n.fromRow;
          })
          .attr("toRow", (n) => {
            return n.toRow;
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
          //.style("color", (n) => {
          //  return this.$color(n);
          //})
          .html((n) => {
            return this.$html(n);
          })
      );
    },
    $id(n) {
      return n.type + n.id;
    },
    $col(n) {
      return this.$isLine(n.type) || this.$isRect(n.type) ? n.fromCol : n.col;
    },
    $row(n) {
      return this.$isRect(n.type) ? n.fromRow : n.row;
    },
    $x(n) {
      let col = this.$col(n);
      let deltaX =
        n.type === NotationType.SQRTSYMBOL || n.type === NotationType.POWER
          ? Math.round(this.rectSize / 3) * -1
          : 0;

      return this.getNotationXposByCol(col) + deltaX;
    },
    $y(n) {
      let row = this.$row(n);
      let deltaY =
        n.type === NotationType.POWER
          ? -5
          : n.type === NotationType.FRACTION || n.type === NotationType.SQRT
          ? -4
          : 0;

      return this.getNotationYposByRow(row) + deltaY;
    },
    $width(n) {
      if (n.type === NotationType.TEXT) {
        return (
          window.textMeasurementCtx.measureText(n.value).width +
          1 * n.value.length
        );
      }

      if (
        n.type === NotationType.SIGN ||
        n.type === NotationType.SYMBOL ||
        n.type === NotationType.SQRTSYMBOL ||
        n.type === NotationType.POWER
      )
        return this.rectSize;

      if (
        n.type === NotationType.FRACTION ||
        n.type === NotationType.SQRT ||
        n.type === NotationType.IMAGE
      )
        return (n.toCol - n.fromCol) * this.rectSize + 5;
    },
    $height(n) {
      if (n.type === NotationType.TEXT) {
        return (
          (this.textFontSize.replace("px", "") + 5) *
          n.value.split(/\r*\n/).length
        );
      }

      if (
        n.type === NotationType.SIGN ||
        n.type === NotationType.SYMBOL ||
        n.type === NotationType.SQRTSYMBOL ||
        n.type === NotationType.POWER
      ) {
        return this.rectSize;
      }

      if (n.type === NotationType.IMAGE) {
        return (n.toRow - n.fromRow) * this.rectSize + 5;
      }

      if (n.type === NotationType.FRACTION || n.type === NotationType.SQRT) {
        return this.lineHeight;
      }
    },
    $fontSize(n) {
      return n.type === NotationType.POWER
        ? this.powerFontSize
        : n.type === NotationType.TEXT
        ? this.textFontSize
        : n.type === NotationType.SIGN
        ? this.signFontSize
        : this.fontSize;
    },
    $html(n) {
      if (n.type === NotationType.FRACTION) {
        return `<span class=line style='width:${
          (n.toCol - n.fromCol) * this.rectSize
        }px;'></span>`;
      }

      if (n.type === NotationType.SQRT) {
        return `<span class=line style='position:relative;left:9px;width:${
          (n.toCol - n.fromCol) * this.rectSize - 8
        }px;'></span>`;
      }

      if (n.type === NotationType.SQRTSYMBOL) {
        return `<p style='position:relative;left:5px; font-size:1.4em'>&#x221A;</p>`;
      }

      if (n.type === NotationType.TEXT) {
        let borderColor = this.$borderColor(n === this.getActiveNotation());
        return `<pre style='border:groove 2px;border-color:${borderColor};background-color:${n.background_color}'>${n.value}</pre>`;
      }

      if (n.type === NotationType.IMAGE) {
        let borderColor = this.$borderColor(n === this.getActiveNotation());
        return `<img style='border:groove 2px;border-color:${borderColor}' src='${n.value}'>`;
      }

      let fontWeight =
        this.getCurrentLesson().UserId === n.UserId ? "bold" : "normal";

      let color = n.selected
        ? "red"
        : this.getParent().boardType === BoardType.ANSWER &&
          this.getUser().id != n.UserId
        ? "purple"
        : "black";

      return `<p style='color:${color};font-weight:${fontWeight};margin-left:8px;font-size:1.1em'>${n.value}</p>`;
    },
    $borderColor: function (selected) {
      return !!selected ? "red" : "transparent";
    },
    updateNotations: function (update) {
      return (
        update
          //.style("color", (n) => {
          //  return this.$color(n);
          //})
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
          })
      );
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
    getNotationXposByCol(col) {
      return col * this.matrixMixin_getRectSize();
    },
    getNotationYposByRow(row) {
      return row * this.matrixMixin_getRectSize();
    },
  },
};