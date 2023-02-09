<template>
  <div>
    <v-card
      id="selection"
      class="selection"
      v-on:mouseup="handleMouseUp"
      v-bind:style="{
        left: selectionRectLeft + 'px',
        top: selectionRectTop + 'px',
        width: selectionRectWidth + 'px',
        height: selectionRectHeight + 'px',
      }"
      v-show="
        selectionPosition.x1 != selectionPosition.x2 &&
        selectionPosition.y1 != selectionPosition.y2
      "
    ></v-card>
  </div>
</template>
<script>
import { mapGetters } from "vuex";
import { mapActions } from "vuex";
import EditMode from "../Mixins/editMode";
import * as d3 from "d3";
import matrixMixin from "../Mixins/matrixMixin";
import userOutgoingOperationsSyncMixin from "../Mixins/userOutgoingOperationsSyncMixin";

const SelectionMode = Object.freeze({
  SELECTING: "SELECTING",
  MOVE: "MOVE",
});

export default {
  name: "SelectionArea",
  mixins: [matrixMixin, userOutgoingOperationsSyncMixin],
  props: {
    svgId: "",
  },
  data: function () {
    return {
      selectionMode: SelectionMode.SELECTING,
      selectionPosition: {
        x1: null,
        y1: null,
        x2: null,
        y2: null,
      },
      dragPosition: {
        x: 0,
        y: 0,
      },
    };
  },
  computed: {
    svgDimensions: function () {
      return document.getElementById(this.svgId).getBoundingClientRect();
    },

    selectionRectLeft: function () {
      return Math.min(this.selectionPosition.x1, this.selectionPosition.x2);
    },
    selectionRectTop: function () {
      return Math.min(this.selectionPosition.y1, this.selectionPosition.y2);
    },
    selectionRectWidth: function () {
      return (
        Math.max(this.selectionPosition.x1, this.selectionPosition.x2) -
        Math.min(this.selectionPosition.x1, this.selectionPosition.x2)
      );
    },
    selectionRectHeight: function () {
      return (
        Math.max(this.selectionPosition.y1, this.selectionPosition.y2) -
        Math.min(this.selectionPosition.y1, this.selectionPosition.y2)
      );
    },
  },
  mounted: function () {
    this.registerSvgMouseDown();
    this.registerSvgMouseMove();
    this.registerSvgMouseUp();
    // emitted in  app.vue
    this.$root.$on("keyup", this.keyUp);
  },
  beforeDestroy: function () {
    this.$root.$off("keyup", this.keyUp);
  },
  methods: {
    ...mapGetters({
      getCurrentEditMode: "getCurrentEditMode",
      getSelectedNotations: "getSelectedNotations",
    }),
    ...mapActions({
      setCurrentEditMode: "setCurrentEditMode",
    }),

    keyUp: function (e) {
      if (e.code === "Backspace" || e.code === "Delete") {
        this.$store.dispatch("removeNotationsByRect", {
          fromCol: this.selectionRectLeft / this.matrixMixin_getRectSize(),
          toCol:
            (this.selectionRectLeft + this.selectionRectWidth) /
            this.matrixMixin_getRectSize(),
          fromRow: this.selectionRectTop / this.matrixMixin_getRectSize(),
          toRow:
            (this.selectionRectTop + this.selectionRectHeight) /
            this.matrixMixin_getRectSize(),
        });
        this.resetSelection();
      }
    },

    registerSvgMouseDown: function (e) {
      document
        .getElementById(this.svgId)
        .addEventListener("mousedown", this.handleMouseDown);
    },

    registerSvgMouseMove: function () {
      document
        .getElementById(this.svgId)
        .parentElement.addEventListener("mousemove", this.handleMouseMove);
    },

    registerSvgMouseUp: function () {
      document
        .getElementById(this.svgId)
        .addEventListener("mouseup", this.handleMouseUp);
    },

    handleMouseMove(e) {
      if (e.buttons !== 1) {
        return;
      }

      if (this.getCurrentEditMode() !== EditMode.SELECT) {
        return;
      }

      if (this.selectionMode === SelectionMode.SELECTING) {
        this.updateSelectionArea(e);
        return;
      }

      if (this.selectionMode === SelectionMode.MOVE) {
        this.moveSelection(e);
        return;
      }
    },
    handleMouseUp() {
      if (this.getCurrentEditMode() !== EditMode.SELECT) {
        return;
      }
      if (this.selectionMode === SelectionMode.SELECTING) {
        this.endSelect();
        return;
      }
      if (this.selectionMode === SelectionMode.MOVE) {
        this.endMoveSelection();
        return;
      }
    },

    noramalizeLeftOrTop(point) {
      return (
        Math.floor(point / this.matrixMixin_getRectSize()) *
        this.matrixMixin_getRectSize()
      );
    },

    noramalizeRightOrBottom(point) {
      return (
        Math.ceil(point / this.matrixMixin_getRectSize()) *
        this.matrixMixin_getRectSize()
      );
    },

    normalizeSelection() {
      this.selectionPosition.x1 = this.noramalizeLeftOrTop(
        this.selectionPosition.x1
      );
      this.selectionPosition.y1 = this.noramalizeLeftOrTop(
        this.selectionPosition.y1
      );
      this.selectionPosition.x2 = this.noramalizeRightOrBottom(
        this.selectionPosition.x2
      );
      this.selectionPosition.y2 = this.noramalizeRightOrBottom(
        this.selectionPosition.y2
      );
    },

    // extend or shrink selection area from inner mouse move
    updateSelectionArea(e) {
      // normalize selection position to edges of rectangle
      if (!this.selectionPosition.x1) {
        this.selectionPosition.x1 = e.clientX - this.svgDimensions.x;
        this.selectionPosition.y1 = e.clientY - this.svgDimensions.y;
      }

      this.selectionPosition.x2 = e.clientX - this.svgDimensions.x;
      this.selectionPosition.y2 = e.clientY - this.svgDimensions.y;
    },
    endSelect() {
      this.selectionMode = SelectionMode.MOVE;
      if (this.selectionPosition.x2 != this.selectionPosition.x1) {
        this.normalizeSelection();

        d3.select("#" + this.svgId)
          .selectAll("foreignObject")
          .each((datum) => {
            let row = datum.row ?? datum.fromRow;
            let col = datum.col ?? datum.fromCol;
            if (
              //!!col &&
              //!!row &&
              this.matrixMixin_getRectSize() * col >=
                this.selectionPosition.x1 &&
              this.matrixMixin_getRectSize() * col <=
                this.selectionPosition.x2 &&
              this.matrixMixin_getRectSize() * row >=
                this.selectionPosition.y1 &&
              this.matrixMixin_getRectSize() * row <= this.selectionPosition.y2
            ) {
              this.$store.dispatch("selectNotation", {
                col: col,
                row: row,
              });
            }
          });
      }
    },
    moveSelection(e) {
      let rectSize = this.matrixMixin_getRectSize();

      // initial drag position
      if (!this.dragPosition.x) {
        this.dragPosition.x = e.clientX - this.svgDimensions.x;
        this.dragPosition.y = e.clientY - this.svgDimensions.y;
        return;
      }

      // movement is still too small
      if (
        Math.abs(e.clientX - this.svgDimensions.x - this.dragPosition.x) <
          rectSize &&
        Math.abs(e.clientY - this.svgDimensions.y - this.dragPosition.y) <
          rectSize
      ) {
        return;
      }

      const rectDeltaX = Math.round(
        (e.clientX - this.svgDimensions.x - this.dragPosition.x) / rectSize
      );
      const rectDeltaY = Math.round(
        (e.clientY - this.svgDimensions.y - this.dragPosition.y) / rectSize
      );

      console.log(rectDeltaX);

      if (rectDeltaX != 0 || rectDeltaY != 0) {
        this.$store
          .dispatch("moveSelectedNotations", {
            rectDeltaX,
            rectDeltaY,
            //      rectSize,
          })
          .then(() => {
            this.selectionPosition.x1 += rectDeltaX * rectSize;
            this.selectionPosition.y1 += rectDeltaY * rectSize;
            this.selectionPosition.x2 += rectDeltaX * rectSize;
            this.selectionPosition.y2 += rectDeltaY * rectSize;
            this.dragPosition.x = e.clientX - this.svgDimensions.x;
            this.dragPosition.y = e.clientY - this.svgDimensions.y;
          });
      }
    },

    endMoveSelection(e) {
      let selectedNotations = this.getSelectedNotations();
      this.$store
        .dispatch("updateSelectedNotationCoordinates")
        .then(() =>
          selectedNotations.forEach((n) =>
            this.userOperationsMixin_syncOutgoingUpdateSelectedNotation(n)
          )
        );
      this.resetSelection();
    },
    resetSelection() {
      this.dragPosition.x = null;
      this.dragPosition.y = null;
      this.selectionPosition.x1 = this.selectionPosition.x2 = this.selectionPosition.y1 = this.selectionPosition.y2 = null;
      this.selectionMode = SelectionMode.SELECTING;
      this.setCurrentEditMode(EditMode.SYMBOL);
      this.$store.dispatch("unselectAllNotations");
    },
  },
};
</script>

<style>
.selection {
  cursor: move; /*fallback if grab cursor is unsupported */
  cursor: grab;
  cursor: -moz-grab;
  cursor: -webkit-grab;
  position: absolute;
  z-index: 99;
  background: transparent !important;
  border: 1, 1, 1, 1;
}
</style>
