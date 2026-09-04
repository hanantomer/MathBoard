/** If this many cells/rows ahead have no math, Space/Enter moves the caret instead of pushing. */
export const SPACE_MOVE_EMPTY_RUN = 10;

export const PUSHABLE_MATH_TYPES = new Set([
  "SYMBOL",
  "EXPONENT",
  "LOGBASE",
  "SQRT",
]);

export function isPushableMathType(notationType: string): boolean {
  return PUSHABLE_MATH_TYPES.has(notationType);
}

/** Contiguous occupied rows at or below `fromRow`. `lastRow` is the last occupied row. */
export function findNextRowBlock(
  fromRow: number,
  isOccupied: (row: number) => boolean,
  rowsNum: number,
): { firstRow: number; lastRow: number } {
  let firstRow = -1;
  let lastRow = -1;
  for (let row = fromRow; row < rowsNum; row++) {
    const occupied = isOccupied(row);
    if (!occupied && firstRow === -1) continue;
    if (!occupied && firstRow !== -1) {
      return { firstRow, lastRow };
    }
    if (firstRow === -1) firstRow = row;
    lastRow = row;
  }
  return { firstRow, lastRow };
}

/** True when rows `fromRow+1` .. `fromRow+count` have no occupied rows. */
export function nextMathRowsAreEmptyFrom(
  fromRow: number,
  isOccupied: (row: number) => boolean,
  rowsNum: number,
  count = SPACE_MOVE_EMPTY_RUN,
): boolean {
  const last = Math.min(fromRow + count, rowsNum - 1);
  for (let row = fromRow + 1; row <= last; row++) {
    if (isOccupied(row)) return false;
  }
  return true;
}
