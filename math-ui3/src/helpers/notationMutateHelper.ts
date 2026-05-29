import useApiHelper from "../helpers/apiHelper";

import {
  PointNotationAttributes,
  RectNotationAttributes,
  ImageNotationAttributes,
  ImageNotationCreationAttributes,
  PointNotationCreationAttributes,
  RectNotationCreationAttributes,
  NotationCreationAttributes,
  LineNotationAttributes,
  CurveAttributes,
  CircleAttributes,
  LineAttributes,
  CurveNotationAttributes,
  CircleNotationAttributes,
  LineNotationCreationAttributes,
  CurveNotationCreationAttributes,
  CircleNotationCreationAttributes,
  AnnotationNotationCreationAttributes,
  SqrtNotationCreationAttributes,
  isCellNotationType,
  isRect,
  MultiCellAttributes,
  SqrtNotationAttributes,
  DotCoordinates,
  AnnotationNotationAttributes,
  FreeSketchAttributes,
  FreeSketchNotationAttributes,
  FreeSketchNotationCreationAttributes,
} from "common/baseTypes";

import { clonedNotationUUIdPrefix } from "common/globals";
import { LessonNotationAttributes } from "common/lessonTypes";
import { matrixDimensions } from "common/globals";
import { CellAttributes } from "common/baseTypes";
import { NotationType, SelectionMoveDirection } from "common/unions";
import { useUserStore } from "../store/pinia/userStore";
import { useNotationStore } from "../store/pinia/notationStore";
import { useCellStore } from "../store/pinia/cellStore";
import { useEditModeStore } from "../store/pinia/editModeStore";
import { useGlobalAlertStore } from "../store/pinia/globalAlertStore";
import useAuthorizationHelper from "./authorizationHelper";
import useUserOutgoingOperations from "./userOutgoingOperationsHelper";
import useMatrixCellHelper from "../helpers/matrixCellHelper";
import useScreenHelper from "../helpers/screenHelper";
import useNotationCellOccupationHelper from "../helpers/notationCellOccupationHelper";

import {
  NotationAttributes,
  RectAttributes,
  RectCoordinates,
} from "common/baseTypes";

import useSelectionHelper from "./selectionHelper";
import { viewportPointerPosition } from "./pointerCoordinateHelper";
import useImageHelper from "./imageHelper";
import {
  collapseNotationsToSelectedCell,
  pushNotationsFromSelectedCell,
} from "./notationCollapsePushHelper";
const selectionHelper = useSelectionHelper();

const matrixCellHelper = useMatrixCellHelper();
const screenHelper = useScreenHelper();
const cellOccupationHelper = useNotationCellOccupationHelper();
const userStore = useUserStore();
const apiHelper = useApiHelper();
const imageHelper = useImageHelper();
const notationStore = useNotationStore();
const cellStore = useCellStore();
const editModeStore = useEditModeStore();
const globalAlertStore = useGlobalAlertStore();
const authorizationHelper = useAuthorizationHelper();
const userOutgoingOperations = useUserOutgoingOperations();

const MAX_IMAGE_WIDTH = 1000;

let deleteKeyLock = false; // Add lock variable at the top with other variables
let spaceKeyLock = false;

function cellRectCoordinates(cell: CellAttributes): RectCoordinates {
  const cellStore = useCellStore();
  const left = cell.col * cellStore.getCellHorizontalWidth();
  const top = cell.row * cellStore.getCellVerticalHeight();
  return {
    topLeft: { x: left, y: top },
    bottomRight: {
      x: left + cellStore.getCellHorizontalWidth(),
      y: top + cellStore.getCellVerticalHeight(),
    },
  };
}

function isPointInRect(x: number, y: number, rect: RectCoordinates): boolean {
  return (
    x >= rect.topLeft.x &&
    x <= rect.bottomRight.x &&
    y >= rect.topLeft.y &&
    y <= rect.bottomRight.y
  );
}

function lineSegmentsIntersect(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number,
  x4: number,
  y4: number,
): boolean {
  const denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
  if (denom === 0) return false;
  const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;
  const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;
  return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
}

function lineNotationIntersectsCellRect(
  line: LineNotationAttributes,
  rect: RectCoordinates,
): boolean {
  if (Math.max(line.p1x, line.p2x) < rect.topLeft.x) return false;
  if (Math.min(line.p1x, line.p2x) > rect.bottomRight.x) return false;
  if (Math.max(line.p1y, line.p2y) < rect.topLeft.y) return false;
  if (Math.min(line.p1y, line.p2y) > rect.bottomRight.y) return false;

  if (
    isPointInRect(line.p1x, line.p1y, rect) ||
    isPointInRect(line.p2x, line.p2y, rect)
  ) {
    return true;
  }

  const { topLeft: tl, bottomRight: br } = rect;
  return (
    lineSegmentsIntersect(
      line.p1x,
      line.p1y,
      line.p2x,
      line.p2y,
      tl.x,
      tl.y,
      br.x,
      tl.y,
    ) ||
    lineSegmentsIntersect(
      line.p1x,
      line.p1y,
      line.p2x,
      line.p2y,
      br.x,
      tl.y,
      br.x,
      br.y,
    ) ||
    lineSegmentsIntersect(
      line.p1x,
      line.p1y,
      line.p2x,
      line.p2y,
      br.x,
      br.y,
      tl.x,
      br.y,
    ) ||
    lineSegmentsIntersect(
      line.p1x,
      line.p1y,
      line.p2x,
      line.p2y,
      tl.x,
      br.y,
      tl.x,
      tl.y,
    )
  );
}

function isSameMovingNotation(
  notationUuid: String,
  movingUuid: string,
): boolean {
  const a = String(notationUuid);
  const b = String(movingUuid);
  return (
    a === b ||
    a === clonedNotationUUIdPrefix + b ||
    b === clonedNotationUUIdPrefix + a
  );
}

function notationBlocksCellForMove(
  notation: NotationAttributes,
  cell: CellAttributes,
  movingUuid: string,
): boolean {
  if (isSameMovingNotation(notation.uuid, movingUuid)) {
    return false;
  }

  if (
    notation.notationType === "LINE" ||
    notation.notationType === "DIVISIONLINE"
  ) {
    return lineNotationIntersectsCellRect(
      notation as LineNotationAttributes,
      cellRectCoordinates(cell),
    );
  }

  return true;
}

function isCellOccupiedForMove(
  cell: CellAttributes,
  movingUuid: string,
): boolean {
  return notationStore
    .getNotationsAtCell(cell)
    .some((n) => notationBlocksCellForMove(n, cell, movingUuid));
}

export default function notationMutateHelper() {
  function pointAtCellCoordinates(
    n1: PointNotationAttributes,
    n2: CellAttributes,
    userUUId: string,
  ) {
    return n1.col == n2.col && n1.row == n2.row && n1.user.uuid === userUUId;
  }

  function pointAtRectCoordinates(
    pointNotation: PointNotationAttributes,
    rectCoordinates: RectAttributes,
    userUUId: string,
  ) {
    return (
      pointNotation.col >= rectCoordinates.fromCol &&
      pointNotation.col <= rectCoordinates.toCol &&
      pointNotation.row >= rectCoordinates.fromRow &&
      pointNotation.row <= rectCoordinates.toRow &&
      pointNotation.user.uuid == userUUId
    );
  }

  // rect
  function rectAtCellCoordinates(
    rectNotation: RectNotationAttributes,
    CellAttributes: CellAttributes,
    userUUId: string,
  ) {
    return (
      rectNotation.fromCol <= CellAttributes.col &&
      rectNotation.toCol >= CellAttributes.col &&
      rectNotation.fromRow <= CellAttributes.row &&
      rectNotation.toRow >= CellAttributes.row &&
      rectNotation.user.uuid == userUUId
    );
  }

  function rectAtRectCoordinates(
    rectNotation: RectNotationAttributes,
    rectCoordinates: RectAttributes,
    userUUId: string,
  ) {
    return (
      ((rectNotation.fromCol >= rectCoordinates.fromCol &&
        rectNotation.fromCol <= rectCoordinates.toCol) ||
        (rectNotation.toCol >= rectCoordinates.fromCol &&
          rectNotation.toCol <= rectCoordinates.toCol)) &&
      ((rectNotation.fromRow >= rectCoordinates.fromRow &&
        rectNotation.fromRow <= rectCoordinates.toRow) ||
        (rectNotation.toRow >= rectCoordinates.fromRow &&
          rectNotation.toRow <= rectCoordinates.toRow)) &&
      rectNotation.user.uuid == userUUId
    );
  }

  function findNotationsByCellCoordinates(cellCoordinates: CellAttributes) {
    let userUUId = getUserUUId();

    return notationStore
      .getNotations()
      .filter((n: NotationAttributes) =>
        n.notationType === "ANNOTATION" ||
        n.notationType === "EXPONENT" ||
        n.notationType === "SYMBOL" ||
        n.notationType === "SQRT" ||
        n.notationType === "SQRTSYMBOL"
          ? pointAtCellCoordinates(
              n as PointNotationAttributes,
              cellCoordinates,
              userUUId,
            )
          : n.notationType === "TEXT" || n.notationType === "IMAGE"
            ? rectAtCellCoordinates(
                n as RectNotationAttributes,
                cellCoordinates,
                userUUId,
              )
            : false,
      );
  }

  function findOverlapCellNotations(
    notation: PointNotationCreationAttributes,
  ): PointNotationAttributes[] | undefined {
    return notationStore
      .getPointNotations()
      .filter((n2: PointNotationAttributes) => {
        return pointAtCellCoordinates(
          notation as PointNotationAttributes,
          n2,
          getUserUUId(),
        );
      });
  }

  function findOverlapRectNotation(
    notation: RectNotationCreationAttributes,
  ): RectNotationAttributes | undefined {
    return notationStore
      .getRectNotations()
      .find((n2: RectNotationAttributes) => {
        return rectAtRectCoordinates(
          notation as RectNotationAttributes,
          n2,
          getUserUUId(),
        );
      });
  }

  function findOverlapNotationsOfAnyTypeButLine(
    notation: NotationCreationAttributes,
  ): NotationAttributes | undefined {
    return notationStore.getNotations().find((n2: NotationAttributes) => {
      if (isCellNotationType(n2.notationType))
        return (
          ((n2 as PointNotationAttributes).value !== "." &&
            (n2 as PointNotationAttributes).value !== "(" &&
            (n2 as PointNotationAttributes).value !== ")" &&
            pointAtCellCoordinates(
              notation as PointNotationAttributes,
              n2 as PointNotationAttributes,
              getUserUUId(),
            )) ??
          rectAtCellCoordinates(
            notation as RectNotationAttributes,
            n2 as PointNotationAttributes,
            getUserUUId(),
          )
        );

      if (isRect(n2.notationType))
        return (
          pointAtRectCoordinates(
            notation as PointNotationAttributes,
            n2 as RectNotationAttributes,
            getUserUUId(),
          ) ??
          rectAtRectCoordinates(
            notation as RectNotationAttributes,
            n2 as RectNotationAttributes,
            getUserUUId(),
          )
        );
    });
  }

  async function selectNotationByCell(CellAttributes: CellAttributes) {
    notationStore.resetSelectedNotations();
    findNotationsByCellCoordinates(CellAttributes).forEach(
      (n: NotationAttributes) => {
        notationStore.selectNotation(n.uuid);
      },
    );
  }

  async function selectNotation(uuid: string) {
    notationStore.selectNotation(uuid);
  }

  function moveSelectedNotationsAtPixelScale(
    deltaX: number,
    deltaY: number,
    keepOriginal: boolean,
  ): boolean {
    if (!authorizationHelper.canEdit()) return false;

    if (keepOriginal) {
      notationStore.cloneSelectedNotations();
    }

    notationStore.getSelectedNotations().forEach((n: NotationAttributes) => {
      switch (n.notationType) {
        case "DIVISIONLINE":
        case "LINE": {
          (n as LineNotationAttributes).p1x += deltaX;
          (n as LineNotationAttributes).p2x += deltaX;
          (n as LineNotationAttributes).p1y += deltaY;
          (n as LineNotationAttributes).p2y += deltaY;
          break;
        }
        case "CURVE": {
          (n as CurveNotationAttributes).p1x += deltaX;
          (n as CurveNotationAttributes).p2x += deltaX;
          (n as CurveNotationAttributes).p1y += deltaY;
          (n as CurveNotationAttributes).p2y += deltaY;
          (n as CurveNotationAttributes).cpx += deltaX;
          (n as CurveNotationAttributes).cpy += deltaY;
          break;
        }
        case "CIRCLE": {
          (n as CircleNotationAttributes).cx += deltaX;
          (n as CircleNotationAttributes).cy += deltaY;
          break;
        }

        case "FREESKETCH": {
          (n as FreeSketchNotationAttributes).points = (
            n as FreeSketchNotationAttributes
          ).points.map((p) => ({
            x: p.x + deltaX,
            y: p.y + deltaY,
          }));
          break;
        }

        case "ANNOTATION": {
          (n as AnnotationNotationAttributes).x += deltaX;
          (n as AnnotationNotationAttributes).y += deltaY;
          break;
        }
      }
      notationStore.addNotation(n, true, true);
    });
    return true;
  }

  function moveSelectedNotationsAtCellScale(
    deltaCol: number,
    deltaRow: number,
    keepOriginal: boolean,
  ): boolean {
    if (!authorizationHelper.canEdit()) return false;

    if (keepOriginal) {
      notationStore.cloneSelectedNotations();
    }

    notationStore.getSelectedNotations().forEach((n: NotationAttributes) => {
      const deltaX = deltaCol * cellStore.getCellHorizontalWidth();
      const deltaY = deltaRow * cellStore.getCellVerticalHeight();
      switch (n.notationType) {
        case "EXPONENT":
        case "LOGBASE":
        case "SQRTSYMBOL":
        case "SYMBOL": {
          (n as PointNotationAttributes).col += deltaCol;
          (n as PointNotationAttributes).row += deltaRow;
          break;
        }
        case "LINE":
        case "DIVISIONLINE":
          (n as unknown as LineAttributes).p1x += deltaX;
          (n as unknown as LineAttributes).p2x += deltaX;
          (n as unknown as LineAttributes).p1y += deltaY;
          (n as unknown as LineAttributes).p2y += deltaY;
          break;

        case "CURVE":
          (n as unknown as CurveAttributes).p1x += deltaX;
          (n as unknown as CurveAttributes).p2x += deltaX;
          (n as unknown as CurveAttributes).p1y += deltaY;
          (n as unknown as CurveAttributes).p2y += deltaY;
          (n as unknown as CurveAttributes).cpx += deltaX;
          (n as unknown as CurveAttributes).cpy += deltaY;

        case "CIRCLE":
          (n as unknown as CircleAttributes).cx += deltaX;
          (n as unknown as CircleAttributes).cy += deltaY;
          break;

        case "ANNOTATION":
          (n as unknown as AnnotationNotationAttributes).x += deltaX;
          (n as unknown as AnnotationNotationAttributes).y += deltaY;
          break;

        case "SQRT": {
          (n as unknown as MultiCellAttributes).fromCol += deltaCol;
          (n as unknown as MultiCellAttributes).toCol += deltaCol;
          (n as unknown as MultiCellAttributes).row += deltaRow;
          break;
        }
        case "IMAGE":
        case "TEXT": {
          (n as RectNotationAttributes).fromCol += deltaCol;
          (n as RectNotationAttributes).toCol += deltaCol;
          (n as RectNotationAttributes).fromRow += deltaRow;
          (n as RectNotationAttributes).toRow += deltaRow;
          break;
        }
      }
    });
    return true;
  }

  function canMoveNotationToTarget(
    sourceNotation: NotationAttributes,
  ): boolean {
    // Point notations (single cell)
    if (isCellNotationType(sourceNotation.notationType)) {
      const sourceCellNotation = sourceNotation as PointNotationAttributes;
      if (
        sourceCellNotation.col < 0 ||
        sourceCellNotation.col > matrixDimensions.colsNum
      )
        return false;
      if (
        sourceCellNotation.row < 0 ||
        sourceCellNotation.row > matrixDimensions.rowsNum
      )
        return false;

      return !isCellOccupiedForMove(
        { col: sourceCellNotation.col, row: sourceCellNotation.row },
        String(sourceNotation.uuid),
      );
    }

    if (sourceNotation.notationType === "TEXT") {
      const sourceRectNotation = sourceNotation as RectNotationAttributes;

      if (
        sourceRectNotation.fromCol < 0 ||
        sourceRectNotation.toCol > matrixDimensions.colsNum
      )
        return false;
      if (
        sourceRectNotation.fromRow < 0 ||
        sourceRectNotation.toRow > matrixDimensions.rowsNum
      )
        return false;

      const movingUuid = String(sourceRectNotation.uuid);
      for (
        let col = sourceRectNotation.fromCol;
        col <= sourceRectNotation.toCol;
        col++
      ) {
        for (
          let row = sourceRectNotation.fromRow;
          row <= sourceRectNotation.toRow;
          row++
        ) {
          if (isCellOccupiedForMove({ col, row }, movingUuid)) {
            return false;
          }
        }
      }
      return true;
    }

    if (sourceNotation.notationType === "IMAGE") {
      const sourceImageNotation = sourceNotation as ImageNotationAttributes;

      if (
        sourceImageNotation.fromCol < 0 ||
        sourceImageNotation.toCol > matrixDimensions.colsNum
      )
        return false;
      if (
        sourceImageNotation.fromRow < 0 ||
        sourceImageNotation.toRow > matrixDimensions.rowsNum
      )
        return false;

      const movingUuid = String(sourceImageNotation.uuid);
      const { minCol, maxCol, minRow, maxRow } =
        cellOccupationHelper.getImageOccupiedCellRange(sourceImageNotation);
      for (let col = minCol; col <= maxCol; col++) {
        for (let row = minRow; row <= maxRow; row++) {
          if (isCellOccupiedForMove({ col, row }, movingUuid)) {
            return false;
          }
        }
      }
      return true;
    }

    // SQRT notations
    if (sourceNotation.notationType === "SQRT") {
      const sourceSqrtNotation = sourceNotation as SqrtNotationAttributes;
      const fromCol = sourceSqrtNotation.fromCol;
      const toCol = sourceSqrtNotation.toCol;
      const row = sourceSqrtNotation.row;

      if (fromCol < 0 || toCol > matrixDimensions.colsNum) return false;
      if (row < 0 || row > matrixDimensions.rowsNum) return false;

      return true;
    }

    // Lines, curves, circles, annotations (pixel-based) — no cell collision check needed
    return true;
  }

  async function saveMovedNotations(moveDirection: SelectionMoveDirection) {
    if (!authorizationHelper.canEdit()) return false;

    const notations = getSelectedNotationsSortedByDirection(moveDirection);

    notationStore.beginUndoGroup();
    try {
      for (let i in notations) {
        const n = notations[i];
        notationStore.clearNotationFromMatrices(n.uuid);
      }

      ///TODO handle also move by key
      for (let i in notations) {
        const n = notations[i];
        if (!canMoveNotationToTarget(n)) {
          await revertMoveNotatios();
          return false;
        }
      }

      if (!notations || notations.length === 0) return false;

      // Check if these are cloned notations that need to be inserted
      const isClonedNotation =
        notations[0].uuid.indexOf(clonedNotationUUIdPrefix) === 0;

      if (isClonedNotation) {
        await insertMovedNotations(notations);
      } else {
        await updateMovedNotations(notations);
      }
      return true;
    } finally {
      notationStore.endUndoGroup();
    }
  }

  async function revertMoveNotatios() {
    notationStore.getSelectedNotations().forEach(async (n) => {
      const isClonedNotation = n.uuid.indexOf(clonedNotationUUIdPrefix) === 0;

      if (isClonedNotation) {
        notationStore.deleteNotation(n.uuid);
      } else {
        const reloadedNotation = await apiHelper.getNotation(
          n.notationType,
          n.boardType,
          n.uuid,
        );
        notationStore.addNotation(reloadedNotation, true, false);
      }
    });
  }

  async function insertMovedNotations(notations: NotationAttributes[]) {
    await Promise.all(
      notations.map(async (notation) => {
        notationStore.deleteNotation(notation.uuid);

        delete (notation as any).uuid;

        if ((notation as any).lesson) {
          (notation as any).parentUUId = (notation as any).lesson.uuid;
          delete (notation as any).lesson;
        }

        if ((notation as any).question) {
          (notation as any).parentUUId = (notation as any).question.uuid;
          delete (notation as any).question;
        }

        if ((notation as any).answer) {
          (notation as any).parentUUId = (notation as any).answer.uuid;
          delete (notation as any).answer;
        }

        addNotation(notation) as any;
      }),
    );
  }

  async function updateMovedNotations(notations: NotationAttributes[]) {
    await Promise.all(
      notations.map(async (notation) => {
        const attributes = getNotationCoordinates(notation);
        if (!attributes) return;
        updateNotation(notation);
      }),
    );
  }

  function getNotationCoordinates(notation: any) {
    const cooerdinates =
      // point
      "col" in notation
        ? {
            col: (notation as any)["col"],
            row: (notation as any)["row"],
          }
        : // line
          "fromCol" in notation && "row" in notation
          ? {
              fromCol: (notation as any)["fromCol"],
              toCol: (notation as any)["toCol"],
              row: (notation as any)["row"],
            }
          : // rect
            "fromRow" in notation && "fromCol" in notation
            ? {
                fromCol: (notation as any)["fromCol"],
                toCol: (notation as any)["toCol"],
                fromRow: (notation as any)["fromRow"],
                toRow: (notation as any)["toRow"],
              }
            : // horizontal line
              "p1x" in notation && "p2x" in notation && "py" in notation
              ? {
                  p1x: (notation as any)["p1x"],
                  p2x: (notation as any)["p2x"],
                  py: (notation as any)["py"],
                }
              : // vertical line
                "px" in notation && "p1y" in notation && "p2y" in notation
                ? {
                    px: (notation as any)["px"],
                    p1y: (notation as any)["p1y"],
                    p2y: (notation as any)["p2y"],
                  }
                : // sloped line
                  "p1x" in notation &&
                    "p2x" in notation &&
                    "p1y" in notation &&
                    "p2y" in notation
                  ? {
                      p1x: (notation as any)["p1x"],
                      p2x: (notation as any)["p2x"],
                      p1y: (notation as any)["p1y"],
                      p2y: (notation as any)["p2y"],
                    }
                  : // sloped line
                    "p1x" in notation &&
                      "p2x" in notation &&
                      "p1y" in notation &&
                      "p2y" in notation &&
                      "cpx" in notation &&
                      "cpy" in notation
                    ? {
                        p1x: (notation as any)["p1x"],
                        p2x: (notation as any)["p2x"],
                        p1y: (notation as any)["p1y"],
                        p2y: (notation as any)["p2y"],
                        cpx: (notation as any)["cpx"],
                        cpy: (notation as any)["cpy"],
                      }
                    : // circle
                      "cx" in notation && "cy" in notation && "r" in notation
                      ? {
                          cx: Math.round((notation as any)["cx"]),
                          cy: Math.round((notation as any)["cy"]),
                          r: Math.round((notation as any)["r"]),
                        }
                      : // free sketch
                        "points" in notation &&
                          Array.isArray((notation as any)["points"])
                        ? {
                            points: (notation as any)["points"],
                          }
                        : // annotation
                          "x" in notation && "y" in notation
                          ? {
                              x: Math.round((notation as any)["x"]),
                              y: Math.round((notation as any)["y"]),
                            }
                          : null;

    return cooerdinates;
  }

  // sort selected notations that we first update the outer and the the inner
  // in order to avoid integrity constraint violation
  // for example: if we move 2 notations to the left, we must first update the left one
  // or the noation to the right will try to occupy the same cell of the left one.
  function getSelectedNotationsSortedByDirection(
    moveDirection: SelectionMoveDirection,
  ) {
    return moveDirection === "LEFT"
      ? notationStore
          .getSelectedNotations()
          .sort(
            (n1: any, n2: any) =>
              (n1.col ?? n1.fromCol) - (n2.col ?? n2.fromCol),
          )
      : moveDirection === "RIGHT"
        ? notationStore
            .getSelectedNotations()
            .sort(
              (n1: any, n2: any) =>
                (n2.col ?? n2.fromCol) - (n1.col ?? n1.fromCol),
            )
        : moveDirection === "TOP"
          ? notationStore
              .getSelectedNotations()
              .sort(
                (n1: any, n2: any) =>
                  (n1.row ?? n1.fromRow) - (n2.row ?? n2.fromRow),
              )
          : moveDirection === "BOTTOM"
            ? notationStore
                .getSelectedNotations()
                .sort(
                  (n1: any, n2: any) =>
                    (n2.row ?? n2.fromRow) - (n1.row ?? n1.fromRow),
                )
            : notationStore.getSelectedNotations();
  }

  async function updateSqrtNotation(
    sqrtNotation: SqrtNotationAttributes,
  ): Promise<string> {
    if (!authorizationHelper.canEdit()) return sqrtNotation.uuid;
    transposeSqrtCoordinatesIfNeeded(sqrtNotation);
    await apiHelper.updateSqrtNotationAttributes(sqrtNotation);
    notationStore.addNotation(sqrtNotation, true, true);
    userOutgoingOperations.syncOutgoingUpdateNotation(sqrtNotation);
    return sqrtNotation.uuid;
  }

  async function updateLineNotation(lineNotation: LineNotationAttributes) {
    if (!authorizationHelper.canEdit()) return;
    await apiHelper.updateLineNotationAttributes(lineNotation);
    notationStore.addNotation(lineNotation, true, true);
    userOutgoingOperations.syncOutgoingUpdateNotation(lineNotation);
  }

  async function updateCurveNotation(curveNotation: CurveNotationAttributes) {
    if (!authorizationHelper.canEdit()) return;
    await apiHelper.updateCurveNotationAttributes(curveNotation);
    notationStore.addNotation(curveNotation, true, true);
    userOutgoingOperations.syncOutgoingUpdateNotation(curveNotation);
  }

  async function updateCircleNotation(circle: CircleNotationAttributes) {
    if (!authorizationHelper.canEdit()) return;
    await apiHelper.updateCircleNotationAttributes(circle);
    notationStore.addNotation(circle, true, true);
    userOutgoingOperations.syncOutgoingUpdateNotation(circle);
  }

  async function updateFreeSketchNotation(
    freeSketch: FreeSketchNotationAttributes,
  ) {
    if (!authorizationHelper.canEdit()) return;
    await apiHelper.updateFreeSketchNotationAttributes(freeSketch);
    notationStore.addNotation(freeSketch, true, true);
    userOutgoingOperations.syncOutgoingUpdateNotation(freeSketch);
  }

  function addCellNotation(notation: PointNotationCreationAttributes) {
    if (!authorizationHelper.canEdit()) return;

    if (isCellInQuestionArea(notation)) {
      return;
    }

    let overlappedPointNotations = findOverlapCellNotations(notation);

    const overlapsWithDot =
      overlappedPointNotations &&
      overlappedPointNotations.find((n) => n.value === ".");

    const nonDotOvelappedNotation =
      overlappedPointNotations &&
      overlappedPointNotations.filter((n) => n.value !== ".");

    const noationIsDot = notation.value === ".";

    if (overlapsWithDot && noationIsDot) {
      return;
    }

    // update
    if (
      !noationIsDot &&
      nonDotOvelappedNotation &&
      nonDotOvelappedNotation.length > 0
    ) {
      return updateFromExistingNotation(nonDotOvelappedNotation[0], notation);
    }

    let overlappedAnyTypeNotation: NotationAttributes | undefined =
      findOverlapNotationsOfAnyTypeButLine(notation);

    // don't allow override of other type notation
    if (overlappedAnyTypeNotation) {
      return;
    }

    addNotation(notation);
  }

  function addLineNotation(
    lineAttributes: LineAttributes,
    notationType: NotationType = "LINE",
  ): Promise<string> {
    if (!authorizationHelper.canEdit()) {
      return Promise.resolve("");
    }

    let lineNotation: LineNotationCreationAttributes = {
      ...lineAttributes,
      boardType: notationStore.getParent().type,
      parentUUId: notationStore.getParent().uuid,
      notationType: notationType,
      user: userStore.getCurrentUser()!,
      color: null,
    };

    return addNotation(lineNotation);
  }

  function updateFromExistingNotation(
    existingNotation: NotationAttributes,
    notation: NotationCreationAttributes,
  ) {
    if (!authorizationHelper.canEdit()) return;

    // dont update a question notation from within answer and vice versa
    if (existingNotation.boardType !== notation.boardType) {
      return;
    }

    setNotationAttributes(existingNotation, notation);

    apiHelper.updateNotationValue(existingNotation);

    notationStore.addNotation(existingNotation, true, true);

    userOutgoingOperations.syncOutgoingUpdateNotation(existingNotation);
  }

  async function addNotation(
    notation: NotationCreationAttributes,
  ): Promise<string> {
    if (notation.boardType === "LESSON" && !authorizationHelper.canEdit()) {
      return "";
    }

    try {
      const newNotation = await apiHelper.addNotation(notation);
      newNotation.notationType = notation.notationType;
      notationStore.addNotation(newNotation, true, true);

      // sync to other participants
      if (notationStore.getParent().type === "LESSON") {
        userOutgoingOperations.syncOutgoingAddNotation(newNotation);
      }
      return newNotation.uuid;
    } catch (error) {
      console.error("Error adding notation:", error);
      return "";
    }
  }

  function setNotationAttributes(
    existingNotation: NotationAttributes,
    notation: NotationCreationAttributes,
  ) {
    switch (existingNotation.notationType) {
      case "ANNOTATION":
      case "EXPONENT":
      case "SQRTSYMBOL":
      case "SYMBOL": {
        (existingNotation as PointNotationAttributes).col = (
          notation as PointNotationAttributes
        ).col;
        (existingNotation as PointNotationAttributes).row = (
          notation as PointNotationAttributes
        ).row;
        (existingNotation as PointNotationAttributes).value = (
          notation as PointNotationAttributes
        ).value;
        break;
      }
      case "DIVISIONLINE":
      case "LINE": {
        const n1 = existingNotation as LineNotationAttributes;
        const n = notation as LineNotationAttributes;

        n1.p1x = n.p1x;
        n1.p2x = n.p2x;
        n1.p1y = n.p1y;
        n1.p2y = n.p2y;

        break;
      }

      case "IMAGE":
      case "TEXT": {
        const n1 = existingNotation as RectNotationAttributes;
        const n = notation as RectNotationAttributes;

        n1.fromCol = n.fromCol;
        n1.toCol = n.toCol;
        n1.fromRow = n.fromRow;
        n1.toRow = n.toRow;

        break;
      }
    }
  }

  // return true if 1. student in question and 2. notation coordinates are within question area
  function isNotationInQuestionArea(
    notation: NotationAttributes | null,
    delatX: number,
    delatY: number,
  ): boolean {
    if (!notation) return false;
    switch (notation.notationType) {
      case "EXPONENT":
      case "ANNOTATION":
      case "SQRTSYMBOL":
      case "SYMBOL": {
        let pointNotation = notation as PointNotationAttributes;
        return (
          notation?.boardType === "ANSWER" &&
          !userStore.isTeacher() &&
          notationStore
            .getNotationsAtCell({
              col: pointNotation.col + delatX,
              row: pointNotation.row + delatY,
            })
            ?.find((n: NotationAttributes) => n.boardType == "QUESTION") != null
        );
      }

      case "IMAGE":
      case "TEXT": {
        let rectNotation = notation as RectNotationAttributes;
        for (
          let col: number = rectNotation.fromCol + delatX;
          col <= rectNotation.toCol + delatX;
          col++
        ) {
          for (
            let row: number = rectNotation.fromRow + delatY;
            row <= rectNotation.toRow + delatY;
            row++
          ) {
            if (
              notation?.boardType === "ANSWER" &&
              !userStore.isTeacher() &&
              notationStore
                .getNotationsAtCell({
                  col: col,
                  row: row,
                })
                ?.find((n: NotationAttributes) => n.boardType == "QUESTION") !=
                null
            )
              return true;
          }
        }
      }
    }
    return false;
  }

  function isCellInQuestionArea(
    pointAttributes: CellAttributes | null,
  ): boolean | null {
    return (
      notationStore.getParent().type == "ANSWER" &&
      !userStore.isTeacher() &&
      pointAttributes &&
      notationStore
        .getNotationsAtCell({
          col: pointAttributes.col,
          row: pointAttributes.row,
        })
        ?.find((n: NotationAttributes) => n.boardType == "QUESTION") != null
    );
  }

  function addMarkNotation(e: PointerEvent) {
    if (!authorizationHelper.canEdit()) return;

    let clickedCell = screenHelper.getCellByDotCoordinates(
      viewportPointerPosition(e),
    );

    if (!clickedCell) return;

    selectionHelper.setSelectedCell(clickedCell, false);

    if (editModeStore.getEditMode() == "CHECKMARK_STARTED") {
      addSymbolNotation("&#x2714");
      return;
    }

    if (editModeStore.getEditMode() == "SEMICHECKMARK_STARTED") {
      addSymbolNotation("&#x237B");
      return;
    }

    if (editModeStore.getEditMode() == "XMARK_STARTED") {
      addSymbolNotation("&#x2718");
      return;
    }
  }

  // function approveDeleteSelectedNotations() {
  //   globalAlertStore.open(
  //     "Confirm Deletion",
  //     "Are you sure you want to delete the selected notation(s)?",
  //     "warning",
  //     deleteSelectedNotations,
  //   );
  // }

  function addImageNotationByColAndRow(
    fromCol: number,
    toCol: number,
    fromRow: number,
    toRow: number,
    base64Value: string,
  ) {
    let notation: ImageNotationCreationAttributes = {
      fromCol: fromCol,
      toCol: toCol,
      fromRow: fromRow,
      toRow: toRow,
      value: base64Value,
      rotation: 0,
      boardType: notationStore.getParent().type,
      parentUUId: notationStore.getParent().uuid,
      notationType: "IMAGE",
      user: userStore.getCurrentUser()!,
    };

    addNotation(notation);

    cellStore.resetSelectedCell();
  }

  function addTextNotation(value: string, textCells: RectAttributes) {
    let notation: RectNotationCreationAttributes = {
      fromCol: textCells.fromCol,
      toCol: textCells.toCol,
      fromRow: textCells.fromRow,
      toRow: textCells.toRow,
      value: value,
      boardType: notationStore.getParent().type,
      parentUUId: notationStore.getParent().uuid,
      notationType: "TEXT",
      user: userStore.getCurrentUser()!,
    };

    addNotation(notation);
  }

  async function addAnnotationNotation(value: string, point: DotCoordinates) {
    let notation: AnnotationNotationCreationAttributes = {
      x: point.x,
      y: point.y,
      value: value,
      boardType: notationStore.getParent().type,
      parentUUId: notationStore.getParent().uuid,
      notationType: "ANNOTATION",
      user: userStore.getCurrentUser()!,
    };

    return addNotation(notation); /// TODO: check if need to check cell occupation
  }

  function addExponentNotation(exponent: string, clickedCell: CellAttributes) {
    let notation: PointNotationCreationAttributes = {
      col: clickedCell!.col,
      row: clickedCell!.row,
      value: exponent,
      boardType: notationStore.getParent().type,
      parentUUId: notationStore.getParent().uuid,
      notationType: "EXPONENT",
      user: userStore.getCurrentUser()!,
    };
    addCellNotation(notation);
    if (!clickedCell) return;
    matrixCellHelper.setNextCell(1, 0);
  }

  function addSymbolNotation(value: string) {
    const symbolCell = getSelectedCell();
    if (!symbolCell) return;

    const notationType = isLogBaseSymbol(symbolCell) ? "LOGBASE" : "SYMBOL";

    const notation: PointNotationCreationAttributes = {
      col: symbolCell.col,
      row: symbolCell.row,
      value: value,
      boardType: notationStore.getParent().type,
      parentUUId: notationStore.getParent().uuid,
      notationType: notationType,
      user: userStore.getCurrentUser()!,
    };

    addCellNotation(notation);

    if (notation.value !== ".") {
      matrixCellHelper.setNextCell(1, 0);
    }

    selectNotationByCell(cellStore.getSelectedCell()!);
  }

  function isLogBaseSymbol(symbolCell: CellAttributes): boolean {
    // Guard: can't have previous cell if at leftmost column
    if (symbolCell.col <= 1) {
      return false;
    }

    const previousCell: CellAttributes = {
      col: symbolCell.col - 1,
      row: symbolCell.row,
    };

    const previousNotations = notationStore.getNotationsAtCell(previousCell);
    return previousNotations.some(
      (n: any) => n.notationType === "SYMBOL" && n.value === "log",
    );
  }

  function getSelectedCell(): CellAttributes | null {
    if (notationStore.getSelectedNotations().length) {
      let point =
        notationStore.getSelectedNotations()[0] as PointNotationAttributes;
      return { col: point.col, row: point.row };
    }

    return cellStore.getSelectedCell();
  }

  function addSqrtNotation(
    sqrtAttributes: MultiCellAttributes,
  ): Promise<string> {
    transposeSqrtCoordinatesIfNeeded(sqrtAttributes);

    let sqrtNotation: SqrtNotationCreationAttributes = {
      fromCol: sqrtAttributes.fromCol,
      toCol: sqrtAttributes.toCol,
      row: sqrtAttributes.row,
      boardType: notationStore.getParent().type,
      parentUUId: notationStore.getParent().uuid,
      notationType: "SQRT",
      user: userStore.getCurrentUser()!,
    };

    return addNotation(sqrtNotation);
  }

  async function addCurveNotation(
    curveAttributes: CurveAttributes,
  ): Promise<string> {
    let curveNotation: CurveNotationCreationAttributes = {
      p1x: curveAttributes.p1x,
      p2x: curveAttributes.p2x,
      p1y: curveAttributes.p1y,
      p2y: curveAttributes.p2y,
      cpx: curveAttributes.cpx,
      cpy: curveAttributes.cpy,
      boardType: notationStore.getParent().type,
      parentUUId: notationStore.getParent().uuid,
      notationType: "CURVE",
      user: userStore.getCurrentUser()!,
    };
    return await addNotation(curveNotation);
  }

  async function addCircleNotation(
    circleAttributes: CircleAttributes,
  ): Promise<string> {
    let circleNotation: CircleNotationCreationAttributes = {
      cx: circleAttributes.cx,
      cy: circleAttributes.cy,
      r: circleAttributes.r,
      boardType: notationStore.getParent().type,
      parentUUId: notationStore.getParent().uuid,
      notationType: "CIRCLE",
      user: userStore.getCurrentUser()!,
    };
    return addNotation(circleNotation);
  }

  async function addFreeSketchNotation(
    freeSketchAttributes: FreeSketchAttributes,
  ): Promise<string> {
    let freeSketchNotation: FreeSketchNotationCreationAttributes = {
      points: freeSketchAttributes.points,
      boardType: notationStore.getParent().type,
      parentUUId: notationStore.getParent().uuid,
      notationType: "FREESKETCH",
      user: userStore.getCurrentUser()!,
    };
    return await addNotation(freeSketchNotation);
  }

  function cloneNotation(notation: Readonly<NotationAttributes>) {
    let clonedNotation = { ...notation } as any;
    clonedNotation.id = undefined;
    delete clonedNotation.uuid;
    clonedNotation.parentUUId = notationStore.getParent().uuid; // in case you paste from lesson to question, parent will be taken from the target

    switch (notation.notationType) {
      case "SQRT":
      case "DIVISIONLINE":
      case "LINE":
        return addLineNotation(clonedNotation);
      case "CURVE":
        return addCurveNotation(clonedNotation);
      case "CIRCLE":
        return addCircleNotation(clonedNotation);
      case "FREESKETCH":
        return addFreeSketchNotation(clonedNotation);
      case "ANNOTATION":
      case "SQRTSYMBOL":
      case "SYMBOL":
        return addCellNotation(clonedNotation);
      case "IMAGE":
      case "TEXT":
        return addNotation(clonedNotation);
    }
  }

  function getUserUUId(): string {
    return userStore.getCurrentUser()!.uuid;
  }

  function transposeSqrtCoordinatesIfNeeded(notation: MultiCellAttributes) {
    if (notation.fromCol > notation.toCol) {
      const fromCol = notation.fromCol;
      notation.fromCol = notation.toCol;
      notation.toCol = fromCol;
    }
  }

  async function updateNotation(notation: NotationAttributes) {
    if (!authorizationHelper.canEdit()) return;
    if (!notationStore.getNotation(notation.uuid)) return;

    notationStore.addNotation(notation, true, true);
    apiHelper.updateNotation(notation);
    userOutgoingOperations.syncOutgoingUpdateNotation(notation);
  }

  function rotateImageNotation(degrees: number) {
    if (!authorizationHelper.canEdit()) return;
    if (notationStore.getSelectedNotations().length !== 1) return;

    const selected = notationStore.getSelectedNotations()[0];
    if (selected.notationType !== "IMAGE") return;

    const imageNotation = selected as ImageNotationAttributes;
    const currentRotation = imageNotation.rotation ?? 0;
    imageNotation.rotation = (currentRotation + degrees + 360) % 360;
    updateNotation(imageNotation);
  }

  async function computeImageCellBounds(
    fromCol: number,
    fromRow: number,
    base64: string,
  ): Promise<{ toCol: number; toRow: number }> {
    const { width, height } = await imageHelper.getDimensionsFromBase64(base64);
    const displayWidth = Math.min(width, MAX_IMAGE_WIDTH);
    const displayHeight = height * (displayWidth / width);
    return {
      toCol:
        Math.ceil(displayWidth / cellStore.getCellHorizontalWidth()) + fromCol,
      toRow:
        Math.ceil(displayHeight / cellStore.getCellVerticalHeight()) + fromRow,
    };
  }

  function cancelImageCrop() {
    editModeStore.setEditMode("IMAGE_SELECTED");
  }

  async function applyImageCrop(
    imageNotation: ImageNotationAttributes,
    displayCrop: { x: number; y: number; width: number; height: number },
  ) {
    if (!authorizationHelper.canEdit()) return;

    const colW = cellStore.getCellHorizontalWidth();
    const rowH = cellStore.getCellVerticalHeight();
    const innerWidth = (imageNotation.toCol - imageNotation.fromCol + 1) * colW;
    const innerHeight =
      (imageNotation.toRow - imageNotation.fromRow + 1) * rowH;

    if (displayCrop.width <= 0 || displayCrop.height <= 0) return;

    const { width: srcW, height: srcH } =
      await imageHelper.getDimensionsFromBase64(imageNotation.value);
    const scaleX = srcW / innerWidth;
    const scaleY = srcH / innerHeight;

    notationStore.beginUndoGroup();
    try {
      const newBase64 = await imageHelper.cropBase64(imageNotation.value, {
        x: displayCrop.x * scaleX,
        y: displayCrop.y * scaleY,
        width: displayCrop.width * scaleX,
        height: displayCrop.height * scaleY,
      });

      const { toCol, toRow } = await computeImageCellBounds(
        imageNotation.fromCol,
        imageNotation.fromRow,
        newBase64,
      );

      const updated: ImageNotationAttributes = {
        ...imageNotation,
        value: newBase64,
        toCol,
        toRow,
        rotation: imageNotation.rotation ?? 0,
      };
      await updateNotation(updated);
      editModeStore.setEditMode("IMAGE_SELECTED");
    } finally {
      notationStore.endUndoGroup();
    }
  }

  async function updateNotations(notations: NotationAttributes[]) {
    if (!authorizationHelper.canEdit()) return;

    //await apiHelper.updateNotations(notations);

    for (const notation of notations) {
      if (!notationStore.getNotation(notation.uuid)) return;
      notationStore.addNotation(notation, true, true);
      await userOutgoingOperations.syncOutgoingUpdateNotation(notation);
    }
  }

  async function handlePushKey() {
    if (!authorizationHelper.canEdit()) return;

    // Check if function is already running
    if (spaceKeyLock) {
      return;
    }

    if (editModeStore.getEditMode() === "AREA_SELECTED") {
      return;
    }

    try {
      spaceKeyLock = true;

      await pushNotationsFromSelectedCell();
    } finally {
      // Always release the lock
      spaceKeyLock = false;
    }
  }

  async function deleteSelectedNotations() {
    if (!authorizationHelper.canEdit()) return;

    // Check if function is already running
    if (deleteKeyLock) {
      return;
    }

    notationStore.beginUndoGroup();
    try {
      try {
        deleteKeyLock = true;

        if (notationStore.getSelectedNotations().length) {
          notationStore
            .getSelectedNotations()
            .forEach(async (n: NotationAttributes) => {
              // from db
              await apiHelper.deleteNotation(n);
            });

          notationStore
            .getSelectedNotations()
            .forEach(async (n: NotationAttributes) => {
              //from store
              notationStore.deleteNotation(n.uuid);

              // publish
              if (notationStore.getParent().type === "LESSON") {
                userOutgoingOperations.syncOutgoingRemoveNotation(
                  n.uuid,
                  (n as LessonNotationAttributes).lesson.uuid,
                );
              }
            });
          return;
        }
      } finally {
        deleteKeyLock = false;
        editModeStore.setDefaultEditMode();
      }
    } finally {
      notationStore.endUndoGroup();
    }
  }

  async function addImageNotation(base64: string) {
    const { width, height } = await imageHelper.getDimensionsFromBase64(base64);

    if (!authorizationHelper.canEdit()) return;

    if (!cellStore.getSelectedCell()) return;

    const selectedCell: CellAttributes = cellStore.getSelectedCell();

    const { col: fromCol, row: fromRow } = selectedCell;

    // Limit image width to maximum 1000 pixels
    const displayWidth = Math.min(width, MAX_IMAGE_WIDTH);
    const displayHeight = height * (displayWidth / width);

    const toCol: number =
      Math.ceil(displayWidth / cellStore.getCellHorizontalWidth()) + fromCol;
    const toRow: number =
      Math.ceil(displayHeight / cellStore.getCellVerticalHeight()) + fromRow;

    addImageNotationByColAndRow(fromCol, toCol, fromRow, toRow, base64);
  }

  function addCartesianSystemAtClickedPoint(e: PointerEvent) {
    if (!authorizationHelper.canEdit()) return;
    let clickedCell = screenHelper.getCellByDotCoordinates(
      viewportPointerPosition(e),
    );
    if (!clickedCell) return;
    selectionHelper.setSelectedCell(clickedCell, false);

    const horizontalLinecellCoordinates = {
      x: Math.round(clickedCell.col * cellStore.getCellHorizontalWidth()),
      y: Math.round(clickedCell.row * cellStore.getCellVerticalHeight()),
    };

    addLineNotation(
      {
        p1x: horizontalLinecellCoordinates.x - 200,
        p1y: horizontalLinecellCoordinates.y,
        p2x: horizontalLinecellCoordinates.x + 200,
        p2y: horizontalLinecellCoordinates.y,
        dashed: false,
        arrowLeft: false,
        arrowRight: true,
      },
      "LINE",
    );

    addLineNotation(
      {
        p1x: horizontalLinecellCoordinates.x,
        p1y: horizontalLinecellCoordinates.y - 200,
        p2x: horizontalLinecellCoordinates.x,
        p2y: horizontalLinecellCoordinates.y + 200,
        dashed: false,
        arrowLeft: true,
        arrowRight: false,
      },
      "LINE",
    );

    cellStore.resetSelectedCell();
    editModeStore.setDefaultEditMode();
  }

  async function pasteNotations() {
    const selectedCell = cellStore.getSelectedCell();
    if (!selectedCell) return;

    notationStore.beginUndoGroup();
    try {
      let firstRow: number | null = null;
      let firstCol: number | null = null;

      notationStore.getCopiedNotations().forEach((n: NotationAttributes) => {
        switch (n.notationType) {
          case "SYMBOL":
          case "SQRTSYMBOL":
          case "EXPONENT":
          case "ANNOTATION": {
            const n1 = n as PointNotationAttributes;
            if (!firstRow) firstRow = n1.row;
            if (!firstCol) firstCol = n1.col;

            n1.col = selectedCell.col + n1.col - firstCol;
            n1.row = selectedCell.row + n1.row - firstRow;
            cloneNotation(n1);
            break;
          }

          case "SQRT": {
            let n1 = { ...n } as SqrtNotationAttributes;
            const numCols = n1.toCol - n1.fromCol;
            n1.fromCol = selectedCell.col;
            n1.toCol = n1.fromCol + numCols;
            n1.row = selectedCell.row;
            cloneNotation(n1);
            break;
          }
          case "DIVISIONLINE":
          case "LINE": {
            let n1 = { ...n } as LineNotationAttributes;
            const lineWidth = n1.p2x - n1.p1x;
            const lineHeight = n1.p2y - n1.p1y;
            n1.p1x = selectedCell.col * cellStore.getCellHorizontalWidth();
            n1.p2x = n1.p1x + lineWidth;
            n1.p1y = selectedCell.row * cellStore.getCellVerticalHeight();
            n1.p2y = n1.p1y + lineHeight;
            cloneNotation(n1);
            break;
          }

          case "IMAGE":
          case "TEXT": {
            let n1 = { ...n } as RectNotationAttributes;
            const rectWidth = n1.toCol - n1.fromCol;
            const rectHeight = n1.toRow - n1.fromRow;
            if (!firstRow) firstRow = n1.fromRow;
            if (!firstCol) firstCol = n1.fromCol;

            n1.fromCol = selectedCell.col + n1.fromCol - firstCol;
            n1.toCol = n1.fromCol + rectWidth;
            n1.fromRow = selectedCell.row + n1.fromRow - firstRow;
            n1.toRow = n1.fromRow + rectHeight;
            cloneNotation(n1);

            break;
          }

          case "CURVE": {
            let n1 = { ...n } as CurveNotationAttributes;

            const deltaX =
              selectedCell.col * cellStore.getCellHorizontalWidth() - n1.p1x;

            const deltaY =
              selectedCell.row * cellStore.getCellVerticalHeight() - n1.p1y;

            n1.p1x += deltaX;
            n1.p2x += deltaX;
            n1.p1y += deltaY;
            n1.p2y += deltaY;

            cloneNotation(n1);
            break;
          }
        }
      });

      notationStore.clearCopiedNotations();
    } finally {
      notationStore.endUndoGroup();
    }
  }

  return {
    addNotation,
    addCircleNotation,
    addCurveNotation,
    addFreeSketchNotation,
    addImageNotation,
    addMarkNotation,
    addLineNotation,
    addSymbolNotation,
    addTextNotation,
    addAnnotationNotation,
    addSqrtNotation,
    addExponentNotation,
    addCartesianSystemAtClickedPoint,
    cloneNotation,

    moveSelectedNotationsAtPixelScale,
    moveSelectedNotationsAtCellScale,

    isNotationInQuestionArea,
    isCellInQuestionArea,
    updateSqrtNotation,
    updateLineNotation,
    updateCurveNotation,
    updateCircleNotation,
    updateFreeSketchNotation,
    updateNotation,
    rotateImageNotation,
    cancelImageCrop,
    applyImageCrop,
    selectNotation,
    selectNotationByCell,

    pushNotationsFromSelectedCell,
    deleteSelectedNotations,
    pasteNotations,
    saveMovedNotations,
    collapseNotationsToSelectedCell,
  };
}
