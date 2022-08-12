<template>
  <div class="fill-height" style="width: 100%; position: relative">
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
                selectionButtonPressed: eventManager_selectionButtonPressed,
                deleteButtonPressed: eventManager_deleteButtonPressed,
                symbolButtonPressed: eventManager_symbolButtonPressed,
                drawSqrtLineButtonPressed: eventManager_drawSqrtLineButtonPressed,
                drawFractionLineButtonPressed: eventManager_drawFractionLineButtonPressed,
                powerButtonPressed: eventManager_powerButtonPressed,
              }"
            ></lesson-toolbar>
          </v-col>
          <v-col cols="11">
            <div style="overflow: auto; height: 100%; position: relative">
              <svg
                id="svg"
                width="1350px"
                height="97%"
                v-on:mousedown="eventManager_mouseDown"
                v-on:mousemove="eventManager_mouseMove"
                v-on:mouseup="eventManager_mouseUp"
              ></svg>
              <areaSelector
                :svg="svg"
                :initialPosition="selectionAreaRelay.initialPosition"
                :currentPosition="selectionAreaRelay.currentPosition"
                :currentMovePosition="selectionAreaRelay.currentMovePosition"
                :selectionEnded="selectionAreaRelay.ended"
                :selectionMoveEnded="selectionAreaRelay.moveEnded"
                v-show="
                  eventManager_getCurrentMode === 'SELECTING' ||
                  eventManager_getCurrentMode === 'MOVESELECTION'
                "
              ></areaSelector>
              <lineDrawer
                v-on="{
                  ended: eventManager_endDrawLine,
                }"
                :editMode="currentMode"
                :lineType="drawLineRelay.lineType"
                :startMousePosition="drawLineRelay.startMousePosition"
                :currentMousePosition="drawLineRelay.currentMousePosition"
                :selectedLineId="drawLineRelay.selectedLineId"
                :ended="drawLineRelay.ended"
                v-show="
                  eventManager_getCurrentMode === 'SELECTLINE' ||
                  drawLineRelay.lineType != 'NONE'
                "
              ></lineDrawer>
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
import selectionMixin from "../Mixins/selectionMixin";
import eventManager from "../Mixins/eventManager";
import symbolMixin from "../Mixins/symbolMixin";
import notationMixin from "../Mixins/notationMixin";
import userOperationsOutgoingSyncMixin from "../Mixins/userOutgoingOperationsSyncMixin";
import userOperationsIncomingSyncMixin from "../Mixins/userIncomingOperationsSyncMixin";
import lessonStudents from "./LessonStudents.vue";
import lessonToolbar from "./LessonToolbar.vue";
import areaSelector from "./SelectionArea.vue";
import lineDrawer from "./LineDrawer.vue";

export default {
  components: {
    lessonStudents,
    lessonToolbar,
    areaSelector,
    lineDrawer,
  },
  props: ["lessonId"],
  destroyed: function () {
    window.removeEventListener("keyup", this.eventManager_keyUp);
  },
  mounted: function () {
    this.svg = d3.select("#svg");

    this.boundingClientRet = document
      .getElementById("svg")
      .getBoundingClientRect();

    this.$loadLesson().then(() => {
      window.addEventListener("keyup", this.eventManager_keyUp); /// TODO check if still required
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
    selectionMixin,
    userOperationsOutgoingSyncMixin,
    userOperationsIncomingSyncMixin,
    symbolMixin,
    eventManager,
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
      getNotations: "getNotations",
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
          1000,
          this.lessonId
        );
      }

      // load to screen
      await this.$store.dispatch("loadLessonNotations", this.lessonId);

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
mjx-container[jax="SVG"][display="true"] {
  margin: auto !important;
}

mjx-line {
  margin-top: 0.05em !important;
  margin-bottom: 0.3em !important;
}

.line {
  position: absolute;
  display: block;
  border-bottom: solid 1px;
  border-top: solid 1px;
  cursor: pointer;
}

.lineHandle {
  cursor: col-resize;
  position: absolute;
  z-index: 999;
  width: 10px;
  height: 10px;
  border: 1, 1, 1, 1;
}
</style>
