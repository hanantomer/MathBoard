<template>
  <div class="fill-height" style="width: 100%">
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
    <!-- selection rectangle TODO:  make it component-->
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
    <v-row dense style="max-height: 25px">
      <v-col cols="12" class="d-flex justify-center">
        <h3>{{ lessonName }}</h3>
        <!-- TODO: better design for lesson title -->
      </v-col>
    </v-row>
    <v-row dense style="height: 98%">
      <v-col cols="11" fluid style="overflow: auto">
        <v-row dense>
          <v-col colls="1">
            <lesson-toolbar
              isAdmin:isAdmin
              authorized:authorized
            ></lesson-toolbar>
          </v-col>
          <v-col cols="11">
            <svg
              id="svg"
              width="1450px"
              height="97%"
              v-on:mousedown="editManager_mouseDown"
              v-on:mousemove="editManager_mouseMove"
              v-on:mouseup="editManager_mouseUp"
            ></svg>
          </v-col>
        </v-row>
      </v-col>
      <v-col cols="1" v-if="isAdmin">
        <lesson-students></lesson-students>
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
import lessonStudents from "./LessonStudents.vue";
import lessonToolbar from "./LessonToolbar.vue";

export default {
  components: {
    createAccessLinkDialog,
    fractionDialog,
    lessonStudents,
    lessonToolbar,
  },
  props: ["lessonId"],
  destroyed: function () {
    window.removeEventListener("keyup", this.editManager_keyUp);
  },
  mounted: function () {
    this.svg = d3.select("#svg");

    this.boundingClientRet = document
      .getElementById("svg")
      .getBoundingClientRect();

    this.$loadLesson().then(() => {
      window.addEventListener("keyup", this.editManager_keyUp);
    });
    this.matrixMixin_setMatrix();
    this.reRenderMathJax();
  },
  data: function () {
    return {
      boundingClientRet: null,
      isAdmin: false,
      isAccessLinkDialogOpen: false,
      isFractionDialogOpen: false,
      svg: {},
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
      authorized: (state) => state.userStore.loggedUser.authorized,
      lessonName: (state) => {
        return state.lessonStore.currentLesson.name;
      },
    }),
  },
  watch: {
    $route: "$loadLesson",
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
      getCurrentLesson: "getCurrentLesson",
      getLessons: "getLessons",
      getUser: "getUser",
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
    $toggleLessonMatrix() {
      this.matrixMixin_toggleMatrixOverlay();
    },
    $loadLesson: async function () {
      // load from db to store
      if (!this.getCurrentLesson().hasOwnProperty()) {
        await this.$store.dispatch("loadLesson", this.lessonId);
      }

      this.isAdmin = this.getCurrentLesson().UserId === this.getUser().id;

      // student send heartbeat to teacher
      if (!this.isAdmin) {
        setInterval(
          this.userOperationsMixin_syncOutgoingHeartBeat,
          2000,
          this.lessonId
        );
      }

      // load to screen
      await this.$store.dispatch("loadNotations", this.lessonId);

      // listen to changes
      this.mixin_syncIncomingUserOperations(this.lessonId, this.isAdmin); ///TODO create mechnism to handle gaps between load and sync
    },
    $createAccessLink: function (link) {
      this.$store.dispatch("createAccessLink", {
        LessonId: this.lessonId,
        link: link,
      });
    },
  },
};
</script>

<style>
.activestudent {
  border: 2px dashed rgb(143, 26, 179);
}
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
</style>
