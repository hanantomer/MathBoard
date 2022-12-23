<template>
  <div>
    <accessLinkDialog
      v-model="accessLinkDialogOpen"
      v-on="{ create: $createAccessLink }"
    ></accessLinkDialog>
    <freeTextDialog
      v-model="freeTextDialogOpen"
      v-on="{ freeTextSubmitted: $submitText }"
    ></freeTextDialog>

    <v-toolbar color="primary" dark class="vertical-toolbar">
      <!-- create access link -->
      <v-tooltip top hidden v-if="isTeacher" v-model="showAccessTooltip">
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            icon
            v-on="on"
            v-bind="attrs"
            @click.stop="accessLinkDialogOpen = true"
            color="white"
            x-small
            fab
            dark
            ><v-icon>mdi-account-plus</v-icon></v-btn
          >
        </template>
        <span>Create Access Link</span>
      </v-tooltip>
      <!-- text tool  -->
      <v-tooltip top hidden>
        <template v-slot:activator="{ on, attrs }">
          <v-btn-toggle
            v-model="textButtonActive"
            background-color="transparent"
            active-class="iconActive"
          >
            <v-btn
              icon
              v-on="on"
              v-bind="attrs"
              :disabled="(!authorized && !isTeacher) || !hasActiveCell"
              v-on:click="$startTextMode"
              @click.stop="freeTextDialogOpen = true"
              x-small
              ><v-icon>mdi-text</v-icon></v-btn
            >
          </v-btn-toggle>
        </template>
        <span>Free Text</span>
      </v-tooltip>

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
      <!-- <v-tooltip top hidden>
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
      </v-tooltip> -->
    </v-toolbar>
  </div>
</template>

<script>
import EditMode from "../Mixins/editMode";
import NotationType from "../Mixins/notationType";
import matrixMixin from "../Mixins/matrixMixin";
import symbolMixin from "../Mixins/symbolMixin";
import userIncomingOperationsSyncMixin from "../Mixins/userIncomingOperationsSyncMixin";
import userOutgoingOperationsSyncMixin from "../Mixins/userOutgoingOperationsSyncMixin";
import accessLinkDialog from "./AccessLinkDialog.vue";
import freeTextDialog from "./FreeTextDialog.vue";
import { mapGetters } from "vuex";
import { mapActions } from "vuex";
import { mapState } from "vuex";

export default {
  components: {
    accessLinkDialog,
    freeTextDialog,
  },
  mixins: [
    matrixMixin,
    symbolMixin,
    userIncomingOperationsSyncMixin,
    userOutgoingOperationsSyncMixin,
  ],
  mounted: function () {
    //emited from lesson/question/answer
    this.$root.$on("resetToolbarState", () => {
      this.$reset();
    });
  },
  methods: {
    ...mapGetters({
      getCurrentEditMode: "getCurrentEditMode",
      getCurrentLesson: "getCurrentLesson",
      getActiveCell: "getActiveCell",
      getActiveNotation: "getActiveNotation",
      getUser: "getUser",
      isTeacher: "isTeacher",
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
      if (this.getCurrentEditMode() == EditMode.POWER) {
        this.$endPowerMode();
      } else {
        this.$startPowerMode();
      }
    },
    async $startPowerMode() {
      this.$reset();
      this.powerButtonActive = 0;
      await this.setCurrentEditMode(EditMode.POWER);
    },
    $endPowerMode() {
      this.$reset();
    },
    // $toggleDeleteMode() {
    //   if (this.getCurrentEditMode() == EditMode.DELETE) {
    //     this.$endDeleteMode();
    //   } else {
    //     this.$startDeleteMode();
    //   }
    // },
    // $toggleTextMode() {
    //   if (this.getCurrentEditMode() == EditMode.TEXT) {
    //     this.$endTextMode();
    //   } else {
    //     this.$startTextMode();
    //   }
    // },
    async $startTextMode() {
      this.$reset();
      this.textButtonActive = 0;
      await this.setCurrentEditMode(EditMode.TEXT);
    },
    $endTextMode() {
      this.$reset();
    },
    // async $startDeleteMode() {
    //   this.$reset();
    //   this.deleteButtonActive = 0;
    //   this.showDeleteCursor();
    //   await this.setCurrentEditMode(EditMode.DELETE);
    // },
    // $endDeleteMode() {
    //   this.$reset();
    // },
    $toggleSelectionMode() {
      if (this.getCurrentEditMode() == EditMode.SELECT) {
        this.$endSelectionMode();
      } else {
        this.$startSelectionMode();
      }
    },
    async $startSelectionMode() {
      this.$reset();
      this.selectionButtonActive = 0;
      await this.setCurrentEditMode(EditMode.SELECT);
    },
    async $endSelectionMode() {
      this.$reset();
      await this.setCurrentEditMode(EditMode.SYMBOL);
    },
    $symbolButtonPressed(e) {
      if (this.getCurrentEditMode() === EditMode.SYMBOL)
        this.symbolMixin_addSymbol(e.currentTarget.innerText, "symbol");
      else if (this.getCurrentEditMode() === EditMode.POWER) {
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
    $submitText: function (value, background_color) {
      let activeCell = this.getActiveCell();
      let text = {
        type: NotationType.TEXT,
        fromCol: activeCell.col,
        toCol:
          parseInt(activeCell.col) + Math.floor(this.freeTextRectWidth(value)),
        fromRow: activeCell.row,
        toRow:
          parseInt(activeCell.row) + Math.floor(this.freeTextRectHeight(value)),
        value: value,
        background_color: background_color,
      };
      this.$store
        .dispatch("addNotation", text)
        .then((text) => {
          this.userOperationsMixin_syncOutgoingSaveNotation(text);
        })
        .catch((e) => {
          console.error(e);
        });

      this.$store.dispatch("setActiveCell", {});
    },
    async $reset() {
      this.$resetButtonsState();
      await this.setCurrentEditMode(EditMode.SYMBOL);
    },
    $resetButtonsState() {
      this.deleteButtonActive = this.selectionButtonActive = this.fractionButtonActive = this.squareRootButtonActive = this.powerButtonActive = 1;
    },
    // $showDeleteCursor() {
    //   document.getElementById(this.svgId).classList.add("deleteButtonActive");
    // },
    // $hideDeleteCursor() {
    //   document
    //     .getElementById(this.svgId)
    //     .classList.remove("deleteButtonActive");
    // },
  },
  computed: {
    ...mapState({
      currentEditMode: (state) => {
        return state.lessonStore.operationMode.editMode;
      },
    }),
    authorized: function () {
      return !!this.getUser().authorized;
    },
    hasActiveCell: function () {
      return !!this.getActiveCell()?.col || !!this.getActiveNotation()?.id;
    },
  },
  watch: {
    currentEditMode: {
      deep: true,
      handler(newVal) {
        if (newVal == EditMode.SYMBOL) {
          this.$resetButtonsState();
        }
      },
    },
  },

  data: function () {
    return {
      accessLinkDialogOpen: false,
      freeTextDialogOpen: false,
      deleteButtonActive: 1,
      textButtonActive: 1,
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
