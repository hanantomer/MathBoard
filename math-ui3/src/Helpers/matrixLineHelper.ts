import * as d3 from "d3";
import {
  NotationAttributes,
  HorizontalLineNotationAttributes,
  SlopeLineNotationAttributes,
  VerticalLineNotationAttributes,
  HorizontalLineAttributes,
} from "common/baseTypes";

import { lineColor, selectionColor } from "common/globals";

import useUtils from "./matrixHelperUtils";
import { add } from "cypress/types/lodash";

const utils = useUtils();

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
          return utils.removeNotations(exit);
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
        return n.color?.value ? n.color.value : lineColor;
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
        return n.selected
          ? selectionColor
          : n.color?.value
          ? n.color.value
          : lineColor;
      });
  }

  return {
    mergeLineNotations,
  };
}
