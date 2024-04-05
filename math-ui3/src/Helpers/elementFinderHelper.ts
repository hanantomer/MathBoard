import { DotPosition, cellSpace } from "../../../math-common/src/globals";
import { CellAttributes } from "../../../math-common/src/baseTypes";
import { useNotationStore } from "../store/pinia/notationStore";
import { NotationAttributes } from "../../../math-common/src/baseTypes";
import { CellPart } from "../../../math-common/src/unions";
const notationStore = useNotationStore();

export default function elementFinderHelper() {
  function findClickedCell(
    svgId: string,
    dotPosition: DotPosition,
  ): CellAttributes {
    const boundingRect = document
      .getElementById(svgId)
      ?.getBoundingClientRect();

    const clickedCellCol = Math.floor(
      (dotPosition.x - boundingRect!.left) /
        (notationStore.getCellHorizontalWidth() + cellSpace),
    );

    const clickedPosDivededByRowHeight =
      (dotPosition.y - boundingRect!.top) /
      (notationStore.getCellVerticalHeight() + cellSpace);

    const clickedCellRow = Math.floor(clickedPosDivededByRowHeight);

    const modulo = clickedPosDivededByRowHeight - clickedCellRow;

    let cellPart: CellPart =
      modulo <= 0.25 ? "TOP" :
        modulo > 0.25 && modulo < 0.75 ? "MIDDLE" : "BOTTOM";

    return { col: clickedCellCol, row: clickedCellRow, part: cellPart };
  }

  function findClickedNotation(
    svgId: string,
    dotPosition: DotPosition,
  ): NotationAttributes | null {
    const clickedCell = findClickedCell(svgId, dotPosition);
    return notationStore.getNotationByCell(clickedCell);
  }

  return {
    findClickedCell,
    findClickedNotation,
  };
}
