import * as d3 from "d3";
import { SlopeLineNotationAttributes } from "common/baseTypes";
import { NotationAttributes } from "common/baseTypes";
import useUtils from "./matrixHelperUtils";

const utils = useUtils();


export default function useSlopeLineMatrixHelper() {
  function mergeLineNotations(svgId: string, notations: NotationAttributes[]) {
    d3.select("#" + svgId)
      .selectAll("line")
      .data(notations, (u: any) => {
        return (u as NotationAttributes).uuid;
      })
      .join(
        (enter) => {
          return addSlopeLineNotations(enter);
        },
        (update) => {
          return updateSlopeLineNotations(update);
        },
        (exit) => {
          return utils.removeNotations(exit);
        },
      );
  }

  function addSlopeLineNotations(enter: any) {
    return enter
      .append("line")
      .attr("id", (n: SlopeLineNotationAttributes) => {
        return n.uuid;
      })
      .attr("x1", (n: SlopeLineNotationAttributes) => {
        return slopeLineX1(n);
      })
      .attr("x2", (n: SlopeLineNotationAttributes) => {
        return slopeLineX2(n);
      })
      .attr("y1", (n: SlopeLineNotationAttributes) => {
        return slopeLineY1(n);
      })
      .attr("y2", (n: SlopeLineNotationAttributes) => {
        return slopeLineY2(n);
      })
      .attr("stroke-width", () => {
        return "2"; /// TODO: move to global
      })
      .attr("stroke", () => {
        return "darkblue"; /// TODO: move to global
      });
  }

  function updateSlopeLineNotations(update: any) {
    return update /// TODO: try reuse wuth add
      .attr("id", (n: SlopeLineNotationAttributes) => {
        return n.uuid;
      })
      .attr("x1", (n: SlopeLineNotationAttributes) => {
        return slopeLineX1(n);
      })
      .attr("x2", (n: SlopeLineNotationAttributes) => {
        return slopeLineX2(n);
      })
      .attr("y1", (n: SlopeLineNotationAttributes) => {
        return slopeLineY1(n);
      })
      .attr("y2", (n: SlopeLineNotationAttributes) => {
        return slopeLineY2(n);
      })
      .attr("stroke-width", () => {
        return 2;
      })
      .attr("fill", () => {
        return "darkblue";
      });
  }

  function slopeLineX1(n: SlopeLineNotationAttributes) {
    return utils.getNotationXposByCol(n.fromCol);
  }

  function slopeLineX2(n: SlopeLineNotationAttributes) {
    return utils.getNotationXposByCol(n.toCol);
  }

  function slopeLineY1(n: SlopeLineNotationAttributes) {
    return utils.getNotationYposByRow(n.fromRow);
  }

  function slopeLineY2(n: SlopeLineNotationAttributes): number {
    return utils.getNotationYposByRow(n.toRow);
  }

  return {
    mergeLineNotations,
    addSlopeLineNotations,
    updateSlopeLineNotations,
  };
}
