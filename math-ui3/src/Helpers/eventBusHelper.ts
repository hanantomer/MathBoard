import { ref } from "vue";
const bus = ref(new Map());

export default function() {

    function emit(event: string, arg?: any) {
        bus.value.set(event, arg);
    }

    return {
        emit,
        bus
    }
}
