import {
  NotationAttributes,
  VerticalLineAttributes,
  VerticalLineNotationAttributes,
} from "../../../math-common/src/baseTypes";

import { useEditModeStore } from "../store/pinia/editModeStore";
import { useCellStore } from "../store/pinia/cellStore";
import { useNotationStore } from "../store/pinia/notationStore";
import useNotationMutateHelper from "../helpers/notationMutateHelper";
import useLineDrawingHelper from "../helpers/lineDrawingHelper";
import useScreenHelper from "../helpers/screenHelper";

const editModeStore = useEditModeStore();
const cellStore = useCellStore();
const notationStore = useNotationStore();
const notationMutateHelper = useNotationMutateHelper();
const lineDrawingHelper = useLineDrawingHelper();
const screenHelper = useScreenHelper();

export default function useVerticalLineDrawingHelper() {
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

  function startEditingVerticalLine() {
    editModeStore.setNextEditMode();
  }

  function setNewVerticalLine(
    e: MouseEvent,
    linePosition: VerticalLineAttributes,
  ) {
    const yPos = e.pageY - (cellStore.getSvgBoundingRect()?.y ?? 0);

    const modifyTop =
      Math.abs(yPos - linePosition.p1y) < Math.abs(linePosition.p2y - yPos);

    setY(modifyTop, linePosition, yPos);
  }

  function setExistingVerticalLine(
    e: MouseEvent,
    linePosition: VerticalLineAttributes,
    modifyTop: boolean,
  ) {
    const yPos = e.pageY - (cellStore.getSvgBoundingRect()?.y ?? 0);
    setY(modifyTop, linePosition, yPos);
  }

  function endDrawingVerticalLine(linePosition: VerticalLineAttributes) {
    if (notationStore.hasSelectedNotations()) {
      lineDrawingHelper.showMatrixLine();
    }

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
    fixLineEdge(lineAttributes);

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
        "VERTICALLINE",
      );
  }

  function resetVerticalLineDrawing(linePosition: VerticalLineAttributes) {
    linePosition.px = linePosition.p1y = linePosition.p2y = 0;
    notationStore.resetSelectedNotations();
    editModeStore.setDefaultEditMode();
  }

  function setY(
    modifyTop: boolean,
    linePosition: VerticalLineAttributes,
    yPos: number,
  ) {
    if (modifyTop) {
      linePosition.p1y = yPos;
    } else {
      linePosition.p2y = yPos;
    }
  }

  function fixLineEdge(linePosition: VerticalLineAttributes) {
    const nearLineRightEdge = screenHelper.getCloseLineEdge({
      x: linePosition.px,
      y: linePosition.p1y,
    });

    if (nearLineRightEdge != null) {
      linePosition.px = nearLineRightEdge.x;
      linePosition.p1y = nearLineRightEdge.y;
    }

    const nearLineLeftEdge = screenHelper.getCloseLineEdge({
      x: linePosition.px,
      y: linePosition.p2y,
    });

    if (nearLineLeftEdge != null) {
      linePosition.px = nearLineLeftEdge.x;
      linePosition.p2y = nearLineLeftEdge.y;
    }
  }

  return {
    startDrawingVerticalLine,
    startEditingVerticalLine,
    endDrawingVerticalLine,
    setNewVerticalLine,
    setExistingVerticalLine,
  };
}
