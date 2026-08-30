import { matrixDimensions } from "common/globals";
import {
  NotationAttributes,
  PointNotationAttributes,
  RectNotationAttributes,
} from "common/baseTypes";
import {
  detectLinePartId,
  isPracticePartLabelOnly,
} from "common/practiceParts";
import { useCellStore } from "../store/pinia/cellStore";
import { useNotationStore } from "../store/pinia/notationStore";
import { usePracticeStore } from "../store/pinia/practiceStore";
import {
  getPracticeQuestionUUId,
  isPracticeBoard,
  isPracticeProblemNotation,
} from "./practiceBoardAdapter";

export const PRACTICE_LABEL_FROM_COL = 0;
export const PRACTICE_LABEL_SPAN = 0;

export function practiceLabelGutterToCol(): number {
  return PRACTICE_LABEL_FROM_COL + PRACTICE_LABEL_SPAN - 1;
}

/** Work uses the full grid; numbers live in the HTML strip beside it. */
export function practiceWorkFromCol(): number {
  return 0;
}

export function isPracticeLabelGutterCol(_col: number): boolean {
  return false;
}

/** Leftover in-grid TEXT chips from older sessions (cols 0–1). */
export function isPracticeGutterNotation(
  fromCol: number,
  toCol: number,
): boolean {
  if (fromCol > 1) return false;
  return toCol <= 3;
}

export function isPracticeLabelGutterActive(): boolean {
  if (!isPracticeBoard()) return false;
  return usePracticeStore().getSession(getPracticeQuestionUUId()).submitted;
}

export function snapPracticeWorkCell<T extends { col: number; row: number }>(
  cell: T,
): T {
  if (!isPracticeLabelGutterActive() || !isPracticeLabelGutterCol(cell.col)) {
    return cell;
  }
  return { ...cell, col: practiceWorkFromCol() };
}

export function notationRow(n: NotationAttributes): number | null {
  const anyN = n as NotationAttributes & {
    row?: number;
    fromRow?: number;
  };
  if (typeof anyN.row === "number" && anyN.row >= 0) return anyN.row;
  if (typeof anyN.fromRow === "number" && anyN.fromRow >= 0) {
    return anyN.fromRow;
  }
  return null;
}

function notationsOnRow(
  notations: NotationAttributes[],
  row: number,
): NotationAttributes[] {
  return notations.filter((n) => {
    if (
      n.notationType === "SYMBOL" ||
      n.notationType === "EXPONENT" ||
      n.notationType === "LOGBASE"
    ) {
      return (n as PointNotationAttributes).row === row;
    }
    if (n.notationType === "TEXT" || n.notationType === "IMAGE") {
      const t = n as RectNotationAttributes;
      return t.fromRow <= row && t.toRow >= row;
    }
    return notationRow(n) === row;
  });
}

export function rowHasPartLabel(
  notations: NotationAttributes[],
  row: number,
  _partId?: string,
): boolean {
  return gutterPartIdOnRow(notations, row) != null;
}

export function gutterPartIdOnRow(
  notations: NotationAttributes[],
  row: number,
): string | null {
  const onRow = notationsOnRow(notations, row);
  for (const n of onRow) {
    if (n.notationType !== "TEXT") continue;
    const t = n as RectNotationAttributes;
    if (!isPracticeGutterNotation(t.fromCol, t.toCol)) continue;
    const v = (t.value ?? "").trim();
    const id = detectLinePartId(v);
    if (id) return id;
  }
  return null;
}

/** Last board row that already has a gutter `(partId)`, or null. */
export function lastRowWithGutterPartId(
  notations: NotationAttributes[],
  partId: string,
): number | null {
  const wanted = partId.trim().toLowerCase();
  let last: number | null = null;
  for (const n of notations) {
    if (n.notationType !== "TEXT") continue;
    if (isPracticeProblemNotation(n)) continue;
    const t = n as RectNotationAttributes;
    if (!isPracticeGutterNotation(t.fromCol, t.toCol)) continue;
    const v = (t.value ?? "").trim();
    const id = detectLinePartId(v);
    if (id !== wanted) continue;
    const row = t.fromRow;
    if (typeof row !== "number") continue;
    if (last == null || row > last) last = row;
  }
  return last;
}

function rowHasStudentMarks(
  notations: NotationAttributes[],
  row: number,
): boolean {
  return notationsOnRow(notations, row).some(
    (n) => !isPracticeProblemNotation(n),
  );
}

function rowHasRealStudentWork(
  notations: NotationAttributes[],
  row: number,
): boolean {
  return notationsOnRow(notations, row).some((n) => {
    if (isPracticeProblemNotation(n)) return false;
    if (n.notationType === "TEXT") {
      const t = n as RectNotationAttributes;
      if (
        isPracticeGutterNotation(t.fromCol, t.toCol) &&
        isPracticePartLabelOnly(t.value ?? "")
      ) {
        return false;
      }
    }
    return true;
  });
}

function firstRealWorkRow(notations: NotationAttributes[]): number | null {
  let min: number | null = null;
  for (let row = 0; row < matrixDimensions.rowsNum; row++) {
    if (!rowHasRealStudentWork(notations, row)) continue;
    if (min == null || row < min) min = row;
  }
  return min;
}

function gutterFreeOnRow(
  notations: NotationAttributes[],
  row: number,
): boolean {
  for (const n of notationsOnRow(notations, row)) {
    if (isPracticeProblemNotation(n)) continue;
    if (n.notationType !== "TEXT") continue;
    const t = n as RectNotationAttributes;
    if (
      isPracticeGutterNotation(t.fromCol, t.toCol) &&
      isPracticePartLabelOnly(t.value ?? "")
    ) {
      return false;
    }
  }
  return true;
}

/** First work row that does not already have a leftover `(n)` TEXT chip. */
export function firstWorkRowWithFreeGutter(
  notations: NotationAttributes[],
): number | null {
  for (let row = 0; row < matrixDimensions.rowsNum; row++) {
    if (!rowHasStudentMarks(notations, row)) continue;
    if (rowHasPartLabel(notations, row)) continue;
    if (!gutterFreeOnRow(notations, row)) continue;
    return row;
  }
  return null;
}

export function firstWorkRow(
  notations: NotationAttributes[],
): number | null {
  let min: number | null = null;
  for (const n of notations) {
    if (isPracticeProblemNotation(n)) continue;
    const row = notationRow(n);
    if (row == null) continue;
    if (min == null || row < min) min = row;
  }
  return min;
}

export function rowForNewPartLabel(
  notations: NotationAttributes[],
): number | null {
  return firstWorkRowWithFreeGutter(notations) ?? nextFreePartRow(notations);
}

/** Next empty row below existing work (row 0 if the board is empty). */
export function nextFreePartRow(
  notations: NotationAttributes[],
): number | null {
  let lastOccupied = -1;
  for (let row = 0; row < matrixDimensions.rowsNum; row++) {
    if (rowHasStudentMarks(notations, row)) lastOccupied = row;
  }
  const start = lastOccupied + 1;
  for (let row = start; row < matrixDimensions.rowsNum; row++) {
    if (rowHasStudentMarks(notations, row)) continue;
    if (rowHasPartLabel(notations, row)) continue;
    return row;
  }
  return null;
}

/**
 * Rows that should show `(n)` next to student work.
 * The selected task owns the first work row when it was only parked on an
 * empty row (Start used to bind `(1)` to row 0, then the student picked `(3)`).
 */
export function overlayGutterMarks(
  notations: NotationAttributes[],
  activePartId: string | null,
  partLabelRows?: Record<string, number> | null,
): { row: number; id: string }[] {
  const idByRow = new Map<number, string>();

  const assign = (row: number, id: string) => {
    const trimmed = id.trim();
    if (typeof row !== "number" || row < 0 || !trimmed) return;
    for (const [existingRow, existingId] of Array.from(idByRow.entries())) {
      if (existingId === trimmed && existingRow !== row) {
        idByRow.delete(existingRow);
      }
    }
    idByRow.set(row, trimmed);
  };

  for (const [id, row] of Object.entries(partLabelRows ?? {})) {
    assign(row, id);
  }
  for (let row = 0; row < matrixDimensions.rowsNum; row++) {
    const id = gutterPartIdOnRow(notations, row);
    if (id) assign(row, id);
  }

  const active = (activePartId ?? "").trim();
  if (active) {
    const boundActive =
      lastRowWithGutterPartId(notations, active) ??
      (typeof partLabelRows?.[active] === "number"
        ? partLabelRows[active]
        : null);
    const activeHasWork =
      boundActive != null && rowHasRealStudentWork(notations, boundActive);
    const workRow = firstRealWorkRow(notations);

    if (activeHasWork && boundActive != null) {
      assign(boundActive, active);
    } else if (workRow != null) {
      const occupant = idByRow.get(workRow);
      if (!occupant || occupant === active) {
        assign(workRow, active);
      } else if (boundActive != null && boundActive !== workRow) {
        assign(workRow, active);
      }
    } else {
      assign(boundActive ?? 0, active);
    }
  }

  return Array.from(idByRow.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([row, id]) => ({ row, id }));
}

function snapSelectedCellOutOfGutter(row: number) {
  const cellStore = useCellStore();
  const selected = cellStore.getSelectedCell();
  if (!selected || selected.row !== row) return;
  if (!isPracticeLabelGutterCol(selected.col)) return;
  cellStore.setSelectedCell({ col: practiceWorkFromCol(), row }, true);
}

function focusWorkCell(row: number) {
  useCellStore().setSelectedCell({ col: practiceWorkFromCol(), row }, true);
}

/**
 * Bind the active section to the row being typed. Numbers render in the HTML strip.
 */
export function ensureActivePartLabel(row: number) {
  if (!isPracticeBoard()) return;
  if (typeof row !== "number" || row < 0) return;

  const practiceStore = usePracticeStore();
  const questionUUId = getPracticeQuestionUUId();
  const session = practiceStore.getSession(questionUUId);
  if (!session.submitted || !session.activePartId) return;

  snapSelectedCellOutOfGutter(row);
  practiceStore.bindPartRow(questionUUId, session.activePartId, row);
}

/**
 * Open the row for a section: reuse its overlay mark, or the work / next empty
 * row. Moves the caret to the work col.
 */
export function ensurePartRow(partId: string) {
  if (!isPracticeBoard()) return;
  const id = partId.trim();
  if (!id) return;

  const practiceStore = usePracticeStore();
  const questionUUId = getPracticeQuestionUUId();
  const session = practiceStore.getSession(questionUUId);
  if (!session.submitted) return;

  const notations = useNotationStore().getNotations();
  const marks = overlayGutterMarks(notations, id, session.partLabelRows);
  const mine = marks.find((m) => m.id === id);
  const row = mine?.row ?? rowForNewPartLabel(notations);
  if (row == null) return;
  practiceStore.bindPartRow(questionUUId, id, row);
  focusWorkCell(row);
}
