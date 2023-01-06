<template>
  <div class="fill-height" style="width: 100%; position: relative">
    <v-row dense style="max-height: 25px">
      <v-col cols="5" class="d-flex justify-center">
        <p>{{ questionTitle }}</p>
      </v-col>
      <v-col cols="4" class="d-flex justify-center">
        <v-combobox
          :items="students"
          v-model="selectedStudent"
          label="Please select a students' answer:"
        ></v-combobox>
      </v-col>
    </v-row>
    <v-row dense style="height: 98%">
      <v-col cols="12" fluid>
        <v-row style="height: 100%">
          <v-col colls="1">
            <toolbar></toolbar>
          </v-col>
          <v-col cols="11">
            <div style="overflow: auto; height: 100%; position: relative">
              <lineDrawer
                v-on="{
                  ended: $resetToolbarState,
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
import userOperationsOutgoingSyncMixin from "../Mixins/userOutgoingOperationsSyncMixin";
import userOperationsIncomingSyncMixin from "../Mixins/userIncomingOperationsSyncMixin";
import notationMixin from "../Mixins/notationMixin";
import toolbar from "./Toolbar.vue";
import areaSelector from "./AreaSelector.vue";
import lineDrawer from "./LineDrawer.vue";
import newItemDialog from "./NewItemDialog.vue";
import boardType from "../Mixins/boardType";

export default {
  components: {
    toolbar,
    areaSelector,
    lineDrawer,
    newItemDialog,
  },
  mounted: async function () {
    await this.$loadQuestion();

    this.activateObjectMixin_reset();

    // for teacher matrix background is gray
    //if (this.isTeacher()) {
    this.matrixMixin_setMatrix();
    //}
    //
    // for student, matrix question area background is in whitesmoke
    // if (!this.isTeacher()) {
    //   this.matrixMixin_setMatrix((row) => {
    //     return row <= this.getMaxNotationRow() ? 1 : 0;
    //   });
    // }

    // init outgoing relay
    //this.userOperationsMixin_init();
  },

  data: function () {
    return {
      matrix: [],
      svgId: "questionsSvg",
      selectedStudent: {},
    };
  },

  mixins: [
    matrixMixin,
    activateObjectMixin,
    symbolMixin,
    eventManager,
    notationMixin,
    userOperationsOutgoingSyncMixin,
    userOperationsIncomingSyncMixin,
  ],
  computed: {
    ...mapState({
      students: (state) => {
        return state.answerStore.answers?.length === 0
          ? null
          : state.answerStore.answers.map((a) => {
              return this.getStudent(a.UserId);
            });
      },
      notations: (state) => {
        return state.notationStore.notations;
      },
      questionTitle: (state) => {
        return state.questionStore.currentQuestion.name;
      },
    }),
  },
  watch: {
    $route: "loadQuestion",
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
      getCurrentQuestion: "getCurrentQuestion",
      getUser: "getUser",
      getCurrentEditMode: "getCurrentEditMode",
      getNotations: "getNotations",
      isTeacher: "isTeacher",
      getMaxNotationRow: "getMaxNotationRow",
      getStudent: "getStudent",
    }),
    ...mapActions({
      loadLesson: "loadLesson",
      loadQuestion: "loadQuestion",
      loadQuestionNotations: "loadQuestionNotations",
      addAnswer: "addAnswer",
    }),

    $resetToolbarState: function () {
      // see toolbar.vue
      this.$root.$emit("resetToolbarState");
    },

    markQuestionAsResolved: async function () {},

    $loadQuestion: async function () {
      await this.loadLesson(this.getCurrentQuestion().LessonUUId);
      // load from db to store
      //if (!this.getCurrentQuestion().hasOwnProperty()) {
      await this.loadQuestion(
        this.$route.params.questionUUId || this.getCurrentQuestion().uuid
      );
      //}
      // add student answer when question is first selected
      if (!this.isTeacher()) {
        this.addAnswer();
      }

      await this.loadQuestionNotations();
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
