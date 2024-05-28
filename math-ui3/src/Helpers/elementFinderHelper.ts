import {
  DotPosition,
  ScreenCoordinates,
  cellSpace,
} from "../../../math-common/src/globals";
import {
  CellAttributes,
  HorizontalLineNotationAttributes,
  PointNotationAttributes,
  RectNotationAttributes,
  SlopeLineNotationAttributes,
  VerticalLineNotationAttributes,
  RectAttributes,
} from "../../../math-common/src/baseTypes";
import { useNotationStore } from "../store/pinia/notationStore";
import { NotationAttributes } from "../../../math-common/src/baseTypes";
import {
  NotationTypeShape,
  NotationType,
} from "../../../math-common/src/unions";
const notationStore = useNotationStore();

export default function elementFinderHelper() {
  const minDistanceForLineSelection = 5;
  const minDistanceForSelection = 25;

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

    const clickedCellRow = Math.floor(
      (dotPosition.y - boundingRect!.top) /
        (notationStore.getCellVerticalHeight() + cellSpace),
    );

    return { col: clickedCellCol, row: clickedCellRow };
  }

  function getRectCoordinates(
    svgId: string,
    screenCoordinates: ScreenCoordinates,
  ): RectAttributes {
    const boundingRect = document
      .getElementById(svgId)
      ?.getBoundingClientRect();

    const areaFromCol = Math.floor(
      (screenCoordinates.x1 - boundingRect!.left) /
        (notationStore.getCellHorizontalWidth() + cellSpace),
    );

    const areaToCol = Math.floor(
      (screenCoordinates.x2 - boundingRect!.left) /
        (notationStore.getCellHorizontalWidth() + cellSpace),
    );

    const areaFromRow = Math.floor(
      (screenCoordinates.y1 - boundingRect!.top) /
        (notationStore.getCellVerticalHeight() + cellSpace),
    );

    const areaToRow = Math.floor(
      (screenCoordinates.y2 - boundingRect!.top) /
        (notationStore.getCellVerticalHeight() + cellSpace),
    );

    return {
      fromCol: areaFromCol,
      toCol: areaToCol,
      fromRow: areaFromRow,
      toRow: areaToRow,
    };
  }

  function getScreenCoordinatesOccupiedCells(
    svgId: string,
    screenCoordinates: ScreenCoordinates,
  ): CellAttributes[] {
    let cells: CellAttributes[] = [];

    const boundingRect = document
      .getElementById(svgId)
      ?.getBoundingClientRect();

    const areaFromCol = Math.floor(
      (screenCoordinates.x1 - boundingRect!.left) /
        (notationStore.getCellHorizontalWidth() + cellSpace),
    );

    const areaToCol = Math.floor(
      (screenCoordinates.x2 - boundingRect!.left) /
        (notationStore.getCellHorizontalWidth() + cellSpace),
    );

    const areaFromRow = Math.floor(
      (screenCoordinates.y1 - boundingRect!.top) /
        (notationStore.getCellVerticalHeight() + cellSpace),
    );

    const areaToRow = Math.floor(
      (screenCoordinates.y2 - boundingRect!.top) /
        (notationStore.getCellVerticalHeight() + cellSpace),
    );

    for (let i = areaFromCol; i <= areaToCol; i++) {
      for (let j = areaFromRow; j <= areaToRow; j++) {
        cells.push({ col: i, row: j });
      }
    }

    return cells;
  }

  function findPointNotation(
    svgId: string,
    dotPosition: DotPosition,
  ): NotationAttributes | null {
    const clickedCell = findClickedCell(svgId, dotPosition);
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

    if (
      notationIsCloseToClickedPoint(
        notationAndDistance.notation.notationType,
        notationAndDistance.distance,
      )
    ) {
      return notationAndDistance.notation;
    }

    return null;
  }

  function notationIsCloseToClickedPoint(
    notationType: NotationType,
    distance: number,
  ) {
    switch (NotationTypeShape.get(notationType)) {
      case "HORIZONTAL_LINE":
      case "VERTICAL_LINE":
      case "SLOPE_LINE":
        return distance <= minDistanceForLineSelection;
      default:
        return distance <= minDistanceForSelection;
    }
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

    return Math.log(
      Math.sqrt(
        Math.pow(clickedPosYDistanceFromRectCenter, 2) +
          Math.pow(clickedPosXDistanceFromRectCenter, 2),
      ),
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

    const cellWidth = notationStore.getCellHorizontalWidth() + cellSpace;

    const cellHeight = notationStore.getCellVerticalHeight() + cellSpace;

    const x = dotPosition.x - boundingRect!.left;

    const y = dotPosition.y - boundingRect!.top;

    const horizontalDistance =
      x < n.fromCol * cellWidth
        ? n.fromCol * cellWidth - x
        : x > n.toCol * cellWidth
        ? x - n.toCol * cellWidth
        : 0;

    const verticalDistance = Math.abs(n.row * cellHeight - y);

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

    const cellWidth = notationStore.getCellHorizontalWidth() + cellSpace;

    const cellHeight = notationStore.getCellVerticalHeight() + cellSpace;

    const x = dotPosition.x - boundingRect!.left;

    const y = dotPosition.y - boundingRect!.top;

    const horizontalDistance = Math.abs(n.col * cellWidth - x);

    const verticalDistance =
      y < n.fromRow * cellHeight
        ? n.fromRow * cellHeight - dotPosition.y
        : y > n.toRow * cellHeight
        ? y - n.toRow * cellHeight
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

    const cellWidth = notationStore.getCellHorizontalWidth() + cellSpace;

    const cellHeight = notationStore.getCellVerticalHeight() + cellSpace;

    const x = dotPosition.x - boundingRect!.left;

    const y = dotPosition.y - boundingRect!.top;

    const nominator = Math.abs(
      (n.toCol - n.fromCol) *
        cellWidth * // x2-x1
        (y - n.fromRow * cellHeight) - // y0 - y1
        (x - n.fromCol * cellWidth) * // x0 - x1
          (n.toRow - n.fromRow) * // y2 - y1
          cellHeight,
    );

    const deNominator = Math.sqrt(
      Math.pow((n.toCol - n.fromCol) * cellWidth, 2) +
        Math.pow((n.toRow - n.fromRow) * cellHeight, 2),
    );

    return nominator / deNominator;
  }

  function getBoundingRect(svgId: string) {
    return document.getElementById(svgId)?.getBoundingClientRect();
  }

  return {
    findPointNotation,
    findClickedCell,
    getScreenCoordinatesOccupiedCells,
    getRectCoordinates,
  };
}
