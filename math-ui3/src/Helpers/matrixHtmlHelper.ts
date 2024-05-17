import * as d3 from "d3";
import {
  NotationAttributes,
  HorizontalLineNotationAttributes,
  PointNotationAttributes,
  RectNotationAttributes,
  CellAttributes,
  RectAttributes,
} from "common/baseTypes";
import { useNotationStore } from "../store/pinia/notationStore";
import { cellSpace, getDefaultFontSize } from "common/globals";
import { NotationTypeShape } from "common/unions";
import useUtils from "./matrixHelperUtils";
import { useUserStore } from "../store/pinia/userStore";

const userStore = useUserStore();
const utils = useUtils();
const notationStore = useNotationStore();

//const maxTextWidth = 10;

export default function useHtmlMatrixHelper() {
  function borderColor(notation: NotationAttributes): string {
    return notation.selected ? "gray" : "transparent";
  }

  function textBorderColor(notation: NotationAttributes): string {
    return notation.selected ? "gray" : "lighgray";
  }

  function textBackgroundColor(): string {
    return "lightyellow";
  }

  function regularFontSize() {
    return `${notationStore.getCellVerticalHeight() / 25}em`;
  }

  function textFontSize(el: HTMLElement): string {
    return getComputedStyle(document.body).getPropertyValue("font-size");
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

  function mergeHtmlNotations(
    svgId: string,
    notations: NotationAttributes[],
    svgElement: HTMLElement,
  ) {
    d3.select("#" + svgId)
      .selectAll("foreignObject")
      .data(notations, (u: any) => {
        return (u as NotationAttributes).uuid;
      })
      .join(
        (enter) => {
          return addHtmlNotations(enter, svgElement!);
        },
        (update) => {
          return updateHtmlNotations(update);
        },
        (exit) => {
          return utils.removeNotations(exit);
        },
      );
  }

  function height(n: NotationAttributes): number | null {
    switch (NotationTypeShape.get(n.notationType)) {
      case "POINT": {
        return pointNotationHeight(n as PointNotationAttributes);
      }

      case "RECT": {
        return rectNotationHeight(n as RectNotationAttributes);
      }
    }
    return null;
  }

  function addHtmlNotations(enter: any, el: HTMLElement) {
    return enter
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
      .attr("col", (n: CellAttributes) => {
        return n?.col;
      })
      .attr("fromCol", (n: RectAttributes) => {
        return n?.fromCol;
      })
      .attr("toCol", (n: RectAttributes) => {
        return n?.toCol;
      })
      .attr("row", (n: CellAttributes) => {
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
      .html((n: NotationAttributes) => {
        return html(n);
      });
  }

  function updateHtmlNotations(update: any) {
    return update
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
      });
  }

  function col(n: NotationAttributes): number | null {
    switch (NotationTypeShape.get(n.notationType)) {
      case "POINT": {
        return (n as PointNotationAttributes).col;
      }
      case "RECT": {
        return (n as RectNotationAttributes).fromCol;
      }
    }
    return null;
  }

  function row(n: NotationAttributes) {
    switch (NotationTypeShape.get(n.notationType)) {
      case "POINT":
      case "HORIZONTAL_LINE": {
        return (n as HorizontalLineNotationAttributes).row;
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

    return colIdx ? utils.getNotationXposByCol(colIdx) + deltaX : null;
  }

  function y(n: NotationAttributes) {
    let rowIdx = row(n);
    if (!rowIdx) return null;
    let deltaY =
      n.notationType === "SQRT" || n.notationType === "SQRTSYMBOL" ? -5 : 0;

    return utils.getNotationYposByRow(rowIdx) + deltaY;
  }

  function width(n: NotationAttributes): number {
    if (n.notationType === "SQRTSYMBOL") {
      return (notationStore.getCellHorizontalWidth() + cellSpace) * 2;
    }

    switch (NotationTypeShape.get(n.notationType)) {
      case "POINT": {
        return pointNotationWidth(n as PointNotationAttributes);
      }
      case "RECT": {
        return rectNotationWidth(n as RectNotationAttributes);
      }
    }
    return 0;
  }

  function pointNotationWidth(n: CellAttributes): number {
    return notationStore.getCellHorizontalWidth();
  }

  function rectNotationWidth(n: RectAttributes): number {
    return (
      (n.toCol - n.fromCol + 1) *
      (notationStore.getCellHorizontalWidth() + cellSpace)
    );
  }

  function pointNotationHeight(n: CellAttributes): number {
    return notationStore.getCellVerticalHeight();
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

    if (n.notationType === "SQRT") {
      let n1 = n as HorizontalLineNotationAttributes;
      return `<span class=line style='color:${color};position:relative;left:9px;width:${
        (n1.toCol - n1.fromCol) *
          (notationStore.getCellHorizontalWidth() + cellSpace) -
        8
      }px;'></span>`;
    }

    if (n.notationType === "SQRTSYMBOL") {
      return `<p class='sqrtsymbol' style='color:${color}'>&#x221A;</p>`;
    }

    if (n.notationType === "TEXT") {
      const n1 = n as RectNotationAttributes;

      const bColor = textBorderColor(n ?? false);

      const height = rectNotationHeight(n as RectNotationAttributes);
      const width = rectNotationWidth(n as RectNotationAttributes);

      return `<textarea readonly style='overflow:hidden;width:${width}px;height:${height}px;background-color:${textBackgroundColor()};border:groove 2px;border-color:${bColor};'>${
        n1.value
      }</textarea>`;
    }

    if (n.notationType === "IMAGE") {
      let n1 = n as RectNotationAttributes;
      return `<img style='border:groove 2px;border-color:${borderColor}' src='${n1.value}'>`;
    }

    if (n.notationType === "EXPONENT") {
      let n1 = n as PointNotationAttributes;
      return `</span><span style='position: absolute;top: 10%;transform: translateY(-10%);left:30%;translateX(-10%);color:${color};font-weight:${fontWeight};font-size:0.75em'>${n1.value}</span>`;
    }

    let n1 = n as PointNotationAttributes;
    return `<p style='color:${color};font-weight:${fontWeight}; position: absolute;top: 50%;transform: translateY(-50%);left:20%;translateX(-20%);font-size:1.1em'>${n1.value}</p>`;
  }

  // function getFreeTextRectWidth(text: string) {
  //   const textArr = text.split("\n");

  //   const maxWidth = Math.max(
  //     ...textArr.map((t) =>
  //       parseFloat((<any>window).textMeasurementCtx.measureText(t).width),
  //     ),
  //   );

  //   return Math.min(
  //     maxTextWidth,
  //     maxWidth / notationStore.getCellHorizontalWidth(),
  //   );
  // }

  // function getFreeTextRectHeight(text: string) {
  //   const fontSize = getDefaultFontSize();
  //   const margin = 5;
  //   return (
  //     ((fontSize + margin) * text.split(/\r*\n/).length) /
  //     notationStore.getCellVerticalHeight()
  //   );
  // }

  return {
    mergeHtmlNotations,
    //getFreeTextRectWidth,
    //    getFreeTextRectHeight,
  };
}
