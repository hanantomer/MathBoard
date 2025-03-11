import { CurveAttributes } from "common/baseTypes";
import { useCellStore } from "../store/pinia/cellStore";
import { useEditModeStore } from "../store/pinia/editModeStore";

const cellStore = useCellStore();
const editModeStore = useEditModeStore();

const MIN_NUMBER_OF_POINTS = 6;
const MOUSE_MOVE_THROTTELING_INTERVAL = 2;

const visitedPointPrefix = "visitedPoint";

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
    removeVisiblePoints();

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
    leftPoint: Point,
    centerPoint: Point,
    rightPoint: Point,
    curveType: String,
  ): number {
    const coefficient = curveType === "CONCAVE" ? -1 : 1;

    const ac = Math.sqrt(
      Math.pow(centerPoint.x - leftPoint.x, 2) +
        Math.pow(centerPoint.y - leftPoint.y, 2),
    );

    const bc = Math.sqrt(
      Math.pow(centerPoint.x - rightPoint.x, 2) +
        Math.pow(centerPoint.y - rightPoint.y, 2),
    );

    const ab = Math.sqrt(
      Math.pow(leftPoint.x - rightPoint.x, 2) +
        Math.pow(leftPoint.y - rightPoint.y, 2),
    );

    const cosineGama =
      (Math.pow(ac, 2) + Math.pow(bc, 2) - Math.pow(ab, 2)) / (2 * ac * bc);

    return (1 - cosineGama * -1) * 550 * coefficient;
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

    setSlopesMovingAverage(slopes);

    return slopes;
  }

  function setSlopesMovingAverage(slopes: PointWithSlope[]) {
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

  function xIsGrowingOrEqual(xPos: number): boolean {
    if (xPos > visitedPoints[visitedPoints.length - 1].x) return true;
    return false;
  }

  function setCurvePoints(xPos: number, yPos: number): boolean {
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
      return;
    }

    const points = getSlopes(visitedPoints);

    if (points.length < MIN_NUMBER_OF_POINTS) {
      return;
    }

    //https://stackoverflow.com/questions/49274176/how-to-create-a-curved-svg-path-between-two-points

    const theta =
      Math.atan2(yPos - curveAttributes!.p1y, xPos - curveAttributes!.p1x) -
      Math.PI / 2; // calculate rciprocal to curve

    const leftPoint = points[0];

    const centerPoint = points[Math.round(points.length / 2)];

    const rightPoint = points[points.length - 1];

    let distanceFromCurve = calculateDistance(
      leftPoint,
      centerPoint,
      rightPoint,
      curveType,
    );

    curveAttributes!.cpx =
      centerPoint.x + Math.round(Math.cos(theta) * distanceFromCurve);
    curveAttributes!.cpy =
      centerPoint.y + Math.round(Math.sin(theta) * distanceFromCurve);

    curveAttributes!.p2x = xPos;
    curveAttributes!.p2y = yPos;
  }

  function updateCurve(
    curveType: CurveType,
    xPos: number,
    yPos: number,
  ): CurveAttributes {
    removePointsToTheRightOfX(xPos);

    setCurvePoints(xPos, yPos);

    setCurveAttributes(curveType, xPos, yPos);

    addVisiblePoint(xPos, yPos);

    return curveAttributes!;
  }

  function removePointsToTheRightOfX(xPos: number) {
    visitedPoints = visitedPoints.filter((p) => p.x <= xPos);
  }

  function getCurveAttributes() {
    return curveAttributes;
  }

  function getVisitedPoints() {
    return visitedPoints;
  }

  function removeVisiblePoints() {
    const visitedPointsCircleElements = document.querySelectorAll(
      `[id^=${visitedPointPrefix}]`,
    );
    visitedPointsCircleElements.forEach((vp) => vp.parentNode?.removeChild(vp));
  }

  function addVisiblePoint(xPos: number, yPos: number) {
    return;
    let svgns = "http://www.w3.org/2000/svg";
    let svgContainer = document.getElementById("curveSvgId")!;
    //    let visitedPoints = curveHelper.getVisitedPoints();

    //for (let i = 0; i < visitedPoints.length; i++) {
    const id = visitedPointPrefix + xPos + yPos;
    let circle = document.createElementNS(svgns, "circle");
    circle.setAttribute("id", id);
    //circle.setAttributeNS(null, "cx", visitedPoints[i].x.toString());
    //circle.setAttributeNS(null, "cy", visitedPoints[i].y.toString());
    circle.setAttributeNS(null, "cx", xPos.toString());
    circle.setAttributeNS(null, "cy", yPos.toString());

    circle.setAttributeNS(null, "r", "3");
    circle.setAttributeNS(
      null,
      "style",
      "fill: none; stroke: blue; stroke-width: 1px;",
    );
    svgContainer.appendChild(circle);
    //}
  }

  return {
    startCurveDrawing,
    updateCurve,
    getCurveAttributes,
    getVisitedPoints,
  };
}
