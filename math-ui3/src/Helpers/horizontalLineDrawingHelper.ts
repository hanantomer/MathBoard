import {
  HorizontalLineAttributes,
  HorizontalLineNotationAttributes,
  MultiCellAttributes,
} from "../../../math-common/src/baseTypes";

import { useEditModeStore } from "../store/pinia/editModeStore";
import { useCellStore } from "../store/pinia/cellStore";
import { useNotationStore } from "../store/pinia/notationStore";
import useNotationMutateHelper from "../helpers/notationMutateHelper";
import useScreenHelper from "../helpers/screenHelper";

const editModeStore = useEditModeStore();
const cellStore = useCellStore();
const notationStore = useNotationStore();
const notationMutateHelper = useNotationMutateHelper();
const screenHelper = useScreenHelper();

export default function useHorizontalLineDrawingHelper() {

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

  function startEditingHorizontalLine( ) {
    editModeStore.setNextEditMode();
  }

  function setNewHorizontalLine(
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

  function setExistingHorizontalLine(
    e: MouseEvent,
    linePosition: HorizontalLineAttributes,
    modifyRight: boolean,
  ) {
    if (e.buttons !== 1) {
      return;
    }

    const xPos = e.pageX - cellStore.getSvgBoundingRect().x;

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

  function saveHorizontalLine(lineAttributes: HorizontalLineAttributes) {

    fixLineEdge(lineAttributes);

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
        "HORIZONTALLINE",
      );
  }

  function fixLineEdge(linePosition: HorizontalLineAttributes) {
    const nearLineRightEdge = screenHelper.getCloseLineEdge({
      x: linePosition.p1x,
      y: linePosition.py,
    });

    if (nearLineRightEdge != null) {
      linePosition.p1x = nearLineRightEdge.x;
      linePosition.py = nearLineRightEdge.y;
    }

    const nearLineLeftEdge = screenHelper.getCloseLineEdge({
      x: linePosition.p2x,
      y: linePosition.py,
    });

    if (nearLineLeftEdge != null) {
      linePosition.p2x = nearLineLeftEdge.x;
      linePosition.py = nearLineLeftEdge.y;
    }
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
        "SQRT",
      );
  }

  function resetHorizontalLineDrawing(linePosition: HorizontalLineAttributes) {
    linePosition.p1x = linePosition.p2x = linePosition.py = 0;
    notationStore.resetSelectedNotations();
  }

  return {
    startDrawingHorizontalLine,
    startEditingHorizontalLine,
    endDrawingHorizontalLine,
    endDrawingSqrt,
    setNewHorizontalLine,
    setExistingHorizontalLine,
  };
}
