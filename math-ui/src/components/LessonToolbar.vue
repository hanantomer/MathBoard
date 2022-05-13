<template>
  <v-toolbar color="primary" dark class="vertical-toolbar">
    <!-- selection button -->
    <v-tooltip top hidden>
      <template v-slot:activator="{ on, attrs }">
        <v-btn-toggle
          v-model="selectionButtonActive"
          background-color="transparent"
          active-class="iconActive"
        >
          <v-btn
            color="yellow"
            icon
            v-on="on"
            v-bind="attrs"
            v-on:click="editManager_selectionButtonPressed"
            x-small
            ><v-icon>mdi-selection</v-icon></v-btn
          >
        </v-btn-toggle>
      </template>
      <span>Selection</span>
    </v-tooltip>

    <!-- eraser tool -->
    <v-tooltip top hidden>
      <template v-slot:activator="{ on, attrs }">
        <v-btn-toggle
          v-model="deleteButtonActive"
          background-color="transparent"
          active-class="iconActive"
        >
          <v-btn
            icon
            v-on="on"
            v-bind="attrs"
            :disabled="!authorized && !isAdmin"
            v-on:click="editManager_deleteButtonPressed"
            x-small
            ><v-icon>mdi-delete</v-icon></v-btn
          >
        </v-btn-toggle>
      </template>
      <span>Eraser</span>
    </v-tooltip>

    <!-- create access link -->
    <v-tooltip top hidden v-if="isAdmin" v-model="showAccessTooltip">
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          icon
          v-on="on"
          v-bind="attrs"
          @click.stop="isAccessLinkDialogOpen = true"
          color="white"
          x-small
          fab
          dark
          ><v-icon>mdi-account-plus</v-icon></v-btn
        >
      </template>
      <span>Create Access Link</span>
    </v-tooltip>

    <!-- fraction -->
    <v-tooltip top hidden v-model="showFractionTooltip">
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          icon
          color="white"
          x-small
          fab
          dark
          v-on="on"
          v-bind="attrs"
          :disabled="!authorized && !isAdmin"
          @click.stop="$openFractionDialog"
        >
          <v-icon>mdi-fraction-one-half</v-icon>
        </v-btn>
      </template>
      <span>Add Fraction</span>
    </v-tooltip>

    <!-- toggle mtrix rectangles -->
    <v-tooltip top hidden>
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          v-if="isAdmin"
          @click="$toggleLessonMatrix"
          icon
          color="white"
          x-small
          fab
          dark
          v-on="on"
          v-bind="attrs"
          ><v-icon>mdi-grid</v-icon>
        </v-btn>
      </template>
      <span>Toggle matrix rectangles</span>
    </v-tooltip>

    <v-btn
      :disabled="!authorized && !isAdmin"
      v-for="s in signs"
      :key="s.sign"
      v-on:click="editManager_symbolButtonPressed"
      x-small
      text
      fab
      ><span class="mr-1">{{ s.sign }}</span></v-btn
    >
  </v-toolbar>
</template>

<script>
import editManager from "../Mixins/editManager";
export default {
  mixins: [editManager],
  props: {
    isAdmin: { type: Boolean },
    authorized: { type: Boolean },
  },
  data: function () {
    return {
      deleteButtonActive: 1,
      selectionButtonActive: 1,
      showFractionTooltip: false,
      showAccessTooltip: false,
      signs: [
        { sign: "1" },
        { sign: "2" },
        { sign: "3" },
        { sign: "4" },
        { sign: "5" },
        { sign: "6" },
        { sign: "7" },
        { sign: "8" },
        { sign: "9" },
        { sign: "0" },
        { sign: "+" },
        { sign: "-" },
        { sign: "*" },
        { sign: "." },
        { sign: "=" },
        { sign: "(" },
        { sign: ")" },
      ],
    };
  },
};
</script>

<style>
.vertical-toolbar {
  flex-basis: content;
  flex-flow: column wrap !important;
  width: 55px !important;
  height: max-content !important;
  padding: 4px !important;
}
.vertical-toolbar .v-toolbar__content {
  flex-flow: column wrap !important;
  width: 35px !important;
  height: max-content !important;
  padding: 2px !important;
}
.vertical-toolbar-column {
  flex-basis: content;
}
</style>
