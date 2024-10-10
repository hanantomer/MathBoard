import { cellSpace } from "../../../math-common/src/globals";

import {
  DotCoordinates,
  RectCoordinates,
  NotationAttributes,
  CellAttributes,
  HorizontalLineNotationAttributes,
  HorizontalLineAttributes,
  HorizontaLinePosition,
  PointNotationAttributes,
  RectNotationAttributes,
  SlopeLineNotationAttributes,
  VerticalLineNotationAttributes,
  CurveNotationAttributes,
  RectAttributes,
  LineCoordinates,
  SlopeLineAttributes,
} from "../../../math-common/src/baseTypes";
import { NotationTypeShape } from "../../../math-common/src/unions";

import { useNotationStore } from "../store/pinia/notationStore";
import { useCellStore } from "../store/pinia/cellStore";

const cellStore = useCellStore();

export default function screenHelper() {
  type NotationDistance = { notation: NotationAttributes; distance: number };

  function getClickedCell(dotCoordinates: DotCoordinates): CellAttributes {
    const clickedCellCol = Math.floor(
      (dotCoordinates.x - cellStore.getSvgBoundingRect().left) /
        (cellStore.getCellHorizontalWidth() + cellSpace),
    );

    const clickedCellRow = Math.floor(
      (dotCoordinates.y - cellStore.getSvgBoundingRect().top) /
        (cellStore.getCellVerticalHeight() + cellSpace),
    );

    return { col: clickedCellCol, row: clickedCellRow };
  }

  // function clickedAtCellBottom(
  //   dotCoordinates: DotCoordinates,
  // ): boolean {

  //   return (
  //     (dotCoordinates.y - cellStore.getSvgBoundingRect().top) %
  //       cellStore.getCellVerticalHeight() <
  //     5
  //   );
  // }

  // function clickedAtCellRightSide(
  //   dotCoordinates: DotCoordinates,
  // ): boolean {

  //   return (
  //     (dotCoordinates.x - cellStore.getSvgBoundingRect().left) %
  //       cellStore.getCellHorizontalWidth() <
  //     5
  //   );
  // }

  function getClickedCellTopLeftCoordinates(
    clickedCell: CellAttributes,
  ): DotCoordinates {
    const cellWidth = cellStore.getCellHorizontalWidth() + cellSpace;
    const cellHeight = cellStore.getCellVerticalHeight() + cellSpace;

    return {
      x:
        clickedCell.col * cellWidth +
        cellStore.getSvgBoundingRect().left -
        cellSpace,
      y:
        clickedCell.row * cellHeight +
        cellStore.getSvgBoundingRect().top -
        cellSpace,
    };
  }

  function getRectAttributes(rectCoordinates: RectCoordinates): RectAttributes {
    const rectFromCol = Math.round(
      rectCoordinates.topLeft.x /
        (cellStore.getCellHorizontalWidth() + cellSpace),
    );

    const rectToCol =
      Math.round(
        rectCoordinates.bottomRight.x /
          (cellStore.getCellHorizontalWidth() + cellSpace),
      ) - 1;

    const rectFromRow = Math.round(
      rectCoordinates.topLeft.y /
        (cellStore.getCellVerticalHeight() + cellSpace),
    );

    const rectToRow =
      Math.round(
        rectCoordinates.bottomRight.y /
          (cellStore.getCellVerticalHeight() + cellSpace),
      ) - 1;

    return {
      fromCol: rectFromCol,
      toCol: rectToCol,
      fromRow: rectFromRow,
      toRow: rectToRow,
    };
  }

  function getLineAttributes(
    lineCoordinates: HorizontaLinePosition,
  ): HorizontalLineAttributes {

    const fromCol = Math.round(
      lineCoordinates.x1 /
        (cellStore.getCellHorizontalWidth() + cellSpace),
    );

    const toCol =
      Math.round(
        lineCoordinates.x2 /
          (cellStore.getCellHorizontalWidth() + cellSpace),
      ) - 1;

    const row = Math.round(
      lineCoordinates.y /
        (cellStore.getCellVerticalHeight() + cellSpace),
    );


    return {
      fromCol: fromCol,
      toCol: toCol,
      row: row,
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
    rectCoordinates: RectCoordinates,
  ): CellAttributes[] {
    let cells: CellAttributes[] = [];

    const areaFromCol = Math.floor(
      (rectCoordinates.topLeft.x - cellStore.getSvgBoundingRect().left) /
        (cellStore.getCellHorizontalWidth() + cellSpace),
    );

    const areaToCol = Math.floor(
      (rectCoordinates.bottomRight.x - cellStore.getSvgBoundingRect().left) /
        (cellStore.getCellHorizontalWidth() + cellSpace),
    );

    const areaFromRow = Math.floor(
      (rectCoordinates.topLeft.y - cellStore.getSvgBoundingRect().top) /
        (cellStore.getCellVerticalHeight() + cellSpace),
    );

    const areaToRow = Math.floor(
      (rectCoordinates.bottomRight.y - cellStore.getSvgBoundingRect().top) /
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
  function getNotationAtCoordinates(
    DotCoordinates: DotCoordinates,
  ): NotationAttributes | null {
    const notationStore = useNotationStore();
    const clickedCell = getClickedCell(DotCoordinates);
    const notationsAtCell = notationStore.getNotationsAtCell(clickedCell);

    if (!notationsAtCell?.length) return null;

    return getClosestNotationToPoint(notationsAtCell, DotCoordinates);
  }

  // loop over notationsAtCell array and return the one closest to DotCoordinates
  function getClosestNotationToPoint(
    notationsAtCell: NotationAttributes[],
    DotCoordinates: DotCoordinates,
  ): NotationAttributes | null {
    let notationDistanceList: NotationDistance[] = [];

    for (let i = 0; i < notationsAtCell.length; i++) {
      const n = notationsAtCell.at(i);

      switch (NotationTypeShape.get(n?.notationType!)) {
        case "POINT": {
          let n1 = n as PointNotationAttributes;

          notationDistanceList.push({
            notation: n1,
            distance: getClickedPosDistanceFromCellCenter(DotCoordinates, n1),
          });
          break;
        }
        case "RECT":
          let n1 = n as RectNotationAttributes;
          notationDistanceList.push({
            notation: n1,
            distance: getClickedPosDistanceFromRectCenter(DotCoordinates, n1),
          });
          break;
        case "SLOPE_LINE": {
          let n1 = n as SlopeLineNotationAttributes;
          notationDistanceList.push({
            notation: n1,
            distance: getClickedPosDistanceFromSlopeLine(DotCoordinates, n1),
          });
          break;
        }
        case "HORIZONTAL_LINE": {
          let n1 = n as HorizontalLineNotationAttributes;
          notationDistanceList.push({
            notation: n1,
            distance: getClickedPosDistanceFromHorizontalLine(
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
            distance: getClickedPosDistanceFromVerticalLine(DotCoordinates, n1),
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

    if (notationDistanceList.length === 0) return null;

    // pick notation with min distance
    return notationDistanceList.reduce((min, notation) =>
      min.distance < notation.distance ? min : notation,
    ).notation;
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
    DotCoordinates: DotCoordinates,
    notation: PointNotationAttributes,
  ): number {
    const clickedPosYDistanceFromCellCenter = Math.abs(
      DotCoordinates.y -
        cellStore.getSvgBoundingRect().top -
        notation.row! * (cellStore.getCellVerticalHeight() + cellSpace) -
        cellStore.getCellVerticalHeight() / 2,
    );

    const clickedPosXDistanceFromCellCenter = Math.abs(
      DotCoordinates.x -
        cellStore.getSvgBoundingRect().left -
        notation.col! * (cellStore.getCellHorizontalWidth() + cellSpace) -
        cellStore.getCellHorizontalWidth() / 2,
    );

    return Math.sqrt(
      Math.pow(clickedPosYDistanceFromCellCenter, 2) +
        Math.pow(clickedPosXDistanceFromCellCenter, 2),
    );
  }

  function getClickedPosDistanceFromRectCenter(
    DotCoordinates: DotCoordinates,
    n1: RectNotationAttributes,
  ): number {
    const clickedPosYDistanceFromRectCenter = Math.abs(
      DotCoordinates.y -
        cellStore.getSvgBoundingRect().top -
        n1.fromRow * (cellStore.getCellVerticalHeight() + cellSpace) -
        ((n1.toRow - n1.fromRow) * cellStore.getCellVerticalHeight()) / 2,
    );

    const clickedPosXDistanceFromRectCenter = Math.abs(
      DotCoordinates.x -
        cellStore.getSvgBoundingRect().top -
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
    DotCoordinates: DotCoordinates,
    n: HorizontalLineAttributes,
  ): number {
    const cellWidth = cellStore.getCellHorizontalWidth() + cellSpace;

    const cellHeight = cellStore.getCellVerticalHeight() + cellSpace;

    const x = DotCoordinates.x - cellStore.getSvgBoundingRect().left;

    const y = DotCoordinates.y - cellStore.getSvgBoundingRect().top;

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
    DotCoordinates: DotCoordinates,
    n: VerticalLineNotationAttributes,
  ): number {
    const cellWidth = cellStore.getCellHorizontalWidth() + cellSpace;

    const cellHeight = cellStore.getCellVerticalHeight() + cellSpace;

    const x = DotCoordinates.x - cellStore.getSvgBoundingRect().left;

    const y = DotCoordinates.y - cellStore.getSvgBoundingRect().top;

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
    DotCoordinates: DotCoordinates,
    n: SlopeLineNotationAttributes,
  ): number {
    const cellWidth = cellStore.getCellHorizontalWidth() + cellSpace;

    const cellHeight = cellStore.getCellVerticalHeight() + cellSpace;

    const x = DotCoordinates.x - cellStore.getSvgBoundingRect().left;

    const y = DotCoordinates.y - cellStore.getSvgBoundingRect().top;

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

  return {
    getClickedPosDistanceFromSlopeLine,
    getClickedPosDistanceFromVerticalLine,
    getClickedPosDistanceFromHorizontalLine,
    getNotationAtCoordinates,
    getClickedCell,
    getRectCoordinatesOccupiedCells,
    getSlopeLineAttributesByCoordinates,
    getClickedCellTopLeftCoordinates,
    getRectAttributes,
    getLineAttributes,
  };
}
