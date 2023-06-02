<template>
  <div class="fill-height" style="width: 100%; position: relative">
    <v-row dense style="max-height: 25px">
      <v-col cols="12" class="d-flex justify-center">
        <slot name="title"></slot>
      </v-col>
    </v-row>
    <v-row style="height: 100%">
      <v-col colls="1">
        <toolbar></toolbar>
      </v-col>
      <v-col cols="11">
        <div style="overflow: auto; height: 100%; position: relative">
          <lineDrawer
            v-on="{
              drawLineEnded: eventManager_lineDrawEnded,
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
      <slot name="students"></slot>
    </v-row>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { mapGetters } from "vuex";
import matrixMixin from "../Mixins/matrixMixin";
import activateObjectMixin from "../Mixins/activateObjectMixin";
import eventManager from "../Mixins/eventManager";
import authMixin from "../Mixins/authMixin";
import notationMixin from "../Mixins/notationMixin";
import userOutgoingOperationsSyncMixin from "../Mixins/userOutgoingOperationsSyncMixin";
import toolbar from "./Toolbar.vue";
import areaSelector from "./AreaSelector.vue";
import lineDrawer from "./LineDrawer.vue";



export default {
  components: {
    toolbar,
    areaSelector,
    lineDrawer,
  },
  props: {
    svgId: null,
    loaded: false,
  },
  mixins: [
    matrixMixin,
    activateObjectMixin,
    eventManager,
    authMixin,
    notationMixin,
    userOutgoingOperationsSyncMixin,
  ],
  mounted: function () {
    // emitted in  app.vue
    this.$root.$on("keyup", this.eventManager_keyUp);
    this.$root.$on("paste", this.eventManager_paste);
  },
  beforeDestroy: function () {
    this.$root.$off("keyup", this.eventManager_keyUp);
    this.$root.$off("paste", this.eventManager_paste);
  },

  data: function () {
    return {
      matrix: [],
    };
  },
  computed: {
    ...mapGetters({
      teacher: "isTeacher",
    }),
    ...mapState({
      notations: (state) => {
        return state.notationStore.notations;
      },
    }),
  },
  watch: {
    loaded: {
      handler: function (loaded) {
        if (!!loaded) this.load();
      },
    },
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
      getUser: "getUser",
      getCurrentEditMode: "getCurrentEditMode",
    }),
    resetToolbarState: function () {
      this.$root.$emit("resetToolbarState");
    },
    load: function () {
      this.activateObjectMixin_reset();
      this.matrixMixin_setMatrix();
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
