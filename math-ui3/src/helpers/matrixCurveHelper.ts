import * as d3 from "d3";
import { NotationAttributes, CurveNotationAttributes } from "common/baseTypes";
import useMatrixHelperUtils from "./matrixHelperUtils";
const matrixHelperUtils = useMatrixHelperUtils();

export default function useCurveMatrixHelper() {
  function mergeCurveNotations(svgId: string, notations: NotationAttributes[]) {
    d3.select("#" + svgId)
      .selectAll("path")
      .data(notations, (u: any) => {
        return (u as NotationAttributes).uuid;
      })
      .join(
        (enter) => {
          return addNotations(enter);
        },
        (update) => {
          return updateNotations(update);
        },
        (exit) => {
          return matrixHelperUtils.removeNotations(exit);
        },
      );
  }

  function addNotations(enter: any) {
    return enter
      .append("path")
      .attr("id", (n: CurveNotationAttributes) => {
        return n.uuid;
      })
      .attr("d", (n: CurveNotationAttributes) => {
        return d(n);
      })
      .attr("stroke", (n: CurveNotationAttributes) => {
        return matrixHelperUtils.getColor(n);
      })
      .attr("stroke-width", () => {
        return "2"; /// TODO: externalize
      })
      .attr("stroke-linecap", () => {
        return "round"; /// TODO: externalize
      })
      .attr("fill", () => {
        return "transparent"; /// TODO: externalize
      });
  }

  function updateNotations(update: any) {
    return update
      .attr("id", (n: CurveNotationAttributes) => {
        return n.uuid;
      })
      .attr("d", (n: CurveNotationAttributes) => {
        return d(n);
      })
      .attr("stroke", (n: CurveNotationAttributes) => {
        return matrixHelperUtils.getColor(n);
      })
      .style("display", () => {
        return "block";
      });
  }

  function d(n: CurveNotationAttributes): String {
    return `M${n.p1x} ${n.p1y} Q ${n.cpx} ${n.cpy} ${n.p2x} ${n.p2y}`;
  }

  return {
    mergeCurveNotations,
  };
}
