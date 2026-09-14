import * as d3 from "d3";
import {
  matrixCellSize,
  matrixDimensions,
  defaultdCellStroke,
  graphPaperStroke,
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
import useConicHelper from "./matrixConicHelper";
import useFreeSketchHelper from "./matrixFreeSketchHelper";
import useMatrixCellHelper from "./matrixCellHelper";

import useHtmlHelper from "./matrixHtmlHelper";

const matrixCellHelper = useMatrixCellHelper();
const lineHelper = useLineHelper();
const curveHelper = useCurveHelper();
const circleHelper = useCircleHelper();
const conicHelper = useConicHelper();
const freeSketchHelper = useFreeSketchHelper();
const cellStore = useCellStore();
const notationStore = useNotationStore();
const htmlHelper = useHtmlHelper();

export default function useMatrixHelper() {
  let matrix: any[] = [];

  function setCellVerticalHeight(svgId: string) {
    const el = document.getElementById(svgId);
    const clientWidth = el?.clientWidth ?? 0;
    const clientHeight = el?.clientHeight ?? 0;

    if (clientWidth > 1 && clientHeight > 1) {
      cellStore.setCellVerticalHeight(
        Math.floor(clientHeight / matrixDimensions.rowsNum) - 1,
      );
      return;
    }

    if (cellStore.getCellVerticalHeightNet() > 0) return;
    cellStore.setCellVerticalHeight(matrixCellSize.height);
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
      .attr("width", () => Math.max(1, cellStore.getCellHorizontalWidthNet()))
      .attr("height", () => Math.max(1, cellStore.getCellVerticalHeightNet()));

    appendGraphPaper(svgId);
  }

  /** Mid-cell horizontals: each 2:1 cell reads as two stacked squares. */
  function appendGraphPaper(svgId: string) {
    const cellH = cellStore.getCellVerticalHeight();
    const midY = cellStore.getCellVerticalHeightNet() / 2;
    const boardW =
      matrixDimensions.colsNum * cellStore.getCellHorizontalWidth();
    const paper = d3
      .select("#" + svgId)
      .append("g")
      .attr("class", "graph-paper")
      .attr("pointer-events", "none");

    for (let row = 0; row < matrixDimensions.rowsNum; row++) {
      const y = row * cellH + midY;
      paper
        .append("rect")
        .attr("x", 0)
        .attr("y", y - 0.5)
        .attr("width", boardW)
        .attr("height", 1)
        .attr("fill", graphPaperStroke)
        .attr("pointer-events", "none");
    }
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

    conicHelper.mergeConicNotations(
      svgId,
      notations.filter((n) => n.notationType === "CONIC"),
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
