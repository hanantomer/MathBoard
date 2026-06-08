<template>
  <v-dialog
    v-model="show"
    max-width="400px"
    min-height="400px"
    transition="dialog-bottom-transition"
    persistent
  >
    <v-form @submit.prevent="save">
      <v-card data-cy="new-board-item-dialog">
        <v-card-title class="headline">
          <span v-html="title"></span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  data-cy="newItemName"
                  autofocus
                  v-model="name"
                  label="name*"
                  required
                ></v-text-field>
              </v-col>
            </v-row>
          </v-container>
          <small>*indicates required field</small>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            data-cy="button-close"
            color="blue darken-1"
            v-on:click="close"
          >
            Close
          </v-btn>
          <v-btn data-cy="button-save" color="blue darken-1" type="submit">
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";


const emit = defineEmits(["close", "save"]);

let show = ref(false);

const props = defineProps({
  dialog: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
  },
  initialName: {
    type: String,
    default: "",
  },
});

watch(
  () => props.dialog,
  (val: boolean) => {
    show.value = val;
    if (val) {
      name.value = props.initialName ?? "";
    }
  },
);

let name = ref("");
function save() {
  const trimmed = name.value?.trim();
  if (!trimmed) {
    return;
  }
  emit("save", trimmed);
  name.value = "";
}

function close() {
  emit("close");
}

</script>
