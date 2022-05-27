<template>
  <div class="fill-height" style="width: 100%">
    <!-- selection rectangle TODO:  make it a component-->
    <v-card
      id="selection"
      v-on:mouseup="editManager_selectionMouseUp"
      v-on:mousedown="editManager_selectionMouseDown"
      v-on:mousemove="editManager_mouseMove"
      v-show="editManager_getCurrentMode === 'SELECT'"
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
        <p>{{ lessonName }}</p>
        <!-- TODO: better design for lesson title -->
      </v-col>
    </v-row>
    <v-row dense style="height: 98%">
      <v-col cols="10" fluid>
        <v-row style="height: 100%">
          <v-col colls="1">
            <lesson-toolbar
              ref="editoToolbar"
              :_isAdmin="isAdmin"
              :_authorized="authorized"
              :lessonId="lessonId"
              v-on="{
                selectionButtonPressed: editManager_selectionButtonPressed,
                deleteButtonPressed: editManager_deleteButtonPressed,
                symbolButtonPressed: editManager_symbolButtonPressed,
                drawlineButtonPressed: editManager_drawlineButtonPressed,
              }"
            ></lesson-toolbar>
          </v-col>
          <v-col cols="11">
            <div style="overflow: auto; height: 100%">
              <svg
                id="svg"
                width="1350px"
                height="97%"
                v-on:mousedown="editManager_mouseDown"
                v-on:mousemove="editManager_mouseMove"
                v-on:mouseup="editManager_mouseUp"
              ></svg>
            </div>
          </v-col>
        </v-row>
      </v-col>
      <v-col cols="2" v-if="isAdmin">
        <lesson-students :lessonId="lessonId"></lesson-students>
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
import notationMixin from "../Mixins/notationMixin";
import userOperationsSyncMixin from "../Mixins/userOperationsSyncMixin";
import lessonStudents from "./LessonStudents.vue";
import lessonToolbar from "./LessonToolbar.vue";

export default {
  components: {
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
    }),
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
