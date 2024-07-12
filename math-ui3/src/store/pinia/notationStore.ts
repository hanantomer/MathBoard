// notations of current board(lesson, question or answers)
//  questions of current lesson
import { defineStore } from "pinia";
import { matrixDimensions } from "common/globals";
import {
  Board,
  NotationAttributes,
  CellAttributes,
  PointNotationAttributes,
  RectNotationAttributes,
  HorizontalLineNotationAttributes,
  VerticalLineNotationAttributes,
  SlopeLineNotationAttributes,
  CurveNotationAttributes,
} from "common/baseTypes";
import { BoardType, NotationShape, NotationTypeShape } from "common/unions";
import { ref } from "vue";
import useNotationCellOccupationHelper from "../../helpers/notationCellOccupationHelper";

const notationCellOccupationHelper = useNotationCellOccupationHelper();

export const useNotationStore = defineStore("notation", () => {
  let cellVerticalHight = ref<number>();

  let cellPointNotationOccupationMatrix: (String | null)[][] =
    createCellSingleNotationOccupationMatrix();

  let cellRectNotationOccupationMatrix: (String | null)[][] =
    createCellSingleNotationOccupationMatrix();

  let cellLineNotationOccupationMatrix: (String | null)[][][] =
    createCellMultipleNotationOccupationMatrix();

  let parent = ref<Board>({ uuid: "", type: "LESSON" });

  let notations = ref(<Map<String, NotationAttributes>>new Map());

  let copiedNotations = ref(<Map<String, NotationAttributes>>new Map());

  let selectedCell = ref(<CellAttributes>{ col: 0, row: 0 });


  function getSelectedNotations(): NotationAttributes[] {
    return Array.from(notations.value.values()).filter(
      (n) => n.selected === true,
    );
  }

  // create a copy set of notations from the selected.
  // the new set will be selected instead of the old
  function cloneSelectedNotations() {
    Array.from(getSelectedNotations()).forEach((n) => {
      if (n.uuid.indexOf("_") === 0) return; // clone only after the first movement
      n.selected = undefined;
      let newNotation: NotationAttributes = Object.assign(
        { ...n },
        {
          uuid: "_" + n.uuid,
          selected: true,
        },
      );
      addNotation(newNotation);
    });
  }

  function getSelectedCell() {
    return selectedCell.value;
  }

  function getParent() {
    return parent.value;
  }

  function getNotationsByShape<T>(notationShape: NotationShape): T[] {
    return Array.from(notations.value.values()).filter((n) => {
      return (
        n.notationType && NotationTypeShape.get(n.notationType) == notationShape
      );
    }) as T[];
  }

  function getNotations(): NotationAttributes[] {
    return Array.from(notations.value.values());
  }

  function getPointNotations(): PointNotationAttributes[] {
    return Array.from(notations.value.values())
      .filter((n) => NotationTypeShape.get(n.notationType) === "POINT")
      .map((n) => n as PointNotationAttributes);
  }

  function getHorizontalLineNotations(): HorizontalLineNotationAttributes[] {
    return Array.from(notations.value.values())
      .filter(
        (n) => NotationTypeShape.get(n.notationType) === "HORIZONTAL_LINE",
      )
      .map((n) => n as HorizontalLineNotationAttributes);
  }

  function getVerticalLineNotations(): VerticalLineNotationAttributes[] {
    return Array.from(notations.value.values())
      .filter((n) => NotationTypeShape.get(n.notationType) === "VERTICAL_LINE")
      .map((n) => n as VerticalLineNotationAttributes);
  }

  function getSlopeLineNotations(): SlopeLineNotationAttributes[] {
    return Array.from(notations.value.values())
      .filter((n) => NotationTypeShape.get(n.notationType) === "SLOPE_LINE")
      .map((n) => n as SlopeLineNotationAttributes);
  }

  function getRectNotations(): RectNotationAttributes[] {
    return Array.from(notations.value.values())
      .filter((n) => NotationTypeShape.get(n.notationType) === "RECT")
      .map((n) => n as RectNotationAttributes);
  }

  function getCopiedNotations(): NotationAttributes[] {
    return Array.from(copiedNotations.value.values());
  }

  function setNotations(newNotations: NotationAttributes[]) {
    newNotations.forEach((n) => {
      addNotation(n);
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

  function addNotation(notation: NotationAttributes) {
    notation.boardType = parent.value.type;
    notations.value.set(notation.uuid, notation);

    switch (NotationTypeShape.get(notation.notationType)) {
      case "POINT":
        notationCellOccupationHelper.updatePointOccupationMatrix(
          cellPointNotationOccupationMatrix,
          notation as PointNotationAttributes,
          false,
        );
        break;

      case "HORIZONTAL_LINE":
        notationCellOccupationHelper.updateHorizontalLineOccupationMatrix(
          cellLineNotationOccupationMatrix,
          notation as HorizontalLineNotationAttributes,
          false,
        );
        break;

      case "VERTICAL_LINE":
        notationCellOccupationHelper.updateVerticalLineOccupationMatrix(
          cellLineNotationOccupationMatrix,
          notation as VerticalLineNotationAttributes,
          false,
        );
        break;

      case "SLOPE_LINE":
        notationCellOccupationHelper.updateSlopeLineOccupationMatrix(
          cellLineNotationOccupationMatrix,
          notation as SlopeLineNotationAttributes,
          false,
        );
        break;

      case "RECT":
        notationCellOccupationHelper.updateRectOccupationMatrix(
          cellRectNotationOccupationMatrix,
          notation as RectNotationAttributes,
          false,
        );
        break;

      case "CONCAVE_CURVE":
      case "CONVEX_CURVE":
        notationCellOccupationHelper.updateCurveOccupationMatrix(
          cellRectNotationOccupationMatrix,
          notation as CurveNotationAttributes,
          false,
        );
    }
  }

  function addCopiedNotation(notation: NotationAttributes) {
    notation.boardType = parent.value.type;
    copiedNotations.value.set(notation.uuid, notation);
  }

  function deleteNotation(uuid: string) {
    const notation = notations.value.get(uuid)!;

    switch (NotationTypeShape.get(notation.notationType)) {
      case "POINT":
        notationCellOccupationHelper.updatePointOccupationMatrix(
          cellPointNotationOccupationMatrix,
          notations.value.get(uuid)! as PointNotationAttributes,
          true,
        );
      case "HORIZONTAL_LINE":
        notationCellOccupationHelper.updateHorizontalLineOccupationMatrix(
          cellLineNotationOccupationMatrix,
          notations.value.get(uuid)! as HorizontalLineNotationAttributes,
          true,
        );
      case "VERTICAL_LINE":
        notationCellOccupationHelper.updateVerticalLineOccupationMatrix(
          cellLineNotationOccupationMatrix,
          notations.value.get(uuid)! as VerticalLineNotationAttributes,
          true,
        );
      case "SLOPE_LINE":
        notationCellOccupationHelper.updateSlopeLineOccupationMatrix(
          cellLineNotationOccupationMatrix,
          notations.value.get(uuid)! as SlopeLineNotationAttributes,
          true,
        );

      case "RECT":
        notationCellOccupationHelper.updateRectOccupationMatrix(
          cellRectNotationOccupationMatrix,
          notations.value.get(uuid)! as RectNotationAttributes,
          true,
        );
    }

    notations.value.delete(uuid);
  }

  function clearNotations() {
    notations.value.clear();
    cellPointNotationOccupationMatrix =
      createCellSingleNotationOccupationMatrix();
    cellRectNotationOccupationMatrix =
      createCellSingleNotationOccupationMatrix();
    cellLineNotationOccupationMatrix =
      createCellMultipleNotationOccupationMatrix();
  }

  function clearCopiedNotations() {
    copiedNotations.value.clear();
  }

  function selectCell(newSelectedCell: CellAttributes) {
    selectedCell.value = newSelectedCell;
  }

  function selectNotation(uuid: string) {
    const notation = notations.value.get(uuid);
    if (!notation) return;
    notation.selected = true;
  }

  function setParent(parentUUID: string, boardType: BoardType) {
    parent.value.uuid = parentUUID;
    parent.value.type = boardType;
  }

  function resetSelectedCell() {
    selectedCell.value = { col: -1, row: -1 };
  }

  function resetSelectedNotations() {
    Array.from(getSelectedNotations()).forEach((n) => (n.selected = false));
  }

  function isLineOrRectSelected() {
    return getSelectedNotations().find(
      (n) =>
        NotationTypeShape.get(n.notationType) == "HORIZONTAL_LINE" ||
        NotationTypeShape.get(n.notationType) == "VERTICAL_LINE" ||
        NotationTypeShape.get(n.notationType) == "SLOPE_LINE" ||
        NotationTypeShape.get(n.notationType) == "RECT",
    );
  }

  function getNotationsByCell(
    clickedCell: CellAttributes,
  ): NotationAttributes[] {
    let notationsAtCellPoint: NotationAttributes[] = [];

    if (clickedCell.col < 0) {
      console.error("invalid col:" + clickedCell.col);
      return [];
    }

    if (clickedCell.row < 0) {
      console.error("invalid col:" + clickedCell.row);
      return [];
    }

    const poinNotationUUId = cellPointNotationOccupationMatrix[clickedCell.col][
      clickedCell.row
    ] as String;

    const poinNotation = notations.value.get(
      poinNotationUUId,
    ) as NotationAttributes;

    if (poinNotation) {
      notationsAtCellPoint.push(poinNotation);
    } else {
      const rectNotationUUId = cellRectNotationOccupationMatrix[
        clickedCell.col
      ][clickedCell.row] as String;

      const rectNotation = notations.value.get(
        rectNotationUUId,
      ) as NotationAttributes;

      if (rectNotation) {
        notationsAtCellPoint.push(rectNotation);
      }
    }

    let lineNotationsUUIDs = cellLineNotationOccupationMatrix[clickedCell.col][
      clickedCell.row
    ] as String[];

    if (lineNotationsUUIDs) {
      lineNotationsUUIDs.forEach((ln) =>
        notationsAtCellPoint.push(
          notations.value.get(ln) as NotationAttributes,
        ),
      );
    }

    return notationsAtCellPoint;
  }

  function selectNotationsOfCells(areaCells: CellAttributes[]) {
    const notationsUUIDsToSelect = new Set<string>();

    for (let i = 0; i < areaCells.length; i++) {
      getNotationsByCell(areaCells[i]).forEach((n) => {
        notationsUUIDsToSelect.add(n.uuid);
      });
    }

    notationsUUIDsToSelect.forEach((uuid) => {
      notations.value.get(uuid)!.selected = true;
    });
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

  function createCellMultipleNotationOccupationMatrix(): (String | null)[][][] {
    let matrix: (String | null)[][][] = new Array();
    for (let i = 0; i < matrixDimensions.colsNum; i++) {
      matrix.push([]);
      for (let j = 0; j < matrixDimensions.rowsNum; j++) {
        matrix[i][j] = [];
      }
    }
    return matrix;
  }

  return {
    addNotation,
    getNotation,
    getNotations,
    getPointNotations,
    getHorizontalLineNotations,
    getVerticalLineNotations,
    getSlopeLineNotations,
    getRectNotations,
    getCopiedNotations,
    getNotationsByShape,
    getNotationsByCell,
    selectNotationsOfCells,
    getSelectedNotations,
    getParent,
    isLineOrRectSelected,
    setNotations,
    setCopiedNotations,
    selectNotation,
    setParent,
    resetSelectedNotations,
    deleteNotation,
    clearNotations,
    clearCopiedNotations,
    cloneSelectedNotations,
  };
});
