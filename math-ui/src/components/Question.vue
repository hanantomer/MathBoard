<template>
  <div class="fill-height" style="width: 100%; position: relative">
    <v-row dense style="max-height: 25px">
      <v-col cols="12" class="d-flex justify-center">
        <p>{{ questionTitle }}</p>
        <!-- TODO: better design for lesson title -->
      </v-col>
    </v-row>
    <v-row dense style="height: 98%">
      <v-col cols="12" fluid>
        <v-row style="height: 100%">
          <v-col colls="1">
            <question-toolbar></question-toolbar>
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
                v-on:mousemove="eventManager_mouseMove"
                v-on:mouseup="eventManager_mouseUp"
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
import matrixMixin from "../Mixins/matrixMixin";
import activateCellMixin from "../Mixins/activateCellMixin";
import eventManager from "../Mixins/eventManager";
import symbolMixin from "../Mixins/symbolMixin";
import userOperationsOutgoingSyncMixin from "../Mixins/userOutgoingOperationsSyncMixin";
import userOperationsIncomingSyncMixin from "../Mixins/userIncomingOperationsSyncMixin";
import notationMixin from "../Mixins/notationMixin";
import questionToolbar from "./Toolbar.vue";
import areaSelector from "./AreaSelector.vue";
import lineDrawer from "./LineDrawer.vue";
import newItemDialog from "./NewItemDialog.vue";

export default {
  components: {
    questionToolbar,
    areaSelector,
    lineDrawer,
    newItemDialog,
  },
  mounted: function () {
    this.loadQuestion().then(() => {
      this.activateCellMixin_reset();
      this.matrixMixin_setMatrix(this.svgId);
      this.reRenderMathJax();
    });
  },
  data: function () {
    return {
      isTeacher: false,
      matrix: [],
      svgId: "questionsSvg",
    };
  },
  mixins: [
    matrixMixin,
    activateCellMixin,
    symbolMixin,
    eventManager,
    notationMixin,
    userOperationsOutgoingSyncMixin,
    userOperationsIncomingSyncMixin,
  ],
  computed: {
    ...mapState({
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
        this.reRenderMathJax();
      },
    },
  },
  methods: {
    ...mapGetters({
      getSelectedNotations: "getSelectedNotations",
      getNotations: "getNotations",
      getCurrentLesson: "getCurrentLesson",
      getCurrentQuestion: "getCurrentQuestion",
      getUser: "getUser",
      getSymbols: "getSymbols",
      getCurrentEditMode: "getCurrentEditMode",
    }),
    $resetToolbarState: function () {
      // see toolbat.vue
      this.$root.$emit("resetToolbarState");
    },
    saveQuesstion: async function () {},
    loadQuestion: async function () {
      // load from db to store
      if (!this.getCurrentQuestion().hasOwnProperty()) {
        await this.$store.dispatch(
          "loadQuestion",
          this.$route.params.questionId || this.getCurrentQuestion().id
        );
      }

      this.isTeacher = this.getCurrentLesson().UserId === this.getUser().id;

      // refresh screen
      await this.$store.dispatch(
        "loadQuestionNotations",
        this.getCurrentQuestion().id
      );
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
