import { DotPosition, cellSpace } from "../../../math-common/src/globals";
import {
  CellAttributes,
  HorizontalLineAttributes,
  HorizontalLineNotationAttributes,
  PointNotationAttributes,
  RectNotationAttributes,
  SlopeLineNotationAttributes,
  VerticalLineNotationAttributes,
} from "../../../math-common/src/baseTypes";
import { useNotationStore } from "../store/pinia/notationStore";
import { NotationAttributes } from "../../../math-common/src/baseTypes";
import { CellPart, NotationTypeShape } from "../../../math-common/src/unions";
const notationStore = useNotationStore();

export default function elementFinderHelper() {
  const minDistanceForSelection = 5;

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
      modulo <= 0.25
        ? "TOP"
        : modulo > 0.25 && modulo < 0.75
        ? "MIDDLE"
        : "BOTTOM";

    return { col: clickedCellCol, row: clickedCellRow, part: cellPart };
  }

  function findClickedNotation(
    svgId: string,
    dotPosition: DotPosition,
  ): NotationAttributes | null {
    const clickedCell = findClickedCell(svgId, dotPosition); /// TODE: remove unnessecary clicked cell part
    const notationsAtCell = notationStore.getNotationsByCell(clickedCell);
    return notationClosestToPoint(svgId, notationsAtCell, dotPosition);
  }

  // loop over notationsAtCell array and return the one closest to dotPosition
  type NotationDistance = { notation: NotationAttributes; distance: number };
  function notationClosestToPoint(
    svgId: string,
    notationsAtCell: NotationAttributes[],
    dotPosition: DotPosition,
  ): NotationAttributes | null {
    if (!notationsAtCell?.length) return null;

    let notationDistanceList: NotationDistance[] = [];

    for (let i = 0; i < notationsAtCell.length; i++) {
      const n = notationsAtCell.at(i);

      switch (NotationTypeShape.get(n?.notationType!)) {
        case "POINT": {
          let n1 = n as PointNotationAttributes;

          notationDistanceList.push({
            notation: n1,
            distance: getClickedPosDistanceFromCellCenter(
              svgId,
              dotPosition,
              n1,
            ),
          });
          break;
        }
        case "RECT":
          let n1 = n as RectNotationAttributes;
          notationDistanceList.push({
            notation: n1,
            distance: getClickedPosDistanceFromRectCenter(
              svgId,
              dotPosition,
              n1,
            ),
          });
          break;
        case "SLOPE_LINE": {
          let n1 = n as SlopeLineNotationAttributes;
          notationDistanceList.push({
            notation: n1,
            distance: getClickedPosDistanceFromSlopeLine(
              svgId,
              dotPosition,
              n1,
            ),
          });
          break;
        }
        case "HORIZONTAL_LINE": {
          let n1 = n as HorizontalLineNotationAttributes;
          notationDistanceList.push({
            notation: n1,
            distance: getClickedPosDistanceFromHorizontalLine(
              svgId,
              dotPosition,
              n1,
            ),
          });
          break;
        }
        case "VERTICAL_LINE": {
          let n1 = n as VerticalLineNotationAttributes;
          notationDistanceList.push({
            notation: n1,
            distance: getClickedPosDistanceFromVerticalLine(
              svgId,
              dotPosition,
              n1,
            ),
          });
          break;
        }
      }
    }

    // pick notation with min distance
    const notationAndDistance = notationDistanceList.reduce((min, notation) =>
      min.distance < notation.distance ? min : notation,
    );

    if (notationAndDistance.distance < minDistanceForSelection)
      return notationAndDistance.notation;

    return null;
  }

  // calc the distnce from the center of cell to the clicked coordinates.
  function getClickedPosDistanceFromCellCenter(
    svgId: string,
    dotPosition: DotPosition,
    notation: PointNotationAttributes,
  ): number {
    const clickedPosYDistanceFromCellCenter = Math.abs(
      dotPosition.y -
        getBoundingRect(svgId)!.top -
        notation.row! * (notationStore.getCellVerticalHeight() + cellSpace) -
        notationStore.getCellVerticalHeight() / 2,
    );

    const clickedPosXDistanceFromCellCenter = Math.abs(
      dotPosition.x -
        getBoundingRect(svgId)!.left -
        notation.col! * (notationStore.getCellHorizontalWidth() + cellSpace) -
        notationStore.getCellHorizontalWidth() / 2,
    );

    return Math.sqrt(
      Math.pow(clickedPosYDistanceFromCellCenter, 2) +
        Math.pow(clickedPosXDistanceFromCellCenter, 2),
    );
  }

  function getClickedPosDistanceFromRectCenter(
    svgId: string,
    dotPosition: DotPosition,
    n1: RectNotationAttributes,
  ): number {
    const clickedPosYDistanceFromRectCenter = Math.abs(
      dotPosition.y -
        getBoundingRect(svgId)!.top -
        n1.fromRow * (notationStore.getCellVerticalHeight() + cellSpace) -
        ((n1.toRow - n1.fromRow) * notationStore.getCellVerticalHeight()) / 2,
    );

    const clickedPosXDistanceFromRectCenter = Math.abs(
      dotPosition.x -
        getBoundingRect(svgId)!.top -
        n1.fromCol * (notationStore.getCellHorizontalWidth() + cellSpace) -
        ((n1.toCol - n1.fromCol) * notationStore.getCellHorizontalWidth()) / 2,
    );

    return Math.sqrt(
      Math.pow(clickedPosYDistanceFromRectCenter, 2) +
        Math.pow(clickedPosXDistanceFromRectCenter, 2),
    );
  }

  function getClickedPosDistanceFromHorizontalLine(
    svgId: string,
    dotPosition: DotPosition,
    n: HorizontalLineNotationAttributes,
  ): number {
    const boundingRect = document
      .getElementById(svgId)
      ?.getBoundingClientRect();

    const horizontalCellWidth =
      notationStore.getCellHorizontalWidth() + cellSpace;

    const verticalCellWidth = notationStore.getCellVerticalHeight() + cellSpace;

    const x = dotPosition.x - boundingRect!.left;

    const y = dotPosition.y - boundingRect!.top;

    const horizontalDistance =
      x < n.fromCol * horizontalCellWidth
        ? n.fromCol * horizontalCellWidth - x
        : x > n.toCol * horizontalCellWidth
        ? x - n.toCol * horizontalCellWidth
        : 0;

    const verticalDistance = Math.abs(n.row * verticalCellWidth - y);

    const a = Math.pow(horizontalDistance, 2);
    const b = Math.pow(verticalDistance, 2);

    return Math.sqrt(a + b);
  }

  function getClickedPosDistanceFromVerticalLine(
    svgId: string,
    dotPosition: DotPosition,
    n: VerticalLineNotationAttributes,
  ): number {
    const boundingRect = document
      .getElementById(svgId)
      ?.getBoundingClientRect();

    const horizontalCellWidth =
      notationStore.getCellHorizontalWidth() + cellSpace;

    const verticalCellWidth = notationStore.getCellVerticalHeight() + cellSpace;

    const x = dotPosition.x - boundingRect!.left;

    const y = dotPosition.y - boundingRect!.top;

    const horizontalDistance = Math.abs(n.col * horizontalCellWidth - x);

    const verticalDistance =
      y < n.fromRow * verticalCellWidth
        ? n.fromRow * verticalCellWidth - dotPosition.y
        : y > n.toRow * verticalCellWidth
        ? y - n.toRow * verticalCellWidth
        : 0;

    const a = Math.pow(horizontalDistance, 2);
    const b = Math.pow(verticalDistance, 2);

    return Math.sqrt(a + b);
  }

  //https://en.wikipedia.org/wiki/Distance_from_a_point_to_a_line
  function getClickedPosDistanceFromSlopeLine(
    svgId: string,
    dotPosition: DotPosition,
    n: SlopeLineNotationAttributes,
  ): number {
    const boundingRect = document
      .getElementById(svgId)
      ?.getBoundingClientRect();

    const horizontalCellWidth =
      notationStore.getCellHorizontalWidth() + cellSpace;

    const verticalCellWidth = notationStore.getCellVerticalHeight() + cellSpace;

    const x = dotPosition.x - boundingRect!.left;

    const y = dotPosition.y - boundingRect!.top;

    const nominator = Math.abs(
      (n.toCol * horizontalCellWidth - n.fromCol * horizontalCellWidth) *
        (y - n.fromCol * horizontalCellWidth) -
        (x - n.fromCol * horizontalCellWidth) *
          (n.toRow * verticalCellWidth - n.fromRow * verticalCellWidth),
    );

    const deNominator = Math.sqrt(
      Math.pow(
        n.toCol * horizontalCellWidth - n.fromCol * horizontalCellWidth,
        2,
      ) +
        Math.pow(
          n.toRow * verticalCellWidth - n.fromRow * verticalCellWidth,
          2,
        ),
    );

    return nominator / deNominator;
  }

  function getBoundingRect(svgId: string) {
    return document.getElementById(svgId)?.getBoundingClientRect();
  }

  return {
    findClickedCell,
    findClickedNotation,
  };
}
