<template>
  <v-row justify="center">
    <v-dialog v-model="show" persistent max-width="400px" min-height="400x">
      <v-form @submit.prevent="save">
        <v-card>
          <v-card-title class="headline">
            <span v-html="title"></span>
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-text-field
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
              data-cy="button-login"
              color="blue darken-1"
              text
              type="submit"
            >
              Save
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>
  </v-row>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import useEventBus from "../helpers/eventBus";
const eventBus = useEventBus();

const props = defineProps({
  dialog: Boolean,
  title: String
});

watch(()=> props.dialog, (show: boolean) => {
  show = show;
})

let show = ref(false);
let name = ref("");
function save() {
  eventBus.emit("newItemDialogSave", name);
};

</script>
