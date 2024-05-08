<template>
  <v-card
    variant="outlined"
    id="text_writer"
    class="text"
    v-if="show"
    style="position: absolute"
    v-bind:style="{
      left: textLeft + 'px',
      top: textTop + 'px',
      width: '100px',
      height: '100px',
    }"
  >
    <v-textarea
      auto-grow
      autofocus
      v-model="textValue"
      background-color="grey lighten-2"
      color="cyan"
    >
    </v-textarea>
  </v-card>
</template>

<script setup lang="ts">
import { watch, ref, computed } from "vue";
import { useNotationStore } from "../store/pinia/notationStore";
import { useEditModeStore } from "../store/pinia/editModeStore";
import useEventBus from "../helpers/eventBusHelper";
import { RectNotationAttributes } from "../../../math-common/build/baseTypes";

let textValue = ref("");

const notationStore = useNotationStore();
const eventBus = useEventBus();
const emit = defineEmits(["hide"]);
const editModeStore = useEditModeStore();

watch(
  () => eventBus.bus.value.get("svgmousedown"),
  (e: MouseEvent) => {
    handleMouseDown(e);
  },
);

let show = ref(false);
let textLeft = ref(0);
const textTop = ref(0);

function handleMouseDown(e: MouseEvent) {
  const editMode = editModeStore.getEditMode();

  if (editMode == "TEXT_WRITING") {
    leave();
  }

  if (editMode == "TEXT") {
    editModeStore.setNextEditMode();
    setInitalTextValue();
    textLeft.value = e.clientX;
    textTop.value = e.clientY;
    show.value = true;
    return;
  }
}

function setInitalTextValue() {
  textValue.value = "";
  if (notationStore.getSelectedNotations()[0]?.notationType == "TEXT")
    textValue.value = (
      notationStore.getSelectedNotations()[0] as RectNotationAttributes
    ).value;
}

function leave() {
  editModeStore.setNextEditMode();
  show.value = false;
  eventBus.emit("freeTextSubmited", textValue.value);
}
</script>
