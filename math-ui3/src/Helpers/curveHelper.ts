import { CurveAttributes } from "common/baseTypes";
import { useCellStore } from "../store/pinia/cellStore";
import { useEditModeStore } from "../store/pinia/editModeStore";

const cellStore = useCellStore();
const editModeStore = useEditModeStore();


export default function curveHelper() {


  return {
    // startCurveDrawing,
    // updateCurve,
    // getCurveAttributes,
    // getVisitedPoints,
  };
}
