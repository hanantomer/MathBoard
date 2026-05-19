import { DotCoordinates } from "common/baseTypes";
import { useCellStore } from "../store/pinia/cellStore";

/** Viewport coordinates — matches `PointerEvent.client*` and `getBoundingClientRect()`. */
export function viewportPointerPosition(e: PointerEvent): DotCoordinates {
  return { x: e.clientX, y: e.clientY };
}

/** Coordinates relative to the board SVG origin (top-left of the SVG). */
export function svgPointerPosition(e: PointerEvent): DotCoordinates {
  const r = useCellStore().getSvgBoundingRect();
  return { x: e.clientX - r.left, y: e.clientY - r.top };
}
