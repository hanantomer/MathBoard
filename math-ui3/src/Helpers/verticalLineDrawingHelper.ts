import {
  DotCoordinates,
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


  // function startDrawingVerticalLine(
  //   e: MouseEvent,
  //   linePosition: VerticalLineAttributes,
  // ) {
  //   editModeStore.setNextEditMode();

  //   if (linePosition.p1y) return;

  //   const position = {
  //     x: e.pageX - cellStore.getSvgBoundingRect().x,
  //     y: e.pageY - cellStore.getSvgBoundingRect().y,
  //   };

  //   linePosition.p1y = position.y;
  //   linePosition.p2y = linePosition.p1y + 10;
  //   linePosition.px = position.x;
  // }

  // function startEditingVerticalLine() {
  //   editModeStore.setNextEditMode();
  // }


  // function endDrawingVerticalLine(linePosition: VerticalLineAttributes) {
  //   if (notationStore.hasSelectedNotations()) {
  //     lineDrawingHelper.showMatrixLine();
  //   }

  //   // drawing not started
  //   if (
  //     linePosition.px === 0 &&
  //     linePosition.p1y === 0 &&
  //     linePosition.p2y === 0
  //   ) {
  //     return;
  //   }

  //   if (linePosition.p2y == linePosition.p1y) return;

  //   saveVerticalLine(linePosition);

  //   resetVerticalLineDrawing(linePosition);
  // }


  
  return {
//    endDrawingVerticalLine,
  };
}
