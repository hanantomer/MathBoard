<template>
  <div class="fill-height" style="width: 100%; position: relative">
    <v-row dense style="max-height: 25px">
      <v-col cols="12" class="d-flex justify-center">
        <p>{{ lessonTitle }}</p>
        <!-- TODO: better design for lesson title -->
      </v-col>
    </v-row>
    <v-row dense style="height: 98%">
      <v-col cols="10" fluid>
        <v-row style="height: 100%">
          <v-col colls="1">
            <toolbar></toolbar>
          </v-col>
          <v-col cols="11">
            <div style="overflow: auto; height: 100%; position: relative">
              <lineDrawer
                v-on="{
                  ended: resetToolbarState,
                }"
                :svgId="svgId"
              ></lineDrawer>
              <areaSelector :svgId="svgId"></areaSelector>
              <svg
                v-bind:id="svgId"
                width="1350px"
                height="600px"
                v-on:mousedown="eventManager_mouseDown"
              ></svg>
            </div>
          </v-col>
        </v-row>
      </v-col>
      <v-col cols="2" v-if="isTeacher">
        <lesson-students></lesson-students>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { mapGetters } from "vuex";
import { mapActions } from "vuex";
import matrixMixin from "../Mixins/matrixMixin";
import activateObjectMixin from "../Mixins/activateObjectMixin";
import eventManager from "../Mixins/eventManager";
import symbolMixin from "../Mixins/symbolMixin";
import notationMixin from "../Mixins/notationMixin";
import userOperationsOutgoingSyncMixin from "../Mixins/userOutgoingOperationsSyncMixin";
import userOperationsIncomingSyncMixin from "../Mixins/userIncomingOperationsSyncMixin";
import lessonStudents from "./LessonStudents.vue";
import toolbar from "./Toolbar.vue";
import areaSelector from "./AreaSelector.vue";
import lineDrawer from "./LineDrawer.vue";
import newItemDialog from "./NewItemDialog.vue";
import questions from "./Questions.vue";

export default {
  components: {
    lessonStudents,
    toolbar,
    areaSelector,
    lineDrawer,
    newItemDialog,
    questions,
  },
  mounted: function () {
    // for keyboard base editing
    this.loadLesson().then(() => {
      this.activateObjectMixin_reset();
      this.matrixMixin_setMatrix();
    });
  },
  data: function () {
    return {
      matrix: [],
      svgId: "lessonSvg",
    };
  },
  mixins: [
    matrixMixin,
    activateObjectMixin,
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
      lessonTitle: (state) => {
        return state.lessonStore.currentLesson.name;
      },
    }),
  },
  watch: {
    $route: "loadLesson",
    notations: {
      deep: true,
      handler: function (notations) {
        this.matrixMixin_refreshScreen(notations, this.svgId);
      },
    },
  },
  methods: {
    ...mapGetters({
      getCurrentLesson: "getCurrentLesson",
      getLessons: "getLessons",
      getUser: "getUser",
      getCurrentEditMode: "getCurrentEditMode",
      isTeacher: "isTeacher",
    }),
    ...mapActions({
      loadLessonNotations: "loadLessonNotations",
    }),
    resetToolbarState: function () {
      this.$root.$emit("resetToolbarState");
    },
    loadLesson: async function () {
      // load from db to store
      if (!this.getCurrentLesson().hasOwnProperty()) {
        await this.$store.dispatch(
          "loadLesson",
          this.$route.params.LessonUUId || this.getCurrentLesson().uuid
        );
      }

      // if student, send heartbeat to teacher
      if (!this.isTeacher()) {
        setInterval(
          this.userOperationsMixin_syncOutgoingHeartBeat,
          5000,
          this.getCurrentLesson().uuid
        );
      }

      // refresh screen
      this.loadLessonNotations();

      // listen to changes
      this.mixin_syncIncomingUserOperations();
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
</style>
