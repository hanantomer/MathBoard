import type {
  MultiCellAttributes,
  NotationAttributes,
  PointNotationAttributes,
  RectAttributes,
} from "common/baseTypes";

export type JumpCell = { col: number; row: number };

const POINT_TYPES = new Set([
  "SYMBOL",
  "EXPONENT",
  "LOGBASE",
  "SQRTSYMBOL",
]);

function visitMathCells(
  n: NotationAttributes,
  visit: (col: number, row: number) => void,
) {
  if (POINT_TYPES.has(n.notationType)) {
    const p = n as PointNotationAttributes;
    if (Number.isFinite(p.col) && Number.isFinite(p.row)) visit(p.col, p.row);
    return;
  }
  if (n.notationType === "SQRT") {
    const s = n as unknown as MultiCellAttributes;
    const from = Math.min(s.fromCol, s.toCol);
    const to = Math.max(s.fromCol, s.toCol);
    for (let c = from; c <= to; c++) visit(c, s.row);
    return;
  }
  if (n.notationType === "TEXT" || n.notationType === "IMAGE") {
    const r = n as unknown as RectAttributes;
    const fromCol = Math.min(r.fromCol, r.toCol);
    const toCol = Math.max(r.fromCol, r.toCol);
    const fromRow = Math.min(r.fromRow, r.toRow);
    const toRow = Math.max(r.fromRow, r.toRow);
    for (let row = fromRow; row <= toRow; row++) {
      for (let col = fromCol; col <= toCol; col++) visit(col, row);
    }
  }
}

export function lastOccupiedColOnRow(
  notations: NotationAttributes[],
  row: number,
): number | null {
  let max: number | null = null;
  for (const n of notations) {
    visitMathCells(n, (col, r) => {
      if (r !== row) return;
      if (max === null || col > max) max = col;
    });
  }
  return max;
}

export function firstOccupiedCell(
  notations: NotationAttributes[],
): JumpCell | null {
  let best: JumpCell | null = null;
  for (const n of notations) {
    visitMathCells(n, (col, row) => {
      if (!best || row < best.row || (row === best.row && col < best.col)) {
        best = { col, row };
      }
    });
  }
  return best;
}

export function lastOccupiedCell(
  notations: NotationAttributes[],
): JumpCell | null {
  let best: JumpCell | null = null;
  for (const n of notations) {
    visitMathCells(n, (col, row) => {
      if (!best || row > best.row || (row === best.row && col > best.col)) {
        best = { col, row };
      }
    });
  }
  return best;
}
