import * as d3 from "d3";
import {
  NotationAttributes,
  HorizontalLineNotationAttributes,
  SlopeLineNotationAttributes,
  VerticalLineNotationAttributes,
} from "common/baseTypes";

import { lineColor, selectionColor } from "common/globals";

import useUtils from "./matrixHelperUtils";

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
        return n.x1;
      })
      .attr("x2", (n: LineNotationAttributes) => {
        return n.x2;
      })
      .attr("y1", (n: LineNotationAttributes) => {
        return n.y1;
      })
      .attr("y2", (n: LineNotationAttributes) => {
        return n.y2;
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
        return n.x1;
      })
      .attr("x2", (n: LineNotationAttributes) => {
        return n.x2;
      })
      .attr("y1", (n: LineNotationAttributes) => {
        return n.y1;
      })
      .attr("y2", (n: LineNotationAttributes) => {
        return n.y2;
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

  // function lineX1(n: LineNotationAttributes): number {
  //   const col =
  //     n.notationType === "SQRT"
  //       ? n.fromCol + 1 /*to leave space for sqrt sign*/
  //       : n.fromCol ?? n.col;
  //   return utils.getNotationXposByCol(col);
  // }

  // function lineX2(n: LineNotationAttributes): number {
  //   return utils.getNotationXposByCol(n.toCol ?? n.col);
  // }

  // function LineY1(n: LineNotationAttributes): number {
  //   return utils.getNotationYposByRow(n.fromRow ?? n.row);
  // }

  // function LineY2(n: LineNotationAttributes): number {
  //   return utils.getNotationYposByRow(n.toRow ?? n.row);
  // }

  return {
    mergeLineNotations,
  };
}
