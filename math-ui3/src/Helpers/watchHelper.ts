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

const editModeStore = useEditModeStore();
const cellStore = useCellStore();

const eventBus = useEventBus();
const matrixCellHelper = useMatrixCellHelper();

type mouseEventHandler = (e: MouseEvent) => void;
type keyEventHandler = (e: KeyboardEvent) => void;
type editModeHandler = (newEditMode: EditMode, oldEditMode: any) => void;
type notationHandler = (n: any) => void;
type customEventHandler = (d: any) => void;

export default function () {
  function watchMouseEvent(
    editMode: EditMode[],
    eventType: BusEventType,
    handler: mouseEventHandler,
  ) {
    editMode.forEach((em) =>
      watch(
        () => eventBus.get(em, eventType),
        (e: MouseEvent) => {
          handler(e);
        },
      ),
    );
  }

  function watchKeyEvent(
    editMode: EditMode[],
    eventType: BusEventType,
    handler: keyEventHandler,
  ) {
    editMode.forEach((em) =>
      watch(
        () => eventBus.get(em, eventType),
        (e: KeyboardEvent) => {
          handler(e);
        },
      ),
    );
  }

  function watchEditMode(handler: editModeHandler) {
    watch(
      () => editModeStore.getEditMode() as EditMode,
      (newEditMode: EditMode, oldEditMode: EditMode) => {
        handler(newEditMode, oldEditMode);
      },
    );
  }

  function watchSelectedCell(svgId: string) {
    watch(
      () => cellStore.getSelectedCell() as CellAttributes,
      (
        newSelectedCell: CellAttributes | undefined | null,
        oldSelectedCell: CellAttributes | undefined | null,
      ) => {
        setTimeout(() => {
          matrixCellHelper.showSelectedCell(
            svgId,
            newSelectedCell,
            oldSelectedCell,
          );
        }, 100);
      },
      { immediate: true, deep: true },
    );
  }

  function watchNotationSelection(
    editMode: EditMode,
    eventType: BusEventType,
    handler: notationHandler,
  ) {
    watch(
      () => eventBus.get(editMode, eventType),
      (notation: NotationAttributes) => {
        handler(notation);
      },
    );
  }

   function watchCustomEvent(
     editMode: EditMode,
     eventType: BusEventType,
     handler: customEventHandler,
   ) {
     watch(
       () => eventBus.get(editMode, eventType),
       (data: any) => {
         handler(data);
       },
     );
   }

  return {
    watchMouseEvent,
    watchKeyEvent,
    watchEditMode,
    watchSelectedCell,
    watchNotationSelection,
    watchCustomEvent,
  };
}
