import * as d3 from "d3";
import { NotationAttributes, ConicNotationAttributes } from "common/baseTypes";
import { conicSvgPaths } from "common/conicGeometry";
import useMatrixHelperUtils from "./matrixHelperUtils";

const matrixHelperUtils = useMatrixHelperUtils();

export default function useConicMatrixHelper() {
  function mergeConicNotations(
    svgId: string,
    notations: NotationAttributes[],
  ) {
    d3.select("#" + svgId)
      .selectAll("g.conic")
      .data(notations, (u: any) => {
        return (u as NotationAttributes).uuid;
      })
      .join(
        (enter) => addNotations(enter),
        (update) => updateNotations(update),
        (exit) => matrixHelperUtils.removeNotations(exit),
      );
  }

  function bindBranchPaths(g: any, n: ConicNotationAttributes) {
    const sel = g.selectAll("path.conic-branch").data(conicSvgPaths(n));
    sel
      .enter()
      .append("path")
      .attr("class", "conic-branch")
      .attr("fill", "transparent")
      .attr("stroke-width", "2")
      .attr("stroke-linecap", "round");
    g.selectAll("path.conic-branch")
      .attr("d", (d: string) => d)
      .attr("stroke", matrixHelperUtils.getColor(n));
    sel.exit().remove();
  }

  function addNotations(enter: any) {
    const g = enter
      .append("g")
      .attr("class", "conic")
      .attr("id", (n: ConicNotationAttributes) => n.uuid)
      .attr("data-cy", () => "conic");

    g.each(function (this: SVGGElement, n: ConicNotationAttributes) {
      bindBranchPaths(d3.select(this), n);
    });

    return g;
  }

  function updateNotations(update: any) {
    update.attr("id", (n: ConicNotationAttributes) => n.uuid);
    update.each(function (this: SVGGElement, n: ConicNotationAttributes) {
      bindBranchPaths(d3.select(this), n);
    });
    return update;
  }

  return {
    mergeConicNotations,
  };
}
