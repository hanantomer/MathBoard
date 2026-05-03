import { ref } from "vue";
import { BusEventType, EditMode } from "common/unions";
import { useEditModeStore } from "../store/pinia/editModeStore";

const editModeStore = useEditModeStore();

const bus = ref(new Map<string, any>());
const listeners = ref(new Map<string, Function[]>());

export default function () {
  function emit(event: BusEventType, e: any) {
    const key = editModeStore.getEditMode() + "_" + event;
    try {
      bus.value.set(key, e);
      // Notify listeners
      const listenerKey = event;
      const funcs = listeners.value.get(listenerKey);
      if (funcs) {
        funcs.forEach((func) => func(e));
      }
    } catch (err) {
      console.error(err);
    }
  }

  function on(event: BusEventType, callback: Function) {
    const listenerKey = event;
    if (!listeners.value.has(listenerKey)) {
      listeners.value.set(listenerKey, []);
    }
    listeners.value.get(listenerKey)!.push(callback);
  }

  function off(event: BusEventType, callback: Function) {
    const listenerKey = event;
    const funcs = listeners.value.get(listenerKey);
    if (funcs) {
      const index = funcs.indexOf(callback);
      if (index > -1) {
        funcs.splice(index, 1);
      }
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
    on,
    off,
  };
}
