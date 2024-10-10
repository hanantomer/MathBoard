import {
  HorizontalLineAttributes,
  HorizontalLineNotationAttributes,
  HorizontaLinePosition,
} from "../../../math-common/build/baseTypes";

import { cellSpace } from "common/globals";

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
    linePosition: HorizontaLinePosition,
  ) {
    if (!lineNotation) return;

    linePosition.x1 =
      lineNotation.fromCol * (cellStore.getCellHorizontalWidth() + cellSpace);
    (linePosition.x2 =
      (lineNotation.toCol - 1) *
      (cellStore.getCellHorizontalWidth() + cellSpace)),
      (linePosition.y =
        lineNotation.row * (cellStore.getCellVerticalHeight() + cellSpace));

    // update store
    notationStore.selectNotation(lineNotation.uuid);
  }

  function startDrawingLine(
    e: MouseEvent,
    linePosition: HorizontaLinePosition,
  ) {
    editModeStore.setNextEditMode();

    if (linePosition.x1) return;

    const position = {
      x: e.pageX - cellStore.getSvgBoundingRect().x,
      y: e.pageY - cellStore.getSvgBoundingRect().y,
    };

    linePosition.x1 = position.x;

    linePosition.x2 = linePosition.x1 + 10;

    linePosition.y = getNearestRow(position.y);
  }

  function setLine(e: MouseEvent, linePosition: HorizontaLinePosition) {
    // ignore right button
    if (e.buttons !== 1) {
      return;
    }

    // nothing done yet
    if (
      linePosition.x1 === 0 &&
      linePosition.x2 === 0 &&
      linePosition.y === 0
    ) {
      return;
    }

    const xPos = e.pageX - cellStore.getSvgBoundingRect().x;

    const modifyRight = xPos >= linePosition.x1;

    if (modifyRight) {
      linePosition.x2 = xPos;
    } else {
      // modify left
      linePosition.x1 = xPos;
    }
  }

  function endDrawingLine(linePosition: HorizontaLinePosition) {
    if (
      linePosition.x1 === 0 &&
      linePosition.x2 === 0 &&
      linePosition.y === 0
    ) {
      return;
    }

    if (linePosition.x2 == linePosition.x1) {
      return;
    }

    let fromCol = Math.round(
      linePosition.x1 / (cellStore.getCellHorizontalWidth() + cellSpace),
    );

    let toCol = Math.round(
      linePosition.x2 / (cellStore.getCellHorizontalWidth() + cellSpace),
    );

    let row = Math.round(
      linePosition.y / (cellStore.getCellVerticalHeight() + cellSpace),
    );

    saveLine({ fromCol: fromCol, toCol: toCol, row: row });

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

  function resetLineDrawing(linePosition: HorizontaLinePosition) {
    linePosition.x1 = linePosition.x2 = linePosition.y = 0;
    editModeStore.setDefaultEditMode();
  }

  function getNearestRow(clickedYPos: number) {
    let clickedRow = Math.round(
      clickedYPos / (cellStore.getCellVerticalHeight() + cellSpace),
    );
    return clickedRow * (cellStore.getCellVerticalHeight() + cellSpace);
  }

  return {
    selectLine,
    startDrawingLine,
    resetLineDrawing,
    endDrawingLine,
    setLine,
  };
}
