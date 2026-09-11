export const TEXT_RESIZE_HANDLES = [
  "nw",
  "n",
  "ne",
  "e",
  "se",
  "s",
  "sw",
  "w",
] as const;

export type TextResizeHandle = (typeof TEXT_RESIZE_HANDLES)[number];

export type ViewportBox = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export function applyTextResizeHandle(
  start: ViewportBox,
  handle: TextResizeHandle,
  pointerX: number,
  pointerY: number,
  startPointerX: number,
  startPointerY: number,
  minWidth: number,
  minHeight: number,
): ViewportBox {
  const dx = pointerX - startPointerX;
  const dy = pointerY - startPointerY;
  let left = start.left;
  let top = start.top;
  let right = start.left + start.width;
  let bottom = start.top + start.height;

  if (handle.includes("e")) right = start.left + start.width + dx;
  if (handle.includes("w")) left = start.left + dx;
  if (handle.includes("s")) bottom = start.top + start.height + dy;
  if (handle.includes("n")) top = start.top + dy;

  if (right - left < minWidth) {
    if (handle.includes("w")) left = right - minWidth;
    else right = left + minWidth;
  }
  if (bottom - top < minHeight) {
    if (handle.includes("n")) top = bottom - minHeight;
    else bottom = top + minHeight;
  }

  return {
    left,
    top,
    width: right - left,
    height: bottom - top,
  };
}
