<template fill-height>
  <div fill-height>
    <v-toolbar color="primary" dark>
      <v-btn
        :disabled="!authorized && !isAdmin"
        v-for="s in signs"
        :key="s.sign"
        v-on:click="$addSymbol"
        x-small
        text
        ><span class="mr-1">{{ s.sign }}</span></v-btn
      >
      <v-btn
        icon
        :disabled="!authorized && !isAdmin"
        v-on:click="$removeSelectedSymbols"
        color="white"
        x-small
        fab
        dark
        ><v-icon>mdi-delete</v-icon></v-btn
      >
      <v-btn
        v-if="isAdmin"
        icon
        @click.stop="isAccessLinkDialogOpen = true"
        color="white"
        x-small
        fab
        dark
        ><v-icon>mdi-account-plus</v-icon></v-btn
      >
    </v-toolbar>
    <createAccessLinkDialog
      v-model="isAccessLinkDialogOpen"
      v-on="{ create: $createAccessLink }"
    ></createAccessLinkDialog>
    <v-container app style="max-width: 1600px !important">
      <v-row>
        <v-col cols="sm 10">
          <v-card class="pa-2 ma-0" outlined tile>
            <svg
              id="svg"
              v-on:mouseup="mixin_svgMouseUp"
              v-on:mousedown="$onMouseDown"
              v-on:mousemove="mixin_mouseMove"
            ></svg>
          </v-card>
          <v-card
            v-on:mouseup="mixin_canvasMouseUp"
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
        </v-col>
        <v-col cols="3" v-if="isAdmin">
          <v-list>
            <v-list-item v-for="student in students" :key="student.id">
              <v-list-item-avatar>
                <v-img :src="student.imageUrl"></v-img>
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title
                  v-text="getDisplayName(student)"
                  @click="toggeleStudentAuthorization(student)"
                ></v-list-item-title>
              </v-list-item-content>
              <v-btn class="mx-2" fab dark x-small color="lightblue">
                <v-icon dark> mdi-pencil </v-icon>
              </v-btn>
            </v-list-item>
          </v-list>
        </v-col>
      </v-row>
    </v-container>
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
import createAccessLinkDialog from "./CreateAccessLinkDialog.vue";

export default {
  components: { createAccessLinkDialog },
  props: ["exerciseId"],
  destroyed: function () {
    window.removeEventListener("click", this.onclick);
  },
  mounted: function () {
    this.svg = d3.select("#svg");
    this.$loadExercise().then(() => {
      window.addEventListener("click", this.onclick);
      setInterval(this.mixin_sendHeartBeat, 5000, this.exerciseId);
    });
  },
  data() {
    return {
      isAdmin: false,
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
      students: (state) => {
        return state.students;
      },
      notations: (state) => {
        return state.notations;
      },
      cursorPosition: (state) => state.cursorPosition,
      authorized: (state) => state.user.authorized,
    }),
    selectionRectLeft: function () {
      return (
        Math.min(this.selectionPosition.x1, this.selectionPosition.x2) +
        5 +
        "px"
      );
    },
    selectionRectTop: function () {
      return (
        Math.min(this.selectionPosition.y1, this.selectionPosition.y2) +
        5 +
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
    $route: "$loadExercise",
    cursorPosition: {
      handler(cursorPosition) {
        this.mixin_blinkCursor(cursorPosition)();
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
      getSelectedNotations: "getSelectedNotations",
      getCurrentExercise: "getCurrentExercise",
      getExercises: "getExercises",
      getUser: "getUser",
    }),
    ...mapActions({
      loadExercise: "loadExercise",
      setCursorPosition: "setCursorPosition",
      selectNotation: "selectNotation",
      unselectAllNotations: "unselectAllNotations",
      moveSelectedNotations: "moveSelectedNotations",
      removeSelectedSymbols: "removeSelectedSymbols",
      updateSelectedNotations: "updateSelectedNotations",
    }),
    getDisplayName(student) {
      return student.firstName + " " + student.lastName;
    },
    $loadExercise: async function () {
      if (!this.getCurrentExercise().hasOwnProperty()) {
        await this.loadExercise(this.exerciseId);
      }
      this.isAdmin = this.getCurrentExercise().UserId === this.getUser().id;

      return this.$store
        .dispatch("loadNotations", this.exerciseId)
        .then((notations) => {
          this.mixin_syncIncomingUserOperations(this.exerciseId, this.isAdmin); ///TODO create mechnism to handle gaps between load and sync
        });
    },
    $createAccessLink: function (link) {
      this.$store.dispatch("createAccessLink", {
        ExerciseId: this.exerciseId,
        link: link,
      });
    },
    $removeSelectedSymbols: function () {
      let selectedNotations = this.getSelectedNotations();
      this.removeSelectedSymbols()
        .then(() => {
          this.mixin_resetSelection();
          this.mixin_syncOutgoingSymbolsDeletion(selectedNotations);
        })
        .catch((e) => {
          console.error(e);
        });
    },
    $addSymbol: function (context) {
      let symbol = {
        ExerciseId: this.exerciseId,
        value: context.currentTarget.innerText,
        isNumber: !isNaN(parseInt()),
      };

      let nextPosition = positionMixin.methods.mixin_getNext(
        context.currentTarget.innerText,
        this.getCursorPosition()
      );
      nextPosition.ExerciseId = this.exerciseId;
      symbol = Object.assign(symbol, nextPosition);

      this.$store
        .dispatch("addSymbol", symbol)
        .then((symbol) => {
          this.mixin_syncOutgoingSymbolAdding(symbol);
          this.mixin_syncOutgoingCursorPosition(nextPosition);
        })
        .catch((e) => {
          console.error(e);
        });
    },
    $onMouseDown: function (e) {
      const boundBox = e.target.getBoundingClientRect();
      if (e.target.id === "svg") {
        let normalizedClickedPosition = this.mixin_getClickedNoramalizedPosition(
          {
            x: e.clientX - boundBox.left,
            y: e.clientY - boundBox.top,
          }
        );
        normalizedClickedPosition.ExerciseId = this.exerciseId;
        this.mixin_syncOutgoingCursorPosition(normalizedClickedPosition);
      }

      if (this.isAnnotationSelected()) {
        this.unselectAllNotations();
        this.mixin_resetSelection();
      } else {
        this.mixin_startSelection(e);
      }
    },
    toggelStudentAuthorization: function (student) {
      this.toggeleStudentAuthorization(student.id).then(() => {
        this.mixin_syncOutgoingUserAthorization(student.id);
      });
    },
  },
};
</script>

<style>
#svg {
  width: 100%;
  min-height: 500px;
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
</style>
