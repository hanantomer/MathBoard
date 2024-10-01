import { watch } from "vue";
import { EditMode, BusEventType } from "../../../math-common/build/unions";
import {
  CellAttributes,
  NotationAttributes,
} from "../../../math-common/build/baseTypes";
import { useEditModeStore } from "../store/pinia/editModeStore";
import { useCellStore } from "../store/pinia/cellStore";
import useEventBus from "../helpers/eventBusHelper";
import useMatrixCellHelper from "../helpers/matrixCellHelper";
import useWatchHelper from "../helpers/watchHelper";

const editModeStore = useEditModeStore();
const cellStore = useCellStore();

const eventBus = useEventBus();
const matrixCellHelper = useMatrixCellHelper();
const watchHelper = useWatchHelper();

export default function () {
  return {
  };
}
