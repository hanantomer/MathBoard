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

import { wrapVectorSymbol, vectorSymbolPrefix } from "common/globals";
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
          return utils.removeNotations(exit);
        },
      );

    if (notations.length > 0) {
      const el = document.getElementById(notations[notations.length - 1].uuid)
        ?.parentElement;
      el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }

  function height(n: NotationAttributes): number | null {
    switch (n.notationType) {
      case "ANNOTATION":
      case "SIGN":
      case "EXPONENT":
      case "LOGBASE":
      case "SYMBOL":
      case "SQRT":
      case "SQRTSYMBOL": {
        return pointNotationHeight(n as PointNotationAttributes);
      }

      case "IMAGE": {
        return imageNotationHeight(n as RectNotationAttributes);
      }
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
        : n.notationType === "SYMBOL" &&
          (n as PointNotationAttributes).value === "."
        ? -3
        : 0;

    return colIdx != null ? utils.getNotationXposByCol(colIdx) + deltaX : null;
  }

  function y(n: NotationAttributes) {
    if (n.notationType === "ANNOTATION") {
      return (n as AnnotationNotationAttributes).y;
    }

    let rowIdx = row(n);
    if (!rowIdx) return null;

    return utils.getNotationYposByRow(rowIdx);
  }

  function width(n: NotationAttributes): number {
    if (n.notationType === "SQRTSYMBOL") {
      return cellStore.getCellHorizontalWidth() * 2;
    }

    switch (n.notationType) {
      case "ANNOTATION": {
        return cellStore.getCellHorizontalWidth() * 2 + 4; //+4 for border
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

      case "IMAGE": {
        return imageNotationWidth(n as RectNotationAttributes);
      }
      case "TEXT": {
        return rectNotationWidth(n as RectNotationAttributes);
      }
    }
    throw new Error("invalid width");
  }

  function rectNotationWidth(n: RectAttributes): number {
    return (n.toCol - n.fromCol + 1) * cellStore.getCellHorizontalWidth();
  }

  function imageNotationWidth(n: RectAttributes): number {
    return (n.toCol - n.fromCol + 1) * cellStore.getCellHorizontalWidth();
  }

  function pointNotationHeight(n: PointNotationAttributes): number {
    if (n.value && n.value.indexOf("∫") !== -1)
      return 2 * cellStore.getCellVerticalHeight();
    return cellStore.getCellVerticalHeight();
  }

  function rectNotationHeight(n: RectAttributes): number {
    return (
      (Math.abs(n.toRow - n.fromRow) + 1) * cellStore.getCellVerticalHeight()
    );
  }

  function imageNotationHeight(n: RectAttributes): number {
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

    const fontWeight =
      userStore.getCurrentUser()?.uuid === n.user.uuid ? "bold" : "normal";

    let color = utils.getColor(n);

    const notationHandlers: Record<string, (n: NotationAttributes) => string> =
      {
        SQRT: generateSqrtHtml,
        SQRTSYMBOL: generateSqrtSymbolHtml,
        TEXT: generateTextHtml,
        ANNOTATION: generateAnnotationHtml,
        IMAGE: generateImageHtml,
        EXPONENT: generateExponentHtml,
        LOGBASE: generateLogbaseHtml,
      };

    const handler = notationHandlers[n.notationType];
    if (handler) {
      return handler(n);
    }

    // Check for special cases like integrals
    if ((n as PointNotationAttributes).value?.indexOf("∫") !== -1) {
      return generateIntegralHtml(n as PointNotationAttributes, color);
    }

    // Default handler for symbols and other notations
    return generateDefaultHtml(n as PointNotationAttributes, color, fontWeight);

    function generateSqrtHtml(n: NotationAttributes): string {
      return utils.wrapWithDiv(
        `<span id='${n.uuid}' class='sqrt line' style='width:${width(
          n,
        )}px;margin-top:2px; color:${color}'></span>`,
      );
    }

    function generateSqrtSymbolHtml(n: NotationAttributes): string {
      const symbolColor = n.color?.value ? n.color.value : color;
      return utils.wrapWithDiv(
        `<p id='${n.uuid}' class='sqrtsymbol' style='margin-top:-2px;margin-left:10px;color:${symbolColor}'>&#x221A;</p>`,
      );
    }

    function generateTextHtml(n: NotationAttributes): string {
      const n1 = n as RectNotationAttributes;
      const bColor = rectBorderColor(n ?? false);
      const height = rectNotationHeight(n1);
      const width = rectNotationWidth(n1);
      const dir = /[\u0590-\u05FF\u0600-\u06FF]/.test(n1.value) ? "rtl" : "ltr";
      return utils.wrapWithDiv(
        `<textarea id=${
          n1.uuid
        } style='resize:none; overflow:hidden;width:${width}px; height:${height}px;background-color:${textBackgroundColor()}; border:groove 2px;border-color:${bColor};' dir='${dir}'>${
          n1.value
        }</textarea>`,
      );
    }

    function generateAnnotationHtml(n: NotationAttributes): string {
      const n1 = n as AnnotationNotationAttributes;
      return utils.wrapWithDiv(
        `<p id=${n1.uuid} style='z-index:100;color:${color};font-weight:${fontWeight}; transform: rotate(${n1.rotation}deg); transformOrigin: "center center"; font-size:0.62em'>${n1.value}</p>`,
      );
    }

    function generateImageHtml(n: NotationAttributes): string {
      const n1 = n as RectNotationAttributes;
      const bColor = rectBorderColor(n ?? false);
      return utils.wrapWithDiv(
        `<img draggable="false" id=${n1.uuid} style='z-index:1;width:100%;height:100%;border:groove 2px;border-color:${bColor}' src='${n1.value}'>`,
      );
    }

    function generateExponentHtml(n: NotationAttributes): string {
      const n1 = n as PointNotationAttributes;
      const exponentHtml = `<p id=${
        n1.uuid
      } style='color:${color};font-weight:${fontWeight}; font-size:${exponentFontSize()}'>${
        n1.value
      }</p>`;
      return utils.wrapWithDiv(exponentHtml);
    }

    function generateLogbaseHtml(n: NotationAttributes): string {
      const n1 = n as PointNotationAttributes;
      const logbaseHtml = `<p id=${
        n1.uuid
      } style='color:${color};font-weight:${fontWeight}; margin-top:55%; margin-left:15%; font-size:${logbaseFontSize()}'>${
        n1.value
      }</p>`;
      return utils.wrapWithDiv(logbaseHtml);
    }

    function generateIntegralHtml(
      n1: PointNotationAttributes,
      color: string,
    ): string {
      const integralParts = n1.value
        .split(/\s+/)
        .filter((part) => part.length > 0);
      const htmlContent =
        integralParts.length === 1
          ? `<p style='color:${color};font-size:36px'>${integralParts[0]}</p>`
          : integralParts.length === 2
          ? `<p style='color:${color};font-size:12px;position:absolute;top:-2px'>${integralParts[0]}</p><p style='font-size:36px'>${integralParts[1]}</p><p style='color:${color};position:absolute;top:43px;font-size:12px'>${integralParts[0]}</p>`
          : `<p style='color:${color};font-size:12px;position:absolute;top:-2px'>${integralParts[0]}</p><p style='font-size:36px'>${integralParts[1]}</p><p style='color:${color};position:absolute;top:43px;font-size:12px'>${integralParts[2]}</p>`;
      return utils.wrapWithDiv(htmlContent);
    }

    function generateDefaultHtml(
      n1: PointNotationAttributes,
      color: string,
      fontWeight: string,
    ): string {
      // Vector symbol
      if (n1.value.startsWith(vectorSymbolPrefix)) {
        return utils.wrapWithDiv(
          wrapVectorSymbol(n1.value.replace(vectorSymbolPrefix, ""), color),
        );
      }

      // Calculate margins and font size
      const leftMargin = getLeftMargin(n1.value);
      const fSize = getFontSize(n1.value);
      const topMargin = getTopMargin(n1.value, n1.followsFraction);

      return utils.wrapWithDiv(
        n1.value.length > 5
          ? n1.value
          : `<p id=${n1.uuid} style='z-index:100;color:${color};font-weight:${fontWeight}; transform: translateY(-0%);margin-top:${topMargin};margin-left:${leftMargin};font-size:${fSize}'>${n1.value}</p>`,
      );
    }

    function getLeftMargin(value: string): string {
      if (value === "." || value === "``(") return "-2px";
      if (value === "M" || value === "m") return "0%";
      if (value === "i" || value === "j") return "35%";
      if (value.startsWith("&") || value.length === 1) return "10%";
      return "0%";
    }

    function getFontSize(value: string): string {
      if (value === "||" || value === "''") return "1.4em";
      if (value === ".") return "1.5em";
      if (value.indexOf("&") >= 0 || value.replaceAll("`", "").length === 1)
        return "1.1em";
      if (
        ["cos", "sin", "tan", "cot", "log"].some(
          (trig) => value.indexOf(trig) >= 0,
        )
      )
        return "0.6em";
      return "0.75em";
    }

    function getTopMargin(value: string, followsFraction: boolean): string {
      if (followsFraction) return "10px";
      if (value === ".") return "-5px";
      if (
        ["cos", "sin", "tan", "cot", "log"].some(
          (trig) => value.indexOf(trig) >= 0,
        )
      )
        return "4px";
      return "0px";
    }
  }

  return {
    mergeHtmlNotations,
  };
}
