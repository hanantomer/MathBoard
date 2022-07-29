<template>
  <v-card
    id="selection"
    v-on:mouseup="endSelect"
    v-on:mousemove="mouseMove"
    class="selection"
    v-bind:style="{
      left: selectionRectLeft,
      top: selectionRectTop,
      width: selectionRectWidth,
      height: selectionRectHeight,
    }"
  ></v-card>
</template>
<script>
import matrixOverlayMixin from "../Mixins/matrixOverlayMixin";
import notationMixin from "../Mixins/notationMixin";

const SelectionMode = Object.freeze({
  SELECTING: "SELECTING",
  MOVE: "MOVE",
});
export default {
  name: "SelectionArea",
  props: {
    svg: {},
    initialPosition: {
      x: 0,
      y: 0,
    },
    currentPosition: {
      x: 0,
      y: 0,
    },
    currentMovePosition: {
      x: 0,
      y: 0,
    },
    selectionEnded: false,
  },
  watch: {
    selectionEnded: {
      immediate: true,
      handler: function (val) {
        if (val) {
          this.endSelect();
        }
      },
    },
    initialPosition: {
      immediate: true,
      handler: function (val) {
        this.currentMode = SelectionMode.SELECTING;
        this.selectionPosition.x1 = val.x;
        this.selectionPosition.x2 = val.x;
        this.selectionPosition.y1 = val.y;
        this.selectionPosition.y2 = val.y;
      },
    },
    currentPosition: {
      immediate: true,
      handler: function (position) {
        this.selectionPosition.x2 = position.x;
        this.selectionPosition.y2 = position.y;
      },
    },
    currentMovePosition: {
      immediate: true,
      handler: function (position) {
        if (position.x || position.y) {
          this.moveSelection({ x: position.x, y: position.y });
        }
      },
    },
  },
  data: function () {
    return {
      currentMode: SelectionMode.SELECTING,
      selectionPosition: {
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 0,
      },
      dragPosition: {
        x: 0,
        y: 0,
      },
    };
  },
  computed: {
    selectionRectLeft: function () {
      return (
        Math.min(this.selectionPosition.x1, this.selectionPosition.x2) + "px"
      );
    },
    selectionRectTop: function () {
      return (
        Math.min(this.selectionPosition.y1, this.selectionPosition.y2) + "px"
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
  mixins: [matrixOverlayMixin, notationMixin],

  methods: {
    getSVGBoundingRect() {
      return document.getElementById("svg").getBoundingClientRect();
    },
    mouseMove(e) {
      if (e.buttons !== 1) {
        return;
      }
      if (this.currentMode === SelectionMode.SELECTING) {
        this.updateSelectionArea(e);
        return;
      }
      if (this.currentMode === SelectionMode.MOVE) {
        this.moveSelection({
          x: e.clientX - this.getSVGBoundingRect().x,
          y: e.clientY - this.getSVGBoundingRect().y,
        });
        return;
      }
    },
    mouseUp(e) {
      if (this.currentMode === SelectionMode.SELECTING) {
        this.endSelect(e);
        return;
      }
      if (this.currentMode === SelectionMode.MOVE) {
        this.endMoveSelection(e);
        return;
      }
    },
    // extend or shrink selection area from inner mouse move
    updateSelectionArea(e) {
      e.stopPropagation();
      this.selectionPosition.x2 = this.selectionPosition.x1 + e.offsetX;
      this.selectionPosition.y2 = this.selectionPosition.y1 + e.offsetY;
    },
    endSelect() {
      this.currentMode = SelectionMode.MOVE;
      if (this.selectionPosition.x2 != this.selectionPosition.x1) {
        this.svg.selectAll("foreignObject").each((datum) => {
          let row = datum.row;
          let col = datum.col ?? datum.fromCol;
          if (
            !!col &&
            !!row &&
            this.getNotationXposByCol(col) > this.selectionPosition.x1 &&
            this.getNotationXposByCol(col) < this.selectionPosition.x2 &&
            this.getNotationYposByRow(row) > this.selectionPosition.y1 &&
            this.getNotationYposByRow(row) < this.selectionPosition.y2
          ) {
            this.$store.dispatch("selectNotation", {
              col: col,
              row: row,
            });
          }
        });
      }
    },
    moveSelection(position) {
      let rectSize = this.matrixMixin_getRectSize();

      console.debug("drag position x:" + this.dragPosition.x);
      console.debug("drag position y:" + this.dragPosition.y);
      console.debug("x:" + position.x);
      console.debug("y:" + position.y);

      // initial drag position
      if (this.dragPosition.x === 0) {
        console.debug("initial position");
        this.dragPosition.x = position.x;
        this.dragPosition.y = position.y;
        return;
      }

      console.debug("after initial");
      // movement is still too small
      if (
        Math.abs(position.x - this.dragPosition.x) < rectSize &&
        Math.abs(position.y - this.dragPosition.y) < rectSize
      ) {
        return;
      }

      console.debug("drag position x:" + this.dragPosition.x);
      console.debug("drag position y:" + this.dragPosition.y);

      const rectDeltaX = Math.round(
        (position.x - this.dragPosition.x) / rectSize
      );
      const rectDeltaY = Math.round(
        (position.y - this.dragPosition.y) / rectSize
      );

      if (rectDeltaX != 0 || rectDeltaY != 0) {
        console.debug("move deltax:" + rectDeltaX);
        console.debug("move deltay:" + rectDeltaY);
        this.$store
          .dispatch("moveSelectedNotations", {
            rectDeltaX,
            rectDeltaY,
            rectSize,
          })
          .then(() => {
            this.selectionPosition.x1 = rectDeltaX * rectSize;
            this.selectionPosition.y1 = rectDeltaY * rectSize;
            this.selectionPosition.x2 = rectDeltaX * rectSize;
            this.selectionPosition.y2 = rectDeltaY * rectSize;
            this.dragPosition.x = position.x;
            this.dragPosition.y = position.y;
          });
      }
    },
    endMoveSelection(e) {
      this.dragPosition.x = 0;
      this.dragPosition.y = 0;
    },
    resetSelection() {
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
