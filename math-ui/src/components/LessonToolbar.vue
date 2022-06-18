<template>
  <div>
    <createAccessLinkDialog
      v-model="isAccessLinkDialogOpen"
      v-on="{ create: $createAccessLink }"
    ></createAccessLinkDialog>
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
              v-on:click="$selectionButtonPressed"
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
              v-on:click="$deleteButtonPressed"
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

      <!-- fraction line-->
      <v-tooltip top hidden v-model="showFractionLineTooltip">
        <template v-slot:activator="{ on, attrs }">
          <v-btn-toggle
            v-model="drawlineButtonActive"
            background-color="transparent"
            active-class="iconActive"
          >
            <v-btn
              icon
              color="white"
              x-small
              fab
              dark
              v-on="on"
              v-bind="attrs"
              v-on:click="$drawFractionLineButtonPressed"
              :disabled="!authorized && !isAdmin"
            >
              <v-icon>mdi-tooltip-minus-outline</v-icon>
            </v-btn>
          </v-btn-toggle>
        </template>
        <span>Draw fraction line</span>
      </v-tooltip>

      <!-- sqrt line-->
      <v-tooltip top hidden v-model="showSquareRootTooltip">
        <template v-slot:activator="{ on, attrs }">
          <v-btn-toggle
            v-model="squareRootButtonActive"
            background-color="transparent"
            active-class="iconActive"
          >
            <v-btn
              icon
              color="white"
              x-small
              fab
              dark
              v-on="on"
              v-bind="attrs"
              v-on:click="$drawSqrtLineButtonPressed"
              :disabled="!authorized && !isAdmin"
            >
              <v-icon>mdi-square-root</v-icon>
            </v-btn>
          </v-btn-toggle>
        </template>
        <span>Draw sqrt line</span>
      </v-tooltip>

      <!-- power-->
      <v-tooltip top hidden v-model="showPowerTooltip">
        <template v-slot:activator="{ on, attrs }">
          <v-btn-toggle
            v-model="powerButtonActive"
            background-color="transparent"
            active-class="iconActive"
          >
            <v-btn
              icon
              color="white"
              x-small
              fab
              dark
              v-on="on"
              v-bind="attrs"
              v-on:click="$powerButtonPressed"
              :disabled="!authorized && !isAdmin"
            >
              <v-icon>mdi-exponent</v-icon>
            </v-btn>
          </v-btn-toggle>
        </template>
        <span>Power</span>
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
        v-on:click="$symbolButtonPressed"
        x-small
        text
        fab
        ><span class="mr-1">{{ s.sign }}</span></v-btn
      >
    </v-toolbar>
  </div>
</template>

<script>
import matrixOverlayMixin from "../Mixins/matrixOverlayMixin";
import createAccessLinkDialog from "./CreateAccessLinkDialog.vue";

export default {
  components: {
    createAccessLinkDialog,
  },
  mixins: [matrixOverlayMixin],
  props: {
    _isAdmin: { type: Boolean },
    _authorized: { type: Boolean },
    lessonId: { type: String },
  },
  methods: {
    $resetButtonsState() {
      this.deleteButtonActive = this.selectionButtonActive = this.drawlineButtonActive = this.squareRootButtonActive = this.powerButtonActive = 1;
    },
    $powerButtonPressed() {
      this.$resetButtonsState();
      this.$emit("powerButtonPressed");
    },
    $deleteButtonPressed() {
      this.$resetButtonsState();
      this.$emit("deleterButtonPressed");
    },
    $drawSqrtLineButtonPressed() {
      this.$resetButtonsState();
      this.$emit("drawSqrtLineButtonPressed");
    },
    $drawFractionLineButtonPressed() {
      this.$resetButtonsState();
      this.$emit("drawFractionLineButtonPressed");
    },
    $selectionButtonPressed() {
      this.$resetButtonsState();
      this.$emit("selectionButtonPressed");
    },

    $symbolButtonPressed(e) {
      this.$resetButtonsState();
      this.$emit("symbolButtonPressed", e);
    },
    $toggleLessonMatrix() {
      this.matrixMixin_toggleMatrixOverlay();
    },
    $createAccessLink: function (link) {
      this.$store.dispatch("createAccessLink", {
        LessonId: this.lessonId,
        link: link,
      });
    },
    resetToggleButtons() {
      this.deleteButtonActive = this.selectionButtonActive = this.drawlineButtonActive = 1;
    },
  },
  watch: {
    _isAdmin(newVal) {
      this.isAdmin = newVal;
    },
    _authorized(newVal) {
      return (this.authorized = newVal);
    },
  },
  data: function () {
    return {
      isAdmin: false,
      authorized: false,
      isAccessLinkDialogOpen: false,
      deleteButtonActive: 1,
      selectionButtonActive: 1,
      drawlineButtonActive: 1,
      squareRootButtonActive: 1,
      powerButtonActive: 1,
      showFractionLineTooltip: false,
      showSquareRootTooltip: false,
      showPowerTooltip: false,
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
