import * as d3 from "d3";
import { VerticalLineNotationAttributes } from "common/baseTypes";
import { NotationAttributes } from "common/baseTypes";
import useUtils from "./matrixHelperUtils";

const utils = useUtils();

export default function useVerticalLineMatrixHelper() {
  function mergeLineNotations(svgId: string, notations: NotationAttributes[]) {
    d3.select("#" + svgId)
      .selectAll("line")
      .data(notations, (u: any) => {
        return (u as NotationAttributes).uuid;
      })
      .join(
        (enter) => {
          return addVerticalLineNotations(enter);
        },
        (update) => {
          return updateVerticalLineNotations(update);
        },
        (exit) => {
          return utils.removeNotations(exit);
        },
      );
  }

  function addVerticalLineNotations(enter: any) {
    return enter
      .append("line")
      .attr("id", (n: VerticalLineNotationAttributes) => {
        return n.uuid;
      })
      .attr("x1", (n: VerticalLineNotationAttributes) => {
        return verticalLineX(n);
      })
      .attr("x2", (n: VerticalLineNotationAttributes) => {
        return verticalLineX(n);
      })
      .attr("y1", (n: VerticalLineNotationAttributes) => {
        return verticalLineY1(n);
      })
      .attr("y2", (n: VerticalLineNotationAttributes) => {
        return verticalLineY2(n);
      })
      .attr("stroke-width", () => {
        return "2"; /// TODO: move to global
      })
      .attr("stroke", () => {
        return "darkblue"; /// TODO: move to global
      });
  }

  function updateVerticalLineNotations(update: any) {
    return update
      .attr("id", (n: VerticalLineNotationAttributes) => {
        return n.uuid;
      })
      .attr("x1", (n: VerticalLineNotationAttributes) => {
        return verticalLineX(n);
      })
      .attr("x2", (n: VerticalLineNotationAttributes) => {
        return verticalLineX(n);
      })
      .attr("y1", (n: VerticalLineNotationAttributes) => {
        return verticalLineY1(n);
      })
      .attr("y2", (n: VerticalLineNotationAttributes) => {
        return verticalLineY2(n);
      })
      .attr("stroke-width", () => {
        return 2;
      })
      .attr("fill", () => {
        return "darkblue";
      });
  }

  function verticalLineX(n: VerticalLineNotationAttributes) {
    return utils.getNotationXposByCol(n.col);
  }

  function verticalLineY1(n: VerticalLineNotationAttributes) {
    return utils.getNotationYposByRow(n.fromRow);
  }

  function verticalLineY2(n: VerticalLineNotationAttributes): number {
    return utils.getNotationYposByRow(n.toRow);
  }

  return {
    mergeLineNotations,
    addVerticalLineNotations,
    updateVerticalLineNotations,
  };
}
