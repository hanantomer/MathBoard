export const baseURL = "/api";
export const imagesURL = "/images";
export const matrixDimensions = {
  rowsNum: 27,
  colsNum: 115,
};
export const clonedNotationUUIdPrefix = "cloned_";
export const transparentColor = "#4d6a96";
export const selectionColor = "chocolate";
export const htmlColor = "black";
export const cellSpace = 1;
export const signList = [
  "=",
  "+",
  "-",
  "*",
  "/",
  "\\",
  "(",
  ")",
  "[",
  "]",
];
export const selectedCellStroke = "red";
export const defaultdCellStroke = "lightgray";
export const heartBeatInterval = 3000;

export function getDefaultFontSize(): number {
  var style = window!.getComputedStyle(
    document!.body
  )!;

  var fs = style.getPropertyValue("font-size")!;
  let regex = fs.match(/\d+/);
  return Number(regex?.[0]);
}

export function formatDate(
  date: Date | null | undefined
) {
  return date
    ? new Date(date).toLocaleDateString("en-us", {
        weekday: "long",
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";
}

export function decodeSpecialSymbol(
  symbol: string
) {
  const decoder = document.createElement("div");
  decoder.innerHTML = symbol.toString();
  return decoder.textContent || decoder.innerText;
}

export function wrapVectorSymbol(
  symbol: string,
  color: string = "black"
) {
  const symbolWithoutPrefix = symbol.replace(
    vectorSymbolPrefix,
    ""
  );

  if (!symbolWithoutPrefix) return "";

  const firstChar = symbolWithoutPrefix.charAt(0);

  return `<span style="color:${color};">${firstChar} </span>${vectorArrowSpan}`;
}

export function getMousePositionInSVG(
  svgElement: SVGSVGElement,
  mouseEvent: MouseEvent,
  rect: DOMRect
) {
  // Create an SVGPoint
  let pt = svgElement.createSVGPoint();

  // Set the point's coordinates to the mouse event's clientX/clientY
  pt.x = mouseEvent.clientX + rect.left;
  pt.y = mouseEvent.clientY + rect.top;

  // Transform the client coordinates to SVG coordinates
  let svgCoords = pt.matrixTransform(
    svgElement.getScreenCTM()!.inverse()
  );

  return svgCoords;
}

export const vectorSymbolPrefix = "vec_";

const vectorArrowSpan = `<span style="position:absolute;margin-left:-12px;margin-top:-12px">&rarr;</span>`;

export const sqrtDeltaY = 3;

export const sqrtSymbolSuffix = "_sqs";

export const ACCESS_TOKEN_NAME = "access_token";

export type TextSyncUpdateData = {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  userUUId: string;
  lessonUUId: string;
  notationUUId: string;
};

export type TextSyncEndData = {
  userUUId: string;
  lessonUUId: string;
  notationUUId: string;
};
