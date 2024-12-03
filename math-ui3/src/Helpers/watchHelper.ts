import { watch } from "vue";
import { EditMode, BusEventType } from "../../../math-common/build/unions";
import {
  CellAttributes,
  NotationAttributes,
} from "../../../math-common/src/baseTypes";
import { useEditModeStore } from "../store/pinia/editModeStore";
import { useCellStore } from "../store/pinia/cellStore";
import { useNotationStore } from "../store/pinia/notationStore";
import useEventBus from "../helpers/eventBusHelper";
import useMatrixCellHelper from "../helpers/matrixCellHelper";

const editModeStore = useEditModeStore();
const cellStore = useCellStore();
const notationStore = useNotationStore();

const eventBus = useEventBus();
const matrixCellHelper = useMatrixCellHelper();

type MouseEventHandler = (e: MouseEvent) => void;
type KeyEventHandler = (e: KeyboardEvent) => void;
type EditModeHandler = (newEditMode: EditMode, oldEditMode: any) => void;
type NotationSelectionHandler = (notation: any) => void;
type CustomEventHandler = (data: any) => void;
type PropEventHandler = (prop: any) => void;

export default function () {
  function watchMouseEvent(
    editMode: EditMode[],
    eventType: BusEventType,
    handler: MouseEventHandler,
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
    handler: KeyEventHandler,
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

  function watchEveryEditModeChange(handler: EditModeHandler) {
    watch(
      () => editModeStore.getEditMode() as EditMode,
      (newEditMode: EditMode, oldEditMode: EditMode) => {
        handler(newEditMode, oldEditMode);
      },
    );
  }

  function watchEditModeTransition(
    oldEditMode: EditMode,
    newEditMode: EditMode,
    handler: EditModeHandler,
  ) {
    watch(
      () => editModeStore.getEditMode() as EditMode,
      (nEditMode: EditMode, oEditMode: EditMode) => {
        if (nEditMode === newEditMode && oEditMode === oldEditMode) {
          handler(nEditMode, oEditMode);
        }
      },
    );
  }

  function watchEndOfEditMode(oldEditMode: EditMode, handler: EditModeHandler) {
    watch(
      () => editModeStore.getEditMode() as EditMode,
      (nEditMode: EditMode, oEditMode: EditMode) => {
        if (nEditMode !== oldEditMode && oEditMode === oldEditMode) {
          handler(nEditMode, oEditMode);
        }
      },
    );
  }

  function watchSelectedCellAndDisplayNewSelected(svgId: string) {
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
    handler: NotationSelectionHandler,
  ) {
    watch(
      () => eventBus.get(editMode, eventType),
      (notation: NotationAttributes) => {
        if (!notation) return;
        handler(notation);
        eventBus.remove(eventType, editMode); // clear event from bus to allow reselction
      },
    );
  }

  function watchCustomEvent(
    editMode: EditMode,
    eventType: BusEventType,
    handler: CustomEventHandler,
  ) {
    watch(
      () => eventBus.get(editMode, eventType),
      (data: any) => {
        handler(data);
      },
    );
  }

  function watchLoadedEvent(props: any, handler: PropEventHandler) {
    watch(props, (data: any) => {
      if (data["loaded"]) handler(data["svgId"]);
    });
  }

  function watchNotationsEvent(svgId: string, handler: CustomEventHandler) {
    watch(
      () => notationStore.getNotations(),  // new and old
      () => {
        handler(svgId);
      },
      { deep: true, immediate: true },
    );
  }

  return {
    watchMouseEvent,
    watchKeyEvent,
    watchEveryEditModeChange,
    watchEditModeTransition,
    watchEndOfEditMode,
    watchSelectedCellAndDisplayNewSelected,
    watchNotationSelection,
    watchCustomEvent,
    watchLoadedEvent,
    watchNotationsEvent,
  };
}
