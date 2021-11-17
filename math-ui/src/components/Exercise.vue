<template>
  <div>
    <v-toolbar color="primary" dark>
      <v-btn
        v-for="s in signs"
        :key="s.sign"
        v-on:click="addSymbol"
        x-small
        text
        ><span class="mr-1">{{ s.sign }}</span></v-btn
      >
      <v-btn
        icon
        v-on:click="deleteSelectedSymbols"
        color="white"
        x-small
        fab
        dark
        ><v-icon>mdi-delete</v-icon></v-btn
      >
      <v-btn
        icon
        @click.stop="isAccessLinkDialogOpen = true"
        color="white"
        x-small
        fab
        dark
        ><v-icon>mdi-account-plus</v-icon></v-btn
      >
    </v-toolbar>
    <CreateAccessLinkDialog
      v-model="isAccessLinkDialogOpen"
      v-on="{ create: createAccessLink }"
    ></CreateAccessLinkDialog>
    <v-card app>
      <v-container app fluid>
        <svg
          id="svg"
          width="960"
          height="600"
          style="border: 1px lightgray solid"
          v-on:mousedown="onmousedown"
          v-on:mousemove="selectionMixin_move"
          v-on:mouseup="selectionMixin_mouseup"
        ></svg>
        <v-card
          v-if="this.selectionActive || this.isAnnotationSelected"
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
      </v-container>
    </v-card>
  </div>
</template>

<script>
import * as d3 from "d3";
import { mapState } from "vuex";
import { mapGetters } from "vuex";
import { mapActions } from "vuex";
import matrixOverlayMixin from "../Mixins/matrixOverlayMixin";
import positionMixin from "../Mixins/positionMixin";
import cursorMixin from "../Mixins/cursorMixin";
import selectionMixin from "../Mixins/selectionMixin";
import userOperationsSyncMixin from "../Mixins/userOperationsSyncMixin";
import CreateAccessLinkDialog from "./CreateAccessLinkDialog.vue";

export default {
  components: { CreateAccessLinkDialog },
  props: ["exerciseId"],
  destroyed: function () {
    window.removeEventListener("click", this.onclick);
  },
  mounted: function () {
    this.svg = d3.select("#svg");
    this.loadNotations().then(() => {
      window.addEventListener("click", this.onclick);
    });
  },
  data() {
    //TODO - move to methods
    return {
      isAccessLinkDialogOpen: false,
      svg: {},
      signs: [
        { sign: "1" },
        { sign: "2" },
        { sign: "3" },
        { sign: "4" },
        { sign: "5" },
        { sign: "6" },
        { sign: "7" },
        { sign: "8" },
        { sign: "9" },
        { sign: "0" },
        { sign: "+" },
        { sign: "-" },
        { sign: "*" },
        { sign: "/" },
        { sign: "^" },
        { sign: "√" },
        { sign: "=" },
      ],
    };
  },
  mixins: [
    matrixOverlayMixin,
    positionMixin,
    cursorMixin,
    selectionMixin,
    userOperationsSyncMixin,
  ],
  computed: {
    ...mapState({
      notations: (state) => {
        return state.notations;
      },
      cursorPosition: (state) => state.cursorPosition,
    }),
    selectionRectLeft: function () {
      return (
        Math.min(this.selectionPosition.x1, this.selectionPosition.x2) +
        10 +
        "px"
      );
    },
    selectionRectTop: function () {
      return (
        Math.min(this.selectionPosition.y1, this.selectionPosition.y2) +
        10 +
        "px"
      );
    },
    selectionRectWidth: function () {
      return (
        Math.max(this.selectionPosition.x1, this.selectionPosition.x2) -
        Math.min(this.selectionPosition.x1, this.selectionPosition.x2) +
        "px"
      );
    },
    selectionRectHeight: function () {
      return (
        Math.max(this.selectionPosition.y1, this.selectionPosition.y2) -
        Math.min(this.selectionPosition.y1, this.selectionPosition.y2) +
        "px"
      );
    },
  },
  watch: {
    $route: "loadNotations",
    cursorPosition: {
      handler(cursorPosition) {
        this.cursorMixin_blink(cursorPosition)();
      },
    },
    notations: {
      deep: true,
      handler(notations) {
        var that = this;
        this.svg
          .selectAll("text")
          .data(notations)
          .join(
            (enter) => {
              return enter
                .append("text")
                .attr("id", (n) => {
                  return n.id;
                })
                .attr("x", (n) => {
                  return n.x;
                })
                .attr("y", (n) => {
                  return n.y;
                })
                .attr("dy", ".45em")
                .text((n) => {
                  return n.value;
                });
            },
            (update) => {
              return update
                .attr("fill", (datum, pos, elements) => {
                  return datum.selected ? "red" : "black";
                })
                .attr("x", (n) => {
                  return n.x;
                })
                .attr("y", (n) => {
                  return n.y;
                });
            },
            (exit) => {
              return exit
                .transition()
                .duration(10)
                .attr("r", 0)
                .style("opacity", 0)
                .attr("cx", 1000)
                .on("end", function () {
                  d3.select(this).remove();
                });
            }
          );
      },
      deep: false,
    },
  },
  methods: {
    ...mapGetters({
      getCursorPosition: "getCursorPosition",
      isAnnotationSelected: "isAnnotationSelected",
      getUser: "getUser",
    }),
    ...mapActions({
      setCursorPosition: "setCursorPosition",
      selectNotation: "selectNotation",
      unselectAllNotations: "unselectAllNotations",
      moveSelectedNotations: "moveSelectedNotations",
      updateSelectedNotations: "updateSelectedNotations",
      createAccessLink: "createAccessLink",
    }),
    createAccessLink: function (link) {
      console.debug(`createAccessLink: ${link}`);
      this.$store.dispatch("createAccessLink", {
        exerciseId: this.exerciseId,
        link: link,
      });
    },
    deleteSelectedSymbols: function () {
      this.$store.dispatch("removeSelectedSymbols");
    },
    loadNotations: function () {
      return this.$store.dispatch("loadNotations", this.exerciseId).then(() => {
        this.syncIncomingUserOperations(this.getUser().id, this.exerciseId); ///TODO create mechnism to handle gaps between load and sync
      });
    },
    addSymbol: function (context) {
      const symbolValue = context.currentTarget.innerText;
      const symbol = {
        UserId: this.getUser().id,
        ExerciseId: this.exerciseId,
        value: symbolValue,
        isNumber: !isNaN(parseInt()),
      };
      this.$store.dispatch("addSymbol", symbol);
    },
    onmousedown: function (e) {
      if (e.target.id === "svg") {
        const boundBox = e.target.getBoundingClientRect();
        let normalizedClickedPosition = this.positionMixin_getClickedNoramalizedPosition(
          { x: e.clientX - boundBox.left, y: e.clientY - boundBox.top }
        );
        this.setCursorPosition(normalizedClickedPosition);
        normalizedClickedPosition.userId = this.getUser().id;
        normalizedClickedPosition.exerciseId = this.exerciseId;
        userOperationsSyncMixin.methods.syncOutgoingCursorPosition(
          normalizedClickedPosition
        );
      }

      if (this.isAnnotationSelected()) {
        this.unselectAllNotations();
        this.selectionMixin_reset();
      } else {
        this.selectionMixin_start(e);
      }
    },
  },
};
</script>

<style>
.hellow {
  padding: 5px;
  color: darkkhaki;
}
.grabbable {
  cursor: move; /* fallback if grab cursor is unsupported */
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
</style>
