import {
  NotationAttributes,
  HorizontalLineAttributes,
  VerticalLineAttributes,
  SlopeLineAttributes,
  HorizontalLineNotationAttributes,
  VerticalLineNotationAttributes,
  SlopeLineNotationAttributes,
  MultiCellAttributes,
} from "../../../math-common/src/baseTypes";

import { useEditModeStore } from "../store/pinia/editModeStore";
import { useCellStore } from "../store/pinia/cellStore";
import { useNotationStore } from "../store/pinia/notationStore";
import useNotationMutateHelper from "../helpers/notationMutateHelper";
import {
  SlopeDrawerAttributes,
  SlopeType,
  MovementDirection,
} from "common/baseTypes";

const editModeStore = useEditModeStore();
const cellStore = useCellStore();
const notationStore = useNotationStore();
const notationMutateHelper = useNotationMutateHelper();

export default function useLineDrawingHelper() {

  function selectLine(lineNotation: NotationAttributes, linePosition: any) {
    Object.assign(linePosition, lineNotation);
    notationStore.selectNotation(lineNotation.uuid);
  }

  function startDrawingHorizontalLine(
    e: MouseEvent,
    linePosition: HorizontalLineAttributes,
  ) {
    editModeStore.setNextEditMode();

    if (!linePosition) return;

    if (linePosition.p1x) return;

    const position = {
      x: e.pageX - cellStore.getSvgBoundingRect().x,
      y: e.pageY - cellStore.getSvgBoundingRect().y,
    };

    linePosition.p1x = position.x;

    linePosition.p2x = linePosition.p1x + 10;

    linePosition.py = position.y;
  }

  function setHorizontalLine(
    e: MouseEvent,
    linePosition: HorizontalLineAttributes,
  ) {
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

    resetHorizontalLineDrawing(linePosition);
  }

  function endDrawingHorizontalLine(linePosition: HorizontalLineAttributes) {
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

    saveHorizontalLine(linePosition);

    resetHorizontalLineDrawing(linePosition);
  }

  function endDrawingVerticalLine(linePosition: VerticalLineAttributes) {
    // drawing not started
    if (
      linePosition.px === 0 &&
      linePosition.p1y === 0 &&
      linePosition.p2y === 0
    ) {
      return;
    }

    if (linePosition.p2y == linePosition.p1y) return;

    saveVerticalLine(linePosition);

    resetVerticalLineDrawing(linePosition);
  }

  function saveVerticalLine(lineAttributes: VerticalLineAttributes) {
    if (notationStore.getSelectedNotations().length > 0) {
      let updatedLine = {
        ...notationStore.getSelectedNotations().at(0)!,
        ...lineAttributes,
      };

      notationMutateHelper.updateVerticalLineNotation(
        updatedLine as VerticalLineNotationAttributes,
      );
    } else
      notationMutateHelper.addVerticalLineNotation(
        lineAttributes,
        editModeStore.getNotationTypeByEditMode(),
      );
  }

  function resetVerticalLineDrawing(linePosition: VerticalLineAttributes) {
    linePosition.px = linePosition.p1y = linePosition.p2y = 0;
    notationStore.resetSelectedNotations();
    editModeStore.setDefaultEditMode();
  }

  function saveHorizontalLine(lineAttributes: HorizontalLineAttributes) {
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

  function resetHorizontalLineDrawing(linePosition: HorizontalLineAttributes) {
    linePosition.p1x = linePosition.p2x = linePosition.py = 0;
    notationStore.resetSelectedNotations();
    editModeStore.setDefaultEditMode();
  }

  function getNearestRow(clickedYPos: number) {
    let clickedRow = Math.round(
      clickedYPos / cellStore.getCellVerticalHeight(),
    );
    return clickedRow * cellStore.getCellVerticalHeight();
  }

  function getNearestCol(clickedXPos: number) {
    let clickedCol = Math.round(
      clickedXPos / cellStore.getCellHorizontalWidth(),
    );
    return clickedCol * cellStore.getCellHorizontalWidth();
  }



  function startDrawingVerticalLine(
    e: MouseEvent,
    linePosition: VerticalLineAttributes,
  ) {
    editModeStore.setNextEditMode();

    if (linePosition.p1y) return;

    const position = {
      x: e.pageX - cellStore.getSvgBoundingRect().x,
      y: e.pageY - cellStore.getSvgBoundingRect().y,
    };

    linePosition.p1y = position.y;
    linePosition.p2y = linePosition.p1y + 10;
    linePosition.px = position.x;
  }

  function setVerticalLine(
    e: MouseEvent,
    linePosition: VerticalLineAttributes,
  ) {
    const yPos = e.pageY - (cellStore.getSvgBoundingRect()?.y ?? 0);

    const modifyTop =
      Math.abs(yPos - linePosition.p1y) < Math.abs(linePosition.p2y - yPos);

    if (modifyTop) {
      linePosition.p1y = yPos;
    } else {
      linePosition.p2y = yPos;
    }
  }


  function resetDrawing(linePosition: any) {
    let key: keyof typeof linePosition;
    for (key in linePosition) {
      linePosition[key] = 0;
    }
    notationStore.resetSelectedNotations();
    editModeStore.setDefaultEditMode();
  }


  return {
    startDrawingHorizontalLine,
    startDrawingVerticalLine,
    selectLine,
    resetDrawing,
    endDrawingHorizontalLine,
    endDrawingVerticalLine,
    endDrawingSqrt,
    setHorizontalLine,
    setVerticalLine,
  };
}
