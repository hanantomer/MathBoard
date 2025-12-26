import {
  PointNotationAttributes,
  SqrtNotationAttributes,
} from "common/baseTypes";

import { NotationType } from "common/unions";
import { matrixDimensions } from "common/globals";
import { useNotationStore } from "../store/pinia/notationStore";
import { useCellStore } from "../store/pinia/cellStore";
import { NotationAttributes } from "common/baseTypes";
import useNotationMutateHelper from "./notationMutateHelper";

const notationStore = useNotationStore();
const cellStore = useCellStore();
const notationMutateHelper = useNotationMutateHelper();

async function collapseNotationsToSelectedCell() {
  const cell = cellStore.getSelectedCell();
  if (!cell) return;
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
      const sqrtNotation = notations.find((n) => n.notationType === "SQRT") as
        | SqrtNotationAttributes
        | undefined;

      if (!sqrtNotation) {
        // do not continue collapsing after the sqrt notation ends
        break;
      }
    }

    notations.forEach(async (notation: NotationAttributes) => {
      if (
        notation.notationType === "SIGN" ||
        notation.notationType === "EXPONENT" ||
        notation.notationType === "LOGBASE" ||
        notation.notationType === "SYMBOL"
      ) {
        notationFound = true;
        (notation as PointNotationAttributes).col--;

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
    });
  }
}

function pushNotationsFromSelectedCell() {
  const cell = cellStore.getSelectedCell();
  if (!cell) return;

  if (cell.col === matrixDimensions.colsNum - 1) return;

  const notationTypesToPush: NotationType[] = [
    "SIGN",
    "EXPONENT",
    "LOGBASE",
    "SQRT",
    "SQRTSYMBOL",
    "SYMBOL",
  ];

  const symbolBlock = findNextSymbolBlock(cell.col, cell.row);

  moveNotationsRight(cell.row, symbolBlock);

  notationStore.resetSelectedNotations();
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

    const notations = notationStore.getNotationsAtCell({
      row: row,
      col: currentCol,
    });

    for (const notation of notations) {
      if ((notation as PointNotationAttributes).col) {
        (notation as PointNotationAttributes).col++;
        await notationMutateHelper.updateNotation(notation);
      }
    }
  }
}

export { collapseNotationsToSelectedCell, pushNotationsFromSelectedCell };
