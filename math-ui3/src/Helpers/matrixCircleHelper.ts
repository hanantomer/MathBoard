import * as d3 from "d3";
import { NotationAttributes, CircleNotationAttributes } from "common/baseTypes";
import useMatrixHelperUtils from "./matrixHelperUtils";

const matrixHelperUtils = useMatrixHelperUtils();

export default function useCircleMatrixHelper() {
  function mergeCircleNotations(
    svgId: string,
    notations: NotationAttributes[],
  ) {
    d3.select("#" + svgId)
      .selectAll("circle")
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
      .append("circle")
      .attr("id", (n: CircleNotationAttributes) => {
        return n.uuid;
      })
      .attr("cx", (n: CircleNotationAttributes) => {
        return n.cx;
      })
      .attr("cy", (n: CircleNotationAttributes) => {
        return n.cy;
      })
      .attr("r", (n: CircleNotationAttributes) => {
        return n.r;
      })
      .attr("stroke", (n: CircleNotationAttributes) => {
        return matrixHelperUtils.getColor(n);
      })
      .attr("stroke-width", () => {
        return "2"; // TODO: externalize
      })
      .attr("fill", () => {
        return "transparent"; // TODO: externalize
      });
  }

  function updateNotations(update: any) {
    return update
      .attr("id", (n: CircleNotationAttributes) => {
        return n.uuid;
      })
      .attr("cx", (n: CircleNotationAttributes) => {
        return n.cx;
      })
      .attr("cy", (n: CircleNotationAttributes) => {
        return n.cy;
      })
      .attr("r", (n: CircleNotationAttributes) => {
        return n.r;
      })
      .attr("stroke", (n: CircleNotationAttributes) => {
        return matrixHelperUtils.getColor(n);
      });
  }

  return {
    mergeCircleNotations,
  };
}
