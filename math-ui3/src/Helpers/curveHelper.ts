import { CurveAttributes } from "common/baseTypes";
import { useCellStore } from "../store/pinia/cellStore";
import { useEditModeStore } from "../store/pinia/editModeStore";

const cellStore = useCellStore();
const editModeStore = useEditModeStore();

const MIN_NUMBER_OF_POINTS = 3;
const MOUSE_MOVE_THROTTELING_INTERVAL = 3;

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
  p2y: 0,
};

let mouseMoveCount = 0;

export default function curveHelper() {
  function startCurveDrawing(e: MouseEvent) {
    const x = e.pageX - cellStore.getSvgBoundingRect().x;
    const y = e.pageY - cellStore.getSvgBoundingRect().y;
    visitedPoints = [];
    mouseMoveCount = 0;
    curveAttributes.p1x = curveAttributes.p2x = curveAttributes.cpx = x;
    curveAttributes.p1y = curveAttributes.p2y = curveAttributes.cpy = y;

    editModeStore.setNextEditMode();
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
      const stdSlopes1 = getStdDev(slopes.slice(0, i));
      console.debug(`stdSlopes1:` + stdSlopes1);

      const stdSlopes2 = getStdDev(slopes.slice(i, slopes.length - 1));
      console.debug(`stdSlopes2:` + stdSlopes2);

      const sumWeightedStd =
        (stdSlopes1 * i + stdSlopes2 * (slopes.length - i)) / slopes.length;
      console.debug(`sumWeightedStd:` + sumWeightedStd);

      if (minSumWeightedStd === 0 || minSumWeightedStd > sumWeightedStd) {
        minSumWeightedStd = sumWeightedStd;
        controlPointIndex = i;
        console.debug(`minSumWeightedStd:` + minSumWeightedStd);
        console.debug(`controlPointIndex:` + controlPointIndex);
      }
    }
    return controlPointIndex;
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
          slope: (prevPoint.y - point.y) / (point.x - prevPoint.x),
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

  function xIsGrowingOrEqual(xPos: number): boolean {
    if (xPos > visitedPoints[visitedPoints.length - 1].x) return true;
    return false;
  }

  function yIsGrowingOrEqual(yPos: number): boolean {
    // y axis is flipped
    if (yPos <= visitedPoints[visitedPoints.length - 1].y) return true;
    return false;
  }

  function secondDeraviateIsPositive(xPos: number, yPos: number): boolean {
    const prevPrevPoint = visitedPoints[visitedPoints.length - 2];
    const prevPoint = visitedPoints[visitedPoints.length - 1];

    const prevFirstDeraviate =
      (prevPrevPoint.y - prevPoint.y) / (prevPoint.x - prevPrevPoint.x);

    const currentFirstDeraviate = (prevPoint.y - yPos) / (xPos - prevPoint.x);

    console.debug(
      `ppdy: ${prevPrevPoint.y - prevPoint.y},
      ppdx:${prevPoint.x - prevPrevPoint.x}`,
    );

    console.debug(`
      pdy: ${prevPoint.y - yPos},
      pdx:${xPos - prevPoint.x}`);

    console.debug(
      `prevFirstDeraviate: ${prevFirstDeraviate},currentFirstDeraviate:${currentFirstDeraviate}`,
    );

    return currentFirstDeraviate >= prevFirstDeraviate;
  }

  function setCurvePoints(
    curveType: CurveType,
    xPos: number,
    yPos: number,
  ): boolean {
    // nothing done yet
    if (curveAttributes.p1x === 0 && curveAttributes.p1y === 0) {
      console.debug("not initialized");
      return false;
    }

    mouseMoveCount++;
    if (mouseMoveCount % MOUSE_MOVE_THROTTELING_INTERVAL !== 0) {
      //console.debug("throtteling:" + mouseMoveCount);
      return false; // throtteling mouse move events
    }

    if (visitedPoints.length > 0 && !xIsGrowingOrEqual(xPos)) {
      console.debug("x is not growing");
      return false;
    }

    if (visitedPoints.length > 0 && !yIsGrowingOrEqual(yPos)) {
      console.debug("y is not growing");
      return false;
    }

    if (
      visitedPoints.length > 1 &&
      curveType === "CONCAVE" &&
      !secondDeraviateIsPositive(xPos, yPos)
    ) {
      //console.debug("concave second deraviate is not positive");
      //return false;
    }

    if (
      visitedPoints.length > 1 &&
      curveType === "CONVEX" &&
      secondDeraviateIsPositive(xPos, yPos)
    ) {
      //console.debug("convex second deraviate is positive");
      //return false;
    }

    console.debug("point added:" + visitedPoints.length);
    visitedPoints.push({ x: xPos, y: yPos });

    return true;
  }

  function setCurveAttributes(
    curveType: CurveType,
    xPos: number,
    yPos: number,
  ) {
    if (visitedPoints.length < MIN_NUMBER_OF_POINTS) {
      //console.debug("min number of points not reached");
      return;
    }

    const points = visitedPoints; //getNormalizedPoints(visitedPoints);

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

  function updateCurve(
    curveType: CurveType,
    xPos: number,
    yPos: number,
  ): CurveAttributes {
    removePointsToTheRightOfX(xPos);

    setCurvePoints(curveType, xPos, yPos);

    setCurveAttributes(curveType, xPos, yPos);

    return curveAttributes;
  }

  function removePointsToTheRightOfX(xPos: number) {
    visitedPoints = visitedPoints.filter((p) => p.x <= xPos);
    console.debug(visitedPoints);
  }

  function getCurveAttributes() {
    return curveAttributes;
  }

  function endCurveDrawing() {
    curveAttributes.p1x =
      curveAttributes.p1y =
      curveAttributes.p1y =
      curveAttributes.p2y =
      curveAttributes.cpx =
      curveAttributes.cpy =
        0;
    visitedPoints = [];
  }

  function getVisitedPoints() {
    return visitedPoints;
  }

  return {
    startCurveDrawing,
    updateCurve,
    getCurveAttributes,
    getVisitedPoints,
    endCurveDrawing,
  };
}
