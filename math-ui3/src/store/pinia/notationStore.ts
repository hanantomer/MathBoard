// notations of current board(lesson, question or answers)
//  questions of current lesson
import { defineStore } from "pinia";
import { matrixDimensions } from "common/globals";
import {
  Board,
  NotationAttributes,
  PointAttributes,
  PointNotationAttributes,
  LineNotationAttributes,
  RectNotationAttributes,
} from "common/baseTypes";
import { BoardType, NotationShape, NotationTypeShape } from "common/unions";
import { ref } from "vue";
import useUserOutgoingOperations from "../../helpers/userOutgoingOperationsHelper";
import useNotationCellOccupationHelper from "../../helpers/notationCellOccupationHelper";
const userOutgoingOperations = useUserOutgoingOperations();
const notationCellOccupationHelper = useNotationCellOccupationHelper();

///TODO watch notations and sync occupation mattrix
export const useNotationStore = defineStore("notation", () => {
  let cellVerticalHight = ref<number>();

  let cellOccupationMatrix: (NotationAttributes | null)[][] =
    createCellOccupationMatrix();

  let parent = ref<Board>({ uuid: "", type: "LESSON" });

  let notations = ref(<Map<String, NotationAttributes>>new Map());

  let copiedNotations = ref(<Map<String, NotationAttributes>>new Map());

  let selectedCell = ref(<PointAttributes>{ col: 0, row: 0 });

  function getCellVerticalHeight() {
    if (!cellVerticalHight.value)
      throw new Error("cellVerticalHight.value is null");
    return cellVerticalHight.value;
  }

  function getCellHorizontalWidth() {
    if (!cellVerticalHight.value)
      throw new Error("cell VerticalHight value is null");
    return cellVerticalHight.value / 2;
  }

  function setCellVerticalHeight(size: number) {
    cellVerticalHight.value = size;
  }

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

  function getCellOccupationMatrix() {
    return cellOccupationMatrix;
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

  function getLineNotations(): LineNotationAttributes[] {
    return Array.from(notations.value.values())
      .filter((n) => NotationTypeShape.get(n.notationType) === "RECT")
      .map((n) => n as LineNotationAttributes);
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
    notationCellOccupationHelper.updateOccupationMatrix(
      cellOccupationMatrix,
      notation,
      false,
    );
  }

  function addCopiedNotation(notation: NotationAttributes) {
    notation.boardType = parent.value.type;
    copiedNotations.value.set(notation.uuid, notation);
  }

  function deleteNotation(uuid: string) {
    notationCellOccupationHelper.updateOccupationMatrix(
      cellOccupationMatrix,
      notations.value.get(uuid)!,
      true,
    );

    notations.value.delete(uuid);

    if (getParent().type === "LESSON") {
      userOutgoingOperations.syncOutgoingRemoveNotation(uuid, getParent().uuid);
    }
  }

  function clearNotations() {
    notations.value.clear();
    cellOccupationMatrix = createCellOccupationMatrix();
  }

  function clearCopiedNotations() {
    copiedNotations.value.clear();
  }

  function selectCell(newSelectedCell: PointAttributes) {
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
        NotationTypeShape.get(n.notationType) == "LINE" ||
        NotationTypeShape.get(n.notationType) == "RECT",
    );
  }

  function getNotationByCell(
    col: number,
    row: number,
  ): NotationAttributes | null {
    return cellOccupationMatrix[col][row];
  }

  function createCellOccupationMatrix(): (NotationAttributes | null)[][] {
    let matrix: (NotationAttributes | null)[][] = new Array();
    for (let i = 0; i < matrixDimensions.colsNum; i++) {
      matrix.push([]);
      for (let j = 0; j < matrixDimensions.rowsNum; j++) {
        matrix[i][j] = null;
      }
    }
    return matrix;
  }

  return {
    addNotation,
    getNotation,
    getNotations,
    getPointNotations,
    getLineNotations,
    getRectNotations,
    getCopiedNotations,
    getNotationsByShape,
    getNotationByCell,
    //getCellOccupationMatrix,
    getSelectedCell,
    getSelectedNotations,
    getParent,
    getCellHorizontalWidth,
    getCellVerticalHeight,
    isLineOrRectSelected,
    setNotations,
    setCopiedNotations,
    selectNotation,
    selectCell,
    setParent,
    setCellVerticalHeight,
    resetSelectedCell,
    resetSelectedNotations,
    deleteNotation,
    clearNotations,
    clearCopiedNotations,
    cloneSelectedNotations,
  };
});
