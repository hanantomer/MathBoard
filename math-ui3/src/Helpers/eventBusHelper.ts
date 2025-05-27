import { ref } from "vue";
import { BusEventType, EditMode } from "../../../math-common/src/unions";
import { useEditModeStore } from "../store/pinia/editModeStore";

const editModeStore = useEditModeStore();

const bus = ref(new Map<String, any>());

export default function () {
  function emit(event: BusEventType, e: any) {
    const key = editModeStore.getEditMode() + "_" + event;
    try {
      bus.value.set(key, e);
    } catch (err) {
      console.error(err);
    }
  }

  function get(editMode: EditMode, eventType: BusEventType): any {
    try {
      const res: any = bus.value.get(editMode + "_" + eventType);
      return res;
    } catch (err) {
      console.error(err);
    }
  }

  function remove(eventType: BusEventType, editMode: EditMode) {
    bus.value.delete(editMode + "_" + eventType);
  }

  return {
    emit,
    remove,
    get,
  };
}
