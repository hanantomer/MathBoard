<template>
  <div style="height: 100%">
    <createAccessLinkDialog
      v-model="isAccessLinkDialogOpen"
      v-on="{ create: $createAccessLink }"
    ></createAccessLinkDialog>
    <fractionDialog
      v-model="isFractionDialogOpen"
      v-on="{
        save: $saveFraction,
      }"
    ></fractionDialog>

    <!-- selection rectangle -->
    <v-card
      id="selection"
      v-on:mouseup="editManager_selectionMouseUp"
      v-on:mousedown="editManager_selectionMouseDown"
      v-on:mousemove="editManager_mouseMove"
      v_-if="editManager_getCurrentMode === 'SELECT'"
      class="grabbable"
      v-bind:style="{
        left: selectionRectLeft,
        top: selectionRectTop,
        width: selectionRectWidth,
        height: selectionRectHeight,
      }"
      style="
        position: absolute;
        z-index: 99;
        background: transparent;
        border: 1, 1, 1, 1;
      "
    ></v-card>

    <v-row>
      <v-col cols="1" sm="2" class="vertical-toolbar-column">
        <v-toolbar color="primary" flat dark class="vertical-toolbar">
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
                @click="$toggleExerciseMatrix"
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
      </v-col>
      <v-col cols="sm 8">
        <svg
          id="svg"
          style="height: 100%; width: -webkit-fill-available"
          v-on:mousedown="editManager_mouseDown"
          v-on:mousemove="editManager_mouseMove"
          v-on:mouseup="editManager_mouseUp"
        ></svg>
      </v-col>
      <v-col cols="3">
        <v-list>
          <v-list-item-group active-class="activestudent" color="indigo">
            <v-list-item v-for="student in students" :key="student.id">
              <v-list-item-avatar>
                <v-img :src="student.imageUrl"></v-img>
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title
                  v-text="$getStudentDisplayName(student)"
                ></v-list-item-title>
              </v-list-item-content>
              <v-btn
                class="[mx-2]"
                fab
                dark
                x-small
                color="green"
                v-on:click="$toggleStudentAuthorization(student)"
              >
                <v-icon dark> mdi-pencil </v-icon>
              </v-btn>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import * as d3 from "d3";
import { mapState } from "vuex";
import { mapGetters } from "vuex";
import matrixOverlayMixin from "../Mixins/matrixOverlayMixin";
import positionMixin from "../Mixins/positionMixin";
import selectionMixin from "../Mixins/selectionMixin";
import editManager from "../Mixins/editManager";
import symbolMixin from "../Mixins/symbolMixin";
import fractionMixin from "../Mixins/fractionMixin";
import notationMixin from "../Mixins/notationMixin";
import userOperationsSyncMixin from "../Mixins/userOperationsSyncMixin";
import createAccessLinkDialog from "./CreateAccessLinkDialog.vue";
import fractionDialog from "./fractionDialog.vue";

export default {
  components: {
    createAccessLinkDialog,
    fractionDialog,
  },
  props: ["exerciseId"],
  destroyed: function () {
    window.removeEventListener("keyup", this.editManager_keyUp);
  },
  mounted: function () {
    this.svg = d3.select("#svg");

    this.boundingClientRet = document
      .getElementById("svg")
      .getBoundingClientRect();

    this.$loadExercise().then(() => {
      window.addEventListener("keyup", this.editManager_keyUp);
    });
    this.matrixMixin_setMatrix();
    this.reRenderMathJax();
  },
  data: function () {
    return {
      deleteButtonActive: 1,
      selectionButtonActive: 1,
      boundingClientRet: null,
      isAdmin: false,
      isAccessLinkDialogOpen: false,
      isFractionDialogOpen: false,
      showFractionTooltip: false,
      showAccessTooltip: false,
      svg: {},
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
  mixins: [
    matrixOverlayMixin,
    positionMixin,
    selectionMixin,
    userOperationsSyncMixin,
    symbolMixin,
    editManager,
    fractionMixin,
    notationMixin,
  ],
  computed: {
    ...mapState({
      notations: (state) => {
        return state.notationStore.notations;
      },
      students: (state) => {
        return state.studentStore.students;
      },
      authorized: (state) => state.userStore.loggedUser.authorized,
    }),
  },
  watch: {
    $route: "$loadExercise",
    notations: {
      deep: true,
      handler: function (notations) {
        this.matrixMixin_refreshScreen(notations);
        this.reRenderMathJax();
      },
    },
  },
  methods: {
    ...mapGetters({
      getSelectedNotations: "getSelectedNotations",
      getNotationByRectCoordinates: "getNotationByRectCoordinates",
      getCurrentExercise: "getCurrentExercise",
      getExercises: "getExercises",
      getUser: "getUser",
      getStudent: "getStudent",
      getSymbols: "getSymbols",
      getFractions: "getFractions",
    }),
    $openFractionDialog() {
      this.isFractionDialogOpen = true;
      this.editManager_fractionDialogOpened();
    },
    $saveFraction(fraction) {
      this.editManager_saveFractionClicked();
      this.fractionMixin_saveFraction(
        fraction.nominatorValue,
        fraction.denominatorValue
      );
    },
    $toggleExerciseMatrix() {
      this.matrixMixin_toggleMatrixOverlay();
    },
    $getStudentDisplayName(student) {
      return student.firstName + " " + student.lastName;
    },
    $loadExercise: async function () {
      if (!this.getCurrentExercise().hasOwnProperty()) {
        await this.$store.dispatch("loadExercise", this.exerciseId);
      }
      this.isAdmin = this.getCurrentExercise().UserId === this.getUser().id;

      if (!this.isAdmin) {
        setInterval(this.mixin_sendHeartBeat, 2000, this.exerciseId);
      }

      await this.$store.dispatch("loadNotations", this.exerciseId);
      //await this.$store.dispatch("loadFractions", this.exerciseId);

      this.mixin_syncIncomingUserOperations(this.exerciseId, this.isAdmin); ///TODO create mechnism to handle gaps between load and sync
    },
    $createAccessLink: function (link) {
      this.$store.dispatch("createAccessLink", {
        ExerciseId: this.exerciseId,
        link: link,
      });
    },
    $toggleStudentAuthorization: function (student) {
      this.toggleAuthorization(student.userId).then((authorization) => {
        this.mixin_syncOutgoingAuthUser(
          this.exerciseId,
          authorization.authorizedStudentId,
          authorization.revokedStudentId
        );
      });
    },
  },
};
</script>

<style>
.activestudent {
  border: 2px dashed rgb(143, 26, 179);
}
/* #svg {
  width: 700px;
  height: 500px;
} */
.hellow {
  padding: 5px;
  color: darkkhaki;
}
.grabbable {
  cursor: move; /*fallback if grab cursor is unsupported */
  cursor: grab;
  cursor: -moz-grab;
  cursor: -webkit-grab;
}

/* (Optional) Apply a "closed-hand" cursor during drag operation. */
.grabbable:active {
  cursor: grabbing;
  cursor: -moz-grabbing;
  cursor: -webkit-grabbing;
}
.nopadding {
  padding: 0 !important;
}
.iconActive {
  background-color: dodgerblue;
}
.deleteButtonActive {
  cursor: URL("~@/assets/delete.jpg"), none !important;
}
/* mjx-container[jax="CHTML"][display="true"] {
  padding: 0.2em;
  margin-top: auto !important;
  margin-bottom: auto !important;
} */
mjx-container[jax="SVG"][display="true"] {
  margin: auto !important;
}

mjx-line {
  margin-top: 0.05em !important;
  margin-bottom: 0.3em !important;
}
._v-main {
  height: fill-content;
}
.vertical-toolbar {
  flex-flow: column wrap !important;
  width: 45px !important;
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
