import { SlopeLineNotationAttributes } from "../../../math-common/src/baseTypes";

import { useEditModeStore } from "../store/pinia/editModeStore";
import { useCellStore } from "../store/pinia/cellStore";
import { useNotationStore } from "../store/pinia/notationStore";
import useNotationMutateHelper from "../helpers/notationMutateHelper";
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

    slopeDrawerAttributes.modifyRight = modifyRight;

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

    slopeDrawerAttributes.modifyRight =
      (slopeDrawerAttributes.slopeType === "POSITIVE" &&
        slopeDrawerAttributes.movementDirection === "UP") ||
      (slopeDrawerAttributes.slopeType === "NEGATIVE" &&
        slopeDrawerAttributes.movementDirection === "DOWN");

    if (slopeDrawerAttributes.modifyRight) {
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
  ) {
    if (e.buttons !== 1) {
      return;
    }

    const yPos = e.pageY - (cellStore.getSvgBoundingRect()?.y ?? 0);
    const xPos = e.pageX - (cellStore.getSvgBoundingRect()?.x ?? 0);

    if (slopeDrawerAttributes.modifyRight) {
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
    if (notationStore.getSelectedNotations().length > 0) {
      let updatedLine = {
        ...notationStore.getSelectedNotations().at(0)!,
        ...linePosition,
      };

      notationMutateHelper.updateSlopeLineNotation(
        updatedLine as SlopeLineNotationAttributes,
      );
    } else {
      notationMutateHelper.addSlopeLineNotation(
        linePosition,
        editModeStore.getNotationTypeByEditMode(),
      );
    }
    editModeStore.setDefaultEditMode();
  }

  return {
    startEditingSlopeLine,
    startDrawingSlopeLine,
    endDrawingSlopeLine,
    setNewSlopeLine,
    setExistingSlopeLine,
  };
}