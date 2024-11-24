import * as d3 from "d3";
import {
  NotationAttributes,
  HorizontalLineNotationAttributes,
  SlopeLineNotationAttributes,
  VerticalLineNotationAttributes,
} from "common/baseTypes";

import useMatrixHelperUtils from "./matrixHelperUtils";
const matrixHelperUtils = useMatrixHelperUtils();

type LineNotationAttributes = HorizontalLineNotationAttributes &
  VerticalLineNotationAttributes &
  SlopeLineNotationAttributes;

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
        return n.px ?? n.p1x;
      })
      .attr("x2", (n: LineNotationAttributes) => {
        return n.px ?? n.p2x;
      })
      .attr("y1", (n: LineNotationAttributes) => {
        return n.py ?? n.p1y;
      })
      .attr("y2", (n: LineNotationAttributes) => {
        return n.py ?? n.p2y;
      })
      .attr("stroke-width", (n: LineNotationAttributes) => {
        return "2";
      })
      .attr("stroke", (n: LineNotationAttributes) => {
        return matrixHelperUtils.getColor(n);
      });
  }

  function updateLineNotations(update: any) {
    return update
      .attr("id", (n: LineNotationAttributes) => {
        return n.uuid;
      })
      .attr("x1", (n: LineNotationAttributes) => {
        return n.px ?? n.p1x;
      })
      .attr("x2", (n: LineNotationAttributes) => {
        return n.px ?? n.p2x;
      })
      .attr("y1", (n: LineNotationAttributes) => {
        return n.py ?? n.p1y;
      })
      .attr("y2", (n: LineNotationAttributes) => {
        return n.py ?? n.p2y;
      })
      .attr("stroke-width", () => {
        return 2;
      })
      .attr("stroke", (n: LineNotationAttributes) => {
        return matrixHelperUtils.getColor(n);
      });
  }

  return {
    mergeLineNotations,
  };
}
