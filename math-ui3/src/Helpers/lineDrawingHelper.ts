import {
  HorizontalLineAttributes,
  HorizontalLineNotationAttributes,
  SqrtNotationAttributes,
  MultiCellAttributes,
} from "../../../math-common/build/baseTypes";

import { useEditModeStore } from "../store/pinia/editModeStore";
import { useCellStore } from "../store/pinia/cellStore";
import { useNotationStore } from "../store/pinia/notationStore";
import useNotationMutateHelper from "../helpers/notationMutateHelper";

const editModeStore = useEditModeStore();
const cellStore = useCellStore();
const notationStore = useNotationStore();
const notationMutateHelper = useNotationMutateHelper();

export default function useLineDrawingHelper() {
  function selectLine(
    lineNotation: HorizontalLineNotationAttributes,
    linePosition: HorizontalLineAttributes,
  ) {
    if (!lineNotation) return;

    linePosition.p1x = lineNotation.p1x;
    linePosition.p2x = lineNotation.p2x;
    linePosition.py = lineNotation.py;

    // update store
    notationStore.selectNotation(lineNotation.uuid);
  }

  function selectSqrt(
    sqrtNotation: SqrtNotationAttributes,
    linePosition: HorizontalLineAttributes,
  ) {
    if (!sqrtNotation) return;

    linePosition.p1x =
      sqrtNotation.fromCol * cellStore.getCellHorizontalWidth();
    linePosition.p2x =
      (sqrtNotation.toCol - 1) * cellStore.getCellHorizontalWidth();
    linePosition.py = sqrtNotation.row * cellStore.getCellVerticalHeight();

    // update store
    notationStore.selectNotation(sqrtNotation.uuid);
  }

  function startDrawingLine(
    e: MouseEvent,
    linePosition: HorizontalLineAttributes,
  ) {
    editModeStore.setNextEditMode();

    if (linePosition.p1x) return;

    const position = {
      x: e.pageX - cellStore.getSvgBoundingRect().x,
      y: e.pageY - cellStore.getSvgBoundingRect().y,
    };

    linePosition.p1x = position.x;

    linePosition.p2x = linePosition.p1x + 10;

    linePosition.py = position.y;
  }

  function setLine(e: MouseEvent, linePosition: HorizontalLineAttributes) {
    // ignore right button
    if (e.buttons !== 1) {
      return;
    }

    // nothing done yet
    if (
      linePosition.p1x === 0 &&
      linePosition.p2x === 0 &&
      linePosition.py === 0
    ) {
      return;
    }

    const xPos = e.pageX - cellStore.getSvgBoundingRect().x;

    const modifyRight = xPos >= linePosition.p1x;

    if (modifyRight) {
      linePosition.p2x = xPos;
    } else {
      // modify left
      linePosition.p1x = xPos;
    }
  }

  function endDrawingSqrt(linePosition: HorizontalLineAttributes) {
    if (
      linePosition.p1x === 0 &&
      linePosition.p2x === 0 &&
      linePosition.py === 0
    ) {
      return;
    }

    if (linePosition.p2x == linePosition.p1x) {
      return;
    }

    let fromCol = Math.round(
      linePosition.p1x / cellStore.getCellHorizontalWidth(),
    );

    let toCol = Math.round(
      linePosition.p2x / cellStore.getCellHorizontalWidth(),
    );

    let row = Math.round(linePosition.py / cellStore.getCellVerticalHeight());

    saveSqrt({ fromCol: fromCol, toCol: toCol, row: row });

    resetLineDrawing(linePosition);
  }

  function endDrawingLine(linePosition: HorizontalLineAttributes) {
    if (
      linePosition.p1x === 0 &&
      linePosition.p2x === 0 &&
      linePosition.py === 0
    ) {
      return;
    }

    if (linePosition.p2x == linePosition.p1x) {
      return;
    }

    saveLine(linePosition);

    resetLineDrawing(linePosition);
  }

  function saveLine(lineAttributes: HorizontalLineAttributes) {
    if (notationStore.getSelectedNotations().length > 0) {
      let updatedLine = {
        ...notationStore.getSelectedNotations().at(0)!,
        ...lineAttributes,
      };

      notationMutateHelper.updateHorizontalLineNotation(
        updatedLine as HorizontalLineNotationAttributes,
      );
    } else
      notationMutateHelper.addHorizontalLineNotation(
        lineAttributes,
        editModeStore.getNotationTypeByEditMode(),
      );
  }

  function saveSqrt(sqrtAttributes: MultiCellAttributes) {
    if (notationStore.getSelectedNotations().length > 0) {
      let updatedSqrt = {
        ...notationStore.getSelectedNotations().at(0)!,
        ...sqrtAttributes,
      };

      notationMutateHelper.updateSqrtNotation(updatedSqrt);
    } else
      notationMutateHelper.addSqrtNotation(
        sqrtAttributes,
        editModeStore.getNotationTypeByEditMode(),
      );
  }

  function resetLineDrawing(linePosition: HorizontalLineAttributes) {
    linePosition.p1x = linePosition.p2x = linePosition.py = 0;
    editModeStore.setDefaultEditMode();
  }

  function getNearestRow(clickedYPos: number) {
    let clickedRow = Math.round(
      clickedYPos / cellStore.getCellVerticalHeight(),
    );
    return clickedRow * cellStore.getCellVerticalHeight();
  }

  return {
    selectLine,
    selectSqrt,
    startDrawingLine,
    resetLineDrawing,
    endDrawingLine,
    endDrawingSqrt,
    setLine,
  };
}
