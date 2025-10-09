import {
  DotCoordinates,
  RectCoordinates,
  NotationAttributes,
  CellAttributes,
  PointNotationAttributes,
  RectNotationAttributes,
  LineNotationAttributes,
  CircleNotationAttributes,
  RectAttributes,
  LineAttributes,
  MultiCellAttributes,
} from "../../../math-common/src/baseTypes";

import { useNotationStore } from "../store/pinia/notationStore";
import { useCellStore } from "../store/pinia/cellStore";

const cellStore = useCellStore();

const maxNotationDistance = 6;
const maxCellDistance = 3;

export default function screenHelper() {
  type NotationDistance = { notation: NotationAttributes; distance: number };

  function getCellByDotCoordinates(
    dotCoordinates: DotCoordinates,
  ): CellAttributes {
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

  function getCellTopLeftCoordinates(
    clickedCell: CellAttributes,
  ): DotCoordinates {
    const cellWidth = cellStore.getCellHorizontalWidth();
    const cellHeight = cellStore.getCellVerticalHeight();

    return {
      x: Math.round(
        clickedCell.col * cellWidth + cellStore.getSvgBoundingRect().left,
      ),
      y: Math.round(
        clickedCell.row * cellHeight + cellStore.getSvgBoundingRect().top,
      ),
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

  function getMultiCellLineAttributes(n: MultiCellAttributes): LineAttributes {
    const x1 = cellStore.getCellHorizontalWidth() * n.fromCol;
    const x2 = cellStore.getCellHorizontalWidth() * n.toCol;
    const y = cellStore.getCellVerticalHeight() * n.row;

    return {
      p1x: x1,
      p2x: x2,
      p1y: y,
      p2y: y,
      dashed: false,
      arrowLeft: false,
      arrowRight: false,
    };
  }

  function getRectCoordinatesOccupiedCells(
    rectCoordinates: RectCoordinates,
  ): CellAttributes[] {
    let cells: CellAttributes[] = [];

    const areaFromCol = Math.floor(
      rectCoordinates.topLeft.x / cellStore.getCellHorizontalWidth(),
    );

    const areaToCol = Math.floor(
      rectCoordinates.bottomRight.x / cellStore.getCellHorizontalWidth(),
    );

    const areaFromRow = Math.round(
      rectCoordinates.topLeft.y / cellStore.getCellVerticalHeight(),
    );

    const areaToRow = Math.round(
      rectCoordinates.bottomRight.y / cellStore.getCellVerticalHeight(),
    );

    for (let i = areaFromCol; i <= areaToCol; i++) {
      for (let j = areaFromRow; j < areaToRow; j++) {
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

    const clickedCell = getCellByDotCoordinates(DotCoordinates);

    let notationsAtCell = notationStore.getNotationsAtCell(clickedCell);

    // If there are multiple notations and a mixture of rect/circle and non-rect/circle, remove rects and circles for lower priority
    if (
      notationsAtCell?.length > 1 &&
      notationsAtCell.some(
        (n) =>
          n.notationType === "IMAGE" ||
          n.notationType === "TEXT" ||
          n.notationType === "CIRCLE",
      ) &&
      notationsAtCell.some(
        (n) =>
          n.notationType !== "IMAGE" &&
          n.notationType !== "TEXT" &&
          n.notationType !== "CIRCLE",
      )
    ) {
      notationsAtCell = notationsAtCell.filter(
        (n) =>
          n.notationType !== "IMAGE" &&
          n.notationType !== "TEXT" &&
          n.notationType !== "CIRCLE",
      );
    }

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
        case "EXPONENT":
        case "LOGBASE":
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

        case "IMAGE":
        case "TEXT":
          let n1 = n as RectNotationAttributes;
          notationDistanceList.push({
            notation: n1,
            distance: getClickedPosDistanceFromRectCenter(DotCoordinates, n1),
          });
          break;
        case "SQRT": {
          let n1 = n as unknown as MultiCellAttributes;
          notationDistanceList.push({
            notation: n,
            distance: getClickedPosDistanceFromLine(
              DotCoordinates,
              getMultiCellLineAttributes(n1),
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

  function getClickedPosDistanceFromLineEdge(
    DotCoordinates: DotCoordinates,
    nx: number,
    ny: number,
  ): number {
    const x = DotCoordinates.x; // - cellStore.getSvgBoundingRect().left;

    const y = DotCoordinates.y; // - cellStore.getSvgBoundingRect().top;

    const horizontalDistance = x - nx;

    const verticalDistance = y - ny;

    const a = Math.pow(horizontalDistance, 2);
    const b = Math.pow(verticalDistance, 2);

    return Math.sqrt(a + b);
  }

  function getClickedPosDistanceFromSqrt(
    dotCoordinates: DotCoordinates,
    sqrtCoordinates: MultiCellAttributes,
  ): number {
    return getClickedPosDistanceFromLine(
      dotCoordinates,
      getMultiCellLineAttributes(sqrtCoordinates),
    );
  }

  //https://en.wikipedia.org/wiki/Distance_from_a_point_to_a_line
  function getClickedPosDistanceFromLine(
    DotCoordinates: DotCoordinates,
    n: LineAttributes,
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

  function getNearestCircleEdge(dot: DotCoordinates): DotCoordinates | null {
    const notationStore = useNotationStore();
    let nearPoint = null;

    const selectedNotationUUId = notationStore.getSelectedNotations()?.at(0)
      ?.uuid;

    notationStore
      .getNotations()
      .filter((n) => n.uuid !== selectedNotationUUId)
      .filter((n) => n.notationType === "CIRCLE")
      .forEach((n) => {
        const n1 = n as CircleNotationAttributes;
        let circleCircumferencePoint = getNearestPointOnCircleCircumference(
          dot,
          n1.cx,
          n1.cy,
          n1.r,
        );
        let distance = getPointsDistance(circleCircumferencePoint, dot);
        if (distance < maxNotationDistance) {
          nearPoint = circleCircumferencePoint;
          return;
        }
      });

    return nearPoint;
  }

  function getNearestLineEdge(dot: DotCoordinates): DotCoordinates | null {
    const notationStore = useNotationStore();
    let nearPoint = null;

    const selectedNotationUUId = notationStore.getSelectedNotations()?.at(0)
      ?.uuid;

    notationStore
      .getNotations()
      .filter((n) => n.uuid !== selectedNotationUUId)
      .filter((n) => n.notationType === "LINE")
      .forEach((n) => {
        const n1 = n as LineNotationAttributes;
        let distance = getClickedPosDistanceFromLineEdge(dot, n1.p1x, n1.p1y);
        if (distance < maxNotationDistance) {
          nearPoint = { x: n1.p1x, y: n1.p1y };
          return;
        }
        distance = getClickedPosDistanceFromLineEdge(dot, n1.p2x, n1.p2y);
        if (distance < maxNotationDistance) {
          nearPoint = { x: n1.p2x, y: n1.p2y };
          return;
        }
      });

    return nearPoint;
  }

  function getNearestPointOnCircleCircumference(
    dot: DotCoordinates,
    centerX: number,
    centerY: number,
    radius: number,
  ): DotCoordinates {
    // Vector from center to point
    const dx = dot.x - centerX;
    const dy = dot.y - centerY;

    // Calculate the distance from center to point
    const distance = Math.sqrt(dx * dx + dy * dy);

    // If distance is 0, return a point on the circle at 0 degrees
    if (distance === 0) {
      return {
        x: Math.round(centerX + radius),
        y: Math.round(centerY),
      };
    }

    // Calculate the scaling factor to project the point onto the circle
    const scale = radius / distance;

    // Return the point on the circumference
    return {
      x: Math.round(centerX + dx * scale),
      y: Math.round(centerY + dy * scale),
    };
  }

  function getNearestCellXBorder(dot: DotCoordinates): number | null {
    const cellWidth = cellStore.getCellHorizontalWidth();
    const cell = getCellByDotCoordinates({
      x: dot.x + cellStore.getSvgBoundingRect().left,
      y: dot.y + cellStore.getSvgBoundingRect().top,
    });
    const left =
      getCellTopLeftCoordinates(cell).x - cellStore.getSvgBoundingRect().left;
    const right = left + Math.floor(cellWidth);

    if (Math.abs(left - dot.x) < maxCellDistance) {
      return left;
    }

    if (Math.abs(right - dot.x) < maxCellDistance) {
      return right;
    }

    return null;
  }

  function getNearestCellYBorder(dot: DotCoordinates): number | null {
    const cellHeight = cellStore.getCellVerticalHeight();
    const cell = getCellByDotCoordinates({
      x: dot.x + cellStore.getSvgBoundingRect().left,
      y: dot.y + cellStore.getSvgBoundingRect().top,
    });
    const top =
      getCellTopLeftCoordinates(cell).y - cellStore.getSvgBoundingRect().top;
    const bottom = top + Math.round(cellHeight);

    if (Math.abs(top - dot.y) < maxCellDistance) {
      return top;
    }

    if (Math.abs(bottom - dot.y) < maxCellDistance) {
      return bottom;
    }

    return null;
  }

  function getPointsDistance(
    point1: DotCoordinates,
    point2: DotCoordinates,
  ): number {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return Math.round(Math.sqrt(dx * dx + dy * dy));
  }

  function getNearestNotationPoint(dot: DotCoordinates): DotCoordinates | null {
    const notationStore = useNotationStore();
    let nearestPoint: DotCoordinates | null = null;
    let minDistance = Infinity;

    const selectedNotationUUId = notationStore.getSelectedNotations()?.at(0)
      ?.uuid;

    notationStore
      .getNotations()
      .filter((n) => n.uuid !== selectedNotationUUId)
      .filter((n) => n.notationType === "LINE")
      .forEach((n) => {
        let candidatePoint: DotCoordinates | null = null;
        let distance = Infinity;
        const n1 = n as LineNotationAttributes;
        // Find the nearest point on the line segment to the dot
        candidatePoint = getNearestPointOnLine(dot, n1);
        distance = getPointsDistance(candidatePoint, dot);
        if (distance < maxNotationDistance && distance < minDistance) {
          minDistance = distance;
          nearestPoint = candidatePoint;
        }
      });

    return nearestPoint;
  }

  // Helper function: nearest point on a line segment to a dot
  function getNearestPointOnLine(
    dot: DotCoordinates,
    line: LineNotationAttributes,
  ): DotCoordinates {
    const { p1x, p1y, p2x, p2y } = line;
    const x0 = dot.x,
      y0 = dot.y;
    const x1 = p1x,
      y1 = p1y,
      x2 = p2x,
      y2 = p2y;

    const dx = x2 - x1;
    const dy = y2 - y1;
    if (dx === 0 && dy === 0) return { x: x1, y: y1 }; // Line is a point

    // Project point onto the line, clamped to the segment
    const t = ((x0 - x1) * dx + (y0 - y1) * dy) / (dx * dx + dy * dy);
    const tClamped = Math.max(0, Math.min(1, t));
    return {
      x: Math.round(x1 + tClamped * dx),
      y: Math.round(y1 + tClamped * dy),
    };
  }

  function getNotationTopLeft(notation: NotationAttributes): DotCoordinates {
    switch (notation.notationType) {
      case "IMAGE":
      case "TEXT": {
        const rect = notation as RectNotationAttributes;
        return {
          x:
            rect.fromCol * cellStore.getCellHorizontalWidth() +
            cellStore.getSvgBoundingRect().left,
          y:
            rect.fromRow * cellStore.getCellVerticalHeight() +
            cellStore.getSvgBoundingRect().top,
        };
      }
      case "CIRCLE": {
        const circle = notation as CircleNotationAttributes;
        return {
          x: circle.cx - circle.r + cellStore.getSvgBoundingRect().left,
          y: circle.cy - circle.r + cellStore.getSvgBoundingRect().top,
        };
      }
      case "LINE": {
        const line = notation as LineNotationAttributes;
        return {
          x: Math.min(line.p1x, line.p2x) + cellStore.getSvgBoundingRect().left,
          y: Math.min(line.p1y, line.p2y) + cellStore.getSvgBoundingRect().top,
        };
      }
      default: {
        const point = notation as PointNotationAttributes;
        return {
          x:
            point.col * cellStore.getCellHorizontalWidth() +
            cellStore.getSvgBoundingRect().left,
          y:
            point.row * cellStore.getCellVerticalHeight() +
            cellStore.getSvgBoundingRect().top,
        };
      }
    }
  }

  function getSelectedCellDotCoordinates(): DotCoordinates | null {
    const selectedCell = cellStore.getSelectedCell();
    if (!selectedCell) return null;

    return {
      x: Math.round(selectedCell.col * cellStore.getCellHorizontalWidth()) + 2,
      y: Math.round(selectedCell.row * cellStore.getCellVerticalHeight()) + 2,
    };
  }

  return {
    getClickedPosDistanceFromLine,
    getClickedPosDistanceFromExponent,
    getClickedPosDistanceFromSqrt,
    getNotationAtCoordinates,
    getCellByDotCoordinates,
    getRectCoordinatesOccupiedCells,
    getCellTopLeftCoordinates,
    getRectAttributes,
    getMultiCellLineAttributes,
    getNearestLineEdge,
    getNearestCircleEdge,
    getNearestCellXBorder,
    getNearestCellYBorder,
    getPointsDistance,
    getNearestNotationPoint,
    getNotationTopLeft,
    getSelectedCellDotCoordinates,
  };
}
