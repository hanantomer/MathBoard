import { ref } from "vue";
import { BusEventType } from "../../../math-common/build/unions";
const bus = ref(new Map<BusEventType, any>());


export default function() {

    function emit(event: BusEventType, arg?: any) {
      bus.value.set(event, arg);
    }

    return {
        emit,
        bus
    }
}
