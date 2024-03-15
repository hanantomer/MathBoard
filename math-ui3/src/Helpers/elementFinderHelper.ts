import {
  DotPosition,
  cellSpace,
} from "../../../math-common/src/globals";
import { PointAttributes } from "../../../math-common/src/baseTypes";
import { useNotationStore } from "../store/pinia/notationStore";
import { NotationAttributes } from "../../../math-common/src/baseTypes";
const notationStore = useNotationStore();

export default function elementFinderHelper() {

  function findClickedCell(
    svgId: string,
    dotPosition: DotPosition,
  ): PointAttributes {
    const boundingRect = document
      .getElementById(svgId)
      ?.getBoundingClientRect();

    const clickedCellCol = Math.floor(
      (dotPosition.x - boundingRect!.left) /
        (notationStore.getCellHorizontalWidth() + cellSpace),
    );

    const clickedCellRow = Math.floor(
      (dotPosition.y - boundingRect!.top) /
        (notationStore.getCellVerticalHeight() + cellSpace),
    );

    return { col: clickedCellCol, row: clickedCellRow };
  }

  function findClickedNotation(
    svgId: string,
    dotPosition: DotPosition,
  ): NotationAttributes | null {
    const clickedCell = findClickedCell(svgId, dotPosition);
    return notationStore.getNotationByCell(clickedCell.col, clickedCell.row);
  }

  return {
    findClickedCell,
    findClickedNotation,
  };
}
