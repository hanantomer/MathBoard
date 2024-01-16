import { NotationTypeShape } from "common/unions";
import {
  getDefaultFontSize,
  selectedCellColor,
  matrixDimensions,
} from "common/globals";
import * as d3 from "d3";
import { useNotationStore } from "../store/pinia/notationStore";

export type CellCoordinates = { col: number; row: number };

import {
  NotationAttributes,
  PointAttributes,
  ExponentNotationAttributes,
  LineAttributes,
  RectAttributes,
  LineNotationAttributes,
  PointNotationAttributes,
  RectNotationAttributes,
} from "common/baseTypes";

import { useUserStore } from "../store/pinia/userStore";

const notationStore = useNotationStore();
const userStore = useUserStore();

export default function useMatrixHelper() {
  const svgWidth: string = "1400px";
  const svgHeight: string = "700px";
  let matrix: any[] = [];

  function borderColor(notation: NotationAttributes): string {
    return notation.selected ? "gray" : "transparent";
  }

  function textBorderColor(notation: NotationAttributes): string {
    return notation.selected ? "gray" : "lighgray";
  }

  function backgroundColor(selected: boolean): string {
    return selected ? "green" : "transparent";
  }

  function regularFontSize() {
    return `${notationStore.getCellVerticalHeight() / 25}em`;
  }

  function textFontSize(el: HTMLElement): string {
    return window.getComputedStyle(el, null).getPropertyValue("font-size");
  }

  function exponentBaseFontSize() {
    return `${notationStore.getCellVerticalHeight() / 28}em`;
  }

  function signFontSize() {
    return `${notationStore.getCellVerticalHeight() / 28}em`;
  }

  function sqrtFontSize() {
    return `${notationStore.getCellVerticalHeight() / 20}em`;
  }

  function setCellVerticalHeight(svgId: string) {
    let clientWidth: number | undefined =
      document.getElementById(svgId)?.clientWidth;
    let clientHeight: number | undefined =
      document.getElementById(svgId)?.clientHeight;

    if (!clientWidth || !clientHeight) return;

    notationStore.setCellVerticalHeight(
      //Math.min(
      //  Math.floor(clientWidth / colsNum),
      Math.floor(clientHeight / matrixDimensions.rowsNum),
      //),
    );
  }

  function setTextMeasurementCtx(el: HTMLElement) {
    let textMeasurementEl = document.createElement("canvas");
    (<any>window).textMeasurementCtx = textMeasurementEl.getContext("2d");
    (<any>window).textMeasurementCtx.font = window
      .getComputedStyle(el, null)
      .getPropertyValue("font");
  }

  function getGeoRectSize() {
    return 5; /// TODO : move to user prefernces
  }

  function getFreeTextRectWidth(text: string) {
    const textArr = text.split("\n");

    const maxWidth = Math.max(
      ...textArr.map((t) =>
        parseFloat((<any>window).textMeasurementCtx.measureText(t).width),
      ),
    );

    return maxWidth / notationStore.getCellVerticalHeight();
  }

  function getFreeTextRectHeight(text: string) {
    const fontSize = getDefaultFontSize();
    const margin = 5;
    return (
      ((fontSize + margin) * text.split(/\r*\n/).length) /
      notationStore.getCellVerticalHeight()
    );
  }

  function setMatrix(svgId: string) {
    const el = document.getElementById(svgId);
    if (!el) return;
    setCellVerticalHeight(svgId);
    setTextMeasurementCtx(el);

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
        return (
          "translate(0, " + notationStore.getCellVerticalHeight() * i + ")"
        );
      })
      .selectAll("cell")
      .data((r) => r)
      .enter()
      .append("rect")
      .attr("fill", (a, i, d) => {
        return "white";
      })
      //      .attr("stroke-opacity", opacity)
      .attr("stroke", "lightgray")
      .attr("col", (d, i) => {
        return i;
      })
      .attr("x", (d, i) => {
        return i * notationStore.getCellHorizontalWidth();
      })
      .attr("width", notationStore.getCellHorizontalWidth())
      .attr("height", notationStore.getCellVerticalHeight());
  }

  function getNextCell(
    horizontalStep: number,
    verticalStep: number,
  ): PointAttributes | undefined {
    if (
      notationStore.getSelectedCell()?.col == null ||
      !notationStore.getSelectedCell()?.row == null
    ) {
      return;
    }

    let col = notationStore.getSelectedCell()?.col || 0;
    let row = notationStore.getSelectedCell()?.row || 0;
    let nextCol = col;
    let nextRow = row;

    if (
      col + horizontalStep < matrixDimensions.colsNum &&
      col + horizontalStep >= 0
    ) {
      nextCol += horizontalStep;
    }

    if (
      col + horizontalStep >= matrixDimensions.colsNum &&
      row != matrixDimensions.rowsNum
    ) {
      nextRow += 1;
      nextCol = 0;
    }

    if (
      row + verticalStep < matrixDimensions.rowsNum &&
      row + verticalStep >= 0
    ) {
      nextRow += verticalStep;
    }

    if (
      row + verticalStep >= matrixDimensions.rowsNum ||
      row + verticalStep < 0
    ) {
      nextCol = 0;
      nextRow = 0;
    }

    return {
      col: nextCol,
      row: nextRow,
    };
  }

  function setNextCell(horizontalStep: number, verticalStep: number) {
    let nextCell = getNextCell(horizontalStep, verticalStep);
    if (nextCell) {
      notationStore.selectCell(nextCell);
    }
  }

  function findRect(point: PointAttributes): HTMLElement | undefined | null {
    return document
      ?.querySelector(`g[row='${point.row}']`)
      ?.querySelector(`cell[col='${point.col}']`);
  }

  function enrichNotations(notations: NotationAttributes[]) {
    let enrichedNotations: NotationAttributes[] = [];
    for (const key in notations) {
      if (Object.hasOwnProperty.call(notations, key)) {
        const notation = notations[key];
        enrichedNotations.push(notation);
        // add sqrt symbol
        if (notation.notationType === "SQRT") {
          let sqrtNotation = {
            ...notation,
            col: (notation as LineNotationAttributes).fromCol,
            toCol: null,
          };
          sqrtNotation.notationType = "SQRTSYMBOL";
          enrichedNotations.push(sqrtNotation);
        }
        // calculate image dimensions
        // if (element.type === "IMAGE") {
        //   let image = new Image();
        //   this.loadImage(image, element.value);
        //   element.toCol = Math.round(
        //     image.width / this.rectSize + element.fromCol
        //   );

        //   element.toRow = Math.round(
        //     image.height / this.rectSize + element.fromRow
        //   );
        // }
      }
    }
    return enrichedNotations;
  }

  function refreshScreen(notations: NotationAttributes[], svgId: string) {
    const svgElement = document!.getElementById(svgId);

    //setMatrix(svgId);

    try {
      notations = enrichNotations(notations);
    } catch {} // cant check if observer has properties

    d3.select("#" + svgId)
      .selectAll("foreignObject")
      .data(Object.values(notations), (d: any) => d.uuid)
      .join(
        (enter) => {
          return addNotations(enter, svgElement!);
        },
        (update) => {
          return updateNotations(update);
        },
        (exit) => {
          return removeNotations(exit);
        },
      );
  }

  function height(n: NotationAttributes): number | null {
    switch (NotationTypeShape.get(n.notationType)) {
      case "POINT": {
        return pointNotationHeight(n as PointNotationAttributes);
      }
      case "LINE": {
        return lineNotationHeight(n as LineNotationAttributes);
      }
      case "RECT": {
        return rectNotationHeight(n as RectNotationAttributes);
      }
    }
    return null;
  }

  /// TODO: treat notation types divertly
  function addNotations(enter: any, el: HTMLElement) {
    return (
      enter
        .append("foreignObject")
        .attr("notationType", (n: NotationAttributes) => {
          return n.notationType;
        })
        .attr("boardType", (n: NotationAttributes) => {
          return n.boardType;
        })
        .attr("uuid", (n: NotationAttributes) => {
          return n.uuid;
        })
        .attr("col", (n: PointAttributes) => {
          return n?.col;
        })
        .attr("fromCol", (n: LineAttributes | RectAttributes) => {
          return n?.fromCol;
        })
        .attr("toCol", (n: LineAttributes | RectAttributes) => {
          return n?.toCol;
        })
        .attr("row", (n: PointAttributes) => {
          return n?.row;
        })
        .attr("fromRow", (n: RectAttributes) => {
          return n?.fromRow;
        })
        .attr("toRow", (n: RectAttributes) => {
          return n?.toRow;
        })
        .attr("x", (n: NotationAttributes) => {
          return x(n);
        })
        .attr("y", (n: NotationAttributes) => {
          return y(n);
        })
        .attr("width", (n: NotationAttributes) => {
          return width(n);
        })
        .attr("height", (n: NotationAttributes) => {
          return height(n);
        })
        .style("font-size", (n: NotationAttributes) => {
          return fontSize(n, el);
        })
        //.style("color", (n) => {
        //  return this.$color(n);
        //})
        .html((n: NotationAttributes) => {
          return html(n);
        })
    );
  }

  function updateNotations(update: any) {
    return (
      update
        //.style("color", (n) => {
        //  return this.$color(n);
        //})
        .attr("x", (n: NotationAttributes) => {
          return x(n);
        })
        .attr("y", (n: NotationAttributes) => {
          return y(n);
        })
        .attr("col", (n: NotationAttributes) => {
          return col(n);
        })
        .attr("row", (n: NotationAttributes) => {
          return row(n);
        })
        .attr("width", (n: NotationAttributes) => {
          return width(n);
        })
        .html((n: NotationAttributes) => {
          return html(n);
        })
    );
  }

  function removeNotations(exit: any) {
    return exit.remove();
    //.transition()
    //.duration(1)
    //.attr("r", 0)
    //.style("opacity", 0)
    //.attr("cx", 1000)
    //.on("end", () => {
    //  d3.select(this).remove();
    //});
  }

  function col(n: NotationAttributes): number | null {
    switch (NotationTypeShape.get(n.notationType)) {
      case "POINT": {
        return (n as PointNotationAttributes).col;
      }
      case "LINE":
      case "RECT": {
        return (n as LineNotationAttributes).fromCol;
      }
    }
    return null;
  }

  function row(n: NotationAttributes) {
    switch (NotationTypeShape.get(n.notationType)) {
      case "POINT":
      case "LINE": {
        return (n as LineNotationAttributes).row;
      }
      case "RECT": {
        return (n as RectNotationAttributes).fromRow;
      }
    }
    return null;
  }

  function x(n: NotationAttributes): number | null {
    let colIdx = col(n);
    let deltaX =
      n.notationType === "SQRTSYMBOL"
        ? Math.round(notationStore.getCellHorizontalWidth() / 1.5) * -1
        : 0;

    return colIdx ? getNotationXposByCol(colIdx) + deltaX : null;
  }

  function y(n: NotationAttributes) {
    let rowIdx = row(n);
    if (!rowIdx) return null;
    let deltaY =
      //n.notationType === "EXPONENT"
      //  ? -5
      n.notationType === "FRACTION" ||
      n.notationType === "SQRT" ||
      n.notationType === "SQRTSYMBOL"
        ? -4
        : 0;

    return getNotationYposByRow(rowIdx) + deltaY;
  }

  function width(n: NotationAttributes): number | null {
    if (n.notationType === "SQRTSYMBOL") {
      return notationStore.getCellHorizontalWidth() * 2;
    }

    if (n.notationType === "EXPONENT") {
      const n1 = n as ExponentNotationAttributes;
      return notationStore.getCellHorizontalWidth() * 2;
    }

    switch (NotationTypeShape.get(n.notationType)) {
      case "POINT": {
        return pointNotationWidth(n as PointNotationAttributes);
      }
      case "LINE": {
        return lineNotationWidth(n as LineNotationAttributes);
      }
      case "RECT": {
        return rectNotationWidth(n as RectNotationAttributes);
      }
    }
    return null;
  }

  function pointNotationWidth(n: PointAttributes): number {
    return notationStore.getCellHorizontalWidth();
  }

  function lineNotationWidth(n: LineAttributes): number {
    return (n.toCol - n.fromCol) * notationStore.getCellHorizontalWidth() + 5;
  }

  function rectNotationWidth(n: RectAttributes): number {
    // if (n.notationType === "TEXT") {
    //   return (
    //     (<any>window).textMeasurementCtx.measureText(n.value).width +
    //     1 * n.value.length
    //   );
    // }
    return (
      (n.toCol - n.fromCol + 1) * notationStore.getCellHorizontalWidth() + 5
    );
  }

  function pointNotationHeight(n: PointAttributes): number {
    return notationStore.getCellVerticalHeight();
  }

  function lineNotationHeight(n: LineAttributes): number {
    return 8;
  }

  function rectNotationHeight(n: RectAttributes): number {
    return (
      (n.toRow - n.fromRow + 1) * notationStore.getCellVerticalHeight() + 5
    );
  }

  function fontSize(n: NotationAttributes, el: HTMLElement) {
    return n.notationType === "TEXT"
      ? textFontSize(el)
      : n.notationType === "SIGN"
      ? signFontSize()
      : regularFontSize;
  }

  function html(n: NotationAttributes) {
    let fontWeight =
      userStore.getCurrentUser()?.uuid == n.user.uuid ? "bold" : "normal";

    let color =
      Array.from(notationStore.getSelectedNotations())
        .map((n) => n.uuid)
        .indexOf(n.uuid) >= 0
        ? "chocolate"
        : notationStore.getParent().type === "ANSWER" &&
          userStore.getCurrentUser()?.uuid != n.user.uuid
        ? "purple"
        : "black";

    if (n.notationType === "FRACTION") {
      let n1 = n as LineNotationAttributes;
      return `<span class=line style='color:${color};width:${
        (n1.toCol - n1.fromCol) * notationStore.getCellHorizontalWidth()
      }px;'></span>`;
    }

    if (n.notationType === "SQRT") {
      let n1 = n as LineNotationAttributes;
      return `<span class=line style='color:${color};position:relative;left:9px;width:${
        (n1.toCol - n1.fromCol) * notationStore.getCellHorizontalWidth() - 8
      }px;'></span>`;
    }

    if (n.notationType === "SQRTSYMBOL") {
      return `<p class='sqrtsymbol'>&#x221A;</p>`;
    }

    if (n.notationType === "TEXT") {
      let n1 = n as RectNotationAttributes;

      let bColor = textBorderColor(n ?? false);
      return `<pre style='border:groove 2px;border-color:${bColor};'>${n1.value}</pre>`;
    }

    if (n.notationType === "IMAGE") {
      let n1 = n as RectNotationAttributes;
      let bColor = borderColor(n ?? false);
      return `<img style='border:groove 2px;border-color:${borderColor}' src='${n1.value}'>`;
    }

    if (n.notationType === "EXPONENT") {
      let n1 = n as ExponentNotationAttributes;
      return `</span><span style='position: absolute;top: 50%;transform: translateY(-50%);left:10%;translateX(-10%);color:${color};font-weight:${fontWeight};font-size:1.1em'>${n1.base}</span>
       <span style='position:relative;left:60%;bottom:6px;color:${color};font-weight:${fontWeight};font-size:0.8em'>${n1.exponent}`;
    }

    let n1 = n as PointNotationAttributes;
    return `<p style='color:${color};font-weight:${fontWeight}; position: absolute;top: 50%;transform: translateY(-50%);left:20%;translateX(-20%);font-size:1.1em'>${n1.value}</p>`;
  }

  function getNotationXposByCol(col: number): number {
    return col * notationStore.getCellHorizontalWidth();
  }

  function getNotationYposByRow(row: number): number {
    return row * notationStore.getCellVerticalHeight();
  }

  // called by store watcher. see mathboard.vue
  function showSelectedCell(
    svgId: string,
    newSelectedCell: CellCoordinates | null | undefined,
    oldSelectedCell: CellCoordinates | null | undefined,
  ) {
    if (oldSelectedCell?.col != null) {
      let prevRectElm = document
        ?.querySelector<HTMLElement>(
          `svg[id="${svgId}"] g[row="${oldSelectedCell.row}"]`,
        )
        ?.querySelector<HTMLElement>(`rect[col="${oldSelectedCell.col}"]`);

      if (prevRectElm?.style) prevRectElm.style.fill = "";
    }

    if (newSelectedCell?.col != null) {
      let rectElm = document
        ?.querySelector<HTMLElement>(
          `svg[id="${svgId}"] g[row="${newSelectedCell.row}"]`,
        )
        ?.querySelector<HTMLElement>(`rect[col="${newSelectedCell.col}"]`);

      if (rectElm?.style) rectElm.style.fill = selectedCellColor;
    }
  }

  return {
    svgWidth,
    svgHeight,
    findRect,
    setNextCell,
    getFreeTextRectWidth,
    getFreeTextRectHeight,
    getGeoRectSize,
    getNotationXposByCol,
    getNotationYposByRow,
    refreshScreen,
    setMatrix,
    showSelectedCell,
  };
}
