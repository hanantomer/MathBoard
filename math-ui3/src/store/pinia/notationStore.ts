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
  HorizontalLineNotationAttributes,
  VerticalLineNotationAttributes,
  SlopeLineNotationAttributes,
  CurveNotationAttributes,
  CircleNotationAttributes,
  isRect,
  isLine,
  isCellNotation,
  SqrtNotationAttributes,
  AnnotationNotationAttributes,
} from "common/baseTypes";
import { BoardType } from "common/unions";
import { ref } from "vue";
import { useCellStore } from "../../store/pinia/cellStore";
import useNotationCellOccupationHelper from "../../helpers/notationCellOccupationHelper";
const notationCellOccupationHelper = useNotationCellOccupationHelper();

export const useNotationStore = defineStore("notation", () => {
  // special occupation matrix for dot notation since it coexists in a cell
  // with other notations
  let dotNotationOccupationMatrix: (String | null)[][] =
    createCellSingleNotationOccupationMatrix();

  // cell can occupy one point only
  let symbolNotationOccupationMatrix: (String | null)[][] =
    createCellSingleNotationOccupationMatrix();

  // cell can occupy one rect only
  let cellRectNotationOccupationMatrix: (String | null)[][] =
    createCellSingleNotationOccupationMatrix();

  // cell can occupy multiple lines
  let cellLineNotationOccupationMatrix: Set<String>[][] =
    createCellMultipleNotationOccupationMatrix();

  const parent = ref<Board>({ uuid: "", type: "LESSON" });

  let notations = ref(<Map<String, NotationAttributes>>new Map());

  let copiedNotations = ref(<Map<String, NotationAttributes>>new Map());

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

      addNotation(newNotation, false);
    });
  }

  function getParent() {
    return parent.value;
  }

  function getNotations(): NotationAttributes[] {
    return Array.from(notations.value.values());
  }

  function getPointNotations(): PointNotationAttributes[] {
    return Array.from(notations.value.values())
      .filter((n) => isCellNotation(n.notationType))
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

  function addNotation(
    notation: NotationAttributes,
    doUpdateOccupationMatrix: boolean,
  ) {
    if (!notation.uuid) {
      console.error("addNotation: Notation uuid is undefined");
      return;
    }
    notation.boardType = parent.value.type;
    notations.value.set(notation.uuid, notation);

    if (doUpdateOccupationMatrix) {
      updateOccupationMatrix(
        notation,
        dotNotationOccupationMatrix,
        symbolNotationOccupationMatrix,
        cellLineNotationOccupationMatrix,
        cellRectNotationOccupationMatrix,
      );
    }
  }

  function addCopiedNotation(notation: NotationAttributes) {
    notation.boardType = parent.value.type;
    copiedNotations.value.set(notation.uuid, notation);
  }

  function deleteNotation(uuid: string) {
    const notation = notations.value.get(uuid)!;

    switch (notation.notationType) {
      case "EXPONENT":
      case "LOGBASE":
      case "SIGN":
      case "SQRTSYMBOL":
      case "SYMBOL":
        if ((notation as PointNotationAttributes).value === ".") {
          notationCellOccupationHelper.updatePointOccupationMatrix(
            dotNotationOccupationMatrix,
            notations.value.get(uuid)! as PointNotationAttributes,
            true,
          );
        } else {
          notationCellOccupationHelper.updatePointOccupationMatrix(
            symbolNotationOccupationMatrix,
            notations.value.get(uuid)! as PointNotationAttributes,
            true,
          );
        }
        break;
      case "CURVE":
        notationCellOccupationHelper.updateCurveOccupationMatrix(
          cellLineNotationOccupationMatrix,
          notations.value.get(uuid)! as CurveNotationAttributes,
          true,
        );
        break;
      case "CIRCLE":
        notationCellOccupationHelper.updateCircleOccupationMatrix(
          cellRectNotationOccupationMatrix,
          notations.value.get(uuid)! as CircleNotationAttributes,
          true,
        );

      case "IMAGE":
      case "TEXT":
        notationCellOccupationHelper.updateRectOccupationMatrix(
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
    dotNotationOccupationMatrix = createCellSingleNotationOccupationMatrix();
    symbolNotationOccupationMatrix = createCellSingleNotationOccupationMatrix();
    cellRectNotationOccupationMatrix =
      createCellSingleNotationOccupationMatrix();
    cellLineNotationOccupationMatrix =
      createCellMultipleNotationOccupationMatrix();
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
    const notationsAtCell: NotationAttributes[] = [];

    if (cell.col < 0) {
      throw new Error("invalid col:" + cell.col);
    }

    if (cell.row < 0) {
      throw new Error("invalid col:" + cell.row);
    }

    // point

    const dotNotationUUId = dotNotationOccupationMatrix[cell.col][
      cell.row
    ] as String;

    if (dotNotationUUId && notations.value.get(dotNotationUUId)) {
      notationsAtCell.push(
        notations.value.get(dotNotationUUId) as NotationAttributes,
      );
    }

    // symbol

    const symbolNotationUUId = symbolNotationOccupationMatrix[cell.col][
      cell.row
    ] as String;

    if (symbolNotationUUId && notations.value.get(symbolNotationUUId)) {
      notationsAtCell.push(
        notations.value.get(symbolNotationUUId) as NotationAttributes,
      );
    }

    // rect

    const rectNotationUUId = cellRectNotationOccupationMatrix[cell.col][
      cell.row
    ] as String;

    if (rectNotationUUId && notations.value.get(rectNotationUUId)) {
      notationsAtCell.push(
        notations.value.get(rectNotationUUId) as NotationAttributes,
      );
    }

    // line

    const lineNotationsUUIDs = cellLineNotationOccupationMatrix[cell.col][
      cell.row
    ] as Set<String>;

    if (lineNotationsUUIDs) {
      Array.from(lineNotationsUUIDs.values()).forEach((ln: any) => {
        if (notations.value.get(ln)) {
          notationsAtCell.push(notations.value.get(ln) as NotationAttributes);
        }
      });
    }
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
    getLinetNotations().forEach((l) => {
      let doIntersects = true;
      switch (l.notationType) {
        case "SQRT":
          doIntersects = checkSqrtIntersection(
            l as SqrtNotationAttributes,
            rect,
          );
          break;
        case "HORIZONTALLINE":
          doIntersects = checkHorizontalLineIntersection(
            l as HorizontalLineNotationAttributes,
            rect,
          );
          break;
        case "VERTICALLINE":
          doIntersects = checkVerticalLineIntersection(
            l as VerticalLineNotationAttributes,
            rect,
          );
          break;
        case "SLOPELINE":
          doIntersects = checkSlopeLineIntersection(
            l as SlopeLineNotationAttributes,
            rect,
          );
          break;
      }
      if (doIntersects) {
        selectNotation(l.uuid);
      }
    });
  }

  function checkSqrtIntersection(
    sqrt: SqrtNotationAttributes,
    rect: RectCoordinates,
  ): boolean {
    const cellStore = useCellStore();
    const x1 = sqrt.fromCol * cellStore.getCellHorizontalWidth();
    const x2 = sqrt.toCol * cellStore.getCellHorizontalWidth();
    const y = sqrt.row * cellStore.getCellVerticalHeight();

    // Check if the sqrt notation intersects with the given rectangle
    if (x1 > rect.bottomRight.x) return false; // sqrt right of rect
    if (x2 < rect.topLeft.x) return false; // sqrt left of rect
    if (y > rect.bottomRight.y) return false; // sqrt below rect
    if (y < rect.topLeft.y) return false; // sqrt above rect
    return true;
  }

  function checkHorizontalLineIntersection(
    line: HorizontalLineNotationAttributes,
    rect: RectCoordinates,
  ): boolean {
    if (line.p2x < rect.topLeft.x) return false; // line left of rect
    if (line.p1x > rect.bottomRight.x) return false; // line right of rect
    if (line.py > rect.bottomRight.y) return false; // line below rect
    if (line.py < rect.topLeft.y) return false; // line above rect
    return true;
  }

  function checkVerticalLineIntersection(
    line: VerticalLineNotationAttributes,
    rect: RectCoordinates,
  ): boolean {
    if (line.px < rect.topLeft.x) return false; // line left of rect
    if (line.px > rect.bottomRight.x) return false; // line right of rect
    if (line.p2y < rect.topLeft.y) return false; // line above rect
    if (line.p1y > rect.bottomRight.y) return false; // line below rect
    return true;
  }

  function checkSlopeLineIntersection(
    line: SlopeLineNotationAttributes,
    rect: RectCoordinates,
  ): boolean {
    if (line.p2x < rect.topLeft.x) return false; // line left of rect
    if (line.p1x > rect.bottomRight.x) return false; // line right of rect
    if (Math.min(line.p1y, line.p2y) > rect.bottomRight.y) return false; // line below rect
    if (Math.max(line.p1y, line.p2y) < rect.topLeft.y) return false; // line above rect
    return true;
  }

  function createCellSingleNotationOccupationMatrix(): (String | null)[][] {
    let matrix: (String | null)[][] = new Array();
    for (let i = 0; i < matrixDimensions.colsNum; i++) {
      matrix.push([]);
      for (let j = 0; j < matrixDimensions.rowsNum; j++) {
        matrix[i][j] = null;
      }
    }
    return matrix;
  }

  function createCellMultipleNotationOccupationMatrix(): Set<String>[][] {
    let matrix: Set<String>[][] = new Array();
    for (let i = 0; i < matrixDimensions.colsNum; i++) {
      matrix.push([]);
      for (let j = 0; j < matrixDimensions.rowsNum; j++) {
        (matrix[i][j] as Set<String>) = new Set<String>();
      }
    }
    return matrix;
  }

  function hasSelectedNotations(): boolean {
    return getSelectedNotations().length > 0;
  }

  function isSymbolAdjecentToHorizontalLine(
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

  function updateOccupationMatrix(
    notation: NotationAttributes,
    dotNotationOccupationMatrix: (String | null)[][],
    symbolNotationOccupationMatrix: (String | null)[][],
    cellLineNotationOccupationMatrix: Set<String>[][],
    cellRectNotationOccupationMatrix: (String | null)[][],
  ) {
    switch (notation.notationType) {
      case "EXPONENT":
      case "LOGBASE":
      case "SIGN":
      case "SQRTSYMBOL":
      case "SYMBOL":
        if ((notation as PointNotationAttributes).value === ".") {
          notationCellOccupationHelper.updatePointOccupationMatrix(
            dotNotationOccupationMatrix,
            notation as PointNotationAttributes,
            false,
          );
        } else {
          notationCellOccupationHelper.updatePointOccupationMatrix(
            symbolNotationOccupationMatrix,
            notation as PointNotationAttributes,
            false,
          );
        }
        break;

      case "ANNOTATION":
        notationCellOccupationHelper.updateAnnotationOccupationMatrix(
          symbolNotationOccupationMatrix,
          notation as AnnotationNotationAttributes,
          false,
        );

      case "TEXT":
      case "IMAGE":
        notationCellOccupationHelper.updateRectOccupationMatrix(
          cellRectNotationOccupationMatrix,
          notation as RectNotationAttributes,
          false,
        );
        break;

      case "CURVE":
        notationCellOccupationHelper.updateCurveOccupationMatrix(
          cellLineNotationOccupationMatrix,
          notation as CurveNotationAttributes,
          false,
        );
        break;
      case "CIRCLE":
        notationCellOccupationHelper.updateCircleOccupationMatrix(
          cellRectNotationOccupationMatrix,
          notation as CircleNotationAttributes,
          false,
        );
        break;
    }
  }

  return {
    addNotation,
    clearCopiedNotations,
    clearNotations,
    cloneSelectedNotations,
    deleteNotation,
    getCopiedNotations,
    getNotation,
    getNotations,
    getNotationsAtCell,
    getParent,
    getPointNotations,
    getRectNotations,
    getSelectedNotations,
    hasSelectedNotations,
    isSymbolAdjecentToHorizontalLine,
    isSymbolPartOfFraction,
    resetSelectedNotations,
    selectNotation,
    selectNotationsOfCells,
    selectNotationsOfRectCoordinates,
    setCopiedNotations,
    setNotations,
    setParent,
  };
});
