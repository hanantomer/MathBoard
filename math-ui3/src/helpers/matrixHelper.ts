import * as d3 from "d3";
import {
  matrixDimensions,
  defaultdCellStroke,
  sqrtSymbolSuffix,
} from "common/globals";
import { NotationAttributes, RectNotationAttributes, SqrtNotationAttributes } from "common/baseTypes";
import { useCellStore } from "../store/pinia/cellStore";
import { useNotationStore } from "../store/pinia/notationStore";
import { isPracticeBoard } from "./practiceBoardAdapter";
import { isPracticePartLabelOnly } from "common/practiceParts";
import useLineHelper from "./matrixLineHelper";
import useCurveHelper from "./matrixCurveHelper";
import useCircleHelper from "./matrixCircleHelper";
import useFreeSketchHelper from "./matrixFreeSketchHelper";
import useMatrixCellHelper from "./matrixCellHelper";

import useHtmlHelper from "./matrixHtmlHelper";

const matrixCellHelper = useMatrixCellHelper();
const lineHelper = useLineHelper();
const curveHelper = useCurveHelper();
const circleHelper = useCircleHelper();
const freeSketchHelper = useFreeSketchHelper();
const cellStore = useCellStore();
const notationStore = useNotationStore();
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
      Math.floor(clientHeight / matrixDimensions.rowsNum) - 1,
    );
  }

  function setMatrix(svgId: string) {
    const el = document.getElementById(svgId);
    if (!el) return;
    matrix = [];
    d3.select("#" + svgId).selectAll("g").remove();
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
      .attr("style", () => {
        return "pointer-events: none";
      })
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
      }
    }
    return enrichedNotations;
  }

  function getSqrtSymbol(notation: NotationAttributes): NotationAttributes {
    let sqrtNotation = notation as SqrtNotationAttributes;
    let sqrtSignNotation = {
      ...sqrtNotation,
      col: sqrtNotation.fromCol,
      toCol: sqrtNotation.fromCol,
    };
    sqrtSignNotation.uuid = sqrtNotation.uuid + sqrtSymbolSuffix;
    sqrtSignNotation.notationType = "SQRTSYMBOL";
    return sqrtSignNotation;
  }

  function refreshScreen(svgId: string) {
    matrixCellHelper.resetAllCellColors();

    let notations: NotationAttributes[] = [];

    const svgElement = document!.getElementById(svgId);

    try {
      notations = enrichNotations(notationStore.getNotations());
      if (isPracticeBoard()) {
        notations = notations.filter((n) => n.boardType !== "QUESTION");
      }
    } catch {} // can't check if observer has properties

    circleHelper.mergeCircleNotations(
      svgId,
      notations.filter((n) => n.notationType === "CIRCLE"),
    );

    freeSketchHelper.mergeFreeSketchNotations(
      svgId,
      notations.filter((n) => n.notationType === "FREESKETCH"),
    );

    curveHelper.mergeCurveNotations(
      svgId,
      notations.filter((n) => n.notationType === "CURVE"),
    );

    const htmlNotations = notations.filter((n) => {
      if (
        n.notationType === "TEXT" &&
        isPracticePartLabelOnly((n as RectNotationAttributes).value ?? "")
      ) {
        return false;
      }
      return (
        n.notationType === "ANNOTATION" ||
        n.notationType === "EXPONENT" ||
        n.notationType === "LOGBASE" ||
        n.notationType === "SQRT" ||
        n.notationType === "TEXT" ||
        n.notationType === "IMAGE" ||
        n.notationType === "SQRTSYMBOL" ||
        n.notationType === "SYMBOL"
      );
    });

    htmlHelper.mergeHtmlNotations(svgId, htmlNotations, svgElement!);

    lineHelper.mergeLineNotations(
      svgId,
      notations.filter(
        (n) => n.notationType === "LINE" || n.notationType === "DIVISIONLINE",
      ),
    );
  }

  return {
    setMatrix,
    refreshScreen,
  };
}
