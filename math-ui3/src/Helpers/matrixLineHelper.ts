import * as d3 from "d3";
import { NotationAttributes, LineNotationAttributes } from "common/baseTypes";

import useMatrixHelperUtils from "./matrixHelperUtils";
const matrixHelperUtils = useMatrixHelperUtils();

export default function useLineMatrixHelper() {
  function mergeLineNotations(svgId: string, notations: NotationAttributes[]) {
    d3.select("#" + svgId)
      .selectAll("line")
      .data(notations, (u: any) => {
        return (u as NotationAttributes).uuid;
      })
      .join(
        (enter) => {
          return addLineNotations(enter);
        },
        (update) => {
          return updateLineNotations(update);
        },
        (exit) => {
          return matrixHelperUtils.removeNotations(exit);
        },
      );
  }

  function addLineNotations(enter: any) {
    return enter
      .append("line")
      .attr("id", (n: LineNotationAttributes) => {
        return n.uuid;
      })
      .attr("x1", (n: LineNotationAttributes) => {
        return n.p1x;
      })
      .attr("x2", (n: LineNotationAttributes) => {
        return n.p2x;
      })
      .attr("y1", (n: LineNotationAttributes) => {
        return n.p1y;
      })
      .attr("y2", (n: LineNotationAttributes) => {
        return n.p2y;
      })
      .attr("stroke-width", (n: LineNotationAttributes) => {
        return "2";
      })
      .attr("stroke", (n: LineNotationAttributes) => {
        return matrixHelperUtils.getColor(n);
      })
      .attr("class", (n: LineNotationAttributes) => {
        if (n.dashed) {
          return "dashed";
        } else {
          return "solid";
        }
      })
      .attr("marker-end", (n: LineNotationAttributes) => {
        return n.arrowRight ? "url(#arrowright)" : null;
      })
      .attr("marker-start", (n: LineNotationAttributes) => {
        return n.arrowLeft ? "url(#arrowleft)" : null;
      });
  }

  function updateLineNotations(update: any) {
    return update
      .attr("id", (n: LineNotationAttributes) => {
        return n.uuid;
      })
      .attr("x1", (n: LineNotationAttributes) => {
        return n.p1x;
      })
      .attr("x2", (n: LineNotationAttributes) => {
        return n.p2x;
      })
      .attr("y1", (n: LineNotationAttributes) => {
        return n.p1y;
      })
      .attr("y2", (n: LineNotationAttributes) => {
        return n.p2y;
      })
      .attr("stroke-width", () => {
        return 2;
      })
      .attr("stroke", (n: LineNotationAttributes) => {
        return matrixHelperUtils.getColor(n);
      })
      .attr("class", (n: LineNotationAttributes) => {
        if (n.dashed) {
          return "dashed";
        } else {
          return "solid";
        }
      })
      .attr("marker-end", (n: LineNotationAttributes) => {
        return n.arrowRight ? "url(#arrowright)" : null;
      })
      .attr("marker-start", (n: LineNotationAttributes) => {
        return n.arrowLeft ? "url(#arrowleft)" : null;
      });
  }

  return {
    mergeLineNotations,
  };
}
