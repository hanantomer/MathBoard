<template>
  <div class="fill-height" style="width: 100%; position: relative">
    <v-row>
      <v-col cols="12" class="d-flex justify-center">
        <p>{{ answertTitle }}</p>
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
                  drawLineEnded: eventManager_lineDrawEnded,
                  lineSelected: eventManager_lineSelected,
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
import toolbar from "./Toolbar.vue";
import areaSelector from "./AreaSelector.vue";
import lineDrawer from "./LineDrawer.vue";

export default {
  components: {
    toolbar,
    areaSelector,
    lineDrawer,
  },
  mounted: async function () {
    await this.$loadAnswer();
  },

  data: function () {
    return {
      matrix: [],
      svgId: "answerSvg",
    };
  },

  mixins: [matrixMixin, activateObjectMixin, eventManager, notationMixin],
  computed: {
    ...mapState({
      notations: (state) => {
        return state.notationStore.notations;
      },
      answerTitle: (state) => {
        return (
          state.answerStore.currentAnswer.user.firstName +
          " " +
          state.answerStore.currentAnswer.user.lastName
        );
      },
    }),
  },
  watch: {
    $route: "loadAnswer",
    notations: {
      deep: true,
      handler: function (notations) {
        this.matrixMixin_refreshScreen(notations, this.svgId);
      },
    },
  },
  methods: {
    ...mapGetters({
      getCurrentEditMode: "getCurrentEditMode",
      getNotations: "getNotations",
      isTeacher: "isTeacher",
    }),
    ...mapActions({
      loadAnswer: "loadAnswer",
      loadAnswerNotations: "loadAnswerNotations",
      loadQuestionNotations: "loadQuestionNotations",
    }),

    $resetToolbarState: function () {
      // see toolbar.vue
      this.$root.$emit("resetToolbarState");
    },

    markAnswerAsChecked: async function () {},

    $loadAnswer: async function () {
      this.activateObjectMixin_reset();
      this.matrixMixin_setMatrix();

      // load from db to store
      await this.loadAnswer(
        this.$route.params.answerUUId || this.getCurrentAnswer().uuid
      );
      await this.loadQuestionNotations();
      await this.loadAnswerNotations();
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
