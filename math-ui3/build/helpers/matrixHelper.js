import { BoardType, NotationType, NotationTypeShape, NotationShape, } from "common/enum";
import { getDefaultFontSize } from "common/globals";
import * as d3 from "d3";
import { useNotationStore } from "../store/pinia/notationStore";
import { useUserStore } from "../store/pinia/userStore";
const notationStore = useNotationStore();
const userStore = useUserStore();
export default function useMatrixHelper() {
    const opacity = 1;
    const colsNum = 35;
    const rowsNum = 20;
    let rectSize = 25; ///TODO: ceck if initial value is of any value
    const svgWidth = "1400px";
    const svgHeight = "700px";
    let matrix;
    function borderColor(selected) {
        return selected ? "red" : "transparent";
    }
    function backgroundColor(selected) {
        return selected ? "green" : "transparent";
    }
    function regularFontSize() {
        return `${rectSize / 25}em`;
    }
    function textFontSize(el) {
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
    function setRectSize(svgId) {
        let clientWidth = document.getElementById(svgId)?.clientWidth;
        let clientHeight = document.getElementById(svgId)?.clientHeight;
        if (!clientWidth || !clientHeight)
            return;
        rectSize = Math.min(Math.floor(clientWidth / colsNum), Math.floor(clientHeight / rowsNum));
    }
    function setTextMeasurementCtx(el) {
        let textMeasurementEl = document.createElement("canvas");
        window.textMeasurementCtx = textMeasurementEl.getContext("2d");
        window.textMeasurementCtx.font = window
            .getComputedStyle(el, null)
            .getPropertyValue("font");
    }
    /// call from component mount
    function init(el, svgId) {
        setRectSize(svgId);
        setTextMeasurementCtx(el);
    }
    function freeTextRectWidth(text) {
        return window.textMeasurementCtx.measureText(text).width / rectSize;
    }
    function freeTextRectHeight(text) {
        let fontSize = getDefaultFontSize();
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
    function findClickedObject(dotPosition, tagName, notationType) {
        var elements = [];
        var display = [];
        var item = document.elementFromPoint(dotPosition.x, dotPosition.y); // must be any to accept window
        var prevItem = null;
        var idx = 0;
        while (idx++ < 50 &&
            item &&
            (!prevItem || item != prevItem) &&
            item != document.body &&
            item != window &&
            item != document &&
            item != document.documentElement) {
            elements.push(item);
            display.push(item.style.display);
            item.style.display = "none";
            prevItem = item;
            item = document.elementFromPoint(dotPosition.x, dotPosition.y);
        }
        for (var i = 0; i < elements.length; i++) {
            elements[i].style.display = display[i];
        }
        return elements.find((item) => item.tagName == tagName &&
            (!notationType || notationType == item.attributes.notationType.value));
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
    function setMatrix(svgId) {
        // render rows
        for (var row = 0; row < rowsNum; row++) {
            matrix.push(d3.range(colsNum));
        }
        // render rectangles
        d3
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
    function getNextRect(horizontalStep, verticalStep) {
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
            value: ""
        };
    }
    function setNextRect(horizontalStep, verticalStep) {
        let nextRect = getNextRect(horizontalStep, verticalStep);
        if (nextRect) {
            nextRect.notationType = "rect";
            notationStore.setActiveCell(nextRect);
            //TODO: move to caller
            //if (notationStore.this.getParent().boardType === BoardType.LESSON) {
            //  this.userOperationsMixin_syncOutgoingActiveCell(nextRect);
            //}
        }
    }
    function findRect(point) {
        return document
            ?.querySelector(`g[row='${point.row}']`)
            ?.querySelector(`rect[col='${point.col}']`);
    }
    function removeNotation(n) {
        document?.getElementById(n.uuid + n.notationType)?.remove();
    }
    function enrichNotations(notations) {
        let enrichedNotations = [];
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
    function refreshScreen(notations, svgId, el) {
        try {
            notations = enrichNotations(notations);
        }
        catch { } // cant check if observer has properties
        d3.select("#" + svgId)
            .selectAll("foreignObject")
            .data(Object.values(notations))
            .join((enter) => {
            return showNotations(enter, el);
        }, (update) => {
            return updateNotations(update);
        }, (exit) => {
            return removeNotations(exit);
        });
    }
    function height(n) {
        switch (NotationTypeShape.get(n.notationType)) {
            case NotationShape.POINT: {
                return pointNotationHeight(n);
            }
            case NotationShape.LINE: {
                return lineNotationHeight(n);
            }
            case NotationShape.RECT: {
                return rectNotationHeight(n);
            }
        }
        return null;
    }
    /// TODO: treat notation types divertly
    function showNotations(enter, el) {
        return (enter
            .append("foreignObject")
            .attr("type", (n) => {
            return n.notationType;
        })
            .attr("id", (n) => {
            return id(n);
        })
            .attr("col", (n) => {
            return n?.col;
        })
            .attr("fromCol", (n) => {
            return n?.fromCol;
        })
            .attr("toCol", (n) => {
            return n?.toCol;
        })
            .attr("row", (n) => {
            return n?.row;
        })
            .attr("fromRow", (n) => {
            return n?.fromRow;
        })
            .attr("toRow", (n) => {
            return n?.toRow;
        })
            .attr("x", (n) => {
            return x(n);
        })
            .attr("y", (n) => {
            return y(n);
        })
            .attr("width", (n) => {
            return width(n);
        })
            .attr("height", (n) => {
            return height(n);
        })
            .style("font-size", (n) => {
            return fontSize(n, el);
        })
            //.style("color", (n) => {
            //  return this.$color(n);
            //})
            .html((n) => {
            return html(n);
        }));
    }
    function updateNotations(update) {
        return (update
            //.style("color", (n) => {
            //  return this.$color(n);
            //})
            .attr("x", (n) => {
            return x(n);
        })
            .attr("y", (n) => {
            return y(n);
        })
            .attr("col", (n) => {
            return col(n);
        })
            .attr("row", (n) => {
            return row(n);
        })
            .attr("width", (n) => {
            return width(n);
        })
            .html((n) => {
            return html(n);
        }));
    }
    function removeNotations(exit) {
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
    function id(n) {
        return n.notationType + n.uuid;
    }
    function col(n) {
        switch (NotationTypeShape.get(n.notationType)) {
            case NotationShape.POINT: {
                return n.col;
            }
            case NotationShape.LINE:
            case NotationShape.RECT: {
                return n.fromCol;
            }
        }
        return null;
    }
    function row(n) {
        switch (NotationTypeShape.get(n.notationType)) {
            case NotationShape.POINT:
            case NotationShape.LINE: {
                return n.row;
            }
            case NotationShape.RECT: {
                return n.fromRow;
            }
        }
        return null;
    }
    function x(n) {
        let colIdx = col(n);
        let deltaX = n.notationType === NotationType.SQRTSYMBOL ||
            n.notationType === NotationType.POWER
            ? Math.round(this.rectSize / 3) * -1
            : 0;
        return colIdx ? getNotationXposByCol(colIdx) + deltaX : null;
    }
    function y(n) {
        let rowIdx = row(n);
        let deltaY = n.notationType === NotationType.POWER
            ? -5
            : n.notationType === NotationType.FRACTION ||
                n.notationType === NotationType.SQRT
                ? -4
                : 0;
        return this.getNotationYposByRow(rowIdx) + deltaY;
    }
    function width(n) {
        switch (NotationTypeShape.get(n.notationType)) {
            case NotationShape.POINT: {
                return pointNotationWidth(n);
            }
            case NotationShape.LINE: {
                return lineNotationWidth(n);
            }
            case NotationShape.RECT: {
                return rectNotationWidth(n);
            }
        }
        return null;
    }
    function pointNotationWidth(n) {
        return rectSize;
    }
    function lineNotationWidth(n) {
        return (n.toCol - n.fromCol) * rectSize + 5;
    }
    function rectNotationWidth(n) {
        // if (n.notationType === NotationType.TEXT) {
        //   return (
        //     (<any>window).textMeasurementCtx.measureText(n.value).width +
        //     1 * n.value.length
        //   );
        // }
        return (n.toCol - n.fromCol) * rectSize + 5;
    }
    function pointNotationHeight(n) {
        return rectSize;
    }
    function lineNotationHeight(n) {
        return rectSize;
    }
    function rectNotationHeight(n) {
        return (n.toRow - n.fromRow) * rectSize + 5;
    }
    function fontSize(n, el) {
        return n.notationType === NotationType.POWER
            ? powerFontSize()
            : n.notationType === NotationType.TEXT
                ? textFontSize(el)
                : n.notationType === NotationType.SIGN
                    ? signFontSize()
                    : regularFontSize;
    }
    function html(n) {
        if (n.notationType === NotationType.FRACTION) {
            let n1 = n;
            return `<span class=line style='width:${(n1.toCol - n1.fromCol) * rectSize}px;'></span>`;
        }
        if (n.notationType === NotationType.SQRT) {
            let n1 = n;
            return `<span class=line style='position:relative;left:9px;width:${(n1.toCol - n1.fromCol) * rectSize - 8}px;'></span>`;
        }
        if (n.notationType === NotationType.SQRTSYMBOL) {
            return `<p style='position:relative;left:5px; font-size:1.4em'>&#x221A;</p>`;
        }
        if (n.notationType === NotationType.TEXT) {
            let n1 = n;
            let bColor = borderColor(n === notationStore.activeNotation);
            return `<pre style='border:groove 2px;border-color:${bColor};background-color:${bColor}'>${n1.value}</pre>`;
        }
        if (n.notationType === NotationType.IMAGE) {
            let n1 = n;
            let bColor = borderColor(n === notationStore.activeNotation);
            return `<img style='border:groove 2px;border-color:${borderColor}' src='${n1.value}'>`;
        }
        if (n.notationType === NotationType.SYMBOL) {
            let n1 = n;
            let bColor = borderColor(n === notationStore.activeNotation);
            return `<img style='border:groove 2px;border-color:${borderColor}' src='${n1.value}'>`;
        }
        let n1 = n;
        let fontWeight = userStore.currentUser?.uuid == n.user.uuid ? "bold" : "normal";
        let color = (notationStore.selectedNotations.indexOf(n.uuid))
            ? "red"
            : this.getParent().boardType === BoardType.ANSWER &&
                this.getUser().uuid != n.user.uuid
                ? "purple"
                : "black";
        return `<p style='color:${color};font-weight:${fontWeight};margin-left:8px;font-size:1.1em'>${n1.value}</p>`;
    }
    function getNotationXposByCol(col) {
        return col * rectSize;
    }
    function getNotationYposByRow(row) {
        return row * rectSize;
    }
    function findTextAtClickedPosition(e) {
        return findClickedObject({
            x: e.clientX,
            y: e.clientY,
        }, "foreignObject", NotationType.TEXT);
    }
    return {
        svgWidth,
        svgHeight,
        setMatrix,
        showNotations,
        rectSize,
        findClickedObject,
        findRect,
        findTextAtClickedPosition,
        setNextRect,
        freeTextRectWidth,
        freeTextRectHeight,
        getNotationXposByCol,
        getNotationYposByRow,
        refreshScreen,
    };
}
;
//# sourceMappingURL=matrixHelper.js.map