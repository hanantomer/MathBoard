<template>
  <div>
    <v-card
      v-show="editMode === 'SELECTLINE'"
      id="lineLeftHandle"
      class="lineHandle"
      v-on:mousedown="lineHandleMouseDown"
      v-on:mousemove="leftLineHandleMouseMove"
      v-on:mouseup="endDrawLine"
      v-bind:style="{
        left: lineLeftHandleLeft,
        top: lineHandleTop,
      }"
    ></v-card>
    <v-card
      v-show="editMode === 'SELECTLINE'"
      id="lineRightHandle"
      class="lineHandle"
      v-on:mousedown="lineHandleMouseDown"
      v-on:mousemove="rightLineHandleMouseMove"
      v-on:mouseup="endDrawLine"
      v-bind:style="{
        left: lineRightHandleLeft,
        top: lineHandleTop,
      }"
    ></v-card>
    <v-divider
      id="line"
      class="line"
      v-on:mouseup="lineMouseUp"
      v-bind:style="{
        left: drawLineLeft,
        top: drawLineTop,
        width: drawLineWidth,
      }"
    ></v-divider>
    <p
      style="left: -2px; position: relative; z-index: 99; border: solid 1px"
      v-if="lineType === 'SQRT'"
    >
      &#x221A;
    </p>
  </div>
</template>
<script>
import EditMode from "../Mixins/editMode";
import notationMixin from "../Mixins/notationMixin";
import matrixOverlayMixin from "../Mixins/matrixOverlayMixin";
import userOutgoingOperationsSyncMixin from "../Mixins/userOutgoingOperationsSyncMixin";
import { mapGetters } from "vuex";
export default {
  mixins: [notationMixin, matrixOverlayMixin, userOutgoingOperationsSyncMixin],
  name: "LineDrawer",
  props: {
    editMode: { type: String },
    lineType: { type: String },
    startMousePosition: { type: Object },
    currentMousePosition: { type: Object },
    selectedLineId: { type: String },
    ended: { type: Boolean },
  },
  watch: {
    startMousePosition: {
      immediate: true,
      handler: function (position) {
        this.startLineDrawing(position);
      },
    },
    currentMousePosition: {
      immediate: true,
      handler: function (position) {
        if (
          !!position &&
          typeof position.x === "number" &&
          isFinite(position.x)
        ) {
          this.updateLineRightPoistion(position.x);
        }
      },
    },
    ended: {
      immediate: true,
      handler: function () {
        this.endDrawLine();
      },
    },
    selectedLineId: {
      immediate: true,
      handler: function (selectedLineId) {
        if (!!selectedLineId) {
          this.startLineEditing(selectedLineId);
        }
      },
    },
  },
  data: function () {
    return {
      linePosition: {
        x1: 0,
        x2: 0,
        y: 0,
      },
    };
  },
  computed: {
    drawLineLeft: function () {
      return Math.min(this.linePosition.x1, this.linePosition.x2) + "px";
    },
    drawLineLeftMinus5: function () {
      return Math.min(this.linePosition.x1, this.linePosition.x2) - 15 + "px";
    },

    lineLeftHandleLeft: function () {
      return Math.min(this.linePosition.x1, this.linePosition.x2) - 5 + "px";
    },
    lineRightHandleLeft: function () {
      return Math.max(this.linePosition.x1, this.linePosition.x2) - 5 + "px";
    },
    drawLineWidth: function () {
      return Math.abs(this.linePosition.x2 - this.linePosition.x1) + "px";
    },
    drawLineTop: function () {
      return this.linePosition.y + "px";
    },
    lineHandleTop: function () {
      return this.linePosition.y - 5 + "px";
    },
  },
  methods: {
    ...mapGetters({
      getNotations: "getNotations",
    }),
    ///TODO move to global area
    getSVGBoundingRect: function () {
      return document.getElementById("svg").getBoundingClientRect();
    },
    lineHandleMouseDown: function () {},
    getNearestRow: function (clickedYPos) {
      let clickedRow = Math.round(clickedYPos / this.matrixMixin_getRectSize());
      return clickedRow * this.matrixMixin_getRectSize();
    },
    // either fraction or sqrt
    setLine: function (row, fromCol, toCol) {
      let line = {
        type: this.lineType,
        row: row,
        fromCol: fromCol,
        toCol: toCol,
      };

      this.$store
        .dispatch("addNotation", line)
        .then((line) => {
          this.userOperationsMixin_syncOutgoingSaveNotation(line);
        })
        .catch((e) => {
          console.error(e);
        });
    },
    startLineEditing: function (selectedLineId) {
      let storedNotation = this.getNotations()[selectedLineId];
      ///TODO handle null

      this.linePosition.x1 = this.getNotationXposByCol(storedNotation.fromCol);

      this.linePosition.x2 =
        this.linePosition.x1 +
        (storedNotation.toCol - storedNotation.fromCol) *
          this.matrixMixin_getRectSize();

      this.linePosition.y = this.getNotationYposByRow(storedNotation.row);
    },
    startLineDrawing: function (position) {
      let y = this.getNearestRow(position.y);
      this.linePosition.x2 = this.linePosition.x1 = position.x;
      this.linePosition.y = y;
    },
    updateLineRightPoistion: function (x) {
      this.linePosition.x2 = x;
    },
    updateLineLeftPoistion: function (x) {
      this.linePosition.x1 = x;
    },
    leftLineHandleMouseMove(e) {
      // left button is pressed
      if (e.buttons !== 1) {
        return;
      }
      this.updateLineLeftPoistion(e.clientX - this.getSVGBoundingRect().x);
    },
    rightLineHandleMouseMove(e) {
      // left button is pressed
      if (e.buttons !== 1) {
        return;
      }
      this.updateLineRightPoistion(e.clientX - this.getSVGBoundingRect().x);
    },
    lineMouseUp() {
      if (
        this.editMode === EditMode.FRACTION ||
        this.editMode === EditMode.SQRT
      ) {
        this.endDrawLine();
      }
    },
    reset: function () {
      this.linePosition.x1 = this.linePosition.x2 = this.linePosition.y = 0;
    },
    endDrawLine: function () {
      if (this.linePosition.x2 != this.linePosition.x1) {
        let fromCol = Math.floor(
          this.linePosition.x1 / this.matrixMixin_getRectSize()
        );

        let toCol = Math.ceil(
          this.linePosition.x2 / this.matrixMixin_getRectSize()
        );

        let row = Math.round(
          this.linePosition.y / this.matrixMixin_getRectSize()
        );

        this.setLine(row, fromCol, toCol);
      }
      this.$emit("ended"); // signal parent
    },
  },
};
</script>

<style>
.line {
  position: absolute;
  display: block;
  border-bottom: solid 1px;
  border-top: solid 1px;
  cursor: pointer;
}

.lineHandle {
  cursor: col-resize;
  position: absolute;
  z-index: 999;
  width: 10px;
  height: 6px;
  border: 1, 1, 1, 1;
}
</style>
