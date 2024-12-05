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
import { SlopeDrawerAttributes, SlopeType } from "common/baseTypes";

const editModeStore = useEditModeStore();
const cellStore = useCellStore();
const notationStore = useNotationStore();
const notationMutateHelper = useNotationMutateHelper();

export default function useLineDrawingHelper() {

  // function selectHorizontalLine(
  //   lineNotation: HorizontalLineNotationAttributes,
  //   linePosition: HorizontalLineAttributes,
  // ) {
  //   if (!lineNotation) return;

  //   linePosition.p1x = lineNotation.p1x;
  //   linePosition.p2x = lineNotation.p2x;
  //   linePosition.py = lineNotation.py;

  //   // update store
  //   notationStore.selectNotation(lineNotation.uuid);
  // }

  // function selectSqrt(
  //   sqrtNotation: SqrtNotationAttributes,
  //   linePosition: HorizontalLineAttributes,
  // ) {
  //   if (!sqrtNotation) return;

  //   linePosition.p1x =
  //     sqrtNotation.fromCol * cellStore.getCellHorizontalWidth();
  //   linePosition.p2x =
  //     (sqrtNotation.toCol - 1) * cellStore.getCellHorizontalWidth();
  //   linePosition.py = sqrtNotation.row * cellStore.getCellVerticalHeight();

  //   // update store
  //   notationStore.selectNotation(sqrtNotation.uuid);
  // }

  // function selectSlopeLine(
  //   lineNotation: SlopeLineNotationAttributes,
  //   linePosition: SlopeLineAttributes,
  // ) {
  //   Object.assign(linePosition, lineNotation);
  //   notationStore.selectNotation(lineNotation.uuid);
  // }

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

  function startDrawingSlopeLine(
    e: MouseEvent,
    slopeDrawerAttributes: SlopeDrawerAttributes,
  ) {
    editModeStore.setNextEditMode();
    if (slopeDrawerAttributes.linePosition.p1y) return;

    slopeDrawerAttributes.slopeType = "NONE";
    slopeDrawerAttributes.movementDirection = "NONE";

    const position = {
      x: e.pageX - cellStore.getSvgBoundingRect().x,
      y: e.pageY - cellStore.getSvgBoundingRect().y,
    };

    slopeDrawerAttributes.linePosition.p1x =
      slopeDrawerAttributes.linePosition.p2x = position.x;
    slopeDrawerAttributes.linePosition.p1y =
      slopeDrawerAttributes.linePosition.p2y = position.y;
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

  function setSlopeLine(
    e: MouseEvent,
    slopeDrawerAttributes: SlopeDrawerAttributes,
  ) {
    if (e.buttons !== 1) {
      return;
    }

    const yPos = e.pageY - (cellStore.getSvgBoundingRect()?.y ?? 0);
    const xPos = e.pageX - (cellStore.getSvgBoundingRect()?.x ?? 0);

    if (
      xPos === slopeDrawerAttributes.linePosition.p1x ||
      yPos === slopeDrawerAttributes.linePosition.p1y
    ) {
      return;
    }

    if (slopeDrawerAttributes.slopeType === "NONE") {
      slopeDrawerAttributes.slopeType = getSlopeType(
        xPos,
        yPos,
        slopeDrawerAttributes.linePosition,
      );
    }

    if (slopeDrawerAttributes.movementDirection === "NONE") {
      slopeDrawerAttributes.movementDirection =
        (slopeDrawerAttributes.slopeType === "POSITIVE" &&
          yPos > slopeDrawerAttributes.linePosition.p2y) ||
        (slopeDrawerAttributes.slopeType === "NEGATIVE" &&
          yPos > slopeDrawerAttributes.linePosition.p1y)
          ? "DOWN"
          : "UP";
    }

    // 4 options for drawing sloped line:
    // 1. upper left to lower right. direction is DOWN and slopeType is NEGATIVE
    // 2  lower right to upper left. direction is UP and slopeType is NEGATIVE
    // 3. upper right to lower left. direction is DOWN and slopeType is POSITIVE
    // 4. lower left to upper right. direction is UP and slopeType is POSITIVE

    const modifyRight =
      (slopeDrawerAttributes.slopeType === "POSITIVE" &&
        slopeDrawerAttributes.movementDirection === "UP") ||
      (slopeDrawerAttributes.slopeType === "NEGATIVE" &&
        slopeDrawerAttributes.movementDirection === "DOWN");

    if (modifyRight) {
      slopeDrawerAttributes.linePosition.p2x = xPos;
      slopeDrawerAttributes.linePosition.p2y = yPos;
    } else {
      slopeDrawerAttributes.linePosition.p1x = xPos;
      slopeDrawerAttributes.linePosition.p1y = yPos;
    }

    if (
      slopeDrawerAttributes.linePosition.p1x >=
      slopeDrawerAttributes.linePosition.p2x
    ) {
      throw new Error(
        JSON.stringify(slopeDrawerAttributes.linePosition) +
          "is invalid: p2x must be greater than p1x",
      );
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

  function getSlopeType(
    xPos: number,
    yPos: number,
    linePosition: SlopeLineAttributes,
  ): SlopeType {
    if (
      /*moving up and right*/
      (yPos < linePosition.p2y && xPos > linePosition.p2x) ||
      /*moving down and left*/
      (yPos > linePosition.p2y && xPos < linePosition.p2x)
    ) {
      return "POSITIVE";
    }

    return "NEGATIVE";
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

  function endDrawingSlopeLine(linePosition: SlopeLineAttributes) {
    if (
      linePosition.p1x === 0 &&
      linePosition.p1y === 0 &&
      linePosition.p2x === 0 &&
      linePosition.p2y === 0
    ) {
      return;
    }

    if (
      linePosition.p1x == linePosition.p2x &&
      linePosition.p2y == linePosition.p2y
    ) {
      return;
    }

    saveSlopeLine(linePosition);
  }

  function saveSlopeLine(linePosition: SlopeLineAttributes) {
    if (notationStore.getSelectedNotations().length > 0) {
      let updatedLine = {
        ...notationStore.getSelectedNotations().at(0)!,
        ...linePosition,
      };

      notationMutateHelper.updateSlopeLineNotation(
        updatedLine as SlopeLineNotationAttributes,
      );
    } else
      notationMutateHelper.addSlopeLineNotation(
        linePosition,
        editModeStore.getNotationTypeByEditMode(),
      );
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
    startDrawingSlopeLine,

//    selectHorizontalLine,
//  selectSlopeLine,
    selectLine,

    resetDrawing,

    endDrawingHorizontalLine,
    endDrawingVerticalLine,
    endDrawingSqrt,
    endDrawingSlopeLine,

    setHorizontalLine,
    setVerticalLine,
    setSlopeLine,
  };
}
