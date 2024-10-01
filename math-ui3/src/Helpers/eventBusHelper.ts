import { ref, computed } from "vue";
import { BusEventType, EditMode } from "../../../math-common/build/unions";
import { useEditModeStore } from "../store/pinia/editModeStore";

const editModeStore = useEditModeStore();

const bus = ref(new Map<String, any>());

export default function () {
  function emit(event: BusEventType, e: any) {
    const key = editModeStore.getEditMode() + "_" + event;
    console.debug("emmiting:" + key);
    bus.value.set(key, e);
  }

  function get(editMode: EditMode, eventType: BusEventType): any {
    return bus.value.get(editMode + "_" + eventType);
  }

  function remove(eventType: BusEventType, editMode: EditMode) {
    bus.value.delete(editMode + eventType);
  }

  return {
    emit,
    remove,
    get,
  };
}
