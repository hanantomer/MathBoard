import {
  AnnotationNotationAttributes,
  CellAttributes,
  ConicNotationAttributes,
  FreeSketchNotationAttributes,
  ImageNotationAttributes,
  NotationAttributes,
  PointNotationAttributes,
  RectNotationAttributes,
  SqrtNotationAttributes,
} from "common/baseTypes";
import { useCellStore } from "../store/pinia/cellStore";
import { useNotationStore } from "../store/pinia/notationStore";
import { usePracticeStore } from "../store/pinia/practiceStore";
import { getLastStudentNotation } from "./practiceCoachAnchorHelper";
import {
  getPracticeQuestionUUId,
  isPracticeProblemNotation,
} from "./practiceBoardAdapter";
import {
  serializePracticeDiagram,
  serializePracticeFractions,
} from "./practiceDiagramSerializeHelper";
import {
  formatPracticeStudentWorkLines,
  formatStudentWorkByParts,
  isPracticePartLabelOnly,
  detectLinePartId,
  partLabelText,
} from "common/practiceParts";
import {
  isPracticeGutterNotation,
  overlayGutterMarks,
} from "./practicePartLabelHelper";
import { partIdForRow } from "./practicePartOrderHelper";
import useImageHelper from "./imageHelper";

type CellRect = {
  fromCol: number;
  fromRow: number;
  toCol: number;
  toRow: number;
};

const TALL_IMAGE_ROWS = 12;
const WIDE_IMAGE_COLS = 22;
const BAND_FRACTION = 0.42;
const MIN_BAND_ROWS = 5;
const MIN_BAND_COLS = 8;
const SKIP_CROP_AREA_RATIO = 0.78;

function listPracticeImages(
  notations: NotationAttributes[],
): ImageNotationAttributes[] {
  return notations
    .filter((n) => n.notationType === "IMAGE")
    .map((n) => n as ImageNotationAttributes)
    .filter((n) => typeof n.value === "string" && n.value.length > 64)
    .sort(
      (a, b) =>
        (a.fromRow ?? 0) - (b.fromRow ?? 0) ||
        (a.fromCol ?? 0) - (b.fromCol ?? 0),
    );
}

function imageRect(n: ImageNotationAttributes): CellRect {
  return {
    fromCol: n.fromCol,
    fromRow: n.fromRow,
    toCol: n.toCol,
    toRow: n.toRow,
  };
}

function imageRowSpan(r: CellRect): number {
  return Math.max(1, r.toRow - r.fromRow + 1);
}

function imageColSpan(r: CellRect): number {
  return Math.max(1, r.toCol - r.fromCol + 1);
}

function manhattanToRect(col: number, row: number, r: CellRect): number {
  const dx =
    col < r.fromCol ? r.fromCol - col : col > r.toCol ? col - r.toCol : 0;
  const dy =
    row < r.fromRow ? r.fromRow - row : row > r.toRow ? row - r.toRow : 0;
  return dx + dy;
}

function pixelToCell(
  x: number,
  y: number,
): { col: number; row: number } | null {
  const cellStore = useCellStore();
  const w = cellStore.getCellHorizontalWidth();
  const h = cellStore.getCellVerticalHeight();
  if (!w || !h) return null;
  return {
    col: Math.floor(x / w),
    row: Math.floor(y / h),
  };
}

function notationAnchorCell(
  n: NotationAttributes,
): { col: number; row: number } | null {
  if (
    n.notationType === "SYMBOL" ||
    n.notationType === "EXPONENT" ||
    n.notationType === "LOGBASE"
  ) {
    const p = n as PointNotationAttributes;
    if (typeof p.col === "number" && typeof p.row === "number") {
      return { col: p.col, row: p.row };
    }
  }

  if (n.notationType === "TEXT" || n.notationType === "IMAGE") {
    const r = n as RectNotationAttributes;
    if (typeof r.fromCol === "number" && typeof r.fromRow === "number") {
      return { col: r.fromCol, row: r.fromRow };
    }
  }

  if (n.notationType === "SQRT") {
    const s = n as SqrtNotationAttributes;
    if (typeof s.fromCol === "number" && typeof s.row === "number") {
      return { col: s.fromCol, row: s.row };
    }
  }

  if (n.notationType === "ANNOTATION") {
    const a = n as AnnotationNotationAttributes;
    return pixelToCell(a.x, a.y);
  }

  if (n.notationType === "FREESKETCH") {
    const s = n as FreeSketchNotationAttributes;
    const last = s.points?.at(-1);
    if (last) return pixelToCell(last.x, last.y);
  }

  return null;
}

function getFocusCell(
  notations: NotationAttributes[],
  images: ImageNotationAttributes[],
): CellAttributes | null {
  const selected = useCellStore().getSelectedCell();
  const hasSelected =
    selected &&
    typeof selected.col === "number" &&
    typeof selected.row === "number";

  const last = getLastStudentNotation(
    notations.filter((n) => n.boardType === "PRACTICE"),
  );
  const lastCell =
    last && last.notationType !== "IMAGE" ? notationAnchorCell(last) : null;

  if (hasSelected && lastCell) {
    if (images.length > 1) {
      const byCursor = nearestImage(images, selected);
      const byWriting = nearestImage(images, lastCell);
      if (byCursor && byWriting && byCursor.uuid !== byWriting.uuid) {
        return selected;
      }
    } else if (Math.abs(selected.row - lastCell.row) > 3) {
      return selected;
    }
    return lastCell;
  }

  if (lastCell) return lastCell;
  if (hasSelected) return selected;
  return null;
}

function nearestImage(
  images: ImageNotationAttributes[],
  cell: CellAttributes | null,
): ImageNotationAttributes | null {
  if (images.length === 0) return null;
  if (!cell) return images[0];

  let best = images[0];
  let bestDist = manhattanToRect(cell.col, cell.row, imageRect(best));
  for (let i = 1; i < images.length; i++) {
    const dist = manhattanToRect(cell.col, cell.row, imageRect(images[i]));
    if (dist < bestDist) {
      best = images[i];
      bestDist = dist;
    }
  }
  return best;
}

function selectedImageOverride(
  notations: NotationAttributes[],
): ImageNotationAttributes | null {
  try {
    const selected = useNotationStore().getSelectedNotations();
    const img = selected.find((n) => n.notationType === "IMAGE") as
      | ImageNotationAttributes
      | undefined;
    if (img && typeof img.value === "string" && img.value.length > 64) {
      return img;
    }
  } catch {
    /* pinia not ready */
  }
  return null;
}

export function getFocusedPracticeImage(
  notations: NotationAttributes[],
): ImageNotationAttributes | null {
  const images = listPracticeImages(notations);
  if (images.length === 0) return null;
  const override = selectedImageOverride(notations);
  if (override && images.some((i) => i.uuid === override.uuid)) {
    return override;
  }
  return nearestImage(images, getFocusCell(notations, images));
}

function bandHalf(span: number, minBand: number): number {
  return Math.max(minBand, Math.ceil(span * BAND_FRACTION)) / 2;
}

function isDenseWorksheet(r: CellRect): boolean {
  return imageRowSpan(r) >= TALL_IMAGE_ROWS || imageColSpan(r) >= WIDE_IMAGE_COLS;
}

function notationBelongsToFocus(
  n: NotationAttributes,
  images: ImageNotationAttributes[],
  focused: ImageNotationAttributes,
  focusCell: CellAttributes | null,
): boolean {
  if (n.notationType === "IMAGE") return false;
  const cell = notationAnchorCell(n);
  if (!cell) {
    return images.length <= 1;
  }

  const nearest = nearestImage(images, cell);
  if (nearest && nearest.uuid !== focused.uuid) return false;

  const rect = imageRect(focused);
  if (!isDenseWorksheet(rect) || !focusCell) return true;

  const rowHalf = bandHalf(imageRowSpan(rect), MIN_BAND_ROWS);
  const colHalf = bandHalf(imageColSpan(rect), MIN_BAND_COLS);
  return (
    Math.abs(cell.row - focusCell.row) <= rowHalf &&
    Math.abs(cell.col - focusCell.col) <= Math.max(colHalf, 16)
  );
}

/** In-progress FreeText box (not yet committed to a PRACTICE notation). */
export type PracticeTextDraft = {
  value: string;
  notationUUId: string | null;
};

function boardCellSize(): { cellW: number; cellH: number } {
  try {
    const cellStore = useCellStore();
    const cellW = cellStore.getCellHorizontalWidth();
    const cellH = cellStore.getCellVerticalHeight();
    if (cellW > 0 && cellH > 0) return { cellW, cellH };
  } catch {
    /* pinia not ready */
  }
  return { cellW: 16.5, cellH: 33 };
}

type WorkLine = {
  text: string;
  row?: number;
  isDraft?: boolean;
};

function joinSameRowText(existing: string, incoming: string): string {
  const a = existing.trim();
  const b = incoming.trim();
  if (!a) return b;
  if (!b) return a;
  if (a === b || a.includes(b)) return a;
  if (b.includes(a)) return b;
  if (isPracticePartLabelOnly(b)) {
    return a.startsWith(b) ? a : `${b} ${a}`;
  }
  if (isPracticePartLabelOnly(a)) {
    return b.startsWith(a) ? b : `${a} ${b}`;
  }
  return `${a} ${b}`;
}

/** Keep visual order so continuation rows stay with the last `(n)` above them. */
function orderWorkLines(lines: WorkLine[]): WorkLine[] {
  const ranked: WorkLine[] = [];
  const rest: WorkLine[] = [];
  for (const line of lines) {
    if (typeof line.row === "number") {
      ranked.push({ text: line.text, row: line.row, isDraft: line.isDraft });
    } else {
      rest.push(line);
    }
  }
  ranked.sort((a, b) => (a.row ?? 0) - (b.row ?? 0));
  const merged: WorkLine[] = [];
  for (const line of ranked) {
    const prev = merged[merged.length - 1];
    if (prev && prev.row === line.row) {
      prev.text = joinSameRowText(prev.text, line.text);
      prev.isDraft = prev.isDraft || line.isDraft;
    } else {
      merged.push(line);
    }
  }
  return [...merged, ...rest];
}

/** Superscripts stored on the row above the base belong with the line below. */
function mergeExponentOnlyRows(itemsByRow: Map<number, { col: number; text: string }[]>) {
  const rows = Array.from(itemsByRow.keys()).sort((a, b) => a - b);
  for (const row of rows) {
    const items = itemsByRow.get(row);
    if (!items?.length) continue;
    if (!items.every((i) => i.text.startsWith("^"))) continue;
    const below = rows.find((r) => r > row && itemsByRow.has(r));
    if (below == null) continue;
    const dest = itemsByRow.get(below)!;
    dest.push(...items);
    itemsByRow.delete(row);
  }
}

function gutterPartIdFromText(
  t: RectNotationAttributes,
  value: string,
): string | null {
  if (!isPracticeGutterNotation(t.fromCol, t.toCol)) return null;
  const trimmed = value.trim();
  if (!isPracticePartLabelOnly(trimmed)) return null;
  return detectLinePartId(trimmed);
}

function prefixGutterLabel(body: string, partId: string): string {
  const prefix = partLabelText(partId);
  const trimmed = body.trim();
  if (!trimmed) return prefix;
  if (trimmed.startsWith(prefix)) return trimmed;
  return `${prefix} ${trimmed}`;
}

function serializeFilteredWork(
  practiceOnly: NotationAttributes[],
  draft?: PracticeTextDraft | null,
  activeCell?: CellAttributes | null,
  markActive = false,
  groupByParts?: {
    activePartId: string | null;
    partLabelRows?: Record<string, number>;
  },
): string {
  const workLines: WorkLine[] = [];
  const cellSize = boardCellSize();
  const diagram = serializePracticeDiagram(practiceOnly, cellSize);
  const fractions = serializePracticeFractions(practiceOnly, cellSize);
  const consumed = new Set([
    ...diagram.consumedUuids,
    ...fractions.consumedUuids,
  ]);

  const pointLike = practiceOnly.filter(
    (n) =>
      (n.notationType === "SYMBOL" ||
        n.notationType === "EXPONENT" ||
        n.notationType === "LOGBASE") &&
      !consumed.has(n.uuid),
  ) as PointNotationAttributes[];

  type RowItem = { col: number; text: string };
  const itemsByRow = new Map<number, RowItem[]>();
  const addItem = (row: number, col: number, text: string) => {
    const items = itemsByRow.get(row) ?? [];
    items.push({ col, text });
    itemsByRow.set(row, items);
  };

  for (const n of pointLike) {
    const value =
      n.notationType === "EXPONENT"
        ? "^" + (n.value ?? "")
        : n.notationType === "LOGBASE"
          ? "_" + (n.value ?? "")
          : (n.value ?? "");
    addItem(n.row, n.col, value);
  }
  for (const frac of fractions.inserts) {
    addItem(frac.row, frac.col, frac.text);
  }
  mergeExponentOnlyRows(itemsByRow);

  const skipGutterMath = !!groupByParts;
  const partByRow = new Map<number, string>();
  if (groupByParts) {
    for (const m of overlayGutterMarks(
      practiceOnly,
      groupByParts.activePartId,
      groupByParts.partLabelRows,
    )) {
      partByRow.set(m.row, m.id);
    }
  }

  const partIdOnRow = (row: number): string | null => {
    if (!groupByParts) return partByRow.get(row) ?? null;
    return (
      partByRow.get(row) ??
      partIdForRow(row, groupByParts.partLabelRows) ??
      null
    );
  };

  const rows = Array.from(itemsByRow.keys()).sort((a, b) => a - b);
  for (const row of rows) {
    const items = itemsByRow.get(row)!;
    items.sort((a, b) => a.col - b.col);
    let buf = "";
    let lastCol = Number.NEGATIVE_INFINITY;
    for (const i of items) {
      if (lastCol > Number.NEGATIVE_INFINITY && i.col > lastCol + 1) {
        buf += " ";
      }
      buf += i.text;
      lastCol = i.col;
    }
    if (buf) {
      const overlayId = partIdOnRow(row);
      workLines.push({
        text: overlayId ? prefixGutterLabel(buf, overlayId) : buf,
        row,
      });
    }
  }

  for (const n of practiceOnly) {
    if (n.notationType === "TEXT") {
      const t = n as RectNotationAttributes;
      const live =
        draft?.notationUUId && draft.notationUUId === t.uuid
          ? draft.value
          : t.value;
      if (!live?.trim()) continue;
      const trimmed = live.trim();
      const isDraft = draft?.notationUUId === t.uuid;
      const gutterId = skipGutterMath
        ? gutterPartIdFromText(t, trimmed)
        : null;
      const bandId = gutterId ?? partIdOnRow(t.fromRow);
      const incoming = bandId ? prefixGutterLabel(trimmed, bandId) : trimmed;
      const existing = workLines.find((l) => l.row === t.fromRow);
      if (existing) {
        existing.text = bandId
          ? prefixGutterLabel(existing.text, bandId)
          : joinSameRowText(existing.text, incoming);
        existing.isDraft = existing.isDraft || isDraft;
      } else {
        workLines.push({
          text: incoming,
          row: t.fromRow,
          isDraft,
        });
      }
    } else if (n.notationType === "ANNOTATION") {
      if (consumed.has(n.uuid)) continue;
      const a = n as AnnotationNotationAttributes;
      if (a.value?.trim()) {
        const cell = pixelToCell(a.x, a.y);
        const existing =
          typeof cell?.row === "number"
            ? workLines.find((l) => l.row === cell.row)
            : undefined;
        if (existing) {
          existing.text = joinSameRowText(existing.text, a.value.trim());
        } else {
          workLines.push({
            text: a.value.trim(),
            row: cell?.row,
          });
        }
      }
    }
  }

  if (draft?.value.trim() && !workLines.some((l) => l.isDraft)) {
    const existing =
      typeof activeCell?.row === "number"
        ? workLines.find((l) => l.row === activeCell.row)
        : undefined;
    if (existing) {
      existing.text = joinSameRowText(existing.text, draft.value.trim());
      existing.isDraft = true;
    } else {
      workLines.push({
        text: draft.value.trim(),
        row: activeCell?.row,
        isDraft: true,
      });
    }
  }
  const conicRows = practiceOnly
    .filter((n) => n.notationType === "CONIC")
    .map((n) =>
      Math.floor((n as ConicNotationAttributes).hy / cellSize.cellH),
    );
  let conicRowIdx = 0;
  for (const line of diagram.lines) {
    if (/^diagram: (?:parabola|hyperbola)/.test(line)) {
      workLines.push({ text: line, row: conicRows[conicRowIdx++] });
    } else {
      workLines.push({ text: line });
    }
  }

  const ordered = orderWorkLines(workLines);
  const texts = ordered.map((l) => l.text);
  if (groupByParts) {
    return formatStudentWorkByParts(texts, groupByParts.activePartId);
  }
  if (!markActive) {
    return texts.join("\n").trim();
  }
  const draftLineIndex = ordered.findIndex((l) => l.isDraft);
  return formatPracticeStudentWorkLines(
    texts,
    pickActiveLineIndex(
      ordered,
      activeCell,
      draftLineIndex >= 0 ? draftLineIndex : null,
    ),
  );
}

function pickActiveLineIndex(
  lines: WorkLine[],
  activeCell: CellAttributes | null | undefined,
  draftLineIndex: number | null,
): number | null {
  if (lines.length === 0) return null;
  if (draftLineIndex != null && draftLineIndex >= 0 && draftLineIndex < lines.length) {
    return draftLineIndex;
  }
  if (activeCell && typeof activeCell.row === "number") {
    let best = -1;
    let bestDist = Number.POSITIVE_INFINITY;
    for (let i = 0; i < lines.length; i++) {
      if (typeof lines[i].row !== "number") continue;
      const dist = Math.abs(lines[i].row! - activeCell.row);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    }
    if (best >= 0) return best;
  }
  return lines.length - 1;
}

function draftAppliesTo(
  notations: NotationAttributes[],
  draft?: PracticeTextDraft | null,
): PracticeTextDraft | null {
  if (!draft?.value.trim()) return null;
  if (!draft.notationUUId) return draft;
  return notations.some((n) => n.uuid === draft.notationUUId) ? draft : null;
}

/** Serialize PRACTICE-layer notations into text for the grading API. */
export function serializePracticeStudentWork(
  notations: NotationAttributes[],
  draft?: PracticeTextDraft | null,
  options?: { activePartId?: string | null; groupByParts?: boolean },
): string {
  const practiceOnly = notations.filter(
    (n) => n.boardType === "PRACTICE" && !isPracticeProblemNotation(n),
  );
  const studentDraft = draftAppliesTo(practiceOnly, draft);
  const images = listPracticeImages(notations);
  const focusCell = getFocusCell(notations, images);
  const groupByParts =
    options?.groupByParts === true
      ? {
          activePartId: options.activePartId ?? null,
          partLabelRows: (() => {
            try {
              return usePracticeStore().getSession(
                getPracticeQuestionUUId(),
              ).partLabelRows;
            } catch {
              return undefined;
            }
          })(),
        }
      : undefined;
  if (practiceOnly.length === 0) {
    const draftText = (studentDraft?.value ?? "").trim();
    if (!draftText) return "";
    return groupByParts
      ? formatStudentWorkByParts([draftText], groupByParts.activePartId)
      : formatPracticeStudentWorkLines([draftText], 0);
  }

  const focused = getFocusedPracticeImage(notations);
  const scoped =
    images.length > 0 && focused
      ? practiceOnly.filter((n) =>
          notationBelongsToFocus(n, images, focused, focusCell),
        )
      : practiceOnly;

  return serializeFilteredWork(
    scoped,
    studentDraft,
    focusCell,
    !groupByParts,
    groupByParts,
  );
}

/**
 * Worksheet/problem image on a blank practice board (pasted or uploaded).
 * Uses the image nearest the student's writing (or a selected image).
 */
export function getPracticeProblemImageBase64(
  notations: NotationAttributes[],
): string | null {
  return getFocusedPracticeImage(notations)?.value ?? null;
}

/** Crafted or pasted question on a blank practice board (not student work). */
export function getPracticeProblemText(
  notations: NotationAttributes[],
  draft?: PracticeTextDraft | null,
): string | null {
  const problems = notations.filter((n) => isPracticeProblemNotation(n));
  if (problems.length === 0) return null;
  const text = serializeFilteredWork(
    problems,
    draftAppliesTo(problems, draft),
  );
  return text || "[board question]";
}

export function hasCraftedPracticeProblem(
  notations: NotationAttributes[],
): boolean {
  return notations.some((n) => isPracticeProblemNotation(n));
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

async function preparedForTutor(value: string): Promise<string> {
  try {
    return await useImageHelper().prepareProblemImageForTutor(value);
  } catch {
    return value;
  }
}

/**
 * Crop a dense worksheet to the band around where the student is writing.
 * Returns the full image when the page is small or crop is not useful.
 * Always invert/upscale/pad before the tutor sees it.
 */
export async function getPracticeProblemImageForTutor(
  notations: NotationAttributes[],
): Promise<string | null> {
  const focused = getFocusedPracticeImage(notations);
  if (!focused?.value) return null;

  const rect = imageRect(focused);
  if (!isDenseWorksheet(rect) || (focused.rotation ?? 0) !== 0) {
    return preparedForTutor(focused.value);
  }

  const focusCell = getFocusCell(notations, listPracticeImages(notations));
  if (!focusCell) return preparedForTutor(focused.value);

  const cellStore = useCellStore();
  const cellW = cellStore.getCellHorizontalWidth();
  const cellH = cellStore.getCellVerticalHeight();
  if (!cellW || !cellH) return preparedForTutor(focused.value);

  const rows = imageRowSpan(rect);
  const cols = imageColSpan(rect);
  const rowHalf = Math.ceil(bandHalf(rows, MIN_BAND_ROWS));
  const colHalf = Math.ceil(bandHalf(cols, MIN_BAND_COLS));

  const centerRow = clamp(focusCell.row, rect.fromRow, rect.toRow);
  const centerCol = clamp(focusCell.col, rect.fromCol, rect.toCol);

  let fromRow = clamp(centerRow - rowHalf, rect.fromRow, rect.toRow);
  let toRow = clamp(centerRow + rowHalf, rect.fromRow, rect.toRow);
  let fromCol = clamp(centerCol - colHalf, rect.fromCol, rect.toCol);
  let toCol = clamp(centerCol + colHalf, rect.fromCol, rect.toCol);

  if (rows < TALL_IMAGE_ROWS) {
    fromRow = rect.fromRow;
    toRow = rect.toRow;
  }
  if (cols < WIDE_IMAGE_COLS) {
    fromCol = rect.fromCol;
    toCol = rect.toCol;
  }

  const cropRows = toRow - fromRow + 1;
  const cropCols = toCol - fromCol + 1;
  if ((cropRows * cropCols) / (rows * cols) >= SKIP_CROP_AREA_RATIO) {
    return preparedForTutor(focused.value);
  }

  const innerWidth = cols * cellW;
  const innerHeight = rows * cellH;

  try {
    const imageHelper = useImageHelper();
    const { width: srcW, height: srcH } =
      await imageHelper.getDimensionsFromBase64(focused.value);
    const scaleX = srcW / innerWidth;
    const scaleY = srcH / innerHeight;

    const cropped = await imageHelper.cropBase64(focused.value, {
      x: (fromCol - rect.fromCol) * cellW * scaleX,
      y: (fromRow - rect.fromRow) * cellH * scaleY,
      width: cropCols * cellW * scaleX,
      height: cropRows * cellH * scaleY,
    });
    return preparedForTutor(cropped);
  } catch {
    return preparedForTutor(focused.value);
  }
}
