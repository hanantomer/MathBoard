import { SlopeLineNotationAttributes } from "../../../math-common/src/baseTypes";
import { useEditModeStore } from "../store/pinia/editModeStore";
import { useCellStore } from "../store/pinia/cellStore";
import { useNotationStore } from "../store/pinia/notationStore";
import useNotationMutateHelper from "../helpers/notationMutateHelper";
import useLineDrawingHelper from "../helpers/lineDrawingHelper";
import useScreenHelper from "../helpers/screenHelper";

import {
  SlopeLineAttributes,
  SlopeDrawerAttributes,
  SlopeType,
  MovementDirection,
} from "common/baseTypes";

const editModeStore = useEditModeStore();
const cellStore = useCellStore();
const notationStore = useNotationStore();
const notationMutateHelper = useNotationMutateHelper();
const lineDrawingHelper = useLineDrawingHelper();
const screenHelper = useScreenHelper();

export default function useSlopeLineDrawingHelper() {
  function startDrawingSlopeLine(
    e: MouseEvent,
    slopeDrawerAttributes: SlopeDrawerAttributes,
  ) {
    slopeDrawerAttributes.slopeType = "NONE";
    slopeDrawerAttributes.movementDirection = "NONE";

    editModeStore.setNextEditMode();

    const position = {
      x: e.pageX - cellStore.getSvgBoundingRect().x,
      y: e.pageY - cellStore.getSvgBoundingRect().y,
    };

    slopeDrawerAttributes.linePosition.p1x =
      slopeDrawerAttributes.linePosition.p2x = position.x;

    slopeDrawerAttributes.linePosition.p1y =
      slopeDrawerAttributes.linePosition.p2y = position.y;
  }

  function startEditingSlopeLine(
    e: MouseEvent,
    slopeDrawerAttributes: SlopeDrawerAttributes,
    modifyRight: boolean,
  ) {
    slopeDrawerAttributes.slopeType = getSlopeTypeForExistingLine(
      slopeDrawerAttributes.linePosition,
    );

    slopeDrawerAttributes.movementDirection = "NONE";

    editModeStore.setNextEditMode();
  }

  function setNewSlopeLine(
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
      slopeDrawerAttributes.slopeType = getSlopeTypeForNewLine(
        xPos,
        yPos,
        slopeDrawerAttributes.linePosition,
      );
    }

    if (slopeDrawerAttributes.movementDirection === "NONE") {
      slopeDrawerAttributes.movementDirection =
        getMovementDirectionForNewSlopeLine(slopeDrawerAttributes, yPos);
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

    validateSlopePosition(slopeDrawerAttributes);
  }

  function setExistingSlopeLine(
    e: MouseEvent,
    slopeDrawerAttributes: SlopeDrawerAttributes,
    modifyRight: boolean,
  ) {
    if (e.buttons !== 1) {
      return;
    }

    const yPos = e.pageY - (cellStore.getSvgBoundingRect()?.y ?? 0);
    const xPos = e.pageX - (cellStore.getSvgBoundingRect()?.x ?? 0);

    if (modifyRight) {
      slopeDrawerAttributes.linePosition.p2x = xPos;
      slopeDrawerAttributes.linePosition.p2y = yPos;
    } else {
      slopeDrawerAttributes.linePosition.p1x = xPos;
      slopeDrawerAttributes.linePosition.p1y = yPos;
    }

    validateSlopePosition(slopeDrawerAttributes);
  }

  function validateSlopePosition(slopeDrawerAttributes: SlopeDrawerAttributes) {
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

  function getSlopeTypeForNewLine(
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

  function getSlopeTypeForExistingLine(
    linePosition: SlopeLineAttributes,
  ): SlopeType {
    return linePosition.p2y < linePosition.p1y ? "POSITIVE" : "NEGATIVE";
  }

  function getMovementDirectionForNewSlopeLine(
    slopeDrawerAttributes: SlopeDrawerAttributes,
    yPos: number,
  ): MovementDirection {
    return (slopeDrawerAttributes.slopeType === "POSITIVE" &&
      yPos > slopeDrawerAttributes.linePosition.p2y) ||
      (slopeDrawerAttributes.slopeType === "NEGATIVE" &&
        yPos > slopeDrawerAttributes.linePosition.p1y)
      ? "DOWN"
      : "UP";
  }

  function endDrawingSlopeLine(slopeDrawerAttributes: SlopeDrawerAttributes) {
    if (notationStore.hasSelectedNotations()) {
      lineDrawingHelper.showMatrixLine();
    }

    if (
      slopeDrawerAttributes.linePosition.p1x === 0 &&
      slopeDrawerAttributes.linePosition.p1y === 0 &&
      slopeDrawerAttributes.linePosition.p2x === 0 &&
      slopeDrawerAttributes.linePosition.p2y === 0
    ) {
      return;
    }

    if (
      slopeDrawerAttributes.linePosition.p1x ==
        slopeDrawerAttributes.linePosition.p2x &&
      slopeDrawerAttributes.linePosition.p2y ==
        slopeDrawerAttributes.linePosition.p2y
    ) {
      return;
    }

    saveSlopeLine(slopeDrawerAttributes.linePosition);

    slopeDrawerAttributes.linePosition.p1x =
      slopeDrawerAttributes.linePosition.p2x =
      slopeDrawerAttributes.linePosition.p1y =
      slopeDrawerAttributes.linePosition.p2y =
        0;
  }

  function saveSlopeLine(linePosition: SlopeLineAttributes) {
    fixLineEdge(linePosition);

    if (notationStore.getSelectedNotations().length > 0) {
      let updatedLine = {
        ...notationStore.getSelectedNotations().at(0)!,
        ...linePosition,
      };

      notationMutateHelper.updateSlopeLineNotation(
        updatedLine as SlopeLineNotationAttributes,
      );
    } else {
      notationMutateHelper.addSlopeLineNotation(linePosition, "SLOPELINE");
    }
    editModeStore.setDefaultEditMode();
  }

  function fixLineEdge(linePosition: SlopeLineAttributes) {
    const nearLineRightEdge = screenHelper.getCloseLineEdge({
      x: linePosition.p1x,
      y: linePosition.p1y,
    });

    if (nearLineRightEdge != null) {
      linePosition.p1x = nearLineRightEdge.x;
      linePosition.p1y = nearLineRightEdge.y;
    }

    const nearLineLeftEdge = screenHelper.getCloseLineEdge({
      x: linePosition.p2x,
      y: linePosition.p2y,
    });

    if (nearLineLeftEdge != null) {
      linePosition.p2x = nearLineLeftEdge.x;
      linePosition.p2y = nearLineLeftEdge.y;
    }
  }

  return {
    startEditingSlopeLine,
    startDrawingSlopeLine,
    endDrawingSlopeLine,
    setNewSlopeLine,
    setExistingSlopeLine,
  };
}

