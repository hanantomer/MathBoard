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
                v-bind:width="svgWidth"
                v-bind:height="svgHeight"
                v-on:mousedown="eventManager_mouseDown"
              ></svg>
            </div>
          </v-col>
        </v-row>
      </v-col>
      <v-col cols="2" v-if="teacher">
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
    this.loadLesson(this.$route.params.LessonUUId).then(() => {
      this.activateObjectMixin_reset();
      this.matrixMixin_setMatrix();

      if (!this.isTeacher()) {
        this.addLessonToSharedLessons();
      }
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
    eventManager,
    notationMixin,
  ],
  computed: {
    ...mapGetters({
      teacher: "isTeacher",
    }),
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
      addLessonToSharedLessons: "addLessonToSharedLessons",
    }),
    resetToolbarState: function () {
      this.$root.$emit("resetToolbarState");
    },
    loadLesson: async function (lessonUUID) {
      // load from db to store
      await this.$store.dispatch("loadLesson", lessonUUID);

      // for student, send heartbeat to teacher
      if (!this.isTeacher()) {
        setInterval(
          this.userOperationsMixin_syncOutgoingHeartBeat,
          5000,
          this.getCurrentLesson().uuid
        );
      }

      // refresh screen
      this.loadLessonNotations();

      // listen to other users
      this.mixin_syncIncomingUserOperations();

      // init outgoing relay
      this.userOperationsMixin_init();
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
