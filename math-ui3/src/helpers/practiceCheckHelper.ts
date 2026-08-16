import {
  AnnotationNotationAttributes,
  CellAttributes,
  FreeSketchNotationAttributes,
  ImageNotationAttributes,
  NotationAttributes,
  PointNotationAttributes,
  RectNotationAttributes,
  SqrtNotationAttributes,
} from "common/baseTypes";
import { useCellStore } from "../store/pinia/cellStore";
import { useNotationStore } from "../store/pinia/notationStore";
import { getLastStudentNotation } from "./practiceCoachAnchorHelper";
import { isPracticeProblemNotation } from "./practiceBoardAdapter";
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

function serializeFilteredWork(
  practiceOnly: NotationAttributes[],
  draft?: PracticeTextDraft | null,
): string {
  const lines: string[] = [];

  const pointLike = practiceOnly.filter(
    (n) =>
      n.notationType === "SYMBOL" ||
      n.notationType === "EXPONENT" ||
      n.notationType === "LOGBASE",
  ) as PointNotationAttributes[];

  pointLike.sort((a, b) => a.row - b.row || a.col - b.col);

  let currentRow = Number.NaN;
  let rowBuf = "";
  for (const n of pointLike) {
    if (n.row !== currentRow) {
      if (rowBuf) lines.push(rowBuf);
      currentRow = n.row;
      rowBuf = n.value ?? "";
    } else {
      rowBuf += n.value ?? "";
    }
  }
  if (rowBuf) lines.push(rowBuf);

  let draftApplied = false;
  for (const n of practiceOnly) {
    if (n.notationType === "TEXT") {
      const t = n as RectNotationAttributes;
      if (isPracticeProblemNotation(t)) {
        if (draft?.notationUUId === t.uuid) draftApplied = true;
        continue;
      }
      const live =
        draft?.notationUUId && draft.notationUUId === t.uuid
          ? draft.value
          : t.value;
      if (draft?.notationUUId === t.uuid) draftApplied = true;
      if (live?.trim()) lines.push(live.trim());
    } else if (n.notationType === "ANNOTATION") {
      const a = n as AnnotationNotationAttributes;
      if (a.value?.trim()) lines.push(a.value.trim());
    } else if (n.notationType === "FREESKETCH") {
      lines.push("[freehand sketch]");
    }
  }

  if (!draftApplied && draft?.value.trim()) {
    lines.push(draft.value.trim());
  }

  return lines.join("\n").trim();
}

/** Serialize PRACTICE-layer notations into text for the grading API. */
export function serializePracticeStudentWork(
  notations: NotationAttributes[],
  draft?: PracticeTextDraft | null,
): string {
  const practiceOnly = notations.filter((n) => n.boardType === "PRACTICE");
  if (practiceOnly.length === 0) {
    return (draft?.value ?? "").trim();
  }

  const images = listPracticeImages(notations);
  const focused = getFocusedPracticeImage(notations);
  const focusCell = getFocusCell(notations, images);
  const scoped =
    images.length > 0 && focused
      ? practiceOnly.filter((n) =>
          notationBelongsToFocus(n, images, focused, focusCell),
        )
      : practiceOnly;

  return serializeFilteredWork(scoped, draft);
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

/** Pasted question text on a blank practice board (not student work). */
export function getPracticeProblemText(
  notations: NotationAttributes[],
  draft?: PracticeTextDraft | null,
): string | null {
  const problems = notations
    .filter(
      (n) => n.notationType === "TEXT" && isPracticeProblemNotation(n),
    )
    .map((n) => n as RectNotationAttributes)
    .sort(
      (a, b) =>
        (a.fromRow ?? 0) - (b.fromRow ?? 0) ||
        (a.fromCol ?? 0) - (b.fromCol ?? 0),
    );
  if (problems.length === 0) return null;
  const t = problems[0];
  const live =
    draft?.notationUUId && draft.notationUUId === t.uuid ? draft.value : t.value;
  return live?.trim() || null;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

/**
 * Crop a dense worksheet to the band around where the student is writing.
 * Returns the full image when the page is small or crop is not useful.
 */
export async function getPracticeProblemImageForTutor(
  notations: NotationAttributes[],
): Promise<string | null> {
  const focused = getFocusedPracticeImage(notations);
  if (!focused?.value) return null;

  const rect = imageRect(focused);
  if (!isDenseWorksheet(rect) || (focused.rotation ?? 0) !== 0) {
    return focused.value;
  }

  const focusCell = getFocusCell(notations, listPracticeImages(notations));
  if (!focusCell) return focused.value;

  const cellStore = useCellStore();
  const cellW = cellStore.getCellHorizontalWidth();
  const cellH = cellStore.getCellVerticalHeight();
  if (!cellW || !cellH) return focused.value;

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
    return focused.value;
  }

  const innerWidth = cols * cellW;
  const innerHeight = rows * cellH;

  try {
    const imageHelper = useImageHelper();
    const { width: srcW, height: srcH } =
      await imageHelper.getDimensionsFromBase64(focused.value);
    const scaleX = srcW / innerWidth;
    const scaleY = srcH / innerHeight;

    return await imageHelper.cropBase64(focused.value, {
      x: (fromCol - rect.fromCol) * cellW * scaleX,
      y: (fromRow - rect.fromRow) * cellH * scaleY,
      width: cropCols * cellW * scaleX,
      height: cropRows * cellH * scaleY,
    });
  } catch {
    return focused.value;
  }
}
