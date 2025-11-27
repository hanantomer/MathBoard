import { watch } from "vue";
import { EditMode, BusEventType } from "common/unions";
import {
  CellAttributes,
  NotationAttributes,
} from "common/baseTypes";
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

type MouseEventHandler = (e: MouseEvent, params?: any) => void;
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
    params: any = {},
  ) {
    editMode.forEach((editMode) =>
      watch(
        () => eventBus.get(editMode, eventType),
        (e: MouseEvent) => {
          if (!e) return;
          handler(e, params);
          eventBus.remove(eventType, editMode); // clear event from bus to allow reselction
        },
      ),
    );
  }

  function watchKeyEvent(
    editMode: EditMode[],
    eventType: BusEventType,
    handler: KeyEventHandler,
  ) {
    editMode.forEach((editMode) =>
      watch(
        () => eventBus.get(editMode, eventType),
        (e: KeyboardEvent) => {
          if (!e) return;
          handler(e);
          eventBus.remove(eventType, editMode); // clear event from bus to allow reselction
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
    oldEditModes: EditMode[],
    newEditMode: EditMode,
    handler: EditModeHandler,
  ) {
    oldEditModes.forEach((oldEditMode) => {
      watch(
        () => editModeStore.getEditMode() as EditMode,
        (nEditMode: EditMode, oEditMode: EditMode) => {
          if (nEditMode === newEditMode && oEditMode === oldEditMode) {
            handler(nEditMode, oEditMode);
          }
        },
      );
    });
  }

  // Watch for the end of an edit mode transition
  // This is useful for actions that should happen after the edit mode has changed
  // and the new edit mode is not one of the excluded modes.
  function watchEndOfEditMode(
    oldEditModes: EditMode[],
    excludeNewEditModes: EditMode[],
    handler: EditModeHandler,
  ) {
    oldEditModes.forEach((oldEditMode) => {
      watch(
        () => editModeStore.getEditMode() as EditMode,
        (newEditMode: EditMode, oEditMode: EditMode) => {
          if (
            newEditMode !== oldEditMode &&
            oEditMode === oldEditMode &&
            !excludeNewEditModes.includes(newEditMode)
          ) {
            handler(newEditMode, oEditMode);
          }
        },
      );
    });
  }

  function watchNotationSelection(
    editModes: EditMode[],
    eventType: BusEventType,
    handler: NotationSelectionHandler,
  ) {
    editModes.forEach((editMode) => {
      watch(
        () => eventBus.get(editMode, eventType),
        (notation: NotationAttributes) => {
          if (!notation) return;
          handler(notation);
          eventBus.remove(eventType, editMode); // clear event from bus to allow reselction
        },
      );
    });
  }

  function watchCustomEvent(
    editModes: EditMode[],
    eventType: BusEventType,
    handler: CustomEventHandler,
  ) {
    editModes.forEach((editMode) => {
      watch(
        () => eventBus.get(editMode, eventType),
        (data: any) => {
          if (!data) return;
          handler(data);
          eventBus.remove(eventType, editMode); // clear event from bus to allow reselction
        },
      );
    });
  }

  function watchLoadedEvent(props: any, handler: PropEventHandler) {
    watch(props, (data: any) => {
      if (data["loaded"]) handler(data["svgId"]);
    });
  }

  function watchNotationsEvent(svgId: string, handler: CustomEventHandler) {
    watch(
      () => notationStore.getNotations(),
      () => {
        handler(svgId);
      },
      { deep: true, immediate: true },
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

