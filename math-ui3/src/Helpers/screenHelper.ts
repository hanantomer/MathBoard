import {
  DotCoordinates,
  RectCoordinates,
  NotationAttributes,
  CellAttributes,
  HorizontalLineNotationAttributes,
  HorizontalLineAttributes,
  PointNotationAttributes,
  RectNotationAttributes,
  SlopeLineNotationAttributes,
  VerticalLineNotationAttributes,
  CurveNotationAttributes,
  RectAttributes,
  MultiCellAttributes,
} from "../../../math-common/src/baseTypes";

import { useNotationStore } from "../store/pinia/notationStore";
import { useCellStore } from "../store/pinia/cellStore";

const cellStore = useCellStore();

export default function screenHelper() {
  type NotationDistance = { notation: NotationAttributes; distance: number };

  function getClickedCell(dotCoordinates: DotCoordinates): CellAttributes {
    const clickedCellCol = Math.floor(
      (dotCoordinates.x - cellStore.getSvgBoundingRect().left) /
        cellStore.getCellHorizontalWidth(),
    );

    const clickedCellRow = Math.floor(
      (dotCoordinates.y - cellStore.getSvgBoundingRect().top) /
        cellStore.getCellVerticalHeight(),
    );

    return { col: clickedCellCol, row: clickedCellRow };
  }

  function getClickedCellTopLeftCoordinates(
    clickedCell: CellAttributes,
  ): DotCoordinates {
    const cellWidth = cellStore.getCellHorizontalWidth();
    const cellHeight = cellStore.getCellVerticalHeight();

    return {
      x: clickedCell.col * cellWidth + cellStore.getSvgBoundingRect().left,
      y: clickedCell.row * cellHeight + cellStore.getSvgBoundingRect().top,
    };
  }

  function getRectAttributes(rectCoordinates: RectCoordinates): RectAttributes {
    const rectFromCol = Math.round(
      rectCoordinates.topLeft.x / cellStore.getCellHorizontalWidth(),
    );

    const rectToCol =
      Math.round(
        rectCoordinates.bottomRight.x / cellStore.getCellHorizontalWidth(),
      ) - 1;

    const rectFromRow = Math.round(
      rectCoordinates.topLeft.y / cellStore.getCellVerticalHeight(),
    );

    const rectToRow =
      Math.round(
        rectCoordinates.bottomRight.y / cellStore.getCellVerticalHeight(),
      ) - 1;

    return {
      fromCol: rectFromCol,
      toCol: rectToCol,
      fromRow: rectFromRow,
      toRow: rectToRow,
    };
  }

  function getMultiCellLineAttributes(
    n: MultiCellAttributes,
  ): HorizontalLineAttributes {
    const x1 = cellStore.getCellHorizontalWidth() * n.fromCol;
    const x2 = cellStore.getCellHorizontalWidth() * n.toCol;
    const y = cellStore.getCellVerticalHeight() * n.row;

    return {
      p1x: x1,
      p2x: x2,
      py: y,
    };
  }

  function getRectCoordinatesOccupiedCells(
    rectCoordinates: RectCoordinates,
  ): CellAttributes[] {
    let cells: CellAttributes[] = [];

    const areaFromCol = Math.floor(
      (rectCoordinates.topLeft.x - cellStore.getSvgBoundingRect().left) /
        cellStore.getCellHorizontalWidth(),
    );

    const areaToCol = Math.floor(
      (rectCoordinates.bottomRight.x - cellStore.getSvgBoundingRect().left) /
        cellStore.getCellHorizontalWidth(),
    );

    const areaFromRow = Math.floor(
      (rectCoordinates.topLeft.y - cellStore.getSvgBoundingRect().top) /
        cellStore.getCellVerticalHeight(),
    );

    const areaToRow = Math.floor(
      (rectCoordinates.bottomRight.y - cellStore.getSvgBoundingRect().top) /
        cellStore.getCellVerticalHeight(),
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

      switch (n?.notationType) {
        case "ANNOTATION":
        case "SYMBOL":
        case "SQRTSYMBOL":
        case "SIGN": {
          let n1 = n as PointNotationAttributes;

          notationDistanceList.push({
            notation: n1,
            distance: getClickedPosDistanceFromCellCenter(DotCoordinates, n1),
          });
          break;
        }
        case "EXPONENT": {
          let n1 = n as unknown as MultiCellAttributes;

          notationDistanceList.push({
            notation: n,
            distance: getClickedPosDistanceFromCellCenter(DotCoordinates, {
              col: n1.fromCol + 1,
              row: n1.row,
            }),
          });
          break;
        }
        case "IMAGE":
        case "TEXT":
          let n1 = n as RectNotationAttributes;
          notationDistanceList.push({
            notation: n1,
            distance: getClickedPosDistanceFromRectCenter(DotCoordinates, n1),
          });
          break;
        // case "SLOPELINE": {
        //   let n1 = n as SlopeLineNotationAttributes;
        //   notationDistanceList.push({
        //     notation: n1,
        //     distance: getClickedPosDistanceFromSlopeLine(DotCoordinates, n1),
        //   });
        //   break;
        // }
        case "SQRT": {
          let n1 = n as unknown as MultiCellAttributes;
          notationDistanceList.push({
            notation: n,
            distance: getClickedPosDistanceFromHorizontalLine(
              DotCoordinates,
              getMultiCellLineAttributes(n1),
            ),
          });
          break;
        }
      //   case "HORIZONTALLINE": {
      //     let n1 = n as HorizontalLineNotationAttributes;
      //     notationDistanceList.push({
      //       notation: n1,
      //       distance: getClickedPosDistanceFromHorizontalLine(
      //         DotCoordinates,
      //         n1,
      //       ),
      //     });
      //     break;
      //   }
      //   case "VERTICALLINE": {
      //     let n1 = n as VerticalLineNotationAttributes;
      //     notationDistanceList.push({
      //       notation: n1,
      //       distance: getClickedPosDistanceFromVerticalLine(DotCoordinates, n1),
      //     });
      //     break;
      //   }

      //   case "CONCAVECURVE":
      //   case "CONVEXCURVE": {
      //     let n1 = n as CurveNotationAttributes;
      //     let curveEnclosingTriangleCenterX = (n1.cpx + n1.p1x + n1.p2x) / 3;
      //     let curveEnclosingTriangleCenterY = (n1.cpy + n1.p1y + n1.p2y) / 3;

      //     notationDistanceList.push({
      //       notation: n1,
      //       distance: getClickedPosDistanceFromEnclosingTriangleCenter(
      //         DotCoordinates,
      //         {
      //           x: curveEnclosingTriangleCenterX,
      //           y: curveEnclosingTriangleCenterY,
      //         },
      //       ),
      //     });
      //     break;
      //   }
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
    point: CellAttributes,
  ): number {
    const clickedPosYDistanceFromCellCenter = Math.abs(
      DotCoordinates.y -
        cellStore.getSvgBoundingRect().top -
        point.row! * cellStore.getCellVerticalHeight() -
        cellStore.getCellVerticalHeight() / 2,
    );

    const clickedPosXDistanceFromCellCenter = Math.abs(
      DotCoordinates.x -
        cellStore.getSvgBoundingRect().left -
        point.col! * cellStore.getCellHorizontalWidth() -
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
        n1.fromRow * cellStore.getCellVerticalHeight() -
        ((n1.toRow - n1.fromRow) * cellStore.getCellVerticalHeight()) / 2,
    );

    const clickedPosXDistanceFromRectCenter = Math.abs(
      DotCoordinates.x -
        cellStore.getSvgBoundingRect().top -
        n1.fromCol * cellStore.getCellHorizontalWidth() -
        ((n1.toCol - n1.fromCol) * cellStore.getCellHorizontalWidth()) / 2,
    );

    return Math.log(
      Math.sqrt(
        Math.pow(clickedPosYDistanceFromRectCenter, 2) +
          Math.pow(clickedPosXDistanceFromRectCenter, 2),
      ),
    );
  }

  function getClickedPosDistanceFromExponent(
    DotCoordinates: DotCoordinates,
    n: MultiCellAttributes,
  ): number {
    const x = DotCoordinates.x - cellStore.getSvgBoundingRect().left;
    const y = DotCoordinates.y - cellStore.getSvgBoundingRect().top;

    const x1 = n.fromCol * cellStore.getCellHorizontalWidth();
    const x2 = n.toCol * cellStore.getCellHorizontalWidth();
    const y1 = n.row * cellStore.getCellVerticalHeight();

    const horizontalDistance = x < x1 ? x2 - x : x > x2 ? x - x2 : 0;
    const verticalDistance = Math.abs(y1 - y);

    const a = Math.pow(horizontalDistance, 2);
    const b = Math.pow(verticalDistance, 2);

    return Math.sqrt(a + b);
  }

  function getClickedPosDistanceFromHorizontalLine(
    DotCoordinates: DotCoordinates,
    n: HorizontalLineAttributes,
  ): number {
    const x = DotCoordinates.x - cellStore.getSvgBoundingRect().left;

    const y = DotCoordinates.y - cellStore.getSvgBoundingRect().top;

    const horizontalDistance = x < n.p1x ? n.p2x - x : x > n.p2x ? x - n.p2x : 0;

    const verticalDistance = Math.abs(n.py - y);

    const a = Math.pow(horizontalDistance, 2);
    const b = Math.pow(verticalDistance, 2);

    return Math.sqrt(a + b);
  }

  function getClickedPosDistanceFromSqrt(
    dotCoordinates: DotCoordinates,
    sqrtCoordinates: MultiCellAttributes,
  ): number {
    return getClickedPosDistanceFromHorizontalLine(
      dotCoordinates,
      getMultiCellLineAttributes(sqrtCoordinates),
    );
  }

  function getClickedPosDistanceFromVerticalLine(
    DotCoordinates: DotCoordinates,
    n: VerticalLineNotationAttributes,
  ): number {
    const x = DotCoordinates.x - cellStore.getSvgBoundingRect().left;

    const y = DotCoordinates.y - cellStore.getSvgBoundingRect().top;

    const horizontalDistance = Math.abs(n.px - x);

    const verticalDistance =
      y < n.p1y ? n.p1y - DotCoordinates.y : y > n.p2y ? y - n.p2y : 0;

    const a = Math.pow(horizontalDistance, 2);
    const b = Math.pow(verticalDistance, 2);

    return Math.sqrt(a + b);
  }

  //https://en.wikipedia.org/wiki/Distance_from_a_point_to_a_line
  function getClickedPosDistanceFromSlopeLine(
    DotCoordinates: DotCoordinates,
    n: SlopeLineNotationAttributes,
  ): number {
    const x = DotCoordinates.x - cellStore.getSvgBoundingRect().left;

    const y = DotCoordinates.y - cellStore.getSvgBoundingRect().top;

    const nominator = Math.abs(
      (n.p2x - n.p1x) * (y - n.p1y) - (x - n.p1x) * (n.p2y - n.p1y),
    );

    const deNominator = Math.sqrt(
      Math.pow(n.p2x - n.p1x, 2) + Math.pow(n.p2y - n.p1y, 2),
    );

    return nominator / deNominator;
  }

  return {
    getClickedPosDistanceFromSlopeLine,
    getClickedPosDistanceFromVerticalLine,
    getClickedPosDistanceFromHorizontalLine,
    getClickedPosDistanceFromExponent,
    getClickedPosDistanceFromSqrt,
    getNotationAtCoordinates,
    getClickedCell,
    getRectCoordinatesOccupiedCells,
    getClickedCellTopLeftCoordinates,
    getRectAttributes,
    getMultiCellLineAttributes,
  };
}
