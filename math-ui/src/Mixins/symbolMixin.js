export default {
  data: function () {
    return { symbolFontSize: "1.8em" };
  },
  methods: {
    symbolMixin_createSymbol(s) {
      let symbol = {
        ExerciseId: this.exerciseId,
        value: s,
        isNumber: !isNaN(parseInt(s)),
      };

      symbol = Object.assign(symbol, this.getSelectedRect());

      this.$store
        .dispatch("addSymbol", symbol)
        .then(() => {
          this.mixin_syncOutgoingSaveNotation(symbol);
          let nextRect = this.matrixMixin_getNextRect();
          if (!!nextRect) {
            this.mixin_syncOutgoingSelectRect(nextRect);
          }
        })
        .catch((e) => {
          console.error(e);
        });
    },
    symbolMixin_moveSelection: function (e) {
      this.selectionMixin_endMoveSelection(e);
      this.$store
        .dispatch("updateSelectedSymbolCoordinates")
        .then(() => this.mixin_syncOutgoingUpdateSelectedNotations());
    },
    symbolMixin_removeSymbol: function (e) {
      let rectToremove = this.mixin_getRectByClickedPosition({
        x: e.clientX,
        y: e.clientY,
      });
      if (!rectToremove) return;

      let symbolAtRectPosition = this.$store.getters.getSymbolByRectCoordinates(
        rectToremove
      );
      if (!symbolAtRectPosition) return;

      this.$store
        .dispatch("removeSymbol", symbolAtRectPosition)
        .then(() => {
          this.mixin_syncOutgoingRemoveNotation(symbolAtRectPosition);
        })
        .catch((e) => {
          console.error(e);
        });
    },
    getSymbolXposByCol(col) {
      return col * this.matrixMixin_getRectSize() + 10;
    },
    getSymbolYposByRow(row) {
      return row * this.matrixMixin_getRectSize() + 10;
    },

    symbolMixin_refreshSymbols(symbols) {
      let that = this;
      this.svg
        .selectAll("text")
        .data(symbols)
        .join(
          (enter) => {
            return enter
              .append("text")
              .attr("id", (n) => {
                return n.id;
              })
              .attr("x", (n) => {
                return this.getSymbolXposByCol(n.col);
              })
              .attr("y", (n) => {
                return this.getSymbolYposByRow(n.row);
              })
              .attr("dy", "0.65em")
              .attr("dx", "0.25em")
              .attr("font-size", that.symbolFontSize)
              .text((n) => {
                return n.value;
              });
          },
          (update) => {
            return update
              .attr("fill", (datum) => {
                return datum.selected ? "red" : "black";
              })
              .attr("x", (n) => {
                return this.getSymbolXposByCol(n.col);
              })
              .attr("y", (n) => {
                return this.getSymbolYposByRow(n.row);
              })
              .text((n) => {
                return n.value;
              });
          },
          (exit) => {
            return exit
              .transition()
              .duration(10)
              .attr("r", 0)
              .style("opacity", 0)
              .attr("cx", 1000)
              .on("end", function () {
                d3.select(this).remove();
              });
          }
        );
    },
  },
};
