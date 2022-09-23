<template>
  <div>
    <v-card
      id="lineLeftHandle"
      class="lineHandle"
      v-bind:style="{
        left: lineLeft - 5 + 'px',
        top: lineTop + 'px',
      }"
      v-on:mousedown="leftHandleMouseDown"
      v-on:mouseup="handleMouseUp"
      v-show="editStarted === true || !!selectedLineId"
    ></v-card>
    <v-card
      id="lineRightHandle"
      class="lineHandle"
      v-bind:style="{
        left: lineRight + 'px',
        top: lineTop + 'px',
      }"
      v-on:mousedown="rightHandleMouseDown"
      v-on:mouseup="handleMouseUp"
      v-show="editStarted === true || !!selectedLineId"
    ></v-card>
    <v-divider
      style="color: red; z-index: 9999; height: 10px"
      id="line"
      class="line"
      v-bind:style="{
        left: lineLeft + 'px',
        top: lineTop + 'px',
        width: lineRight - lineLeft + 'px',
      }"
      v-on:mouseup="handleMouseUp"
      v-show="editStarted === true || !!selectedLineId"
    ></v-divider>
    <p
      style="left: -2px; position: relative; z-index: 99; border: solid 1px"
      v-if="notationType === 'SQRT'"
    >
      &#x221A;
    </p>
  </div>
</template>
<script>
import notationMixin from "../Mixins/notationMixin";
import matrixMixin from "../Mixins/matrixMixin";
import userOutgoingOperationsSyncMixin from "../Mixins/userOutgoingOperationsSyncMixin";
import notationType from "../Mixins/notationType";
import EditMode from "../Mixins/editMode";
import { mapGetters } from "vuex";

export default {
  mixins: [notationMixin, matrixMixin, userOutgoingOperationsSyncMixin],
  name: "LineDrawer",
  props: {
    svgId: { type: String },
  },
  data: function () {
    return {
      editStarted: false,
      notationType: "",
      selectedLineId: null,
      linePosition: {
        x1: 0,
        x2: 0,
        y: 0,
      },
    };
  },
  mounted: function () {
    this.registerSvgMouseDown();
    this.registerSvgMouseMove();
    this.registerSvgMouseUp();
  },
  computed: {
    lineLeft: function () {
      // console.debug(
      //   "line left:" + this.linePosition.x1 + "," + this.linePosition.x1
      // );
      return Math.min(this.linePosition.x1, this.linePosition.x2);
    },
    lineRight: function () {
      // console.debug(
      //   "line right:" + this.linePosition.x1 + "," + this.linePosition.x1
      // );
      return Math.max(this.linePosition.x1, this.linePosition.x2);
    },
    lineTop: function () {
      return this.linePosition.y;
    },
  },
  methods: {
    ...mapGetters({
      getNotations: "getNotations",
      getCurrentEditMode: "getCurrentEditMode",
    }),

    /// TODO move to global
    getNearestRow: function (clickedYPos) {
      let clickedRow = Math.round(clickedYPos / this.matrixMixin_getRectSize());
      return clickedRow * this.matrixMixin_getRectSize();
    },
    startLineDrawing: function (position) {
      ///TODO move to function
      this.editStarted = true;
      this.linePosition.x2 = this.linePosition.x1 = position.x;
      this.linePosition.y = this.getNearestRow(position.y);
    },
    selectLine: function () {
      this.matrixMixin_unselectPreviouslySelectedtRect();

      this.hideLine(this.selectedLineId);
      let storedNotation = this.getNotations()[this.selectedLineId];
      if (!storedNotation) {
        console.error(`selectedLineId: ${this.selectedLineId} not found `);
        return;
      }

      console.log(`storedNotation: ${JSON.stringify(storedNotation)} `);

      this.linePosition.x1 = this.getNotationXposByCol(storedNotation.fromCol);

      this.linePosition.x2 =
        this.linePosition.x1 +
        (storedNotation.toCol - storedNotation.fromCol) *
          this.matrixMixin_getRectSize();

      this.linePosition.y = this.getNotationYposByRow(storedNotation.row);
      console.debug(
        "selectLine: x1:" +
          this.linePosition.x1 +
          ",x2:" +
          this.linePosition.x2 +
          ",y:" +
          this.linePosition.y
      );
    },
    setLine: function (position) {
      if (position < this.linePosition.x1) {
        this.linePosition.x1 = position;
      }
      if (position > this.linePosition.x1) {
        this.linePosition.x2 = position;
      }
    },
    saveLine: function (row, fromCol, toCol) {
      let line = {
        type: this.notationType,
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
    hideLine(lineId) {
      document.getElementById(lineId).style.display = "none";
    },
    showLine(lineId) {
      document.getElementById(lineId).style.display = "block";
    },
    endDrawLine: function () {
      if (!!this.selectedLineId) this.showLine(this.selectedLineId);

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
        console.log("endDrawLine");
        this.saveLine(row, fromCol, toCol);
        this.$emit("ended"); // signal parent
      }
      this.reset();
    },
    reset: function () {
      this.linePosition.x1 = this.linePosition.x2 = this.linePosition.y = 0;
      this.editStarted = false;
    },
    registerSvgMouseMove: function () {
      document
        .getElementById(this.svgId)
        .addEventListener("mousemove", this.handleSvgMouseMove);
    },
    registerSvgMouseDown: function (e) {
      document
        .getElementById(this.svgId)
        .addEventListener("mousedown", this.handleMouseDown);
    },

    registerSvgMouseUp: function () {
      document
        .getElementById(this.svgId)
        .addEventListener("mouseup", this.handleMouseUp);
    },
    leftHandleMouseDown() {
      this.editStarted = true;
    },
    rightHandleMouseDown() {
      this.editStarted = true;
    },
    handleMouseDown(e) {
      // left button is pressed
      if (e.buttons !== 1) {
        return;
      }

      if (!!this.editStarted) {
        return;
      }

      if (
        this.getCurrentEditMode() === EditMode.FRACTION ||
        this.getCurrentEditMode() === EditMode.SQRT
      ) {
        // new line
        this.notationType =
          this.getCurrentEditMode() === EditMode.FRACTION
            ? notationType.FRACTION
            : notationType.SQRT;

        this.startLineDrawing({ x: e.offsetX, y: e.offsetY });
      }

      //existing line
      let fraction = this.findFractionLineAtClickedPosition(e);
      if (!!fraction) {
        this.notationType = notationType.FRACTION;
        this.selectedLineId = fraction.id;
        this.selectLine();
        return;
      }

      let sqrt = this.findSqrtLineAtClickedPosition(e);
      if (!!sqrt) {
        this.notationType = notationType.SQRT;
        this.selectedLineId = sqrt.id;
        this.selectLine();
      }
    },
    handleSvgMouseMove(e) {
      // left button is pressed
      if (e.buttons !== 1) {
        return;
      }

      if (this.linePosition.x1 === 0 && this.linePosition.x2 === 0) {
        return;
      }

      if (!this.editStarted) {
        return;
      }

      this.setLine(e.offsetX);
    },
    handleMouseUp() {
      if (this.linePosition.x1 === 0 && this.linePosition.x2 === 0) {
        return;
      }
      if (!this.editStarted) {
        return;
      }

      this.endDrawLine();
    },
    findFractionLineAtClickedPosition(e) {
      return this.matrixMixin_findClickedObject(
        {
          x: e.clientX,
          y: e.clientY,
        },
        "foreignObject",
        "fraction"
      );
    },
    findSqrtLineAtClickedPosition(e) {
      return this.matrixMixin_findClickedObject(
        {
          x: e.clientX,
          y: e.clientY,
        },
        "foreignObject",
        "sqrt"
      );
    },
  },
};
</script>

<style>
foreignObject[type="fraction"],
foreignObject[type="sqrt"] {
  height: 10px;
  padding-top: 4px;
  cursor: pointer;
}
.line {
  position: absolute;
  display: block;
  border-bottom: solid 1px;
  border-top: solid 1px;
}
.lineHandle {
  cursor: col-resize;
  display: block;
  position: absolute;
  z-index: 999;
  width: 6px;
  height: 6px;
  border: 1, 1, 1, 1;
}
</style>
