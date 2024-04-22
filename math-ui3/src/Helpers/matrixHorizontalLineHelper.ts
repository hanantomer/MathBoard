import * as d3 from "d3";
import { HorizontalLineNotationAttributes } from "common/baseTypes";
import { NotationAttributes } from "common/baseTypes";
import useUtils from "./matrixHelperUtils";

const utils = useUtils();

export default function useHorizontalLineMatrixHelper() {
  // function mergeLineNotations(svgId: string, notations: NotationAttributes[]) {
  //   d3.select("#" + svgId)
  //     .selectAll("line")
  //     .data(notations, (u: any) => {
  //       return (u as NotationAttributes).uuid;
  //     })
  //     .join(
  //       (enter) => {
  //         return addHorizontalLineNotations(enter);
  //       },
  //       (update) => {
  //         return updateHorizontalLineNotations(update);
  //       },
  //       (exit) => {
  //         return utils.removeNotations(exit);
  //       },
  //     );
  // }

  function addHorizontalLineNotations(enter: any) {
    return enter
      .append("line")
      .attr("id", (n: HorizontalLineNotationAttributes) => {
        return n.uuid;
      })
      .attr("x1", (n: HorizontalLineNotationAttributes) => {
        return horizontalLineLeft(n);
      })
      .attr("x2", (n: HorizontalLineNotationAttributes) => {
        return horizontalLineRight(n);
      })
      .attr("y1", (n: HorizontalLineNotationAttributes) => {
        return horizontalLineY(n);
      })
      .attr("y2", (n: HorizontalLineNotationAttributes) => {
        return horizontalLineY(n);
      })
      .attr("stroke-width", () => {
        return "2";
      })
      .attr("stroke", () => {
        return "darkblue";
      });
  }

  function updateHorizontalLineNotations(update: any) {
    console.debug("update line");
    return update
      .attr("id", (n: HorizontalLineNotationAttributes) => {
        return n.uuid;
      })
      .attr("x1", (n: HorizontalLineNotationAttributes) => {
        return horizontalLineLeft(n);
      })
      .attr("x2", (n: HorizontalLineNotationAttributes) => {
        return horizontalLineRight(n);
      })
      .attr("y1", (n: HorizontalLineNotationAttributes) => {
        return horizontalLineY(n);
      })
      .attr("y2", (n: HorizontalLineNotationAttributes) => {
        return horizontalLineY(n);
      })
      .attr("stroke-width", () => {
        return 2;
      })
      .attr("fill", () => {
        return "darkblue";
      });
  }

  function horizontalLineLeft(n: HorizontalLineNotationAttributes): number | null {
    return utils.getNotationXposByCol(n.fromCol);
  }

  function horizontalLineY(n: HorizontalLineNotationAttributes) {
    return utils.getNotationYposByRow(n.row);
  }

  function horizontalLineRight(n: HorizontalLineNotationAttributes): number {
    return utils.getNotationXposByCol(n.toCol);
  }

  return {
//    mergeLineNotations,
    addHorizontalLineNotations,
    updateHorizontalLineNotations
  };
}
