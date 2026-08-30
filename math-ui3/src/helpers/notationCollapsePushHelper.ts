import {
  PointNotationAttributes,
  SqrtNotationAttributes,
} from "common/baseTypes";

import { matrixDimensions } from "common/globals";
import { useNotationStore } from "../store/pinia/notationStore";
import { useCellStore } from "../store/pinia/cellStore";
import { NotationAttributes } from "common/baseTypes";
import useNotationMutateHelper from "./notationMutateHelper";

/** If this many cells to the right have no math, Space moves the cursor instead of pushing. */
const SPACE_MOVE_EMPTY_RUN = 10;

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
  pushNotationsFromSelectedCell,
  pushNotationsFromCell,
};
