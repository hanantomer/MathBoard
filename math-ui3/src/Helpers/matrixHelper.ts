export { }

import { BoardType, NotationType, NotationTypeShape, NotationShape } from "../../../math-common/src/enum";
import { Point, PointCoordinates } from "../../../math-common/src/globals";
import * as d3 from "d3";
import { useNotationStore } from "../store/pinia/notationStore"
import { useLessonStore } from "../store/pinia/lessonStore"
import { Notation, PointNotation, LineNotation, RectNotation, TextNotation } from "./responseTypes";
import { useUserStore } from "../store/pinia/userStore";

const notationStore = useNotationStore();
const userStore = useUserStore();

export default function useMatrixHelper() {
  const opacity: number = 1;
  const colsNum: number = 35;
  const rowsNum: number = 20;
  let rectSize: number = 25; ///TODO: ceck if initial value is of any value
  const lineHeight: number = 4;
  let topLevelGroup: any = null;
  const svgns: string = "http://www.w3.org/2000/svg";
  const svgWidth: string = "1400px";
  const svgHeight: string = "700px";
  let matrix: any[];

  function borderColor(selected: boolean): string {
    return selected ? "red" : "transparent";
  }

  function backgroundColor(selected: boolean): string {
    return selected ? "green" : "transparent";
  }

  function regularFontSize() {
    return `${rectSize / 25}em`;
  }

  function textFontSize(el: HTMLElement): string {
    return window.getComputedStyle(el, null).getPropertyValue("font-size");
  }

  function powerFontSize() {
    return `${rectSize / 50}em`;
  }

  function signFontSize() {
    return `${rectSize / 28}em`;
  }

  function sqrtFontSize() {
    return `${rectSize / 20}em`;
  }

  function setRectSize(svgId: string) {
    let clientWidth: number | undefined =
      document.getElementById(svgId)?.clientWidth;
    let clientHeight: number | undefined =
      document.getElementById(svgId)?.clientHeight;

    if (!clientWidth || !clientHeight) return;

    rectSize = Math.min(
      Math.floor(clientWidth / colsNum),
      Math.floor(clientHeight / rowsNum)
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

  function init(el: HTMLElement, svgId: string) {
    setRectSize(svgId);
    setTextMeasurementCtx(el);
  }

  function freeTextRectWidth(text: string) {
    return (<any>window).textMeasurementCtx.measureText(text).width / rectSize;
  }

  function freeTextRectHeight(text: string, el: HTMLElement) {
    let fontSize: number = Number.parseInt(textFontSize(el).replace("px", ""));
    return (fontSize * text.split(/\r*\n/).length) / rectSize;
  }

  //   $isRect(notationType) {
  //     return (
  //       notationType === NotationType.TEXT ||
  //       notationType === NotationType.IMAGE
  //     );
  // },

  //   $isLine(notationType) {
  //     return (
  //       notationType === NotationType.FRACTION ||
  //       notationType === NotationType.SQRT ||
  //       notationType === NotationType.SQRTSYMBOL ||
  //       notationType === NotationType.LEFT_HANDLE ||
  //       notationType === NotationType.RIGHT_HANDLE
  //     );
  // },

  //https://stackoverflow.com/questions/22428484/get-element-from-point-when-you-have-overlapping-elements
  function findClickedObject(
    point: Point,
    tagName: string,
    notationType: NotationType
  ) : Element {
    var elements = [];
    var display = [];
    var item = document.elementFromPoint(point.x, point.y) as any; // must be any to accept window
    var prevItem = null;
    var idx = 0;

    while (
      idx++ < 50 &&
      item &&
      (!prevItem || item != prevItem) &&
      item != document.body &&
      item != window &&
      item != document &&
      item != document.documentElement
    ) {
      elements.push(item);
      display.push(item.style.display);
      item.style.display = "none";
      prevItem = item;
      item = document.elementFromPoint(point.x, point.y);
    }
    for (var i = 0; i < elements.length; i++) {
      elements[i].style.display = display[i];
    }
    return elements.find(
      (item) =>
        item.tagName == tagName &&
        (!notationType || notationType == item.attributes.notationType.value)
    );
  }

  //TODO: call from component onmount with SVGID as paameter
  //onMounted(() => {

  //});

  // methods: {
  //   ...mapGetters({
  //     getActiveNotation: "getActiveNotation",
  //     getCurrentLesson: "getCurrentLesson",
  //     getParent: "getParent",
  //   }),
  //   ...mapActions({
  //     setPrevActiveCell: "setPrevActiveCell",
  //   }),

  function setMatrix(svgId: string) {
    // render rows
    for (var row = 0; row < rowsNum; row++) {
      matrix.push(d3.range(colsNum));
    }

    // render rectangles
    topLevelGroup = d3
      .select("#" + svgId)
      .selectAll("g")
      .data(matrix)
      .enter()
      .append("g")
      .attr("row", (d, i) => {
        return i;
      })
      .lower()
      .attr("transform", (d, i) => {
        return "translate(0, " + rectSize * i + ")";
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
        return i * rectSize;
      })
      .attr("width", rectSize)
      .attr("height", rectSize);
  }

  function getNextRect(
    horizontalStep: number,
    verticalStep: number
  ): PointCoordinates | undefined {
    if (!notationStore.activeCell?.col || notationStore.activeCell?.row) {
      return;
    }

    let col = notationStore.activeCell?.col;
    let row = notationStore.activeCell?.row;
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

  function setNextRect(
    horizontalStep: number,
    verticalStep: number
  ) {
    let nextRect: any = getNextRect(horizontalStep, verticalStep);
    if (nextRect) {
      nextRect.notationType = "rect";
      notationStore.setActiveCell(nextRect);

      //TODO: move to caller
      //if (notationStore.this.getParent().boardType === BoardType.LESSON) {
      //  this.userOperationsMixin_syncOutgoingActiveCell(nextRect);
      //}
    }
  }

  function findRect(point: PointCoordinates): HTMLElement | undefined | null {
    return document
      ?.querySelector(`g[row='${point.row}']`)
      ?.querySelector(`rect[col='${point.col}']`);
  }

  function removeNotation(n: Notation) {
    document?.getElementById(n.id + n.notationType)?.remove();
  }

  function enrichNotations(notations: Notation[]) {
    let enrichedNotations: Notation[] = [];
    for (const key in notations) {
      if (Object.hasOwnProperty.call(notations, key)) {
        const notation = notations[key];
        enrichedNotations.push(notation);
        // add sqrt symbol
        if (notation.notationType === NotationType.SQRT) {
          let sqrtNotation = notation;
          sqrtNotation.notationType = NotationType.SQRTSYMBOL;
          enrichedNotations.push(sqrtNotation);
        }
        // calculate image dimensions
        // if (element.type === NotationType.IMAGE) {
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

  function refreshScreen(
    notations: Notation[],
    svgId: string,
    el: HTMLElement
  ) {
    try {
      notations = enrichNotations(notations);
    } catch {} // cant check if observer has properties
    d3.select("#" + svgId)
      .selectAll("foreignObject")
      .data(Object.values(notations))
      .join(
        (enter) => {
          return showNotations(enter, el);
        },
        (update) => {
          return updateNotations(update);
        },
        (exit) => {
          return removeNotations(exit);
        }
      );
  }

  function height(n: Notation): number | null {
    switch (NotationTypeShape.get(n.notationType)) {
      case NotationShape.POINT: {
        return pointNotationHeight(n as PointNotation);
      }
      case NotationShape.LINE: {
        return lineNotationHeight(n as LineNotation);
      }
      case NotationShape.RECT: {
        return rectNotationHeight(n as RectNotation);
      }
    }
    return null;
  }

  /// TODO: treat notation types divertly
  function showNotations(enter: any, el: HTMLElement) {
    return (
      enter
        .append("foreignObject")
        .attr("type", (n: Notation) => {
          return n.notationType;
        })
        .attr("id", (n: Notation) => {
          return id(n);
        })
        .attr("col", (n: PointNotation) => {
          return n?.col;
        })
        .attr("fromCol", (n: LineNotation | RectNotation) => {
          return n?.fromCol;
        })
        .attr("toCol", (n: LineNotation | RectNotation) => {
          return n?.toCol;
        })
        .attr("row", (n: PointNotation) => {
          return n?.row;
        })
        .attr("fromRow", (n: RectNotation) => {
          return n?.fromRow;
        })
        .attr("toRow", (n: RectNotation) => {
          return n?.toRow;
        })
        .attr("x", (n: Notation) => {
          return x(n);
        })
        .attr("y", (n: Notation) => {
          return y(n);
        })
        .attr("width", (n: Notation) => {
          return width(n);
        })
        .attr("height", (n: Notation) => {
          return height(n);
        })
        .style("font-size", (n: Notation) => {
          return fontSize(n, el);
        })
        //.style("color", (n) => {
        //  return this.$color(n);
        //})
        .html((n: Notation) => {
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
        .attr("x", (n: Notation) => {
          return x(n);
        })
        .attr("y", (n: Notation) => {
          return y(n);
        })
        .attr("col", (n: Notation) => {
          return col(n);
        })
        .attr("row", (n: Notation) => {
          return row(n);
        })
        .attr("width", (n: Notation) => {
          return width(n);
        })
        .html((n: Notation) => {
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

  function id(n: Notation) {
    return n.notationType + n.id;
  }

  function col(n: Notation) : number | null{
    switch (NotationTypeShape.get(n.notationType)) {
      case NotationShape.POINT: {
        return (n as PointNotation).col;
      }
      case NotationShape.LINE:
      case NotationShape.RECT: {
        return (n as LineNotation).fromCol;
      }
    }
    return null;
  }

  function row(n: Notation) {
    switch (NotationTypeShape.get(n.notationType)) {
      case NotationShape.POINT:
      case NotationShape.LINE: {
        return (n as PointNotation | LineNotation).row;
      }
      case NotationShape.RECT: {
        return (n as RectNotation).fromRow;
      }
    }
    return null;
  }

  function x(n: Notation) : number | null {
    let colIdx = col(n);
    let deltaX =
      n.notationType === NotationType.SQRTSYMBOL ||
      n.notationType === NotationType.POWER
        ? Math.round(this.rectSize / 3) * -1
        : 0;

    return colIdx ? getNotationXposByCol(colIdx) + deltaX : null;
  }

  function y(n: Notation) {
    let rowIdx = row(n);
    let deltaY =
      n.notationType === NotationType.POWER
        ? -5
        : n.notationType === NotationType.FRACTION ||
          n.notationType === NotationType.SQRT
        ? -4
        : 0;

    return this.getNotationYposByRow(rowIdx) + deltaY;
  }

  function width(n: Notation): number | null {
    switch (NotationTypeShape.get(n.notationType)) {
      case NotationShape.POINT: {
        return pointNotationWidth(n as PointNotation);
      }
      case NotationShape.LINE: {
        return lineNotationWidth(n as LineNotation);
      }
      case NotationShape.RECT: {
        return rectNotationWidth(n as RectNotation);
      }
    }
    return null;
  }

  function pointNotationWidth(n: PointNotation): number {
    return rectSize;
  }

  function lineNotationWidth(n: LineNotation): number {
    return (n.toCol - n.fromCol) * rectSize + 5;
  }

  function rectNotationWidth(n: RectNotation): number {
    // if (n.notationType === NotationType.TEXT) {
    //   return (
    //     (<any>window).textMeasurementCtx.measureText(n.value).width +
    //     1 * n.value.length
    //   );
    // }
    return (n.toCol - n.fromCol) * rectSize + 5;
  }

  function pointNotationHeight(n: PointNotation): number {
    return rectSize;
  }

  function lineNotationHeight(n: LineNotation): number {
    return rectSize;
  }

  function rectNotationHeight(n: RectNotation): number {
    return (n.toRow - n.fromRow) * rectSize + 5;
  }

  function fontSize(n: Notation, el: HTMLElement) {
    return n.notationType === NotationType.POWER
      ? powerFontSize()
      : n.notationType === NotationType.TEXT
      ? textFontSize(el)
      : n.notationType === NotationType.SIGN
      ? signFontSize()
      : regularFontSize;
  }

  function html(n: Notation) {
    if (n.notationType === NotationType.FRACTION) {
      n = n as LineNotation;
      return `<span class=line style='width:${
        (n.toCol - n.fromCol) * rectSize
      }px;'></span>`;
    }

    if (n.notationType === NotationType.SQRT) {
      n = n as LineNotation;
      return `<span class=line style='position:relative;left:9px;width:${
        (n.toCol - n.fromCol) * rectSize - 8
      }px;'></span>`;
    }

    if (n.notationType === NotationType.SQRTSYMBOL) {
      return `<p style='position:relative;left:5px; font-size:1.4em'>&#x221A;</p>`;
    }

    if (n.notationType === NotationType.TEXT) {
      n = n as RectNotation;

      let bColor = borderColor(n === notationStore.activeNotation);
      return `<pre style='border:groove 2px;border-color:${bColor};background-color:${bColor}'>${n.value}</pre>`;
    }

    if (n.notationType === NotationType.IMAGE) {
      n = n as RectNotation;
      let bColor = borderColor(n === notationStore.activeNotation);
      return `<img style='border:groove 2px;border-color:${borderColor}' src='${n.value}'>`;
    }


    let fontWeight =
      userStore.currentUser.uuid == n.user.uuid ? "bold" : "normal";

    let color = (notationStore.selectedNotations.indexOf(n.uuid))
      ? "red"
      : this.getParent().boardType === BoardType.ANSWER &&
        this.getUser().id != n.userId
      ? "purple"
      : "black";

    return `<p style='color:${color};font-weight:${fontWeight};margin-left:8px;font-size:1.1em'>${n.value}</p>`;
  }

  function getNotationXposByCol(col: number): number {
    return col * rectSize;
  }

  function getNotationYposByRow(row: number): number {
    return row * rectSize;
  }

  function findTextAtClickedPosition(e: MouseEvent) : Element {
    return findClickedObject(
      {
        x: e.clientX,
        y: e.clientY,
      },
      "foreignObject",
      NotationType.TEXT
    );
  }


  return {
    showNotations,
    rectSize,
    findClickedObject,
    findRect,
    findTextAtClickedPosition,
  };
};
