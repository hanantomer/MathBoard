export default {
  data: function () {
    return {};
  },
  methods: {
    fractionMixin_saveFraction(symbol) {
      this.$store
        .dispatch("saveFraction", symbol)
        .then((fraction) => {
          this.mixin_syncOutgoingSaveNotation(fraction);

          let nextRect = this.matrixMixin_getNextFractionRect();
          if (!!nextRect) {
            this.mixin_syncOutgoingSelectRect(nextRect);
          }
        })
        .catch((e) => {
          console.error(e);
        });
    },
    getFractionCharacterXpos(col, charPos) {
      return (
        col * this.matrixMixin_getRectSize() +
        (charPos * this.matrixMixin_getRectSize()) / 2 +
        5
      );
    },
    fractionMixin_refreshFractions(fractions) {
      fractions.forEach((f) => this.refreshFractionCharacters(f, true));
      fractions.forEach((f) => this.refreshFractionCharacters(f, false));
    },
    refreshFractionCharacters(fraction, isUpper) {
      let that = this;
      let fractionPartValue = isUpper
        ? fraction.nominatorValue
        : fraction.denominatorValue;

      if (!fractionPartValue) {
        return;
      }

      this.svg
        .selectAll("text")
        .data([...fractionPartValue])
        .join(
          (enter) => {
            return enter
              .append("text")
              .attr("id", (n) => {
                // ? should id be unique
                return n.id;
              })
              .attr("x", (n, i) => {
                return this.getFractionCharacterXpos(fraction.col, i);
              })
              .attr("y", (n) => {
                return (
                  this.getSymbolYposByRow(fraction.row) -
                  5 +
                  (isUpper ? 0 : this.matrixMixin_getRectSize() / 2)
                );
              })
              .attr("dy", "0.65em")
              .attr("dx", "0.25em")
              .attr("font-size", that.symbolFontSize / 2)
              .text((n) => {
                return n;
              });
          },
          (update) => {
            return update
              .attr("fill", (datum) => {
                return datum.selected ? "red" : "black";
              })
              .attr("x", (n, i) => {
                return this.getFractionCharacterXpos(fraction.col, i);
              })
              .attr("y", (n) => {
                return this.getSymbolYposByRow(fraction.row) + isUpper
                  ? 0
                  : this.matrixMixin_getRectSize() / 2;
              })
              .text((n) => {
                return n;
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
