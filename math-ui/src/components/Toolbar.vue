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
              v-on:click="$toggleSelectionMode"
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
              v-on:click="$toggleDeleteMode"
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
              v-on:click="$toggleFractionMode"
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
              v-on:click="$toggleSqrtMode"
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
              v-on:click="$togglePowerMode"
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
import EditMode from "../Mixins/editMode";
import matrixMixin from "../Mixins/matrixMixin";
import symbolMixin from "../Mixins/symbolMixin";
import userIncomingOperationsSyncMixin from "../Mixins/userIncomingOperationsSyncMixin";
import userOutgoingOperationsSyncMixin from "../Mixins/userOutgoingOperationsSyncMixin";
import createAccessLinkDialog from "./CreateAccessLinkDialog.vue";
import { mapGetters } from "vuex";
import { mapActions } from "vuex";

export default {
  components: {
    createAccessLinkDialog,
  },
  mixins: [
    matrixMixin,
    symbolMixin,
    userIncomingOperationsSyncMixin,
    userOutgoingOperationsSyncMixin,
  ],
  mounted: function () {
    this.$root.$on("resetToolbarState", () => {
      this.reset();
    });
  },
  methods: {
    ...mapGetters({
      getCurrentEditMode: "getCurrentEditMode",
      getCurrentLesson: "getCurrentLesson",
      getUser: "getUser",
    }),
    ...mapActions({
      setCurrentEditMode: "setCurrentEditMode",
    }),
    $toggleFractionMode() {
      this.$resetButtonsState();
      if (this.getCurrentEditMode() == EditMode.FRACTION) {
        this.$reset();
      } else {
        this.$startFractionMode();
      }
    },
    async $startFractionMode() {
      this.$reset();
      this.fractionButtonActive = 0;
      await this.setCurrentEditMode(EditMode.FRACTION);
    },

    $toggleSqrtMode() {
      this.$resetButtonsState();
      if (this.getCurrentEditMode() == EditMode.SQRT) {
        this.$reset();
      } else {
        this.$startSqrtMode();
      }
    },

    async $startSqrtMode() {
      this.$reset();
      this.squareRootButtonActive = 0;
      await this.setCurrentEditMode(EditMode.SQRT);
    },

    $togglePowerMode() {
      this.$resetButtonsState();
      if (this.getCurrentEditMode() == EditMode.ADD_POWER) {
        this.$endPowerMode();
      } else {
        this.$startPowerMode();
      }
    },
    async $startPowerMode() {
      this.reset();
      this.powerButtonActive = 0;
      await this.setCurrentEditMode(EditMode.ADD_POWER);
    },
    $endPowerMode() {
      this.reset();
    },
    $toggleDeleteMode() {
      if (this.getCurrentEditMode() == EditMode.DELETE) {
        this.endDeleteMode();
      } else {
        this.startDeleteMode();
      }
    },
    async $startDeleteMode() {
      this.reset();
      this.deleteButtonActive = 0;
      this.showDeleteCursor();
      await this.setCurrentEditMode(EditMode.DELETE);
    },
    $endDeleteMode() {
      this.reset();
    },
    $toggleSelectionMode() {
      if (this.getCurrentEditMode() == EditMode.SELECT) {
        this.$endSelectionMode();
      } else {
        this.$startSelectionMode();
      }
    },
    async $startSelectionMode() {
      this.reset();
      this.selectionButtonActive = 0;
      await this.setCurrentEditMode(EditMode.SELECT);
    },
    async $endSelectionMode() {
      this.$reset();
      await this.setCurrentEditMode(EditMode.ADD_SYMBOL);
    },
    $symbolButtonPressed(e) {
      if (this.getCurrentEditMode() === EditMode.ADD_SYMBOL)
        this.symbolMixin_addSymbol(e.currentTarget.innerText, "symbol");
      else if (this.getCurrentEditMode() === EditMode.ADD_POWER) {
        this.symbolMixin_addSymbol(e.currentTarget.innerText, "power");
      }
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
    async $reset() {
      this.$resetButtonsState();
      this.$hideDeleteCursor();
      await this.setCurrentEditMode(EditMode.ADD_SYMBOL);
    },
    $resetButtonsState() {
      this.deleteButtonActive = this.selectionButtonActive = this.fractionButtonActive = this.squareRootButtonActive = this.powerButtonActive = 1;
    },
    $showDeleteCursor() {
      document.getElementById(this.svgId).classList.add("deleteButtonActive");
    },
    $hideDeleteCursor() {
      document
        .getElementById(this.svgId)
        .classList.remove("deleteButtonActive");
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
  wtach: {
    reset(newVal) {
      if (!!newVal) {
        this.reset();
      }
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
