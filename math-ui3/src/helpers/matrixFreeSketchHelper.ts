import * as d3 from "d3";
import {
  NotationAttributes,
  FreeSketchNotationAttributes,
} from "common/baseTypes";
import useMatrixHelperUtils from "./matrixHelperUtils";

const matrixHelperUtils = useMatrixHelperUtils();

export default function useFreeSketchMatrixHelper() {
  function mergeFreeSketchNotations(
    svgId: string,
    notations: NotationAttributes[],
  ) {
    d3.select("#" + svgId)
      .selectAll("path.free-sketch")
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

  function pointsToPathData(n: FreeSketchNotationAttributes): string {
    if (!n.points || n.points.length === 0) return "";

    let d = `M ${n.points[0].x} ${n.points[0].y}`;
    for (let i = 1; i < n.points.length; i++) {
      d += ` L ${n.points[i].x} ${n.points[i].y}`;
    }

    return d;
  }

  function addNotations(enter: any) {
    return enter
      .append("path")
      .attr("data-cy", () => {
        return "free-sketch";
      })
      .attr("class", () => {
        return "free-sketch";
      })
      .attr("id", (n: FreeSketchNotationAttributes) => {
        return n.uuid;
      })
      .attr("d", (n: FreeSketchNotationAttributes) => {
        return pointsToPathData(n);
      })
      .attr("stroke", (n: FreeSketchNotationAttributes) => {
        return matrixHelperUtils.getColor(n);
      })
      .attr("stroke-width", () => {
        return "2";
      })
      .attr("stroke-linecap", () => {
        return "round";
      })
      .attr("fill", () => {
        return "transparent";
      });
  }

  function updateNotations(update: any) {
    return update
      .attr("id", (n: FreeSketchNotationAttributes) => {
        return n.uuid;
      })
      .attr("d", (n: FreeSketchNotationAttributes) => {
        return pointsToPathData(n);
      })
      .attr("stroke", (n: FreeSketchNotationAttributes) => {
        return matrixHelperUtils.getColor(n);
      })
      .style("display", () => {
        return "block";
      });
  }

  return {
    mergeFreeSketchNotations,
  };
}
