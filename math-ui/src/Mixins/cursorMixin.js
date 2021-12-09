import * as d3 from "d3";
export default {
  methods: {
    mixin_hideCursor: function () {
      this.svg.selectAll("path").remove();
    },
    mixin_blinkCursor: function (nextPosition) {
      this.mixin_hideCursor();
      const cursorLeftDistance = 10;
      const cursorHeight = 10;
      const linePoints = [
        [nextPosition.x + cursorLeftDistance, nextPosition.y - cursorHeight],
        [nextPosition.x + cursorLeftDistance, nextPosition.y + cursorHeight],
      ];
      const lineGenerator = d3.line();
      const path = this.svg
        .append("path")
        .attr("d", lineGenerator(linePoints))
        .attr("stroke", "darkgrey")
        .attr("stroke-width", "2")
        .attr("fill", "none");

      const totalLength = path.node().getTotalLength();

      var blink = function () {
        path
          .attr("stroke-dasharray", totalLength + " " + totalLength)
          .attr("stroke-dashoffset", totalLength)
          .transition()
          .duration(1000)
          .attr("stroke-dashoffset", 1)
          .on("end", blink);
      };
      return blink;
    },
  },
};
