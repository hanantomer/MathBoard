<template fill-height>
  <div fill-height>
    <v-toolbar color="primary" dark>
      <v-btn
        :disabled="!authorized && !isAdmin"
        v-for="s in signs"
        :key="s.sign"
        v-on:click="editManager_symbolButtonPressed"
        x-small
        text
        ><span class="mr-1">{{ s.sign }}</span></v-btn
      >

      <v-btn-toggle
        v-model="toggleDeleteMode"
        background-color="transparent"
        active-class="deleteActive"
      >
        <v-btn
          icon
          :disabled="!authorized && !isAdmin"
          v-on:click="editManager_deleteButtonPressed"
          x-small
          ><v-icon>mdi-delete</v-icon></v-btn
        >
      </v-btn-toggle>
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
      <v-btn
        icon
        color="white"
        x-small
        fab
        dark
        @click="editManager_fractionButtonPressed"
      >
        <v-icon>minimize</v-icon>
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
              v-on:mouseup="editManager_svgMouseUp"
              v-on:mousedown="editManager_mouseDown"
              v-on:mousemove="editManager_mouseMove"
            ></svg>
          </v-card>
          <v-card
            id="selection"
            v-on:mouseup="editManager_selectionMouseUp"
            v-on:mousedown="editManager_selectionMouseDown"
            v_-if="editManager_getCurrentMode === 'SELECT'"
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
//import lineDrawingMixin from "../Mixins/lineDrawingMixin";
import editManager from "../Mixins/editManager";
import symbolMixin from "../Mixins/symbolMixin";
import userOperationsSyncMixin from "../Mixins/userOperationsSyncMixin";
import createAccessLinkDialog from "./CreateAccessLinkDialog.vue";

export default {
  components: { createAccessLinkDialog },
  props: ["exerciseId"],
  destroyed: function () {
    //window.removeEventListener("click", this.onclick);
  },
  mounted: function () {
    this.svg = d3.select("#svg");

    this.boundingClientRet = document
      .getElementById("svg")
      .getBoundingClientRect();

    this.$loadExercise().then(() => {
      //window.addEventListener("click", this.onclick);
      window.addEventListener("keyup", this.editManager_keyUp);
    });
    this.matrixMixin_setMatrix();
  },
  data: function () {
    return {
      toggleDeleteMode: 1,
      boundingClientRet: null,
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
    symbolMixin,
    editManager,
  ],
  computed: {
    ...mapState({
      symbols: (state) => {
        return state.symbolStore.symbols;
      },
      fractions: (state) => {
        return state.symbolStore.fractions;
      },
      students: (state) => {
        return state.studentStore.students;
      },
      selectedRect: (state) => state.symbolStore.selectedRect,
      authorized: (state) => state.userStore.loggedUser.authorized,
    }),
  },
  watch: {
    $route: "$loadExercise",
    selectedRect: {
      handler(selectedRect) {
        this.matrixMixin_selectRectByCoordinates(selectedRect);
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
    $getXpos(col) {
      return col * this.matrixMixin_getRectSize() + 10; //- this.boundingClientRet.x - 5;
    },
    $getYpos(row) {
      return row * this.matrixMixin_getRectSize() + 10; //- this.boundingClientRet.y - 5;
    },
    $toggleExerciseMatrix() {
      this.matrixMixin_toggleMatrixOverlay();
    },
    $getStudentDisplayName(student) {
      return student.firstName + " " + student.lastName;
    },
    $loadExercise: async function () {
      if (!this.getCurrentExercise().hasOwnProperty()) {
        await this.$store.dispatch("loadExercise", this.exerciseId);
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
.deleteActive {
  background-color: dodgerblue;
}
.deleteMode {
  cursor: URL("~@/assets/delete.jpg"), none !important;
}
</style>
