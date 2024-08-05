import { cellSpace } from "../../../math-common/src/globals";
import {
  DotCoordinates,
  RectCoordinates,
} from "../../../math-common/src/baseTypes";
import {
  NotationAttributes,
  CellAttributes,
  HorizontalLineNotationAttributes,
  PointNotationAttributes,
  RectNotationAttributes,
  SlopeLineNotationAttributes,
  VerticalLineNotationAttributes,
  CurveNotationAttributes,
  RectAttributes,
  LineCoordinates,
  SlopeLineAttributes,
} from "../../../math-common/src/baseTypes";
import {
  NotationTypeShape,
  NotationType,
} from "../../../math-common/src/unions";

import { useNotationStore } from "../store/pinia/notationStore";
import { useCellStore } from "../store/pinia/cellStore";

const cellStore = useCellStore();

export default function screenHelper() {
  const minDistanceForLineSelection = 5;
  const minDistanceForSelection = 25;
  const minDistanceForCurveSelection = 50;
  type NotationDistance = { notation: NotationAttributes; distance: number };

  function getClickedCell(
    svgId: string,
    DotCoordinates: DotCoordinates,
  ): CellAttributes {
    const boundingRect = document
      .getElementById(svgId)
      ?.getBoundingClientRect();

    const clickedCellCol = Math.floor(
      (DotCoordinates.x - boundingRect!.left) /
        (cellStore.getCellHorizontalWidth() + cellSpace),
    );

    const clickedCellRow = Math.floor(
      (DotCoordinates.y - boundingRect!.top) /
        (cellStore.getCellVerticalHeight() + cellSpace),
    );

    return { col: clickedCellCol, row: clickedCellRow };
  }

  function getRectAttributes(rectCoordinates: RectCoordinates): RectAttributes {
    const rectFromCol = Math.round(
      rectCoordinates.topLeft.x /
        (cellStore.getCellHorizontalWidth() + cellSpace),
    );

    const rectToCol = Math.round(
      rectCoordinates.bottomRight.x /
        (cellStore.getCellHorizontalWidth() + cellSpace),
    );

    const rectFromRow = Math.round(
      rectCoordinates.bottomRight.y /
        (cellStore.getCellVerticalHeight() + cellSpace),
    );

    const rectToRow = Math.round(
      rectCoordinates.topLeft.y /
        (cellStore.getCellVerticalHeight() + cellSpace),
    );

    return {
      fromCol: rectFromCol,
      toCol: rectToCol,
      fromRow: rectFromRow,
      toRow: rectToRow,
    };
  }

  function getSlopeLineAttributesByCoordinates(
    lineCoordinates: LineCoordinates,
  ): SlopeLineAttributes {
    const lineFromCol = Math.round(
      lineCoordinates.bottom.x /
        (cellStore.getCellHorizontalWidth() + cellSpace),
    );

    const lineToCol = Math.round(
      lineCoordinates.top.x / (cellStore.getCellHorizontalWidth() + cellSpace),
    );

    const lineFromRow = Math.round(
      lineCoordinates.bottom.y /
        (cellStore.getCellVerticalHeight() + cellSpace),
    );

    const lineToRow = Math.round(
      lineCoordinates.top.y / (cellStore.getCellVerticalHeight() + cellSpace),
    );

    return {
      fromCol: lineFromCol,
      toCol: lineToCol,
      fromRow: lineFromRow,
      toRow: lineToRow,
    };
  }

  function getRectCoordinatesOccupiedCells(
    svgId: string,
    rectCoordinates: RectCoordinates,
  ): CellAttributes[] {
    let cells: CellAttributes[] = [];

    const boundingRect = document
      .getElementById(svgId)
      ?.getBoundingClientRect();

    const areaFromCol = Math.floor(
      (rectCoordinates.topLeft.x - boundingRect!.left) /
        (cellStore.getCellHorizontalWidth() + cellSpace),
    );

    const areaToCol = Math.floor(
      (rectCoordinates.bottomRight.x - boundingRect!.left) /
        (cellStore.getCellHorizontalWidth() + cellSpace),
    );

    const areaFromRow = Math.floor(
      (rectCoordinates.bottomRight.y - boundingRect!.top) /
        (cellStore.getCellVerticalHeight() + cellSpace),
    );

    const areaToRow = Math.floor(
      (rectCoordinates.bottomRight.y - boundingRect!.top) /
        (cellStore.getCellVerticalHeight() + cellSpace),
    );

    for (let i = areaFromCol; i <= areaToCol; i++) {
      for (let j = areaFromRow; j <= areaToRow; j++) {
        cells.push({ col: i, row: j });
      }
    }

    return cells;
  }

  // find notation at screen  point
  function getNotationAtDotCoordinates(
    svgId: string,
    DotCoordinates: DotCoordinates,
  ): NotationAttributes | null {
    const notationStore = useNotationStore();
    const clickedCell = getClickedCell(svgId, DotCoordinates);
    const notationsAtCell = notationStore.getNotationsAtCell(clickedCell);
    return notationClosestToPoint(svgId, notationsAtCell, DotCoordinates);
  }

  // loop over notationsAtCell array and return the one closest to DotCoordinates
  function notationClosestToPoint(
    svgId: string,
    notationsAtCell: NotationAttributes[],
    DotCoordinates: DotCoordinates,
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
              DotCoordinates,
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
              DotCoordinates,
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
              DotCoordinates,
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
              DotCoordinates,
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
              DotCoordinates,
              n1,
            ),
          });
          break;
        }

        case "CONCAVE_CURVE":
        case "CONVEX_CURVE": {
          let n1 = n as CurveNotationAttributes;
          let curveEnclosingTriangleCenterX = (n1.cpx + n1.p1x + n1.p2x) / 3;
          let curveEnclosingTriangleCenterY = (n1.cpy + n1.p1y + n1.p2y) / 3;

          notationDistanceList.push({
            notation: n1,
            distance: getClickedPosDistanceFromEnclosingTriangleCenter(
              DotCoordinates,
              {
                x: curveEnclosingTriangleCenterX,
                y: curveEnclosingTriangleCenterY,
              },
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
      case "CONCAVE_CURVE":
      case "CONVEX_CURVE":
        return distance <= minDistanceForCurveSelection;
      default:
        return distance <= minDistanceForSelection;
    }
  }

  // calc the minimum distnce of either x dimension or y dimension between 2 points.
  function getClickedPosDistanceFromEnclosingTriangleCenter(
    clickedDot: DotCoordinates,
    enclosingTriangleCenter: DotCoordinates,
  ): number {
    const xDistance = Math.abs((clickedDot.x - enclosingTriangleCenter.x) / 2);

    const yDistance = Math.abs((clickedDot.y - enclosingTriangleCenter.y) / 2);

    return Math.sqrt(Math.min(Math.pow(xDistance, 2), Math.pow(yDistance, 2)));
  }

  // calc the distnce from the center of cell to the clicked coordinates.
  function getClickedPosDistanceFromCellCenter(
    svgId: string,
    DotCoordinates: DotCoordinates,
    notation: PointNotationAttributes,
  ): number {
    const clickedPosYDistanceFromCellCenter = Math.abs(
      DotCoordinates.y -
        getBoundingRect(svgId)!.top -
        notation.row! * (cellStore.getCellVerticalHeight() + cellSpace) -
        cellStore.getCellVerticalHeight() / 2,
    );

    const clickedPosXDistanceFromCellCenter = Math.abs(
      DotCoordinates.x -
        getBoundingRect(svgId)!.left -
        notation.col! * (cellStore.getCellHorizontalWidth() + cellSpace) -
        cellStore.getCellHorizontalWidth() / 2,
    );

    return Math.sqrt(
      Math.pow(clickedPosYDistanceFromCellCenter, 2) +
        Math.pow(clickedPosXDistanceFromCellCenter, 2),
    );
  }

  function getClickedPosDistanceFromRectCenter(
    svgId: string,
    DotCoordinates: DotCoordinates,
    n1: RectNotationAttributes,
  ): number {
    const clickedPosYDistanceFromRectCenter = Math.abs(
      DotCoordinates.y -
        getBoundingRect(svgId)!.top -
        n1.fromRow * (cellStore.getCellVerticalHeight() + cellSpace) -
        ((n1.toRow - n1.fromRow) * cellStore.getCellVerticalHeight()) / 2,
    );

    const clickedPosXDistanceFromRectCenter = Math.abs(
      DotCoordinates.x -
        getBoundingRect(svgId)!.top -
        n1.fromCol * (cellStore.getCellHorizontalWidth() + cellSpace) -
        ((n1.toCol - n1.fromCol) * cellStore.getCellHorizontalWidth()) / 2,
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
    DotCoordinates: DotCoordinates,
    n: HorizontalLineNotationAttributes,
  ): number {
    const boundingRect = document
      .getElementById(svgId)
      ?.getBoundingClientRect();

    const cellWidth = cellStore.getCellHorizontalWidth() + cellSpace;

    const cellHeight = cellStore.getCellVerticalHeight() + cellSpace;

    const x = DotCoordinates.x - boundingRect!.left;

    const y = DotCoordinates.y - boundingRect!.top;

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
  /*
  function getClickedPosDistanceFromConcaveCurve(
    svgId: string,
    DotCoordinates: DotCoordinates,
    n: CurveNotationAttributes,
  ): number {
    const boundingRect = document
      .getElementById(svgId)
      ?.getBoundingClientRect(); /// TODO move to function

    const x = DotCoordinates.x - boundingRect!.left;

    const y = DotCoordinates.y - boundingRect!.top;

    // aoutline a virtual triangle from curve edges and control point
  }
  */

  function getClickedPosDistanceFromVerticalLine(
    svgId: string,
    DotCoordinates: DotCoordinates,
    n: VerticalLineNotationAttributes,
  ): number {
    const boundingRect = document
      .getElementById(svgId)
      ?.getBoundingClientRect();

    const cellWidth = cellStore.getCellHorizontalWidth() + cellSpace;

    const cellHeight = cellStore.getCellVerticalHeight() + cellSpace;

    const x = DotCoordinates.x - boundingRect!.left;

    const y = DotCoordinates.y - boundingRect!.top;

    const horizontalDistance = Math.abs(n.col * cellWidth - x);

    const verticalDistance =
      y < n.fromRow * cellHeight
        ? n.fromRow * cellHeight - DotCoordinates.y
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
    DotCoordinates: DotCoordinates,
    n: SlopeLineNotationAttributes,
  ): number {
    const boundingRect = document
      .getElementById(svgId)
      ?.getBoundingClientRect();

    const cellWidth = cellStore.getCellHorizontalWidth() + cellSpace;

    const cellHeight = cellStore.getCellVerticalHeight() + cellSpace;

    const x = DotCoordinates.x - boundingRect!.left;

    const y = DotCoordinates.y - boundingRect!.top;

    const nominator = Math.abs(
      (n.toCol - n.fromCol) *
        cellWidth * // x2-x1
        (y - n.fromRow * cellHeight) -
        (x - n.fromCol * cellWidth) * (n.toRow - n.fromRow) * cellHeight,
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
    getNotationAtDotCoordinates,
    getClickedCell,
    getRectCoordinatesOccupiedCells,
    getSlopeLineAttributesByCoordinates,
    getRectAttributes,
  };
}
