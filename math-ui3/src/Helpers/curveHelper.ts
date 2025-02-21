import { CurveAttributes } from "common/baseTypes";
import { useCellStore } from "../store/pinia/cellStore";
import { useEditModeStore } from "../store/pinia/editModeStore";

const cellStore = useCellStore();
const editModeStore = useEditModeStore();

const MIN_NUMBER_OF_POINTS = 3;
const MOUSE_MOVE_THROTTELING_INTERVAL = 2;

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

let curveAttributes: CurveAttributes | undefined = undefined;

let mouseMoveCount = 0;

export default function curveHelper() {
  function initCurve() {
    visitedPoints = [];
    curveAttributes = {
      p1x: 0,
      p1y: 0,
      p2x: 0,
      p2y: 0,
      cpx: 0,
      cpy: 0,
    };
  }

  function startCurveDrawing(e: MouseEvent) {
    initCurve();

    const x = e.pageX - cellStore.getSvgBoundingRect().x;
    const y = e.pageY - cellStore.getSvgBoundingRect().y;
    visitedPoints = [];
    mouseMoveCount = 0;
    if (curveAttributes) {
      curveAttributes.p1x = curveAttributes.p2x = curveAttributes.cpx = x;
      curveAttributes.p1y = curveAttributes.p2y = curveAttributes.cpy = y;
    }

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

    return slopeChange * coeficient * 10;
  }

  function findPeakPoint(points: Point[]): number | null {
    if (points.length < 8) return null;

    const peakCandiaites = [];

    for (let i = 4; i < points.length - 4; i++) {
      if (
        (points[i - 3].y + points[i - 2].y + points[i - 1].y) / 3 >
          points[i].y &&
        points[points.length - 1].y - points[i].y + 10 >
          points[0].y - points[i].y &&
        (points[i + 3].y + points[i + 2].y + points[i + 1].y) / 3 > points[i].y
      ) {
        peakCandiaites.push(i);
      }
    }

    if (peakCandiaites.length > 1) {
      return getIndexOfLowestY(peakCandiaites, points);
    }

    return null;
  }

  /// TODO: change that to get avergae x of similiar points
  function getIndexOfLowestY(pointsIndex: number[], points: Point[]): number {
    return pointsIndex.reduce(
      (maxIndex, index) =>
        points[index].y < points[maxIndex].y ? index : maxIndex,
      0,
    );
  }

  function getControlPointIndex(
    normalizedPointsWithSlope: PointWithSlope[],
  ): number {
    const peakIndex = findPeakPoint(normalizedPointsWithSlope);

    if (peakIndex) {
      document.getElementById("controlPoint")!.setAttribute("fill", "red");
      return peakIndex;
    }
    document.getElementById("controlPoint")!.setAttribute("fill", "black");

    let controlPointIndex: number = Math.round(
      normalizedPointsWithSlope.length / 2,
    );

    if (normalizedPointsWithSlope.length < MIN_NUMBER_OF_POINTS)
      return controlPointIndex;

    const slopes = normalizedPointsWithSlope.map((p) => p.slope);

    let minSumWeightedStd = 0;
    for (let i = 2; i < slopes.length - 2; i++) {
      const stdSlopes1 = getStdDev(slopes.slice(0, i));
      //console.debug(`stdSlopes1:` + stdSlopes1);

      const stdSlopes2 = getStdDev(slopes.slice(i, slopes.length - 1));
      //console.debug(`stdSlopes2:` + stdSlopes2);

      const sumWeightedStd =
        (stdSlopes1 * i + stdSlopes2 * (slopes.length - i)) / slopes.length;
      //console.debug(`sumWeightedStd:` + sumWeightedStd);

      if (minSumWeightedStd === 0 || minSumWeightedStd > sumWeightedStd) {
        minSumWeightedStd = sumWeightedStd;
        controlPointIndex = i;
        //console.debug(`minSumWeightedStd:` + minSumWeightedStd);
        //console.debug(`controlPointIndex:` + controlPointIndex);
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

    setSlopesMoviongAverage(slopes);

    return slopes;
  }

  function setSlopesMoviongAverage(slopes: PointWithSlope[]) {
    const windowSize = 3;
    for (let i = 0; i < slopes.length; i++) {
      let sum = 0;
      let count = 0;
      for (
        let j = Math.max(0, i - windowSize);
        j <= Math.min(slopes.length - 1, i + windowSize);
        j++
      ) {
        sum += slopes[j].slope;
        count++;
      }
      slopes[i].slope = sum / count;
    }
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

  function setCurvePoints(
    curveType: CurveType,
    xPos: number,
    yPos: number,
  ): boolean {
    // nothing done yet
    if (curveAttributes!.p1x === 0 && curveAttributes!.p1y === 0) {
      console.debug("not initialized");
      return false;
    }

    mouseMoveCount++;
    if (mouseMoveCount % MOUSE_MOVE_THROTTELING_INTERVAL !== 0) {
      //console.debug("throtteling:" + mouseMoveCount);
      return false; // throtteling mouse move events
    }

    if (visitedPoints.length > 0 && !xIsGrowingOrEqual(xPos)) {
      //      console.debug("x is not growing");
      return false;
    }

    //console.debug("point added:" + visitedPoints.length);
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

    let controlPointIndex = getControlPointIndex(slopes);

    const theta =
      Math.atan2(yPos - curveAttributes!.p1y, xPos - curveAttributes!.p1x) -
      Math.PI / 2; // calculate rciprocal to curve
    const turningPoint = slopes[controlPointIndex];

    let distanceFromCurve = calculateDistance(
      slopes,
      controlPointIndex,
      curveType,
    );

    curveAttributes!.cpx = turningPoint.x + distanceFromCurve * Math.cos(theta);
    curveAttributes!.cpy = turningPoint.y + distanceFromCurve * Math.cos(theta);
    curveAttributes!.p2x = xPos;
    curveAttributes!.p2y = yPos;
  }

  function updateCurve(
    curveType: CurveType,
    xPos: number,
    yPos: number,
  ): CurveAttributes {
    removePointsToTheRightOfX(xPos);

    setCurvePoints(curveType, xPos, yPos);

    setCurveAttributes(curveType, xPos, yPos);

    return curveAttributes!;
  }

  function removePointsToTheRightOfX(xPos: number) {
    visitedPoints = visitedPoints.filter((p) => p.x <= xPos);
    //console.debug(visitedPoints);
  }

  function getCurveAttributes() {
    return curveAttributes;
  }

  function getVisitedPoints() {
    return visitedPoints;
  }

  return {
    startCurveDrawing,
    updateCurve,
    getCurveAttributes,
    getVisitedPoints,
  };
}
