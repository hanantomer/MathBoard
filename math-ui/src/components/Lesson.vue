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
              <template>
                <v-tabs
                  id="tabs"
                  v-model="tab"
                  slider-color="transparent"
                  active-class="active-tab"
                >
                  <v-tab> Lesson </v-tab>
                  <v-tab> Questions </v-tab>
                </v-tabs>
              </template>

              <v-tabs-items v-model="tab">
                <v-tab-item :eager="true">
                  <svg
                    v-bind:id="svgId"
                    width="1350px"
                    height="600px"
                    v-on:mousedown="eventManager_mouseDown"
                    v-on:mousemove="eventManager_mouseMove"
                    v-on:mouseup="eventManager_mouseUp"
                  ></svg>
                  <lineDrawer
                    v-on="{
                      ended: eventManager_endDrawLine,
                    }"
                    :svgId="svgId"
                  ></lineDrawer>
                </v-tab-item>
                <v-tab-item> </v-tab-item>
              </v-tabs-items>

              <areaSelector
                :svgId="svgId"
                :initialPosition="selectionAreaRelay.initialPosition"
                :currentPosition="selectionAreaRelay.currentPosition"
                :currentMovePosition="selectionAreaRelay.currentMovePosition"
                :selectionEnded="selectionAreaRelay.ended"
                :moveEnded="selectionAreaRelay.moveEnded"
                v-show="
                  getCurrentEditMode() === 'SELECTING' ||
                  getCurrentEditMode() === 'MOVESELECTION'
                "
              ></areaSelector>
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
import areaSelector from "./AreaSelector.vue";
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
    // for keyboard base editing
    this.$loadLesson().then(() => {
      window.addEventListener("keyup", this.eventManager_keyUp);
    });
    this.matrixMixin_setMatrix(this.svgId);
    this.reRenderMathJax();
  },
  data: function () {
    return {
      svgId: "lessonSvg",
      isAdmin: false,
      tab: null,
      matrix: [],
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
      //      authorized: (state) => state.userStore.loggedUser.authorized,
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
        this.matrixMixin_refreshScreen(notations, this.svgId);
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
      getCurrentEditMode: "getCurrentEditMode",
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

.tab-item-wrapper {
  /* vuetify sets the v-tabs__container height to 48px */
  height: calc(100vh - 48px) !important;
}
.active-tab {
  background-color: aliceblue;
}
</style>
