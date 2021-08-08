import * as d3 from "d3";

var enabled = false;

var colsNum = 60;
var rowsNum = 50;
var squareSize = 40;
var matrix = [];
var topLevelGroup;

function setMatrix() {
  for (var row = 0; row < rowsNum; row++) {
    matrix.push(d3.range(colsNum));
  }
}

function draw() {
  topLevelGroup = d3
    .select("svg")
    .selectAll("g")
    .data(matrix)
    .enter()
    .append("g")
    .attr("transform", (d, i) => {
      return "translate(0, " + squareSize * i + ")";
    });

  topLevelGroup
    .selectAll("rect")
    .data(matrix)
    .enter()
    .append("rect")
    .attr("fill", "white")
    .style("stroke", "lightgray")
    .attr("x", (d, i) => {
      console.log(i * squareSize);
      return i * squareSize;
    })
    .attr("width", squareSize)
    .attr("height", squareSize);
}

export default {
  methods: {
    toggleMatrixOverlay: function () {
      enabled = !enabled;
      setMatrix();
      draw();
    },
  },
};
