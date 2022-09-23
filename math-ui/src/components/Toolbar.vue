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
              :disabled="!authorized && !isTeacher"
              v-on:click="$deleteButtonPressed"
              x-small
              ><v-icon>mdi-delete</v-icon></v-btn
            >
          </v-btn-toggle>
        </template>
        <span>Eraser</span>
      </v-tooltip>

      <!-- create access link -->
      <v-tooltip top hidden v-if="isTeacher" v-model="showAccessTooltip">
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
            v-model="fractionButtonActive"
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
              :disabled="!authorized && !isTeacher"
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
              :disabled="!authorized && !isTeacher"
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
              :disabled="!authorized && !isTeacher"
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
            v-if="isTeacher"
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
        :disabled="!authorized && !isTeacher"
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
import matrixMixin from "../Mixins/matrixMixin";
import createAccessLinkDialog from "./CreateAccessLinkDialog.vue";
import { mapGetters } from "vuex";

export default {
  components: {
    createAccessLinkDialog,
  },
  mixins: [matrixMixin],
  methods: {
    ...mapGetters({
      getCurrentLesson: "getCurrentLesson",
      getUser: "getUser",
    }),

    $resetButtonsState() {
      this.deleteButtonActive = this.selectionButtonActive = this.fractionButtonActive = this.squareRootButtonActive = this.powerButtonActive = 1;
    },
    $powerButtonPressed() {
      this.$resetButtonsState();
      this.$emit("powerButtonPressed");
    },
    $deleteButtonPressed() {
      this.$resetButtonsState();
      this.$emit("deleteButtonPressed");
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
        LessonId: this.getCurrentLesson().id,
        link: link,
      });
    },
    resetToggleButtons() {
      this.deleteButtonActive = this.selectionButtonActive = this.fractionButtonActive = 1;
    },
  },
  computed: {
    isTeacher: function () {
      return this.getCurrentLesson().UserId === this.getUser().id;
    },
    authorized: function () {
      return !!this.getUser().authorized;
    },
  },
  data: function () {
    return {
      isAccessLinkDialogOpen: false,
      deleteButtonActive: 1,
      selectionButtonActive: 1,
      fractionButtonActive: 1,
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
