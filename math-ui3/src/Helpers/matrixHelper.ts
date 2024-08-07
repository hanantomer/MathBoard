import * as d3 from "d3";
import { NotationTypeShape } from "common/unions";
import { matrixDimensions, defaultdCellStroke } from "common/globals";
import { HorizontalLineNotationAttributes } from "common/baseTypes";
import { useNotationStore } from "../store/pinia/notationStore";
import { useCellStore } from "../store/pinia/cellStore";
import { cellSpace } from "common/globals";
import { NotationAttributes } from "common/baseTypes";
import useLineHelper from "./matrixLineHelper";
import useCurveHelper from "./matrixCurveHelper";
import useHtmlHelper from "./matrixHtmlHelper";

const lineHelper = useLineHelper();
const curveHelper = useCurveHelper();
const notationStore = useNotationStore();
const cellStore = useCellStore();
const htmlHelper = useHtmlHelper();

export default function useMatrixHelper() {
  let matrix: any[] = [];

  function setCellVerticalHeight(svgId: string) {
    let clientWidth: number | undefined =
      document.getElementById(svgId)?.clientWidth;
    let clientHeight: number | undefined =
      document.getElementById(svgId)?.clientHeight;

    if (!clientWidth || !clientHeight) return;

    cellStore.setCellVerticalHeight(
      Math.floor(clientHeight / matrixDimensions.rowsNum),
    );
  }

  function setMatrix(svgId: string) {
    const el = document.getElementById(svgId);
    if (!el) return;
    setCellVerticalHeight(svgId);

    // render rows
    for (var row = 0; row < matrixDimensions.rowsNum; row++) {
      matrix.push(d3.range(matrixDimensions.colsNum));
    }

    // render cells
    d3.select("#" + svgId)
      .selectAll("g")
      .data(matrix)
      .enter()
      .append("g")
      .attr("row", (d, i) => {
        return i;
      })
      .lower()
      .attr("transform", (d, i) => {
        let y =
          i === 0
            ? 0
            : (cellStore.getCellVerticalHeight() + cellSpace) * i - cellSpace;
        return "translate(0, " + y + ")";
      })
      .selectAll("cell")
      .data((r) => r)
      .enter()
      .append("rect")
      .attr("fill", () => {
        return "white";
      })
      .attr("stroke", defaultdCellStroke)
      .attr("col", (d, i) => {
        return i;
      })
      .attr("x", (d, i) => {
        return i == 0
          ? 0
          : i * (cellStore.getCellHorizontalWidth() + cellSpace) - cellSpace;
      })
      .attr("width", cellStore.getCellHorizontalWidth())
      .attr("height", cellStore.getCellVerticalHeight());
  }

  function enrichNotations(notations: NotationAttributes[]) {
    let enrichedNotations: NotationAttributes[] = [];
    for (const key in notations) {
      if (Object.hasOwnProperty.call(notations, key)) {
        const notation = notations[key];
        enrichedNotations.push(notation);
        // add sqrt symbol
        if (notation.notationType === "SQRT") {
          let sqrtNotation = notation as HorizontalLineNotationAttributes;
          let sqrtSignNotation = {
            ...sqrtNotation,
            col: sqrtNotation.fromCol,
            toCol: sqrtNotation.fromCol,
          };
          sqrtSignNotation.uuid = sqrtNotation.uuid + "_";
          sqrtSignNotation.notationType = "SQRTSYMBOL";
          enrichedNotations.push(sqrtSignNotation);
        }
      }
    }
    return enrichedNotations;
  }

  function refreshScreen(notations: NotationAttributes[], svgId: string) {
    const svgElement = document!.getElementById(svgId);

    try {
      notations = enrichNotations(notations);
    } catch {} // can't check if observer has properties

    htmlHelper.mergeHtmlNotations(
      svgId,
      notations.filter(
        (n) =>
          NotationTypeShape.get(n.notationType) === "POINT" ||
          NotationTypeShape.get(n.notationType) === "RECT",
      ),
      svgElement!,
    );

    lineHelper.mergeLineNotations(
      svgId,
      notations.filter(
        (n) =>
          NotationTypeShape.get(n.notationType) === "HORIZONTAL_LINE" ||
          NotationTypeShape.get(n.notationType) === "VERTICAL_LINE" ||
          NotationTypeShape.get(n.notationType) === "SLOPE_LINE",
      ),
    );

    curveHelper.mergeCurveNotations(
      svgId,
      notations.filter(
        (n) =>
          NotationTypeShape.get(n.notationType) === "CONCAVE_CURVE" ||
          NotationTypeShape.get(n.notationType) === "CONVEX_CURVE",
      ),
    );
  }

  return {
    setMatrix,
    refreshScreen,
  };
}
