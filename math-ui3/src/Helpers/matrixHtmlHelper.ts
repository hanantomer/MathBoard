import * as d3 from "d3";
import {
  NotationAttributes,
  HorizontalLineNotationAttributes,
  PointNotationAttributes,
  ExponentNotationAttributes,
  RectNotationAttributes,
  CellAttributes,
  RectAttributes,
  AnnotationNotationAttributes,
  MultiCellAttributes,
} from "common/baseTypes";
import { useNotationStore } from "../store/pinia/notationStore";
import { useCellStore } from "../store/pinia/cellStore";
import { NotationTypeBackgroundColorizing } from "common/unions";
import useUtils from "./matrixHelperUtils";
import { useUserStore } from "../store/pinia/userStore";

const userStore = useUserStore();
const utils = useUtils();
const notationStore = useNotationStore();
const cellStore = useCellStore();

export default function useHtmlMatrixHelper() {
  function borderColor(notation: NotationAttributes): string {
    return notation.selected ? "gray" : "transparent";
  }

  function textBorderColor(notation: NotationAttributes): string {
    return notation.selected ? "chocolate" : "lighgray";
  }

  function textBackgroundColor(): string {
    return "lightyellow";
  }

  function regularFontSize() {
    return `${cellStore.getCellVerticalHeight() / 25}em`;
  }

  function textFontSize(el: HTMLElement): string {
    return getComputedStyle(document.body).getPropertyValue("font-size");
  }

  function signFontSize() {
    return `${cellStore.getCellVerticalHeight() / 28}em`;
  }

  function exponentFontSize() {
    return `0.55em`;
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
    switch (n.notationType) {
      case "ANNOTATION":
      case "SIGN":
      case "EXPONENT":
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
    switch (n.notationType) {
      case "ANNOTATION":
      case "SIGN":
      case "SQRTSYMBOL":
      case "SYMBOL": {
        return (n as PointNotationAttributes).col;
      }
      case "IMAGE":
      case "TEXT": {
        return (n as RectNotationAttributes).fromCol;
      }
      case "EXPONENT": {
        return (n as unknown as MultiCellAttributes).fromCol;
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
      case "ANNOTATION":
      case "SQRTSYMBOL":
      case "SIGN":
      case "SYMBOL":
        return (n as PointNotationAttributes).row;

      case "EXPONENT":
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
    let colIdx = col(n);
    let deltaX =
      n.notationType === "SQRTSYMBOL"
        ? Math.round(cellStore.getCellHorizontalWidth() / 3) * -1
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
      return cellStore.getCellHorizontalWidth() * 2;
    }

    switch (n.notationType) {
      case "ANNOTATION":
      case "SYMBOL": {
        return cellStore.getCellHorizontalWidth();
      }

      case "EXPONENT": {
        const n1 = n as unknown as MultiCellAttributes;
        return (n1.toCol - n1.fromCol + 2) * cellStore.getCellHorizontalWidth();
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

  function fontSize(n: NotationAttributes, el: HTMLElement) {
    return n.notationType === "TEXT"
      ? textFontSize(el)
      : n.notationType === "SIGN"
      ? signFontSize()
      : regularFontSize;
  }

  function html(n: NotationAttributes) {
    if (
      n.color?.value &&
      NotationTypeBackgroundColorizing.has(n.notationType)
    ) {
      utils.colorizeNotationCells(n);
    }

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
      color = n.color?.value ? n.color?.value : color;

      return `<span id=${n.uuid} class=line style='color:${color};
            position:relative;'></span>`;
    }

    if (n.notationType === "SQRTSYMBOL") {
      color = n.color?.value ? n.color?.value : color;
      return `<p id=${n.uuid} class='sqrtsymbol' style='color:${color}'>&#x221A;</p>`;
    }

    if (n.notationType === "TEXT") {
      const n1 = n as RectNotationAttributes;

      const bColor = textBorderColor(n ?? false);

      const height = rectNotationHeight(n as RectNotationAttributes);
      const width = rectNotationWidth(n as RectNotationAttributes);

      return `<textarea id=${
        n1.uuid
      } style='resize:none; overflow:hidden;width:${width}px;
              height:${height}px;background-color:${textBackgroundColor()};
              border:groove 2px;border-color:${bColor};'>${
                n1.value
              }</textarea>`;
    }

    if (n.notationType === "ANNOTATION") {
      const n1 = n as AnnotationNotationAttributes;

      const bColor = textBorderColor(n ?? false);

      ///TODO move static css props to a class
      return `<p id=${n1.uuid} style=
            'background:lightyellow; z-index:100;color:${color};font-weight:${fontWeight};
            position: absolute;top:50%;transform:
           translateY(-50%);font-size:0.48em'>${n1.value}</p>`;
    }

    if (n.notationType === "IMAGE") {
      let n1 = n as RectNotationAttributes;
      return `<img id=${n1.uuid} style='border:groove 2px;border-color:${borderColor}' src='${n1.value}'>`;
    }

    if (n.notationType === "EXPONENT") {
      const n1 = n as ExponentNotationAttributes;
      const baseStr = n1.base.toString();
      let baseHtml = "";

      for (let i = 0; i < baseStr.length; i++) {
        baseHtml += `<p id=${
          n1.uuid
        } style='color:${color};font-weight:${fontWeight}; position: absolute;
          top:10%;
          transform: translateX(${i * cellStore.getCellHorizontalWidth()}px);
          font-size:1.1em'>${baseStr.charAt(i)}</p>`;
      }

      const exponentHtml = `<p id=${
        n1.uuid
      } style='color:${color};font-weight:${fontWeight}; position:realtive;
      transform:translateY(-20%);
      transform:translateX(${
        baseStr.length * cellStore.getCellHorizontalWidth() - 2
      }px);
      font-size:${exponentFontSize()}'>${n1.exponent}</p>`;

      return baseHtml + exponentHtml;
    }

    // Symbol

    let n1 = n as PointNotationAttributes;
    const top = n1.followsFraction ? "75%" : "50%";
    ///TODO: move static css props to a class
    return `<p id=${n1.uuid} style='z-index:100;color:${color};font-weight:${fontWeight}; position: absolute;top:${top};transform:
    translateY(-50%);left:20%;font-size:1.1em'>${n1.value}</p>`;
  }

  return {
    mergeHtmlNotations,
  };
}
