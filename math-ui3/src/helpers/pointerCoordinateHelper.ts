import { DotCoordinates } from "common/baseTypes";
import { useCellStore } from "../store/pinia/cellStore";

/** Viewport coordinates — matches `PointerEvent.client*` and `getBoundingClientRect()`. */
export function viewportPointerPosition(e: PointerEvent): DotCoordinates {
  return { x: e.clientX, y: e.clientY };
}

function getBoardSvg(): SVGSVGElement | null {
  const id = useCellStore().getSvgId();
  if (!id) return null;
  const el = document.getElementById(id);
  return el instanceof SVGSVGElement ? el : null;
}

/**
 * Board SVG user-space point from a viewport (client) position.
 * Uses the live screen CTM so overlay, handles, and matrix strokes share
 * the same coordinates even when the SVG is scaled or has a viewBox.
 */
export function clientPointToSvgUser(
  clientX: number,
  clientY: number,
): DotCoordinates {
  const svg = getBoardSvg();
  const ctm = svg?.getScreenCTM();
  if (svg && ctm) {
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const user = pt.matrixTransform(ctm.inverse());
    return { x: user.x, y: user.y };
  }

  const r = useCellStore().getSvgBoundingRect();
  return { x: clientX - r.left, y: clientY - r.top };
}

/** Map a board SVG user-space point to viewport (fixed-position) pixels. */
export function svgUserToViewport(x: number, y: number): DotCoordinates {
  const svg = getBoardSvg();
  const ctm = svg?.getScreenCTM();
  if (svg && ctm) {
    const pt = svg.createSVGPoint();
    pt.x = x;
    pt.y = y;
    const screen = pt.matrixTransform(ctm);
    return { x: screen.x, y: screen.y };
  }

  const r = useCellStore().getSvgBoundingRect();
  return { x: x + r.left, y: y + r.top };
}

/**
 * User-space rectangle that currently maps onto the board SVG's screen box.
 * Overlay SVGs should use this as viewBox so they share the matrix coordinate system.
 */
export function getBoardSvgUserExtent(): {
  x: number;
  y: number;
  width: number;
  height: number;
} {
  const svg = getBoardSvg();
  const r = svg?.getBoundingClientRect() ?? useCellStore().getSvgBoundingRect();
  if (!r.width || !r.height) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }
  const tl = clientPointToSvgUser(r.left, r.top);
  const br = clientPointToSvgUser(r.right, r.bottom);
  return {
    x: tl.x,
    y: tl.y,
    width: br.x - tl.x,
    height: br.y - tl.y,
  };
}

/** Coordinates relative to the board SVG user space (not raw CSS pixels). */
export function svgPointerPosition(e: PointerEvent): DotCoordinates {
  return clientPointToSvgUser(e.clientX, e.clientY);
}
