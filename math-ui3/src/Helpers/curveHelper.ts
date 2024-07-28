import {
  CurveAttributes,
} from "common/baseTypes";

const MIN_NUMBER_OF_POINTS = 3;

type Point = {
  x: number;
  y: number;
};

type PointWithSlope = {
  x: number;
  y: number;
  slope: number;
};

type CurveType = "CONCAVE" | "CONVEX";

let visitedPoints: Point[] = [];
const curveAttributes: CurveAttributes = {
  cpx: 0,
  cpy: 0,
  p1x: 0,
  p2x: 0,
  p1y: 0,
  p2y: 0
};
let mouseMoveCount = 0;

export default function curveHelper() {

  function startCurveDrawing(position: Point) {
    mouseMoveCount = 0;
    curveAttributes.p1x = position.x;
    curveAttributes.p1y = position.y;
  }

  function calculateDistance(
    normalizedSlopes: PointWithSlope[],
    controlPointIndex: number,
    curveType: String,
  ): number {
    const coeficient = curveType === "CONCAVE" ? -1 : 1;

    if (controlPointIndex === 0) {
      return 0;
    }

    if (normalizedSlopes.length <= 3) {
      return 0;
    }

    const avgSlopeUpToControlPoint =
      normalizedSlopes
        .slice(0, controlPointIndex + 1)
        .map((p) => p.slope)
        .reduce((a, b) => a + b) /
        controlPointIndex +
      1;

    const avgSlopeFromControlPoint =
      normalizedSlopes
        .slice(controlPointIndex + 1, normalizedSlopes.length)
        .map((p) => p.slope)
        .reduce((a, b) => a + b) /
        controlPointIndex +
      1;

    const slopeChange = Math.abs(
      avgSlopeFromControlPoint - avgSlopeUpToControlPoint,
    );

    return slopeChange < 0.01 /// TODO put magic numbers
      ? 0
      : slopeChange < 0.25
      ? 5 * coeficient
      : slopeChange < 0.5
      ? 7 * coeficient
      : slopeChange < 1
      ? 9 * coeficient
      : 12 * coeficient;
  }

  function getNormalizedConvexSlopes(
    slopes: PointWithSlope[],
  ): PointWithSlope[] {
    const normalizedSlopes: PointWithSlope[] = [];

    normalizedSlopes.push(slopes[0]);

    for (let i = 1; i < slopes.length - 1; i++) {
      normalizedSlopes.push(slopes[i]);
      let doNormalize = false;

      if (slopes[i].slope >= 0) {
        doNormalize = true;
      }

      // slopes are negative, verify it diminishes
      if (slopes[i].slope <= slopes[i - 1].slope && slopes[i - 1].slope !== 0) {
        doNormalize = true;
      }

      if (doNormalize) {
        normalizedSlopes[i].slope = slopes[i - 1].slope + 0.1;
      }
    }

    normalizedSlopes.push(slopes[slopes.length - 1]);

    return normalizedSlopes;
  }

  function getNormalizedConcaveSlopes(
    slopes: PointWithSlope[],
  ): PointWithSlope[] {
    const normalizedSlopes: PointWithSlope[] = [];

    normalizedSlopes.push(slopes[0]);

    for (let i = 1; i < slopes.length - 1; i++) {
      normalizedSlopes.push(slopes[i]);
      let doNormalize = false;

      if (slopes[i].slope >= 0) {
        doNormalize = true;
      }

      // slopes are negative, verify it increases
      if (slopes[i].slope >= slopes[i - 1].slope && slopes[i - 1].slope !== 0) {
        doNormalize = true;
      }

      if (doNormalize) {
        normalizedSlopes[i].slope = slopes[i - 1].slope - 0.1;
      }
    }

    normalizedSlopes.push(slopes[slopes.length - 1]);

    return normalizedSlopes;
  }

  function getControlPointIndex(
    normalizedPointsWithSlope: PointWithSlope[],
  ): number {
    let controlPointIndex: number = Math.round(
      normalizedPointsWithSlope.length / 2,
    );

    if (normalizedPointsWithSlope.length < MIN_NUMBER_OF_POINTS)
      return controlPointIndex;

    const slopes = normalizedPointsWithSlope.map((p) => p.slope);

    let minSumWeightedStd = 0;
    for (let i = 2; i < slopes.length - 2; i++) {
      //console.debug("i:" + i);

      const stdSlopes1 = getStdDev(slopes.slice(0, i));
      //console.debug("stdSlopes1:" + stdSlopes1);

      const stdSlopes2 = getStdDev(slopes.slice(i, slopes.length - 1));

      const sumWeightedStd =
        (stdSlopes1 * i + stdSlopes2 * (slopes.length - i)) / slopes.length;

      if (minSumWeightedStd === 0 || minSumWeightedStd > sumWeightedStd) {
        minSumWeightedStd = sumWeightedStd;
        controlPointIndex = i;
      }
    }
    return controlPointIndex;
  }

  // verify that x can grow only
  function getNormalizedPoints(points: Point[]) {
    const normalizedPoints = points;
    for (let i = 1; i < points.length; i++) {
      if (points[i].x <= points[i - 1].x) {
        points[i].x = points[i - 1].x + 1;
      }
    }
    return normalizedPoints;
  }

  function getSlopes(points: Point[]): PointWithSlope[] {
    const slopes: PointWithSlope[] = [];
    let prevPoint = { x: 0, y: 0 };
    for (let point of points) {
      if (prevPoint.x === 0) {
        slopes.push({ x: point.x, y: point.y, slope: 0 });
      } else {
        slopes.push({
          x: point.x,
          y: point.y,
          slope: (point.y - prevPoint.y) / (point.x - prevPoint.x),
        });
      }
      prevPoint = { x: point.x, y: point.y };
    }
    return slopes;
  }

  function getStdDev(arr: number[]) {
    const mean = arr.reduce((acc, val) => acc + val, 0) / arr.length;
    return Math.sqrt(
      arr
        .reduce(
          (acc: number[], val: number) => acc.concat((val - mean) ** 2),
          [],
        )
        .reduce((acc: number, val: number) => acc + val, 0) / arr.length,
    );
  }

  function xIsGrowing(xPos: number): boolean {
    if (xPos > visitedPoints[visitedPoints.length - 1].x) return true;
    return false;
  }

  function secondDeraviateIsPositive(xPos: number, yPos: number): boolean {
    const prevPrevPoint = visitedPoints[visitedPoints.length - 2];
    const prevPoint = visitedPoints[visitedPoints.length - 1];

    const prevFirstDeraviate =
      (prevPrevPoint.y - prevPoint.y) / (prevPoint.x - prevPrevPoint.x);

    const currentFirstDeraviate = (prevPoint.y - yPos) / (xPos - prevPoint.x);

    return currentFirstDeraviate >= prevFirstDeraviate;
  }

  function calculateCurveProperties(
    curveType: CurveType,
    xPos: number,
    yPos: number) {
    // nothing done yet
    //if (p1x === 0 && p1y === 0) {
    //  return;
    //}

    mouseMoveCount++;
    if (mouseMoveCount % 5/*TODO: magic number */ !== 0) return; // throtteling mouse move events

    if (visitedPoints.length > 0 && !xIsGrowing(xPos)) return;

    if (
      visitedPoints.length > 1 &&
      curveType === "CONCAVE" &&
      !secondDeraviateIsPositive(xPos, yPos)
    )
      return ;

    if (
      visitedPoints.length > 1 &&
      curveType === "CONVEX" &&
      secondDeraviateIsPositive(xPos, yPos)
    )
      return null;

    visitedPoints.push({ x: xPos, y: yPos }); // hold one y for each visited x

    if (visitedPoints.length < MIN_NUMBER_OF_POINTS) return;

    const points = getNormalizedPoints(visitedPoints);

    const slopes = getSlopes(points);

    const normalizedSlopes =
      curveType === "CONCAVE"
        ? getNormalizedConcaveSlopes(slopes)
        : getNormalizedConvexSlopes(slopes);

    let controlPointIndex = getControlPointIndex(normalizedSlopes);

    const theta =
      Math.atan2(yPos - curveAttributes.p1y, xPos - curveAttributes.p1x) -
      Math.PI / 2; // calculate rciprocal to curve
    const turningPoint = normalizedSlopes[controlPointIndex];

    const distanceFromCurve = calculateDistance(
      normalizedSlopes,
      controlPointIndex,
      curveType,
    );

    curveAttributes.cpx = turningPoint.x + distanceFromCurve * Math.cos(theta);
    curveAttributes.cpy = turningPoint.y + distanceFromCurve * Math.cos(theta);
    curveAttributes.p2x = xPos;
    curveAttributes.p2y = yPos;
  }

  function getCurveAttributes() {
    return curveAttributes
  }

  function resetCurveDrawing() {
    curveAttributes.p1x =
      curveAttributes.p1y =
      curveAttributes.p1y =
      curveAttributes.p2y =
      curveAttributes.cpx =
      curveAttributes.cpy =
        0;
    visitedPoints = [];
  }

  return {
    startCurveDrawing,
    calculateCurveProperties,
    getCurveAttributes,
    resetCurveDrawing,
  };
}
