import {
  AnnotationNotationAttributes,
  CircleNotationAttributes,
  ConicNotationAttributes,
  CurveNotationAttributes,
  FreeSketchNotationAttributes,
  LineNotationAttributes,
  PointNotationAttributes,
  RectNotationAttributes,
  SqrtNotationAttributes,
} from "common/baseTypes";

import { clonedNotationUUIdPrefix, matrixCellSize, matrixDimensions } from "common/globals";
import { useNotationStore } from "../store/pinia/notationStore";
import { useCellStore } from "../store/pinia/cellStore";
import { usePracticeStore } from "../store/pinia/practiceStore";
import { NotationAttributes } from "common/baseTypes";
import { conicBoundingBox } from "common/conicGeometry";
import useNotationMutateHelper from "./notationMutateHelper";
import {
  getPracticeQuestionUUId,
  isPracticeBoard,
  isPracticeProblemNotation,
} from "./practiceBoardAdapter";
import {
  extendPushBlockForPracticeParts,
  hasLaterPracticePartLabel,
  shiftedPartLabelRows,
} from "./practicePartOrderHelper";
import {
  findNextRowBlock,
  isPushableMathType,
  nextMathRowsAreEmptyFrom,
  SPACE_MOVE_EMPTY_RUN,
} from "./notationCollapsePushLogic";

const notationStore = useNotationStore();
const cellStore = useCellStore();
const notationMutateHelper = useNotationMutateHelper();

async function collapseNotationsToSelectedCell() {
  const cell = cellStore.getSelectedCell();
  if (!cell) return;

  notationStore.beginUndoGroup();
  try {
    let sqrtNotationFound = false;
    let notationFound = false;
    for (
      let col = cellStore.getSelectedCell().col;
      col < matrixDimensions.colsNum;
      col++
    ) {
      const notations = notationStore.getNotationsAtCell({
        row: cell.row,
        col: col,
      });

      if (notations.length === 0 && notationFound) {
        return;
      }

      if (sqrtNotationFound) {
        const sqrtNotation = notations.find(
          (n) => n.notationType === "SQRT",
        ) as SqrtNotationAttributes | undefined;

        if (!sqrtNotation) {
          // do not continue collapsing after the sqrt notation ends
          break;
        }
      }

      for (const notation of notations) {
        if (
          notation.notationType === "EXPONENT" ||
          notation.notationType === "LOGBASE" ||
          notation.notationType === "SYMBOL"
        ) {
          notationFound = true;
          const point = notation as PointNotationAttributes;
          // A leftover `.` at the deleted cell stays put so the next digit
          // can collapse onto it (3.14 minus 1 → 3.4), instead of sliding
          // left onto the previous digit.
          if (point.value === "." && col === cell.col) {
            continue;
          }
          point.col--;
          await notationMutateHelper.updateNotation(notation);
        } else if (notation.notationType === "SQRT") {
          if ((notation as SqrtNotationAttributes).fromCol === col) {
            (notation as SqrtNotationAttributes).fromCol--;
            (notation as SqrtNotationAttributes).toCol--;
            await notationMutateHelper.updateNotation(
              notation as SqrtNotationAttributes,
            );
          }
          sqrtNotationFound = true;
        }
      }
    }
  } finally {
    notationStore.endUndoGroup();
  }
}

async function pushNotationsFromCell(cell: { col: number; row: number }) {
  if (cell.col === matrixDimensions.colsNum - 1) return;

  const nextSymbolBlock = findNextSymbolBlock(cell.col, cell.row);
  if (nextSymbolBlock.firstCol === -1) return;

  await moveNotationsRight(cell.row, nextSymbolBlock);
}

async function pushNotationsFromSelectedCell() {
  const cell = cellStore.getSelectedCell();
  if (!cell) return;

  notationStore.beginUndoGroup();
  try {
    await pushNotationsFromCell(cell);
    notationStore.resetSelectedNotations();
  } finally {
    notationStore.endUndoGroup();
  }
}

function rowHeightPx(): number {
  return cellStore.getCellVerticalHeight() || matrixCellSize.height;
}

function rowHasPushableMath(row: number): boolean {
  for (const n of notationStore.getNotations()) {
    if (n.uuid?.startsWith(clonedNotationUUIdPrefix)) continue;
    if (isPracticeProblemNotation(n)) continue;
    if (!isPushableMathType(n.notationType)) continue;
    if (n.notationType === "SQRT") {
      if ((n as SqrtNotationAttributes).row === row) return true;
      continue;
    }
    if ((n as PointNotationAttributes).row === row) return true;
  }
  return false;
}

function laterPracticePartLabelsBelow(fromRow: number): boolean {
  if (!isPracticeBoard()) return false;
  try {
    const session = usePracticeStore().getSession(getPracticeQuestionUUId());
    if (!session.submitted) return false;
    return hasLaterPracticePartLabel(fromRow, session.partLabelRows);
  } catch {
    return false;
  }
}

function nextMathRowsAreEmpty(cell: { col: number; row: number }): boolean {
  if (laterPracticePartLabelsBelow(cell.row)) return false;
  return nextMathRowsAreEmptyFrom(
    cell.row,
    rowHasPushableMath,
    matrixDimensions.rowsNum,
  );
}

function notationMinMaxRow(
  n: NotationAttributes,
  rowH: number,
): { min: number; max: number } | null {
  switch (n.notationType) {
    case "SYMBOL":
    case "EXPONENT":
    case "LOGBASE":
    case "SQRTSYMBOL": {
      const row = (n as PointNotationAttributes).row;
      return { min: row, max: row };
    }
    case "SQRT": {
      const row = (n as SqrtNotationAttributes).row;
      return { min: row, max: row };
    }
    case "TEXT":
    case "IMAGE": {
      const t = n as RectNotationAttributes;
      return { min: t.fromRow, max: t.toRow };
    }
    case "LINE":
    case "DIVISIONLINE": {
      const line = n as LineNotationAttributes;
      const min = Math.floor(Math.min(line.p1y, line.p2y) / rowH);
      const max = Math.floor(Math.max(line.p1y, line.p2y) / rowH);
      return { min, max };
    }
    case "CURVE": {
      const c = n as CurveNotationAttributes;
      const min = Math.floor(Math.min(c.p1y, c.p2y, c.cpy) / rowH);
      const max = Math.floor(Math.max(c.p1y, c.p2y, c.cpy) / rowH);
      return { min, max };
    }
    case "CIRCLE": {
      const row = Math.floor((n as CircleNotationAttributes).cy / rowH);
      return { min: row, max: row };
    }
    case "CONIC": {
      const box = conicBoundingBox(n as ConicNotationAttributes);
      return {
        min: Math.floor(box.minY / rowH),
        max: Math.floor(box.maxY / rowH),
      };
    }
    case "FREESKETCH": {
      const pts = (n as FreeSketchNotationAttributes).points ?? [];
      if (!pts.length) return null;
      let minY = pts[0].y;
      let maxY = pts[0].y;
      for (const p of pts) {
        minY = Math.min(minY, p.y);
        maxY = Math.max(maxY, p.y);
      }
      return { min: Math.floor(minY / rowH), max: Math.floor(maxY / rowH) };
    }
    case "ANNOTATION": {
      const row = Math.floor((n as AnnotationNotationAttributes).y / rowH);
      return { min: row, max: row };
    }
    default:
      return null;
  }
}

function notationIntersectsRowRange(
  n: NotationAttributes,
  firstRow: number,
  lastRow: number,
  rowH: number,
): boolean {
  if (n.uuid?.startsWith(clonedNotationUUIdPrefix)) return false;
  if (isPracticeProblemNotation(n)) return false;
  if (n.notationType === "SQRTSYMBOL") return false;
  const span = notationMinMaxRow(n, rowH);
  if (!span) return false;
  return span.min <= lastRow && span.max >= firstRow;
}

function shiftNotationDown(n: NotationAttributes, rowH: number) {
  switch (n.notationType) {
    case "SYMBOL":
    case "EXPONENT":
    case "LOGBASE":
    case "SQRTSYMBOL":
      (n as PointNotationAttributes).row += 1;
      break;
    case "SQRT":
      (n as SqrtNotationAttributes).row += 1;
      break;
    case "TEXT":
    case "IMAGE": {
      const t = n as RectNotationAttributes;
      t.fromRow += 1;
      t.toRow += 1;
      break;
    }
    case "LINE":
    case "DIVISIONLINE": {
      const line = n as LineNotationAttributes;
      line.p1y += rowH;
      line.p2y += rowH;
      break;
    }
    case "CURVE": {
      const c = n as CurveNotationAttributes;
      c.p1y += rowH;
      c.p2y += rowH;
      c.cpy += rowH;
      break;
    }
    case "CIRCLE":
      (n as CircleNotationAttributes).cy += rowH;
      break;
    case "CONIC":
      (n as ConicNotationAttributes).hy += rowH;
      break;
    case "FREESKETCH": {
      const s = n as FreeSketchNotationAttributes;
      s.points = (s.points ?? []).map((p) => ({ x: p.x, y: p.y + rowH }));
      break;
    }
    case "ANNOTATION":
      (n as AnnotationNotationAttributes).y += rowH;
      break;
  }
}

function shiftPartLabelRowsFromRow(firstRow: number, fromRow: number) {
  if (!isPracticeBoard()) return;
  let questionUUId: string;
  try {
    questionUUId = getPracticeQuestionUUId();
  } catch {
    return;
  }
  const practiceStore = usePracticeStore();
  const session = practiceStore.getSession(questionUUId);
  const next = shiftedPartLabelRows(session.partLabelRows, firstRow, fromRow);
  if (!next || next === session.partLabelRows) return;
  practiceStore.setSession(questionUUId, { ...session, partLabelRows: next });
}

async function pushNotationsDownFromCell(cell: { col: number; row: number }) {
  let block = findNextRowBlock(
    cell.row,
    rowHasPushableMath,
    matrixDimensions.rowsNum,
  );
  if (isPracticeBoard()) {
    try {
      const session = usePracticeStore().getSession(getPracticeQuestionUUId());
      if (session.submitted) {
        block = extendPushBlockForPracticeParts(
          block,
          cell.row,
          session.partLabelRows,
        );
      }
    } catch {
      /* no practice parent */
    }
  }
  if (block.firstRow === -1) return;
  if (block.lastRow + 1 >= matrixDimensions.rowsNum) return;

  const rowH = rowHeightPx();
  const toMove = notationStore
    .getNotations()
    .filter((n) =>
      notationIntersectsRowRange(n, block.firstRow, block.lastRow, rowH),
    )
    .sort((a, b) => {
      const aMax = notationMinMaxRow(a, rowH)?.max ?? 0;
      const bMax = notationMinMaxRow(b, rowH)?.max ?? 0;
      return bMax - aMax;
    });

  for (const notation of toMove) {
    shiftNotationDown(notation, rowH);
    await notationMutateHelper.updateNotation(notation);
  }

  shiftPartLabelRowsFromRow(block.firstRow, cell.row);
}

async function pushNotationsDownFromSelectedCell() {
  const cell = cellStore.getSelectedCell();
  if (!cell) return;

  notationStore.beginUndoGroup();
  try {
    await pushNotationsDownFromCell(cell);
    notationStore.resetSelectedNotations();
  } finally {
    notationStore.endUndoGroup();
  }
}

function cellHasPushableMath(col: number, row: number): boolean {
  return notationStore.getNotationsAtCell({ col, row }).some(
    (n) =>
      n.notationType === "SYMBOL" ||
      n.notationType === "EXPONENT" ||
      n.notationType === "LOGBASE" ||
      n.notationType === "SQRT",
  );
}

/** True when the next `count` cells on this row have no symbols / sqrt to push. */
function nextMathCellsAreEmpty(
  cell: { col: number; row: number },
  count = SPACE_MOVE_EMPTY_RUN,
): boolean {
  const last = Math.min(cell.col + count, matrixDimensions.colsNum - 1);
  for (let col = cell.col + 1; col <= last; col++) {
    if (cellHasPushableMath(col, cell.row)) return false;
  }
  return true;
}

function findNextSymbolBlock(
  leftCol: number,
  row: number,
): {
  lastCol: number;
  firstCol: number;
} {
  let lastCol = -1;
  let firstCol = -1;

  for (let col = leftCol; col < matrixDimensions.colsNum; col++) {
    const notations = notationStore.getNotationsAtCell({
      row: row,
      col: col,
    });

    if (notations.length == 0 && firstCol === -1) {
      continue;
    }

    if (notations.length == 0 && firstCol !== -1) {
      lastCol = col;
      return { lastCol: lastCol, firstCol: firstCol };
    }

    if (firstCol === -1) {
      firstCol = col;
    }
  }

  return { lastCol: lastCol, firstCol: firstCol };
}

// Move notations from left to right
async function moveNotationsRight(
  row: number,
  symbolBlock: { lastCol: number; firstCol: number },
) {
  for (
    let currentCol = symbolBlock.lastCol;
    currentCol >= symbolBlock.firstCol;
    currentCol--
  ) {
    const sqrtNotation = notationStore
      .getNotationsAtCell({ col: currentCol, row: row })
      .find((n) => n.notationType === "SQRT") as
      | SqrtNotationAttributes
      | undefined;

    if (sqrtNotation && sqrtNotation.fromCol === currentCol) {
      (sqrtNotation as SqrtNotationAttributes).fromCol++;
      (sqrtNotation as SqrtNotationAttributes).toCol++;
      notationMutateHelper.updateNotation(
        sqrtNotation as SqrtNotationAttributes,
      );
    }

    const notations = notationStore
      .getNotationsAtCell({
        row: row,
        col: currentCol,
      })
      .slice()
      .sort((a, b) => {
        const aDot = (a as PointNotationAttributes).value === "." ? 1 : 0;
        const bDot = (b as PointNotationAttributes).value === "." ? 1 : 0;
        return aDot - bDot;
      });

    for (const notation of notations) {
      if (typeof (notation as PointNotationAttributes).col === "number") {
        (notation as PointNotationAttributes).col++;
        await notationMutateHelper.updateNotation(notation);
      }
    }
  }
}

export {
  collapseNotationsToSelectedCell,
  nextMathCellsAreEmpty,
  nextMathRowsAreEmpty,
  pushNotationsFromSelectedCell,
  pushNotationsFromCell,
  pushNotationsDownFromSelectedCell,
  pushNotationsDownFromCell,
};
