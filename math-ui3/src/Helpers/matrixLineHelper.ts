import * as d3 from "d3";
import {
  NotationAttributes,
  HorizontalLineNotationAttributes,
  SlopeLineNotationAttributes,
  VerticalLineNotationAttributes,
} from "common/baseTypes";
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
        return lineX1(n);
      })
      .attr("x2", (n: LineNotationAttributes) => {
        return lineX2(n);
      })
      .attr("y1", (n: LineNotationAttributes) => {
        return LineY1(n);
      })
      .attr("y2", (n: LineNotationAttributes) => {
        return LineY2(n);
      })
      .attr("stroke-width", () => {
        return "2";
      })
      .attr("stroke", () => {
        return "darkblue";
      });
  }

  function updateLineNotations(update: any) {
    return update
      .attr("id", (n: LineNotationAttributes) => {
        return n.uuid;
      })
      .attr("x1", (n: LineNotationAttributes) => {
        return lineX1(n);
      })
      .attr("x2", (n: LineNotationAttributes) => {
        return lineX2(n);
      })
      .attr("y1", (n: LineNotationAttributes) => {
        return LineY1(n);
      })
      .attr("y2", (n: LineNotationAttributes) => {
        return LineY2(n);
      })
      .attr("stroke-width", () => {
        return 2;
      })
      .attr("stroke", (n: LineNotationAttributes) => {
        return n.selected ? "chocolate" : "darkblue";
      });
  }

  function lineX1(n: LineNotationAttributes): number {
    return utils.getNotationXposByCol(n.fromCol ?? n.col);
  }

  function lineX2(n: LineNotationAttributes): number {
    return utils.getNotationXposByCol(n.toCol ?? n.col);
  }

  function LineY1(n: LineNotationAttributes): number {
    return utils.getNotationYposByRow(n.fromRow ?? n.row);
  }

  function LineY2(n: LineNotationAttributes): number {
    return utils.getNotationYposByRow(n.toRow ?? n.row);
  }

  return {
    mergeLineNotations,
  };
}
