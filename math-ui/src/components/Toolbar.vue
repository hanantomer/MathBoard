<template>
  <div>
    <accessLinkDialog v-model="accessLinkDialogOpen"></accessLinkDialog>
    <freeTextDialog
      v-model="freeTextDialogOpen"
      v-on="{
        submitText: $submitText,
      }"
    ></freeTextDialog>

    <v-toolbar color="primary" dark class="vertical-toolbar">
      <!-- create access link -->
      <v-tooltip top hidden v-if="editEnabled" v-model="showAccessTooltip">
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
              :disabled="!editEnabled || !hasActiveCell"
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
              :disabled="!editEnabled"
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
              :disabled="!editEnabled"
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
              :disabled="!editEnabled"
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
              :disabled="!editEnabled"
            >
              <v-icon>mdi-exponent</v-icon>
            </v-btn>
          </v-btn-toggle>
        </template>
        <span>Power</span>
      </v-tooltip>

      <!-- checkmark-->
      <v-tooltip top hidden v-model="showCheckmarkTooltip">
        <template v-slot:activator="{ on, attrs }">
          <v-btn-toggle
            v-model="checkmarkButtonActive"
            background-color="transparent"
            active-class="iconActive"
          >
            <v-btn
              v-if="answerCheckMode"
              icon
              color="white"
              x-small
              fab
              dark
              v-on="on"
              v-bind="attrs"
              v-on:click="$toggleCheckmarkMode"
            >
              <v-icon>mdi-checkbox-marked-circle-outline</v-icon>
            </v-btn>
          </v-btn-toggle>
        </template>
        <span>Correct</span>
      </v-tooltip>

      <!-- semicheckmark-->
      <v-tooltip top hidden v-model="showSemicheckmarkTooltip">
        <template v-slot:activator="{ on, attrs }">
          <v-btn-toggle
            v-model="semicheckmarkButtonActive"
            background-color="transparent"
            active-class="iconActive"
          >
            <v-btn
              v-if="answerCheckMode"
              icon
              color="white"
              x-small
              fab
              dark
              v-on="on"
              v-bind="attrs"
              v-on:click="$toggleSemiCheckmarkMode"
            >
              <v-icon style="position: relative; left: 8px">mdi-check</v-icon>
              <v-icon style="position: relative; left: -8px; top: -1px"
                >mdi-minus</v-icon
              >
            </v-btn>
          </v-btn-toggle>
        </template>
        <span>Half Correct</span>
      </v-tooltip>

      <!-- xmark-->
      <v-tooltip top hidden v-model="showXmarkTooltip">
        <template v-slot:activator="{ on, attrs }">
          <v-btn-toggle
            v-model="xmarkButtonActive"
            background-color="transparent"
            active-class="iconActive"
          >
            <v-btn
              v-if="answerCheckMode"
              icon
              color="white"
              x-small
              fab
              dark
              v-on="on"
              v-bind="attrs"
              v-on:click="$toggleXmarkMode"
            >
              <v-icon>mdi-close-outline</v-icon>
            </v-btn>
          </v-btn-toggle>
        </template>
        <span>Incorrect</span>
      </v-tooltip>
    </v-toolbar>
  </div>
</template>

<script>
import EditMode from "../Mixins/editMode";
import NotationType from "../Mixins/notationType";
import matrixMixin from "../Mixins/matrixMixin";
import userIncomingOperationsSyncMixin from "../Mixins/userIncomingOperationsSyncMixin";
import userOutgoingOperationsSyncMixin from "../Mixins/userOutgoingOperationsSyncMixin";
import accessLinkDialog from "./AccessLinkDialog.vue";
import freeTextDialog from "./FreeTextDialog.vue";
import authMixin from "../Mixins/authMixin";
import { mapGetters } from "vuex";
import { mapActions } from "vuex";
import { mapState } from "vuex";

export default {
  components: {
    accessLinkDialog,
    freeTextDialog,
  },
  mixins: [
    authMixin,
    matrixMixin,
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
      getActiveCell: "getActiveCell",
      getActiveNotation: "getActiveNotation",
      getParent: "getParent",
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
    async $startTextMode() {
      this.$reset();
      this.textButtonActive = 0;
      await this.setCurrentEditMode(EditMode.TEXT);
    },
    $endTextMode() {
      this.$reset();
    },
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
    async $toggleCheckmarkMode() {
      if (this.getCurrentEditMode() == EditMode.CHECKMARK) {
        this.$reset();
        await this.setCurrentEditMode(EditMode.SYMBOL);
      } else {
        this.$startCheckmarkMode();
      }
    },
    async $startCheckmarkMode() {
      this.$reset();
      this.checkmarkButtonActive = 0;
      await this.setCurrentEditMode(EditMode.CHECKMARK);
    },
    async $toggleSemiCheckmarkMode() {
      if (this.getCurrentEditMode() == EditMode.SEMICHECKMARK) {
        this.$reset();
        await this.setCurrentEditMode(EditMode.SYMBOL);
      } else {
        this.$startSemiCheckmarkMode();
      }
    },
    async $startSemiCheckmarkMode() {
      this.$reset();
      this.semicheckmarkButtonActive = 0;
      await this.setCurrentEditMode(EditMode.SEMICHECKMARK);
    },
    async $toggleXmarkMode() {
      if (this.getCurrentEditMode() == EditMode.XMARK) {
        this.$reset();
        await this.setCurrentEditMode(EditMode.SYMBOL);
      } else {
        this.$startXmarkMode();
      }
    },
    async $startXmarkMode() {
      this.$reset();
      this.xmarkButtonActive = 0;
      await this.setCurrentEditMode(EditMode.XMARK);
    },

    // $symbolButtonPressed(e) {
    //   if (this.getCurrentEditMode() === EditMode.SYMBOL)
    //     this.notationMixin_addNotation(e.currentTarget.innerText, "symbol");
    //   else if (this.getCurrentEditMode() === EditMode.POWER) {
    //     this.notationMixin_addNotation(e.currentTarget.innerText, "power");
    //   }
    // },
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
      this.checkmarkButtonActive = 1;
      this.semicheckmarkButtonActive = 1;
      this.xmarkButtonActive = 1;
      this.deleteButtonActive = 1;
      this.selectionButtonActive = 1;
      this.fractionButtonActive = 1;
      this.squareRootButtonActive = 1;
      this.powerButtonActive = 1;
    },
    $checkmark() {
      //this.notationMixin_addSpecialSymbol("", NotationType.CHECKMARK);
      this.checkmarkButtonActive = 0;
    },
    $semicheckmark() {
      //this.notationMixin_addSpecialSymbol("", NotationType.CHECKMARK);
      this.semicheckmarkButtonActive = 0;
    },
    $xmark() {
      //this.notationMixin_addSpecialSymbol("", NotationType.CHECKMARK);
      this.xmarkButtonActive = 0;
    },
  },
  computed: {
    ...mapState({
      currentEditMode: (state) => {
        return state.lessonStore.operationMode.editMode;
      },
    }),
    editEnabled: function () {
      return this.mixin_canEdit();
    },
    hasActiveCell: function () {
      return !!this.getActiveCell()?.col || !!this.getActiveNotation()?.id;
    },
    answerCheckMode: function () {
      let answerCheckMode =
        this.getParent().boardType === "answer" && this.isTeacher() === true;

      return answerCheckMode;
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
      checkmarkButtonActive: 1,
      semicheckmarkButtonActive: 1,
      xmarkButtonActive: 1,
      showFractionLineTooltip: false,
      showSquareRootTooltip: false,
      showPowerTooltip: false,
      showAccessTooltip: false,
      showCheckmarkTooltip: false,
      showSemicheckmarkTooltip: false,
      showXmarkTooltip: false,
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
