export const baseURL = "/api";
export const imagesURL = "/images";
export const matrixDimensions = {
  rowsNum: 50,
  colsNum: 100,
};
export const matrixSize = {
  width: "1650px",
  height: "1650px",
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

export function validateCookiesEnabled(): boolean {
  if (!window.navigator.cookieEnabled) {
    alert(
      "Cookies not enabled. You must enable cookies to continue",
    );
    return false;
  }
  return true;
}

export function getDefaultFontSize(): number {
  var style = window!.getComputedStyle(
    document!.body,
  )!;

  var fs = style.getPropertyValue("font-size")!;
  let regex = fs.match(/\d+/);
  return Number(regex?.[0]);
}

export function formatDate(
  date: Date | null | undefined,
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
  symbol: string,
) {
  const decoder = document.createElement("div");
  decoder.innerHTML = symbol.toString();
  return decoder.textContent || decoder.innerText;
}

export function wrapVectorSymbol(
  symbol: string,
  color: string = "black",
) {
  const symbolWithoutPrefix = symbol.replace(
    vectorSymbolPrefix,
    "",
  );

  if (!symbolWithoutPrefix) return "";

  const firstChar = symbolWithoutPrefix.charAt(0);

  return `<span style="color:${color};">${firstChar} </span>${vectorArrowSpan}`;
}

export function getMousePositionInSVG(
  svgElement: SVGSVGElement,
  mouseEvent: PointerEvent,
  rect: DOMRect,
) {
  // Create an SVGPoint
  let pt = svgElement.createSVGPoint();

  pt.x = mouseEvent.clientX;
  pt.y = mouseEvent.clientY;

  const ctm = svgElement.getScreenCTM();
  if (!ctm) {
    return {
      x: mouseEvent.clientX - rect.left,
      y: mouseEvent.clientY - rect.top,
    };
  }

  return pt.matrixTransform(ctm.inverse());
}

export function isMobile() {
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    ) || window.innerWidth <= 1023
  );
}

export const vectorSymbolPrefix = "vec_";

const vectorArrowSpan = `<span style="position:absolute;margin-left:-12px;margin-top:-12px">&rarr;</span>`;

export const sqrtDeltaY = 10;

export const sqrtSymbolSuffix = "_sqs";

export const ACCESS_TOKEN_NAME = "access_token";

/** Cookie / localStorage key for anonymous practice guests. */
export const GUEST_ID_COOKIE = "mathboard_guest_id";

/** Max Check + Coach AI calls per guest per UTC day. */
export const GUEST_AI_DAILY_LIMIT = 5;

/**
 * Max Check + Coach AI calls per registered user per UTC day
 * (until paid plans exist).
 */
export const USER_AI_DAILY_LIMIT = 25;

/** API error code when practice AI daily quota is exhausted. */
export const PRACTICE_AI_LIMIT_ERROR = "practice_ai_limit";

/** @deprecated Use PRACTICE_AI_LIMIT_ERROR */
export const GUEST_AI_LIMIT_ERROR = PRACTICE_AI_LIMIT_ERROR;

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

export interface GoogleUserData {
  sub: string;
  name: string;
  email: string;
}
