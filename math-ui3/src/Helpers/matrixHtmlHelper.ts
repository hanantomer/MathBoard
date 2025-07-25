import * as d3 from "d3";
import {
  NotationAttributes,
  PointNotationAttributes,
  RectNotationAttributes,
  CellAttributes,
  RectAttributes,
  AnnotationNotationAttributes,
  MultiCellAttributes,
} from "common/baseTypes";
import { useCellStore } from "../store/pinia/cellStore";
import useUtils from "./matrixHelperUtils";
import { useUserStore } from "../store/pinia/userStore";

const userStore = useUserStore();
const utils = useUtils();
const cellStore = useCellStore();

export default function useHtmlMatrixHelper() {
  function rectBorderColor(notation: NotationAttributes): string {
    return notation.selected ? "chocolate" : "lighgray";
  }

  function textBackgroundColor(): string {
    return "lightyellow";
  }

  function regularFontSize(value: string) {
    if (value?.indexOf("infin") >= 0) {
      return `${cellStore.getCellVerticalHeight() / 50}em`;
    }
    if (value?.indexOf("&#") === 0) {
      return `${cellStore.getCellVerticalHeight() / 45}em`;
    }

    return `${cellStore.getCellVerticalHeight() / 30}em`;
  }

  function textFontSize(el: HTMLElement): string {
    return getComputedStyle(document.body).getPropertyValue("font-size");
  }

  function signFontSize() {
    return `${cellStore.getCellVerticalHeight() / 24}em`;
  }

  function exponentFontSize() {
    return `0.5em`;
  }

  function logbaseFontSize() {
    return `0.7em`;
  }

  function mergeHtmlNotations(
    svgId: string,
    notations: NotationAttributes[],
    svgElement: HTMLElement,
  ) {
    const sortedNotations = [
      ...notations.filter((n) => n.notationType === "IMAGE"),
      ...notations.filter((n) => n.notationType !== "IMAGE"),
    ];

    d3.select("#" + svgId)
      .selectAll("foreignObject")
      .data(sortedNotations, (u: any) => {
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
          if (!exit.empty()) {
            //matrixCellHelper.unColorizeNotationCells(exit.datum() as any);
          }
          return utils.removeNotations(exit);
        },
      );
  }

  function height(n: NotationAttributes): number | null {
    switch (n.notationType) {
      case "ANNOTATION":
        return pointNotationHeight(n as PointNotationAttributes) + 2;
      case "SIGN":
      case "EXPONENT":
      case "LOGBASE":
      case "SYMBOL":
      case "SQRT":
      case "SQRTSYMBOL": {
        return pointNotationHeight(n as PointNotationAttributes);
      }

      case "IMAGE":
      case "TEXT": {
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
        return fontSize(n as PointNotationAttributes, el);
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
      .attr("height", (n: NotationAttributes) => {
        return height(n);
      })

      .html((n: NotationAttributes) => {
        return html(n);
      });
  }

  function col(n: NotationAttributes): number | null {
    switch (n.notationType) {
      case "EXPONENT":
      case "LOGBASE":
      case "SIGN":
      case "SQRTSYMBOL":
      case "SYMBOL": {
        return (n as PointNotationAttributes).col;
      }
      case "IMAGE":
      case "TEXT": {
        return (n as RectNotationAttributes).fromCol;
      }
      case "SQRT": {
        return (
          (n as unknown as MultiCellAttributes).fromCol +
          1 /*first col occupied by sqrt symbol*/
        );
      }
    }
    return null;
  }

  function row(n: NotationAttributes) {
    switch (n.notationType) {
      case "EXPONENT":
      case "LOGBASE":
      case "SQRTSYMBOL":
      case "SIGN":
      case "SYMBOL":
        return (n as PointNotationAttributes).row;

      case "SQRT": {
        return (n as unknown as MultiCellAttributes).row;
      }

      case "IMAGE":
      case "TEXT": {
        return (n as RectNotationAttributes).fromRow;
      }
    }
    return null;
  }

  function x(n: NotationAttributes): number | null {
    if (n.notationType === "ANNOTATION") {
      return (n as AnnotationNotationAttributes).x;
    }

    let colIdx = col(n);
    let deltaX =
      n.notationType === "SQRTSYMBOL"
        ? Math.round(cellStore.getCellHorizontalWidth() / 3) * -1
        : 0;

    return colIdx != null ? utils.getNotationXposByCol(colIdx) + deltaX : null;
  }

  function y(n: NotationAttributes) {
    if (n.notationType === "ANNOTATION") {
      return (n as AnnotationNotationAttributes).y - 7;
    }

    let rowIdx = row(n);
    if (!rowIdx) return null;
    let deltaY =
      n.notationType === "SQRT" || n.notationType === "SQRTSYMBOL" ? -5 : 0;

    return utils.getNotationYposByRow(rowIdx) + deltaY;
  }

  function width(n: NotationAttributes): number {
    if (n.notationType === "SQRTSYMBOL") {
      return cellStore.getCellHorizontalWidth() * 2;
    }

    switch (n.notationType) {
      case "ANNOTATION": {
        return cellStore.getCellHorizontalWidth() + 2;
      }
      case "SYMBOL": {
        return cellStore.getCellHorizontalWidth();
      }

      case "EXPONENT": {
        return cellStore.getCellHorizontalWidth();
      }

      case "LOGBASE": {
        return cellStore.getCellHorizontalWidth();
      }

      case "SQRT": {
        const n1 = n as unknown as MultiCellAttributes;
        return (n1.toCol - n1.fromCol - 1) * cellStore.getCellHorizontalWidth();
      }

      case "IMAGE":
      case "TEXT": {
        return rectNotationWidth(n as RectNotationAttributes);
      }
    }
    throw new Error("invalid width");
  }

  function rectNotationWidth(n: RectAttributes): number {
    return (n.toCol - n.fromCol + 1) * cellStore.getCellHorizontalWidth();
  }

  function pointNotationHeight(n: CellAttributes): number {
    return cellStore.getCellVerticalHeight();
  }

  function rectNotationHeight(n: RectAttributes): number {
    return (
      (Math.abs(n.toRow - n.fromRow) + 1) * cellStore.getCellVerticalHeight()
    );
  }

  function fontSize(n: PointNotationAttributes, el: HTMLElement) {
    return n.notationType === "TEXT"
      ? textFontSize(el)
      : n.notationType === "SIGN"
      ? signFontSize()
      : regularFontSize(n.value);
  }

  /**
   * Generates an HTML string representation for a given notation attribute object.
   * The output varies based on the `notationType` property of the input, supporting types such as
   * "SQRT", "SQRTSYMBOL", "TEXT", "ANNOTATION", "IMAGE", "EXPONENT", "LOGBASE", and default symbol types.
   *
   * - For "SQRT" and "SQRTSYMBOL", returns styled HTML for square root notation.
   * - For "TEXT", returns a styled `<textarea>` with directionality based on content.
   * - For "ANNOTATION", returns a styled annotation `<p>` element.
   * - For "IMAGE", returns an `<img>` tag with border styling.
   * - For "EXPONENT" and "LOGBASE", returns absolutely positioned `<p>` elements for exponents and log bases.
   * - For other symbol types, returns a styled `<p>` element with dynamic positioning and font size.
   *
   * The function applies user-specific color and font weight, and uses various helpers for style calculation.
   *
   * @param n - The notation attribute object describing the mathematical notation to render.
   * @returns An HTML string representing the notation, styled and structured according to its type.
   */
  function html(n: NotationAttributes) {
    utils.colorizeNotationCells(n);

    let fontWeight =
      userStore.getCurrentUser()?.uuid == n.user.uuid ? "bold" : "normal";

    let color = utils.getColor(n);
    //   : notationStore.getParent().type === "ANSWER" &&
    //     userStore.getCurrentUser()?.uuid != n.user.uuid

    if (n.notationType === "SQRT") {
      return `<span id='${n.uuid}' class=sqrt style='margin-top:5px; position:relative;color:${color}'></span>`;
    }

    if (n.notationType === "SQRTSYMBOL") {
      color = n.color?.value ? n.color?.value : color;
      return `<p id='${n.uuid}' class='sqrtsymbol' style='margin-top:-6px;margin-left:6px;color:${color}'>&#x221A;</p>`;
    }

    if (n.notationType === "TEXT") {
      const n1 = n as RectNotationAttributes;

      const bColor = rectBorderColor(n ?? false);

      const height = rectNotationHeight(n as RectNotationAttributes);
      const width = rectNotationWidth(n as RectNotationAttributes);

      return `<textarea id=${
        n1.uuid
      } style='resize:none; overflow:hidden;width:${width}px;
              height:${height}px;background-color:${textBackgroundColor()};
              border:groove 2px;border-color:${bColor};' dir='${
                /[\u0590-\u05FF\u0600-\u06FF]/.test(n1.value) ? "rtl" : "ltr"
              }'>${n1.value}</textarea>`;
    }

    if (n.notationType === "ANNOTATION") {
      const n1 = n as AnnotationNotationAttributes;

      return `<p id=${n1.uuid} style=
            'background:lightyellow; z-index:100;color:${color};font-weight:${fontWeight};
            position: absolute;top:50%;transform:
           translateY(-50%);font-size:0.6em'>${n1.value}</p>`;
    }

    if (n.notationType === "IMAGE") {
      let n1 = n as RectNotationAttributes;
      const bColor = rectBorderColor(n ?? false);
      return `<img draggable="false"  id=${n1.uuid}  style='z-index:1;width:100%;height:100%;border:groove 2px;border-color:${bColor}' src='${n1.value}'>`;
    }

    if (n.notationType === "EXPONENT") {
      const n1 = n as PointNotationAttributes;

      const exponentHtml = `<p id=${
        n1.uuid
      } style='position:absolute;left:0px;top:2px;color:${color};font-weight:${fontWeight};
      font-size:${exponentFontSize()}'>${n1.value}</p>`;

      return exponentHtml;
    }

    if (n.notationType === "LOGBASE") {
      const n1 = n as PointNotationAttributes;

      const logbaseHtml = `<p id=${
        n1.uuid
      } style='position:absolute;left:0px;top:18px;color:${color};font-weight:${fontWeight};
      font-size:${logbaseFontSize()}'>${n1.value}</p>`;

      return logbaseHtml;
    }

    // Symbol

    let n1 = n as PointNotationAttributes;
    const top = n1.followsFraction ? "75%" : "50%";

    const leftMargin =
      n1.value === "."
        ? "-10%"
        : n1.value.startsWith("&") || n1.value.length === 1
        ? "20%"
        : "0%";
    const fSize =
      n1.value.indexOf("&") >= 0 || n1.value.length === 1
        ? "1.1em"
        : n1.value.indexOf("cos") >= 0 ||
          n1.value.indexOf("sin") >= 0 ||
          n1.value.indexOf("tan") >= 0 ||
          n1.value.indexOf("cot") >= 0 ||
          n1.value.indexOf("log") >= 0
        ? "0.6em"
        : "0.75em";

    const topMargin =
      n1.value === "."
        ? "5px"
        : n1.value.indexOf("cos") >= 0 ||
          n1.value.indexOf("sin") >= 0 ||
          n1.value.indexOf("tan") >= 0 ||
          n1.value.indexOf("cot") >= 0 ||
          n1.value.indexOf("log") >= 0
        ? "4px"
        : "0px";

    ///TODO: move static css props to a class
    return `<p id=${n1.uuid} style='z-index:100;color:${color};font-weight:${fontWeight}; position: absolute;top:${top};transform:
    translateY(-0%);top:${topMargin};left:${leftMargin};font-size:${fSize}'>${n1.value}</p>`;
  }

  return {
    mergeHtmlNotations,
  };
}
