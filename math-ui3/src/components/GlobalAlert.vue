<template>
  <v-dialog
    v-model="globalAlertStore.show"
    :max-width="globalAlertStore.options.width"
    @keydown.esc="cancel"
  >
    <v-card>
      <v-toolbar :color="globalAlertStore.options.color" dense flat>
        <v-toolbar-title class="text-body-2 font-weight-bold grey--text">
          {{ globalAlertStore.title }}
        </v-toolbar-title>
      </v-toolbar>
      <v-card-text
        v-show="!!globalAlertStore.message"
        class="pa-4 black--text"
        v-html="globalAlertStore.message"
      ></v-card-text>
      <v-card-actions class="pt-3">
        <v-spacer></v-spacer>
        <v-btn @click="agree" v-show="globalAlertStore.type == 'warning'"
          >Confirm</v-btn
        >
        <v-btn @click="cancel" v-show="globalAlertStore.type == 'warning'"
          >Cancel</v-btn
        >
        <v-btn @click="agree" v-show="globalAlertStore.type !== 'warning'"
          >OK</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { useGlobalAlertStore } from "../store/pinia/globalAlertStore";
const globalAlertStore = useGlobalAlertStore();

function agree() {
  globalAlertStore.show = false;
  globalAlertStore.callback();
}

function cancel() {
  globalAlertStore.show = false;
}
</script>
