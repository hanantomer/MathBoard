import type { NotationAttributes } from "common/baseTypes";
import { useCellStore } from "../store/pinia/cellStore";

/**
 * Prefer the latest student mark (not a pasted worksheet image).
 */
export function getLastStudentNotation(
  notations: NotationAttributes[],
): NotationAttributes | undefined {
  for (let i = notations.length - 1; i >= 0; i--) {
    if (notations[i].notationType !== "IMAGE") {
      return notations[i];
    }
  }
  return notations.at(-1);
}

function notationDomRect(
  svgId: string,
  notation: NotationAttributes,
): DOMRect | null {
  const svg = document.getElementById(svgId);
  if (!svg) return null;

  const byUuid =
    svg.querySelector(`[uuid="${notation.uuid}"]`) ??
    document.getElementById(notation.uuid);
  if (byUuid) {
    return byUuid.getBoundingClientRect();
  }
  return null;
}

function fallbackCellRect(notation: NotationAttributes): DOMRect | null {
  const cellStore = useCellStore();
  const svgRect = cellStore.getSvgBoundingRect();
  if (!svgRect?.width) return null;

  const cellW = cellStore.getCellHorizontalWidth();
  const cellH = cellStore.getCellVerticalHeight();
  const anyN = notation as NotationAttributes & {
    col?: number;
    row?: number;
    fromCol?: number;
    toCol?: number;
    fromRow?: number;
    toRow?: number;
    x?: number;
    y?: number;
    p1x?: number;
    p1y?: number;
    cx?: number;
    cy?: number;
  };

  let svgX = 0;
  let svgY = 0;
  let w = cellW;
  let h = cellH;

  if (typeof anyN.col === "number" && typeof anyN.row === "number") {
    svgX = anyN.col * cellW;
    svgY = anyN.row * cellH;
  } else if (
    typeof anyN.fromCol === "number" &&
    typeof anyN.fromRow === "number"
  ) {
    const toCol = anyN.toCol ?? anyN.fromCol;
    const toRow = anyN.toRow ?? anyN.fromRow;
    svgX = anyN.fromCol * cellW;
    svgY = anyN.fromRow * cellH;
    w = (toCol - anyN.fromCol + 1) * cellW;
    h = (toRow - anyN.fromRow + 1) * cellH;
  } else if (typeof anyN.x === "number" && typeof anyN.y === "number") {
    svgX = anyN.x;
    svgY = anyN.y;
  } else if (typeof anyN.p1x === "number" && typeof anyN.p1y === "number") {
    svgX = anyN.p1x;
    svgY = anyN.p1y;
  } else if (typeof anyN.cx === "number" && typeof anyN.cy === "number") {
    svgX = anyN.cx;
    svgY = anyN.cy;
  } else {
    return null;
  }

  return new DOMRect(svgRect.left + svgX, svgRect.top + svgY, w, h);
}

/** Viewport rect for anchoring a tip balloon near the last notation. */
export function getPracticeCoachAnchorRect(
  svgId: string,
  notations: NotationAttributes[],
): DOMRect | null {
  const last = getLastStudentNotation(notations);
  if (!last) return null;
  return notationDomRect(svgId, last) ?? fallbackCellRect(last);
}
