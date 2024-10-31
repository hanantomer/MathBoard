import * as d3 from "d3";
import { matrixDimensions, defaultdCellStroke } from "common/globals";
import {
  SqrtNotationAttributes,
  PointNotationAttributes,
} from "common/baseTypes";
import { useCellStore } from "../store/pinia/cellStore";
import { useNotationStore } from "../store/pinia/notationStore";
import { cellSpace } from "common/globals";
import { NotationAttributes } from "common/baseTypes";
import useLineHelper from "./matrixLineHelper";
import useCurveHelper from "./matrixCurveHelper";
import useHtmlHelper from "./matrixHtmlHelper";

const lineHelper = useLineHelper();
const curveHelper = useCurveHelper();
const cellStore = useCellStore();
const notationStore = useNotationStore();
const htmlHelper = useHtmlHelper();

export default function useMatrixHelper() {
  let matrix: any[] = [];

  function setCellVerticalHeight(svgId: string) {
    if (cellStore.getCellVerticalHeight() !== cellSpace/*not initial value*/) return;

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
        let y = i === 0 ? 0 : cellStore.getCellVerticalHeight() * i;
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
        return i == 0 ? 0 : i * cellStore.getCellHorizontalWidth();
      })
      .attr("width", cellStore.getCellHorizontalWidthNet())
      .attr("height", cellStore.getCellVerticalHeightNet());
  }

  function enrichNotations(notations: NotationAttributes[]) {
    let enrichedNotations: NotationAttributes[] = [];
    for (const key in notations) {
      if (Object.hasOwnProperty.call(notations, key)) {
        const notation = notations[key];
        enrichedNotations.push(notation);
        // add sqrt symbol
        if (notation.notationType === "SQRT") {
          enrichedNotations.push(getSqrtSymbol(notation));
        }

        // if (notation.notationType === "SYMBOL") {
        //   let pointNotation = notation as PointNotationAttributes;
        //   pointNotation.followsFraction = symbolFollowsFraction(pointNotation);
        //   console.debug(pointNotation);
        // }
      }
    }
    return enrichedNotations;
  }

  function symbolFollowsFraction(notation: PointNotationAttributes): boolean {
    const maxLineDistance = 1;

    if (notationStore.isSymbolPartOfFraction(notation)) {
      return false;
    }

    if (
      notationStore.isSymbolAdjecentToHorizontalLine(notation, maxLineDistance)
    ) {
      return true;
    }

    return false;
  }

  function getSqrtSymbol(notation: NotationAttributes): NotationAttributes {
    let sqrtNotation = notation as SqrtNotationAttributes;
    let sqrtSignNotation = {
      ...sqrtNotation,
      col: sqrtNotation.fromCol,
      toCol: sqrtNotation.fromCol,
    };
    sqrtSignNotation.uuid = sqrtNotation.uuid + "_";
    sqrtSignNotation.notationType = "SQRTSYMBOL";
    return sqrtSignNotation;
  }

  function refreshScreen(svgId: string) {
    let notations: NotationAttributes[] = [];

    const svgElement = document!.getElementById(svgId);

    try {
      notations = enrichNotations(notationStore.getNotations());
    } catch {} // can't check if observer has properties

    htmlHelper.mergeHtmlNotations(
      svgId,
      notations.filter(
        (n) =>
          n.notationType === "ANNOTATION" ||
          n.notationType === "EXPONENT" ||
          n.notationType === "SIGN" ||
          n.notationType === "SQRT" ||
          n.notationType === "SQRTSYMBOL" ||
          n.notationType === "SYMBOL",
      ),
      svgElement!,
    );

    lineHelper.mergeLineNotations(
      svgId,
      notations.filter(
        (n) =>
          n.notationType === "HORIZONTALLINE" ||
          n.notationType === "VERTICALLINE" ||
          n.notationType === "SLOPELINE",
      ),
    );

    curveHelper.mergeCurveNotations(
      svgId,
      notations.filter(
        (n) =>
          n.notationType === "CONCAVECURVE" || n.notationType === "CONVEXCURVE",
      ),
    );
  }

  return {
    setMatrix,
    refreshScreen,
  };
}
