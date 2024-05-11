<template>
  <v-row justify="center">
    <v-dialog
      v-model="dialog"
      max-width="400px"
      persistent
      @keydown.esc="closeDialog"
    >
      <v-card>
        <v-card-title>
          <span class="headline">Exponent construction</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="6">
                <v-text-field
                  :rules="[rules.required, rules.maxLength]"
                  v-model="base"
                  label="base"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  :rules="[rules.required, rules.maxLength]"
                  v-model="exponent"
                  label="exponent"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" @click="closeDialog"> Close </v-btn>
          <v-btn color="blue darken-1" @click="submit"> Submit exponent </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import useEventBus from "../helpers/eventBusHelper";
import { useNotationStore } from "../store/pinia/notationStore";
import { ExponentNotationAttributes } from "common/baseTypes";

const emit = defineEmits(["close", "save"]);
const eventBus = useEventBus();
const notationStore = useNotationStore();

const dialog = ref(false);
const props = defineProps({
  show: { type: Boolean },
});

watch(
  () => props.show,
  (newVal) => {
    dialog.value = newVal;
    setInitalTextValue();
  },
);

let base = ref("");
let exponent = ref("");

const rules = {
  required: (value: string) => !!value || "Required.",
  maxLength: (value: string) => value.length <= 2 || "Maximum base length is 2",
};

function setInitalTextValue() {
  base.value = "";
  if (notationStore.getSelectedNotations()[0]?.notationType == "EXPONENT") {
    base.value = (
      notationStore.getSelectedNotations()[0] as ExponentNotationAttributes
    ).base;

    exponent.value = (
      notationStore.getSelectedNotations()[0] as ExponentNotationAttributes
    ).exponent;
  }
}

function submit() {
  if (base.value.length > 2 || base.value.length == 0) return;
  if (exponent.value.length > 2 || exponent.value.length == 0) return;

  eventBus.emit("EXPONENT_SUBMITED", {
    base: base.value,
    exponent: exponent.value,
  });
   emit("close");
}

function closeDialog() {
  emit("close");
}
</script>
