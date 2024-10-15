import { ref, computed } from "vue";
import { BusEventType, EditMode } from "../../../math-common/build/unions";
import { useEditModeStore } from "../store/pinia/editModeStore";

const editModeStore = useEditModeStore();

const bus = ref(new Map<String, any>());

export default function () {
  function emit(event: BusEventType, e: any) {
    const key = editModeStore.getEditMode() + "_" + event;
    bus.value.set(key, e);
  }

  function get(editMode: EditMode, eventType: BusEventType): any {
    const res: any = bus.value.get(editMode + "_" + eventType);
    return res;
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
