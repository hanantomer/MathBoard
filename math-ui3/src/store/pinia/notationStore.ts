// notations of current board(lesson, question or answers)
//  questions of current lesson
import { defineStore } from "pinia";
import { matrixDimensions, clonedNotationUUIdPrefix } from "common/globals";
import {
  Board,
  NotationAttributes,
  CellAttributes,
  RectCoordinates,
  PointNotationAttributes,
  RectNotationAttributes,
  LineNotationAttributes,
  CurveNotationAttributes,
  CircleNotationAttributes,
  isRect,
  isLine,
  isCurve,
  isCellNotationType,
  SqrtNotationAttributes,
} from "../../../../math-common/src/baseTypes";
import { BoardType } from "common/unions";
import { ref, computed } from "vue";
import { useCellStore } from "./cellStore";
import { cloneDeep } from "lodash";
import useNotationCellOccupationHelper from "../../helpers/notationCellOccupationHelper";

export const useNotationStore = defineStore("notation", () => {
  const cellOccupationHelper = useNotationCellOccupationHelper();

  let dotNotationOccupationMatrix: (String | null)[][] =
    cellOccupationHelper.createCellSingleNotationOccupationMatrix();
  let symbolNotationOccupationMatrix: (String | null)[][] =
    cellOccupationHelper.createCellSingleNotationOccupationMatrix();
  let cellRectNotationOccupationMatrix: (String | null)[][] =
    cellOccupationHelper.createCellSingleNotationOccupationMatrix();
  let cellLineNotationOccupationMatrix: Set<String>[][] =
    cellOccupationHelper.createCellMultipleNotationOccupationMatrix();

  const matrices = () => {
    return [
      dotNotationOccupationMatrix,
      symbolNotationOccupationMatrix,
      cellRectNotationOccupationMatrix,
      cellLineNotationOccupationMatrix,
    ];
  };

  const parent = ref<Board>({ uuid: "", type: "LESSON" });

  let notations = ref(<Map<String, NotationAttributes>>new Map());

  let copiedNotations = ref(<Map<String, NotationAttributes>>new Map());

  // Add undo/redo stacks
  const undoStack = ref<Map<String, NotationAttributes>[]>([]);
  const redoStack = ref<Map<String, NotationAttributes>[]>([]);
  const maxStackSize = 50; // Limit stack size to prevent memory issues

  function getSelectedNotations(): NotationAttributes[] {
    return Array.from(notations.value.values()).filter(
      (n) => n.selected === true,
    );
  }

  // create a copy set of notations from the selected.
  // the new set will be selected instead of the old
  function cloneSelectedNotations() {
    Array.from(getSelectedNotations()).forEach((n) => {
      n.selected = undefined;
      let newNotation: NotationAttributes = Object.assign(
        { ...n },
        {
          uuid: clonedNotationUUIdPrefix + n.uuid,
          selected: true,
        },
      );

      addNotation(newNotation, false, false);
    });
  }

  function clearNotationFromMatrices(uuid: string) {
    for (let i in matrices()) {
      cellOccupationHelper.clearNotationFromMatrix(uuid, matrices()[i]);
    }
  }

  function getParent() {
    return parent.value;
  }

  function getNotations(): NotationAttributes[] {
    return Array.from(notations.value.values());
  }

  function getPointNotations(): PointNotationAttributes[] {
    return Array.from(notations.value.values())
      .filter((n) => isCellNotationType(n.notationType))
      .map((n) => n as PointNotationAttributes);
  }

  function getRectNotations(): RectNotationAttributes[] {
    return Array.from(notations.value.values())
      .filter((n) => isRect(n.notationType))
      .map((n) => n as RectNotationAttributes);
  }

  function getLinetNotations(): NotationAttributes[] {
    return Array.from(notations.value.values())
      .filter((n) => isLine(n.notationType))
      .map((n) => n as RectNotationAttributes);
  }

  function getCurveNotations(): NotationAttributes[] {
    return Array.from(notations.value.values())
      .filter((n) => isCurve(n.notationType))
      .map((n) => n as RectNotationAttributes);
  }

  function getCopiedNotations(): NotationAttributes[] {
    return Array.from(copiedNotations.value.values());
  }

  function setNotations(newNotations: NotationAttributes[]) {
    newNotations.forEach((n) => {
      addNotation(n, true);
    });
  }

  function setCopiedNotations(newCopiedNotations: NotationAttributes[]) {
    copiedNotations.value.clear();
    newCopiedNotations.forEach((n) => {
      addCopiedNotation(n);
    });
  }

  function getNotation(uuid: String) {
    return notations.value.get(uuid);
  }

  // Helper to save current state to undo stack
  function saveState() {
    undoStack.value.push(cloneDeep(notations.value));
    if (undoStack.value.length > maxStackSize) {
      undoStack.value.shift(); // Remove oldest state
    }
    redoStack.value = []; // Clear redo stack when new action is performed
  }

  function addNotation(
    notation: NotationAttributes,
    doUpdateOccupationMatrix: boolean,
    preventOverwrite: boolean = true,
  ) {
    if (!notation.uuid) {
      console.error("addNotation: Notation uuid is undefined");
      return;
    }

    if (preventOverwrite && isCellNotationType(notation.notationType)) {
      const n = notation as PointNotationAttributes;
      const existingNotations = getNotationsAtCell({
        col: n.col,
        row: n.row,
      }).filter((nt) => isCellNotationType(nt.notationType));
      if (existingNotations.length > 0) {
        console.warn("addNotation: Cell already has a point notation", n);
        return false;
      }
    }

    saveState();
    notation.boardType = parent.value.type;
    notations.value.delete(notation.uuid);
    notations.value.set(notation.uuid, notation);
    if (doUpdateOccupationMatrix) {
      cellOccupationHelper.updateOccupationMatrix(
        notation,
        dotNotationOccupationMatrix,
        symbolNotationOccupationMatrix,
        cellLineNotationOccupationMatrix,
        cellRectNotationOccupationMatrix,
        false,
      );
    }
    return true;
  }

  function addCopiedNotation(notation: NotationAttributes) {
    notation.boardType = parent.value.type;
    copiedNotations.value.set(notation.uuid, notation);
  }

  function deleteNotation(uuid: string) {
    saveState();
    const notation = notations.value.get(uuid)!;

    switch (notation.notationType) {
      case "EXPONENT":
      case "LOGBASE":
      case "SIGN":
      case "SQRTSYMBOL":
      case "SYMBOL":
        if ((notation as PointNotationAttributes).value === ".") {
          cellOccupationHelper.updatePointOccupationMatrix(
            dotNotationOccupationMatrix,
            notations.value.get(uuid)! as PointNotationAttributes,
            true,
          );
        } else {
          cellOccupationHelper.updatePointOccupationMatrix(
            symbolNotationOccupationMatrix,
            notations.value.get(uuid)! as PointNotationAttributes,
            true,
          );
        }
        break;
      case "CURVE":
        cellOccupationHelper.updateCurveOccupationMatrix(
          cellLineNotationOccupationMatrix,
          notations.value.get(uuid)! as CurveNotationAttributes,
          true,
        );
        break;
      case "CIRCLE":
        cellOccupationHelper.updateCircleOccupationMatrix(
          cellRectNotationOccupationMatrix,
          notations.value.get(uuid)! as CircleNotationAttributes,
          true,
        );

      case "IMAGE":
      case "TEXT":
        cellOccupationHelper.updateRectOccupationMatrix(
          cellRectNotationOccupationMatrix,
          notations.value.get(uuid)! as RectNotationAttributes,
          true,
        );
        break;
    }

    notations.value.delete(uuid);
  }

  function clearNotations() {
    notations.value.clear();
    dotNotationOccupationMatrix =
      cellOccupationHelper.createCellSingleNotationOccupationMatrix();
    symbolNotationOccupationMatrix =
      cellOccupationHelper.createCellSingleNotationOccupationMatrix();
    cellRectNotationOccupationMatrix =
      cellOccupationHelper.createCellSingleNotationOccupationMatrix();
    cellLineNotationOccupationMatrix =
      cellOccupationHelper.createCellMultipleNotationOccupationMatrix();
  }

  function clearCopiedNotations() {
    copiedNotations.value.clear();
  }

  function selectNotation(uuid: string) {
    const notation = notations.value.get(uuid);

    if (!notation) {
      console.error("selectNotation: Notation not found with uuid:", uuid);
      return;
    }

    notation.selected = true;
  }

  function setParent(parentUUID: string, boardType: BoardType) {
    parent.value = { uuid: parentUUID, type: boardType };
  }

  function resetSelectedNotations() {
    Array.from(getSelectedNotations()).forEach((n) => (n.selected = false));
  }

  function getNotationsAtCell(cell: CellAttributes): NotationAttributes[] {
    if (cell.col == null || cell.col < 0) {
      throw new Error("invalid col:" + cell.col);
    }
    if (cell.row == null || cell.row < 0) {
      throw new Error("invalid col:" + cell.row);
    }

    const notationsAtCell: NotationAttributes[] = [];

    // Helper to add notation if it exists
    const addIfExists = (uuid: String | null) => {
      if (uuid && notations.value.get(uuid)) {
        notationsAtCell.push(notations.value.get(uuid)!);
      }
    };

    // Get from each matrix
    addIfExists(
      cellOccupationHelper.getDotNotationAtCell(
        dotNotationOccupationMatrix,
        cell.col,
        cell.row,
      ),
    );
    addIfExists(
      cellOccupationHelper.getSymbolNotationAtCell(
        symbolNotationOccupationMatrix,
        cell.col,
        cell.row,
      ),
    );
    addIfExists(
      cellOccupationHelper.getRectNotationAtCell(
        cellRectNotationOccupationMatrix,
        cell.col,
        cell.row,
      ),
    );

    return notationsAtCell;
  }

  function selectNotationsOfCells(areaCells: CellAttributes[]) {
    const notationsUUIDsToSelect = new Set<string>();

    for (let i = 0; i < areaCells.length; i++) {
      const notationsAtCell = getNotationsAtCell(areaCells[i]);
      for (let j = 0; j < notationsAtCell.length; j++) {
        if (notationsAtCell[j]) {
          notationsUUIDsToSelect.add(notationsAtCell[j].uuid);
        }
      }
    }

    notationsUUIDsToSelect.forEach((uuid) => {
      selectNotation(uuid);
    });
  }

  function selectNotationsOfRectCoordinates(rect: RectCoordinates) {
    getLinetNotations()
      .concat(getCurveNotations())
      .forEach((l) => {
        let doIntersects = true;
        switch (l.notationType) {
          case "SQRT":
            doIntersects = checkSqrtIntersection(
              l as SqrtNotationAttributes,
              rect,
            );
            break;
          case "DIVISIONLINE":
          case "LINE":
            doIntersects = checkLineIntersection(
              l as LineNotationAttributes,
              rect,
            );
            break;
          case "CURVE":
            doIntersects = checkCurveIntersection(
              l as CurveNotationAttributes,
              rect,
            );
            break;
        }
        if (doIntersects) {
          selectNotation(l.uuid);
        }
      });
  }

  function checkCurveIntersection(
    curve: CurveNotationAttributes,
    rect: RectCoordinates,
  ): boolean {
    const x1 = curve.p1x;
    const x2 = curve.p2x;
    const y1 = curve.p1y;
    const y2 = curve.p2y;

    // Check if the curve's bounding box intersects with the given rectangle
    if (Math.max(x1, x2) < rect.topLeft.x) return false;
    if (Math.min(x1, x2) > rect.bottomRight.x) return false;
    if (Math.max(y1, y2) < rect.topLeft.y) return false;
    if (Math.min(y1, y2) > rect.bottomRight.y) return false;
    return true;
  }

  function checkSqrtIntersection(
    sqrt: SqrtNotationAttributes,
    rect: RectCoordinates,
  ): boolean {
    // Move useCellStore inside the function
    const cellStore = useCellStore();
    const x1 = sqrt.fromCol * cellStore.getCellHorizontalWidth();
    const x2 = sqrt.toCol * cellStore.getCellHorizontalWidth();
    const y = sqrt.row * cellStore.getCellVerticalHeight();

    // Check if the sqrt notation intersects with the given rectangle
    if (Math.max(x1, x2) < rect.topLeft.x) return false;
    if (Math.min(x1, x2) > rect.bottomRight.x) return false;
    if (y < rect.topLeft.y) return false;
    if (y > rect.bottomRight.y) return false;
    return true;
  }

  function checkLineIntersection(
    line: LineNotationAttributes,
    rect: RectCoordinates,
  ): boolean {
    // First do quick rejection test using bounding box
    if (Math.max(line.p1x, line.p2x) < rect.topLeft.x) return false;
    if (Math.min(line.p1x, line.p2x) > rect.bottomRight.x) return false;
    if (Math.max(line.p1y, line.p2y) < rect.topLeft.y) return false;
    if (Math.min(line.p1y, line.p2y) > rect.bottomRight.y) return false;

    // Check if either endpoint is inside rectangle
    if (
      isPointInRect(line.p1x, line.p1y, rect) ||
      isPointInRect(line.p2x, line.p2y, rect)
    ) {
      return true;
    }

    // Check intersection with each edge of rectangle
    return (
      lineIntersectsLine(
        line.p1x,
        line.p1y,
        line.p2x,
        line.p2y,
        rect.topLeft.x,
        rect.topLeft.y,
        rect.bottomRight.x,
        rect.topLeft.y,
      ) || // Top edge
      lineIntersectsLine(
        line.p1x,
        line.p1y,
        line.p2x,
        line.p2y,
        rect.bottomRight.x,
        rect.topLeft.y,
        rect.bottomRight.x,
        rect.bottomRight.y,
      ) || // Right edge
      lineIntersectsLine(
        line.p1x,
        line.p1y,
        line.p2x,
        line.p2y,
        rect.bottomRight.x,
        rect.bottomRight.y,
        rect.topLeft.x,
        rect.bottomRight.y,
      ) || // Bottom edge
      lineIntersectsLine(
        line.p1x,
        line.p1y,
        line.p2x,
        line.p2y,
        rect.topLeft.x,
        rect.bottomRight.y,
        rect.topLeft.x,
        rect.topLeft.y,
      ) // Left edge
    );
  }

  function isPointInRect(x: number, y: number, rect: RectCoordinates): boolean {
    return (
      x >= rect.topLeft.x &&
      x <= rect.bottomRight.x &&
      y >= rect.topLeft.y &&
      y <= rect.bottomRight.y
    );
  }

  function lineIntersectsLine(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number,
    x4: number,
    y4: number,
  ): boolean {
    // Calculate the denominator
    const denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
    if (denom === 0) return false; // Lines are parallel

    // Calculate intersection parameters for both lines
    const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;
    const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;

    // Check if intersection occurs within both line segments
    return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
  }

  function hasSelectedNotations(): boolean {
    return getSelectedNotations().length > 0;
  }

  function isSymbolAdjecentToLine(
    cell: CellAttributes,
    maxDistance: number,
  ): boolean {
    if (cell.row === matrixDimensions.colsNum) return false;

    for (let i = cell.col; cell.col - i <= maxDistance; i--) {
      if (cellLineNotationOccupationMatrix[i][cell.row + 1].size > 0) {
        return true;
      }
    }

    return false;
  }

  function isSymbolPartOfFraction(cell: CellAttributes): boolean {
    return cellLineNotationOccupationMatrix[cell.col][cell.row + 1].size > 0;
  }

  // Add undo/redo functions
  function undo() {
    if (undoStack.value.length === 0) return;

    // Save current state to redo stack
    redoStack.value.push(cloneDeep(notations.value));

    // Restore previous state
    const previousState = undoStack.value.pop()!;
    notations.value = cloneDeep(previousState);

    // Rebuild occupation matrices
    rebuildOccupationMatrices();
  }

  function redo() {
    if (redoStack.value.length === 0) return;

    // Save current state to undo stack
    undoStack.value.push(cloneDeep(notations.value));

    // Restore next state
    const nextState = redoStack.value.pop()!;
    notations.value = cloneDeep(nextState);

    // Rebuild occupation matrices
    rebuildOccupationMatrices();
  }

  function rebuildOccupationMatrices() {
    dotNotationOccupationMatrix =
      cellOccupationHelper.createCellSingleNotationOccupationMatrix();
    symbolNotationOccupationMatrix =
      cellOccupationHelper.createCellSingleNotationOccupationMatrix();
    cellRectNotationOccupationMatrix =
      cellOccupationHelper.createCellSingleNotationOccupationMatrix();
    cellLineNotationOccupationMatrix =
      cellOccupationHelper.createCellMultipleNotationOccupationMatrix();

    Array.from(notations.value.values()).forEach((notation) => {
      cellOccupationHelper.updateOccupationMatrix(
        notation,
        dotNotationOccupationMatrix,
        symbolNotationOccupationMatrix,
        cellLineNotationOccupationMatrix,
        cellRectNotationOccupationMatrix,
        false,
      );
    });
  }

  return {
    addNotation,
    clearCopiedNotations,
    clearNotations,
    cloneSelectedNotations,
    clearNotationFromMatrices,
    deleteNotation,
    getCopiedNotations,
    getNotation,
    getNotations,
    getNotationsAtCell,
    getParent,
    getPointNotations,
    getRectNotations,
    getLinetNotations,
    getCurveNotations,
    getSelectedNotations,
    hasSelectedNotations,
    isSymbolAdjecentToLine,
    isSymbolPartOfFraction,
    resetSelectedNotations,
    selectNotation,
    selectNotationsOfCells,
    selectNotationsOfRectCoordinates,
    setCopiedNotations,
    setNotations,
    setParent,
    undo,
    redo,
    canUndo: computed(() => undoStack.value.length > 0),
    canRedo: computed(() => redoStack.value.length > 0),
  };
});
