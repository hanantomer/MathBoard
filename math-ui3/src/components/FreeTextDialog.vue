<template>
  <v-row justify="center">
    <v-dialog
      persistant
      v-model="dialog"
      max-width="800px"
      @keydown.esc="closeDialog"
    >
      <v-card>
        <v-card-title>
          <span class="headline">Compose free text</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-textarea
                  autofocus
                  v-model="textValue"
                  background-color="grey lighten-2"
                  color="cyan"
                ></v-textarea>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="6"> Background color: </v-col>
            </v-row>

            <!-- <v-row>
              <v-col cols="12">
                <v-color-picker
                  v-model="background_color"
                  dot-size="25"
                  mode="hexa"
                  show-swatches
                  swatches-max-height="100"
                ></v-color-picker>
              </v-col>
            </v-row> -->
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" @click="closeDialog"> Close </v-btn>
          <v-btn color="blue darken-1" @click="submit"> Submit text </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script setup lang="ts">
import { watch, ref } from "vue";
import { useNotationStore } from "../store/pinia/notationStore";
import useEventBus from "../helpers/eventBusHelper";
import { RectNotationAttributes } from "../../../math-common/build/baseTypes";

const notationStore = useNotationStore();
const eventBus = useEventBus();

const emit = defineEmits(["close"]);

const props = defineProps({
  show: { type: Boolean },
});

let dialog = ref(false);

watch(
  () => props.show,
  (newVal) => {
    dialog.value = newVal;
    setInitalTextValue();
  },
  { immediate: true },
);

let textValue = ref("");

function setInitalTextValue() {
  if (
    notationStore.getSelectedNotations().length === 1 &&
    notationStore.getSelectedNotations()[0].notationType == "TEXT"
  )
    textValue.value = (
      notationStore.getSelectedNotations()[0] as RectNotationAttributes
    ).value;
}

function submit() {
  eventBus.emit("freeTextSubmited", textValue.value);
  closeDialog();
}

function closeDialog() {
  emit("close");
}
</script>
