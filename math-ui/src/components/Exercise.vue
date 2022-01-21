<template fill-height>
  <div fill-height>
    <v-toolbar color="primary" dark>
      <v-btn
        :disabled="!authorized && !isAdmin"
        v-for="s in signs"
        :key="s.sign"
        v-on:click="$symbolIconClicked"
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
      <v-btn
        v-if="isAdmin"
        @click="$toggleExerciseMatrix"
        icon
        color="white"
        x-small
        fab
        dark
        ><v-icon>mdi-grid</v-icon>
      </v-btn>
    </v-toolbar>
    <createAccessLinkDialog
      v-model="isAccessLinkDialogOpen"
      v-on="{ create: $createAccessLink }"
    ></createAccessLinkDialog>
    <v-container app style="max-width: 1600px !important">
      <v-row>
        <v-col cols="sm 10" style="overflow: auto">
          <v-card class="pa-2 ma-0 nopadding">
            <svg
              id="svg"
              v-on:mouseup="$onMouseUp"
              v-on:mousedown="$onMouseDown"
              v-on:mousemove="mixin_mouseMove"
            ></svg>
          </v-card>
          <v-card
            v-on:mouseup="mixin_canvasMouseUp"
            v-if="this.selectionActive || this.isAnySymbolSelected"
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
            <v-list-item-group active-class="activestudent" color="indigo">
              <v-list-item v-for="student in students" :key="student.id">
                <v-list-item-avatar>
                  <v-img :src="student.imageUrl"></v-img>
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title
                    v-text="$getStudentDisplayName(student)"
                  ></v-list-item-title>
                </v-list-item-content>
                <v-btn
                  class="[mx-2]"
                  fab
                  dark
                  x-small
                  color="green"
                  v-on:click="$toggleStudentAuthorization(student)"
                >
                  <v-icon dark> mdi-pencil </v-icon>
                </v-btn>
              </v-list-item>
            </v-list-item-group>
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

    this.boundingClientRet = document
      .getElementById("svg")
      .getBoundingClientRect();

    this.$loadExercise().then(() => {
      window.addEventListener("click", this.onclick);
      window.addEventListener("keyup", this.onkeyup);
    });
    this.mixin_setMatrix();

    var canvas = document.createElement("canvas");
    document.body.append(canvas);
    this.ctx = canvas.getContext("2d");
    this.ctx.font = window.getComputedStyle(document.body).font;
  },
  data() {
    return {
      boundingClientRet: null,
      ctx: null,
      font: null,
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
      symbols: (state) => {
        return state.symbols;
      },
      students: (state) => {
        return state.students;
      },
      selectedRect: (state) => state.selectedRect,
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
    selectedRect: {
      handler(selectedRect) {
        this.mixin_selectRectByCoordinates(selectedRect);
      },
    },
    symbols: {
      deep: true,
      handler(symbols) {
        this.svg
          .selectAll("text")
          .data(symbols)
          .join(
            (enter) => {
              return enter
                .append("text")
                .attr("id", (n) => {
                  return n.id;
                })
                .attr("x", (n) => {
                  return this.$getXpos(n.col);
                })
                .attr("y", (n) => {
                  return this.$getYpos(n.row);
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
                  return this.$getXpos(n.col);
                })
                .attr("y", (n) => {
                  return this.$getYpos(n.row);
                })
                .text((n) => {
                  return n.value;
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
      getSelectedRect: "getSelectedRect",
      isAnySymbolSelected: "isAnySymbolSelected",
      getSelectedSymbols: "getSelectedSymbols",
      getCurrentExercise: "getCurrentExercise",
      getExercises: "getExercises",
      getUser: "getUser",
      getStudent: "getStudent",
    }),
    ...mapActions({
      loadExercise: "loadExercise",
      setSelectedRect: "setSelectedRect",
      selectSymbol: "selectSymbol",
      unselectAllSymbols: "unselectAllSymbols",
      moveSelectedSymbols: "moveSelectedSymbols",
      removeSelectedSymbols: "removeSelectedSymbols",
      updateSelectedSymbolCoordinates: "updateSelectedSymbolCoordinates",
      toggleAuthorization: "toggleAuthorization",
    }),
    $getXpos(col) {
      return col * this.mixin_getRectSize() + 10; //- this.boundingClientRet.x - 5;
    },
    $getYpos(row) {
      return row * this.mixin_getRectSize() + 10; //- this.boundingClientRet.y - 5;
    },

    $toggleExerciseMatrix() {
      this.mixin_toggleMatrixOverlay();
    },
    $getStudentDisplayName(student) {
      return student.firstName + " " + student.lastName;
    },
    $loadExercise: async function () {
      if (!this.getCurrentExercise().hasOwnProperty()) {
        await this.loadExercise(this.exerciseId);
      }
      this.isAdmin = this.getCurrentExercise().UserId === this.getUser().id;

      if (!this.isAdmin) {
        setInterval(this.mixin_sendHeartBeat, 2000, this.exerciseId);
      }

      return this.$store
        .dispatch("loadSymbols", this.exerciseId)
        .then((symbols) => {
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
      let selectedSymbols = this.getSelectedSymbols();
      this.removeSelectedSymbols()
        .then(() => {
          this.mixin_resetSelection();
          this.mixin_syncOutgoingSymbolsDeletion(selectedSymbols);
        })
        .catch((e) => {
          console.error(e);
        });
    },
    $addSymbol(s) {
      let symbol = {
        ExerciseId: this.exerciseId,
        value: s,
        isNumber: !isNaN(parseInt(s)),
      };

      symbol = Object.assign(symbol, this.getSelectedRect());

      this.$store
        .dispatch("upsertSymbol", symbol)
        .then((symbol) => {
          this.mixin_syncOutgoingSymbolAdding(symbol);

          let nextRect = this.mixin_selectNextRect();
          if (!!nextRect) {
            this.mixin_syncOutgoingSelectedRect(nextRect);
          }
        })
        .catch((e) => {
          console.error(e);
        });
    },
    $symbolIconClicked: function (context) {
      this.$addSymbol(context.currentTarget.innerText);
    },
    onkeyup: function (e) {
      if (e.keyCode < 48) {
        ///TODO - support special keys to move/delete
      } else {
        this.$addSymbol(e.key);
      }
    },
    $onMouseDown: function (e) {
      if (this.isAnySymbolSelected()) {
        this.unselectAllSymbols();
        this.mixin_resetSelection();
      } else {
        this.mixin_startSelection(e);
      }
    },
    $onMouseUp: function (e) {
      let normalizedClickedPosition = this.mixin_getClickedNoramalizedPosition({
        x: e.clientX,
        y: e.clientY,
      });
      let selectedRect = this.mixin_selectRectByClickedPosition(
        normalizedClickedPosition
      );
      this.mixin_syncOutgoingSelectedRect(selectedRect);
      if (this.isAnySymbolSelected && this.selectionActive === false) {
        this.mixin_endMove(e);
      }
    },
    $toggleStudentAuthorization: function (student) {
      this.toggleAuthorization(student.userId).then((authorization) => {
        this.mixin_syncOutgoingUserAthorization(
          this.exerciseId,
          authorization.authorizedStudentId,
          authorization.revokedStudentId
        );
      });
    },
  },
};
</script>

<style scoped>
.activestudent {
  border: 2px dashed rgb(143, 26, 179);
}
#svg {
  width: 700px;
  height: 500px;
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
.nopadding {
  padding: 0 !important;
}
</style>
