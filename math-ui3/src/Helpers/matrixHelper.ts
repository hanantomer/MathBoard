import { NotationTypeShape } from "common/unions";
import { getDefaultFontSize } from "common/globals";
import * as d3 from "d3";
import { useNotationStore } from "../store/pinia/notationStore";

import {
  NotationAttributes,
  PointAttributes,
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
  const opacity: number = 1;
  const colsNum: number = 35;
  const rowsNum: number = 20;

  const svgWidth: string = "1400px";
  const svgHeight: string = "700px";
  let matrix: any[] = [];

  function borderColor(notation: NotationAttributes): string {
    return notation.selected ? "gray" : "transparent";
  }

  function backgroundColor(selected: boolean): string {
    return selected ? "green" : "transparent";
  }

  function regularFontSize() {
    return `${notationStore.getRectSize() / 25}em`;
  }

  function textFontSize(el: HTMLElement): string {
    return window.getComputedStyle(el, null).getPropertyValue("font-size");
  }

  function powerFontSize() {
    return `${notationStore.getRectSize() / 50}em`;
  }

  function signFontSize() {
    return `${notationStore.getRectSize() / 28}em`;
  }

  function sqrtFontSize() {
    return `${notationStore.getRectSize() / 20}em`;
  }

  function setRectSize(svgId: string) {
    let clientWidth: number | undefined =
      document.getElementById(svgId)?.clientWidth;
    let clientHeight: number | undefined =
      document.getElementById(svgId)?.clientHeight;

    if (!clientWidth || !clientHeight) return;

    notationStore.setRectSize(
      Math.min(
        Math.floor(clientWidth / colsNum),
        Math.floor(clientHeight / rowsNum),
      ),
    );
  }

  function setTextMeasurementCtx(el: HTMLElement) {
    let textMeasurementEl = document.createElement("canvas");
    (<any>window).textMeasurementCtx = textMeasurementEl.getContext("2d");
    (<any>window).textMeasurementCtx.font = window
      .getComputedStyle(el, null)
      .getPropertyValue("font");
  }

  /// call from component mount

  // function init(el: HTMLElement, svgId: string) {
  //   setRectSize(svgId);
  //   setTextMeasurementCtx(el);
  // }

  function getFreeTextRectWidth(text: string) {
    const textArr = text.split("\n");

    const maxWidth = Math.max(
      ...textArr.map((t) =>
        parseFloat((<any>window).textMeasurementCtx.measureText(t).width),
      ),
    );

    return maxWidth / notationStore.getRectSize();
  }

  function getFreeTextRectHeight(text: string) {
    const fontSize = getDefaultFontSize();
    const margin = 5;
    return (
      ((fontSize + margin) * text.split(/\r*\n/).length) /
      notationStore.getRectSize()
    );
  }

  function setMatrix(svgId: string) {
    const el = document.getElementById(svgId);
    if (!el) return;
    setRectSize(svgId);
    setTextMeasurementCtx(el);

    // render rows
    for (var row = 0; row < rowsNum; row++) {
      matrix.push(d3.range(colsNum));
    }

    // render rectangles
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
        return "translate(0, " + notationStore.getRectSize() * i + ")";
      })
      .selectAll("rect")
      .data((r) => r)
      .enter()
      .append("rect")
      .attr("fill", (a, i, d) => {
        return "white";
      })
      .attr("stroke-opacity", opacity)
      .attr("stroke", "lightgray")
      .attr("col", (d, i) => {
        return i;
      })
      .attr("x", (d, i) => {
        return i * notationStore.getRectSize();
      })
      .attr("width", notationStore.getRectSize())
      .attr("height", notationStore.getRectSize());
  }

  function getNextRect(
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

    if (col + horizontalStep < colsNum && col + horizontalStep >= 0) {
      nextCol += horizontalStep;
    }

    if (col + horizontalStep >= colsNum && row != rowsNum) {
      nextRow += 1;
      nextCol = 0;
    }

    if (row + verticalStep < rowsNum && row + verticalStep >= 0) {
      nextRow += verticalStep;
    }

    if (row + verticalStep >= rowsNum || row + verticalStep < 0) {
      nextCol = 0;
      nextRow = 0;
    }

    return {
      col: nextCol,
      row: nextRow,
    };
  }

  function setNextRect(horizontalStep: number, verticalStep: number) {
    let nextRect: any = getNextRect(horizontalStep, verticalStep);
    if (nextRect) {
      nextRect.notationType = "rect";
      notationStore.selectCell(nextRect);
    }
  }

  function findRect(point: PointAttributes): HTMLElement | undefined | null {
    return document
      ?.querySelector(`g[row='${point.row}']`)
      ?.querySelector(`rect[col='${point.col}']`);
  }

  function removeNotation(n: NotationAttributes) {
    document?.getElementById(n.uuid + n.notationType)?.remove();
  }

  function enrichNotations(notations: NotationAttributes[]) {
    let enrichedNotations: NotationAttributes[] = [];
    for (const key in notations) {
      if (Object.hasOwnProperty.call(notations, key)) {
        const notation = notations[key];
        enrichedNotations.push(notation);
        // add sqrt symbol
        if (notation.notationType === "SQRT") {
          let sqrtNotation = { ...notation };
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

    setMatrix(svgId);

    try {
      notations = enrichNotations(notations);
    } catch {} // cant check if observer has properties

    d3.select("#" + svgId)
      .selectAll("foreignObject")
      .data(Object.values(notations))
      .join(
        (enter) => {
          return showNotations(enter, svgElement!);
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
  function showNotations(enter: any, el: HTMLElement) {
    return (
      enter
        .append("foreignObject")
        .attr("type", (n: NotationAttributes) => {
          return n.notationType;
        })
        .attr("id", (n: NotationAttributes) => {
          return id(n);
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
    return exit
      .transition()
      .duration(10)
      .attr("r", 0)
      .style("opacity", 0)
      .attr("cx", 1000)
      .on("end", () => {
        d3.select(this).remove();
      });
  }

  function id(n: NotationAttributes) {
    return n.notationType + n.uuid;
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
      n.notationType === "SQRTSYMBOL" || n.notationType === "POWER"
        ? Math.round(notationStore.getRectSize() / 3) * -1
        : 0;

    return colIdx ? getNotationXposByCol(colIdx) + deltaX : null;
  }

  function y(n: NotationAttributes) {
    let rowIdx = row(n);
    if (!rowIdx) return null;
    let deltaY =
      n.notationType === "POWER"
        ? -5
        : n.notationType === "FRACTION" ||
          n.notationType === "SQRT" ||
          n.notationType === "SQRTSYMBOL"
        ? -4
        : 0;

    return getNotationYposByRow(rowIdx) + deltaY;
  }

  function width(n: NotationAttributes): number | null {
    if (n.notationType === "SQRTSYMBOL") {
      return notationStore.getRectSize();
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
    return notationStore.getRectSize();
  }

  function lineNotationWidth(n: LineAttributes): number {
    return (n.toCol - n.fromCol) * notationStore.getRectSize() + 5;
  }

  function rectNotationWidth(n: RectAttributes): number {
    // if (n.notationType === "TEXT") {
    //   return (
    //     (<any>window).textMeasurementCtx.measureText(n.value).width +
    //     1 * n.value.length
    //   );
    // }
    return (n.toCol - n.fromCol + 1) * notationStore.getRectSize() + 5;
  }

  function pointNotationHeight(n: PointAttributes): number {
    return notationStore.getRectSize();
  }

  function lineNotationHeight(n: LineAttributes): number {
    return notationStore.getRectSize();
  }

  function rectNotationHeight(n: RectAttributes): number {
    return (n.toRow - n.fromRow + 1) * notationStore.getRectSize() + 5;
  }

  function fontSize(n: NotationAttributes, el: HTMLElement) {
    return n.notationType === "POWER"
      ? powerFontSize()
      : n.notationType === "TEXT"
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
        ? "gray"
        : notationStore.getParent().type === "ANSWER" &&
          userStore.getCurrentUser().uuid != n.user.uuid
        ? "purple"
        : "black";

    if (n.notationType === "FRACTION") {
      let n1 = n as LineNotationAttributes;
      return `<span class=line style='color:${color};width:${
        (n1.toCol - n1.fromCol) * notationStore.getRectSize()
      }px;'></span>`;
    }

    if (n.notationType === "SQRT") {
      let n1 = n as LineNotationAttributes;
      return `<span class=line style='color:${color};position:relative;left:9px;width:${
        (n1.toCol - n1.fromCol) * notationStore.getRectSize() - 8
      }px;'></span>`;
    }

    if (n.notationType === "SQRTSYMBOL") {
      return `<p class='sqrtsymbol'>&#x221A;</p>`;
    }

    if (n.notationType === "TEXT") {
      let n1 = n as RectNotationAttributes;

      let bColor = borderColor(n ?? false);
      return `<pre style='border:groove 2px;border-color:${bColor};'>${n1.value}</pre>`;
    }

    if (n.notationType === "IMAGE") {
      let n1 = n as RectNotationAttributes;
      let bColor = borderColor(n ?? false);
      return `<img style='border:groove 2px;border-color:${borderColor}' src='${n1.value}'>`;
    }

    let n1 = n as PointNotationAttributes;
    return `<p style='color:${color};font-weight:${fontWeight};margin-left:8px;font-size:1.1em'>${n1.value}</p>`;
  }

  function getNotationXposByCol(col: number): number {
    return col * notationStore.getRectSize();
  }

  function getNotationYposByRow(row: number): number {
    return row * notationStore.getRectSize();
  }

  function getRectSize(): number {
    return notationStore.getRectSize();
  }

  return {
    svgWidth,
    svgHeight,
    getRectSize,
    findRect,
    setNextRect,
    getFreeTextRectWidth,
    getFreeTextRectHeight,
    getNotationXposByCol,
    getNotationYposByRow,
    refreshScreen,
    setMatrix,
  };
}
