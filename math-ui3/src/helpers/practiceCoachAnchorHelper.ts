import type { NotationAttributes } from "common/baseTypes";
import { useCellStore } from "../store/pinia/cellStore";
import { isPracticeProblemNotation } from "./practiceBoardAdapter";

/**
 * Prefer the latest student mark (not a pasted worksheet image).
 */
export function getLastStudentNotation(
  notations: NotationAttributes[],
): NotationAttributes | undefined {
  for (let i = notations.length - 1; i >= 0; i--) {
    const n = notations[i];
    if (n.notationType === "IMAGE") continue;
    if (isPracticeProblemNotation(n)) continue;
    return n;
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

function liveFreeTextRect(): DOMRect | null {
  const textArea = document.getElementById("textAreaEl");
  if (!(textArea instanceof HTMLTextAreaElement)) return null;
  if (textArea.offsetParent === null) return null;
  const rect = textArea.getBoundingClientRect();
  if (rect.width < 8 || rect.height < 8) return null;
  return rect;
}

/** Viewport rect for anchoring a tip balloon near the last notation. */
export function getPracticeCoachAnchorRect(
  svgId: string,
  notations: NotationAttributes[],
): DOMRect | null {
  const writing = liveFreeTextRect();
  if (writing) return writing;
  const last = getLastStudentNotation(notations);
  if (!last) return null;
  return notationDomRect(svgId, last) ?? fallbackCellRect(last);
}

/** Clear space between the writing and the coach balloon. */
export const PRACTICE_COACH_BALLOON_GAP = 96;

export type PracticeCoachBalloonBounds = {
  minLeft: number;
  minTop: number;
  maxRight: number;
  maxBottom: number;
};

function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), Math.max(min, max));
}

export function clampBalloonToBounds(
  left: number,
  top: number,
  width: number,
  height: number,
  b: PracticeCoachBalloonBounds,
): { left: number; top: number } {
  return {
    left: clamp(left, b.minLeft, b.maxRight - width),
    top: clamp(top, b.minTop, b.maxBottom - height),
  };
}

function overlapsKeepOut(
  box: { left: number; top: number; width: number; height: number },
  keepOut: { left: number; top: number; right: number; bottom: number },
): boolean {
  const right = box.left + box.width;
  const bottom = box.top + box.height;
  return !(
    right <= keepOut.left ||
    box.left >= keepOut.right ||
    bottom <= keepOut.top ||
    box.top >= keepOut.bottom
  );
}

/**
 * Place the balloon near the last mark without covering it.
 * Prefers below, then to the right; never clamps back onto the writing.
 */
export function placePracticeCoachBalloon(
  anchor: { left: number; top: number; right: number; bottom: number },
  width: number,
  height: number,
  bounds: PracticeCoachBalloonBounds,
): { left: number; top: number } {
  const gap = PRACTICE_COACH_BALLOON_GAP;
  const keepOut = {
    left: anchor.left - 16,
    top: anchor.top - 16,
    right: anchor.right + 16,
    bottom: anchor.bottom + gap,
  };

  const candidates = [
    { left: anchor.left, top: anchor.bottom + gap },
    {
      left: Math.max(anchor.left, anchor.right - width),
      top: anchor.bottom + gap,
    },
    { left: anchor.right + gap, top: anchor.top },
    { left: anchor.right + gap, top: Math.max(bounds.minTop, anchor.bottom - height) },
    { left: anchor.left - width - gap, top: anchor.top },
    { left: anchor.left, top: anchor.top - height - gap },
    { left: bounds.maxRight - width, top: bounds.maxBottom - height },
  ];

  for (const c of candidates) {
    const pos = clampBalloonToBounds(c.left, c.top, width, height, bounds);
    if (!overlapsKeepOut({ ...pos, width, height }, keepOut)) {
      return pos;
    }
  }

  return clampBalloonToBounds(
    bounds.maxRight - width,
    bounds.maxBottom - height,
    width,
    height,
    bounds,
  );
}
