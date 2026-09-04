import type { PracticeProblemPart } from "common/practiceParts";

export type PracticePartStatus = "locked" | "started" | "completed";

export type PracticePartOrderSession = {
  submitted?: boolean;
  parts: PracticeProblemPart[];
  startedPartIds?: string[];
  completedPartIds: string[];
  activePartId: string | null;
  partLabelRows?: Record<string, number> | null;
};

function addId(ids: string[], id: string | null | undefined) {
  const trimmed = (id ?? "").trim();
  if (!trimmed || ids.includes(trimmed)) return;
  ids.push(trimmed);
}

/** Pin the first task at row 0 (or the first free row) so later clicks cannot steal it. */
export function withSeededFirstPartRow(
  parts: PracticeProblemPart[],
  partLabelRows?: Record<string, number> | null,
): Record<string, number> {
  const rows: Record<string, number> = {};
  for (const [id, row] of Object.entries(partLabelRows ?? {})) {
    if (typeof row === "number" && row >= 0) rows[id] = row;
  }
  const firstId = (parts[0]?.id ?? "").trim();
  if (firstId && typeof rows[firstId] !== "number") {
    const taken = new Set(Object.values(rows));
    if (taken.has(0)) {
      const occupant = Object.keys(rows).find((id) => rows[id] === 0);
      if (occupant && occupant !== firstId) {
        let dest = 1;
        while (taken.has(dest)) dest++;
        rows[occupant] = dest;
      }
    }
    rows[firstId] = 0;
  }
  return orderPartLabelRowsByList(parts, rows);
}

/** Keep list order matching top-to-bottom gutter order: (1) above (2) above (3). */
export function orderPartLabelRowsByList(
  parts: PracticeProblemPart[],
  partLabelRows?: Record<string, number> | null,
): Record<string, number> {
  const rows: Record<string, number> = {};
  for (const [id, row] of Object.entries(partLabelRows ?? {})) {
    if (typeof row === "number" && row >= 0) rows[id] = row;
  }
  const placed = parts
    .map((p) => p.id)
    .filter((id) => typeof rows[id] === "number")
    .map((id) => ({ id, row: rows[id] }));
  if (placed.length < 2) return rows;
  const sortedRows = [...placed.map((p) => p.row)].sort((a, b) => a - b);
  const next = { ...rows };
  placed.forEach((p, i) => {
    next[p.id] = sortedRows[i];
  });
  return next;
}

/** Started parts, including a derived set for sessions saved before this field existed. */
export function startedPartIdsFromSession(
  session: PracticePartOrderSession,
): string[] {
  const allowed = new Set(session.parts.map((p) => p.id));
  const ids: string[] = [];
  const add = (id: string | null | undefined) => {
    const trimmed = (id ?? "").trim();
    if (!trimmed) return;
    if (allowed.size && !allowed.has(trimmed)) return;
    addId(ids, trimmed);
  };
  if (Array.isArray(session.startedPartIds)) {
    for (const id of session.startedPartIds) add(id);
  }
  for (const id of session.completedPartIds) add(id);
  for (const id of Object.keys(session.partLabelRows ?? {})) add(id);
  add(session.activePartId);
  if (session.submitted) add(session.parts[0]?.id);
  return ids;
}

export function canActivatePart(
  parts: PracticeProblemPart[],
  startedIds: string[],
  partId: string,
): boolean {
  const id = partId.trim();
  const idx = parts.findIndex((p) => p.id === id);
  if (idx < 0) return false;
  const started = new Set(startedIds);
  if (started.has(id)) return true;
  const firstUnstartedIdx = parts.findIndex((p) => !started.has(p.id));
  return firstUnstartedIdx === idx;
}

export function lockedPartHint(
  parts: PracticeProblemPart[],
  startedIds: string[],
  partId: string,
): string | null {
  if (canActivatePart(parts, startedIds, partId)) return null;
  const started = new Set(startedIds);
  const firstUnstarted = parts.find((p) => !started.has(p.id));
  if (!firstUnstarted) return null;
  return `Start (${firstUnstarted.id}) before (${partId.trim()}).`;
}

export function partStatus(
  partId: string,
  startedIds: string[],
  completedIds: string[],
): PracticePartStatus {
  if (completedIds.includes(partId)) return "completed";
  if (startedIds.includes(partId)) return "started";
  return "locked";
}

/**
 * Which started section owns `row`: from that part's start row until the next
 * part's start (last part owns the rest). Rows above the first mark are none.
 */
export function partIdForRow(
  row: number,
  partLabelRows?: Record<string, number> | null,
): string | null {
  const marks = Object.entries(partLabelRows ?? {})
    .filter(([, r]) => typeof r === "number" && r >= 0)
    .map(([id, r]) => ({ id, row: r as number }))
    .sort((a, b) => a.row - b.row || a.id.localeCompare(b.id));
  if (!marks.length) return null;
  if (row < marks[0].row) return null;
  let current = marks[0].id;
  for (const m of marks) {
    if (row < m.row) break;
    current = m.id;
  }
  return current;
}

export function laterPartLabelRows(
  fromRow: number,
  partLabelRows?: Record<string, number> | null,
): number[] {
  return Object.values(partLabelRows ?? {}).filter(
    (row): row is number => typeof row === "number" && row > fromRow,
  );
}

export function hasLaterPracticePartLabel(
  fromRow: number,
  partLabelRows?: Record<string, number> | null,
): boolean {
  return laterPartLabelRows(fromRow, partLabelRows).length > 0;
}

/** Grow a vertical push so later `(n)` start rows move even across empty rows. */
export function extendPushBlockForPracticeParts(
  block: { firstRow: number; lastRow: number },
  fromRow: number,
  partLabelRows?: Record<string, number> | null,
): { firstRow: number; lastRow: number } {
  const later = laterPartLabelRows(fromRow, partLabelRows);
  if (!later.length) return block;
  const maxLater = Math.max(...later);
  const minLater = Math.min(...later);
  if (block.firstRow === -1) {
    return { firstRow: minLater, lastRow: maxLater };
  }
  return {
    firstRow: block.firstRow,
    lastRow: Math.max(block.lastRow, maxLater),
  };
}

/** Shift `(n)` marks at or below the push block, not the mark on the caret row. */
export function shiftedPartLabelRows(
  partLabelRows: Record<string, number> | null | undefined,
  firstRow: number,
  fromRow: number,
): Record<string, number> | null | undefined {
  if (!partLabelRows) return partLabelRows;
  const next: Record<string, number> = {};
  let changed = false;
  for (const [id, row] of Object.entries(partLabelRows)) {
    if (row >= firstRow && row > fromRow) {
      next[id] = row + 1;
      changed = true;
    } else {
      next[id] = row;
    }
  }
  return changed ? next : partLabelRows;
}
