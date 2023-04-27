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
import NotationType from "../Mixins/notationType";
import EditMode from "../Mixins/editMode";
import { mapGetters, mapState, mapActions } from "vuex";

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
      return Math.min(this.linePosition.x1, this.linePosition.x2);
    },
    lineRight: function () {
      return Math.max(this.linePosition.x1, this.linePosition.x2);
    },
    lineTop: function () {
      return this.linePosition.y;
    },
    ...mapState({
      activeCell: (state) => state.notationStore.activeCell,
    }),
  },
  watch: {
    activeCell: {
      handler(newVal) {
        if (!newVal) return;
        this.reset();
      },
    },
  },
  methods: {
    ...mapGetters({
      getCurrentEditMode: "getCurrentEditMode",
      getNotations: "getNotations",
    }),
    ...mapActions({
      setActiveNotation: "setActiveNotation",
    }),
    /// TODO move to global
    getNearestRow: function (clickedYPos) {
      let clickedRow = Math.round(clickedYPos / this.matrixMixin_getRectSize());
      return clickedRow * this.matrixMixin_getRectSize();
    },
    startLineDrawing: function (position) {
      this.editStarted = true;
      this.linePosition.x2 = this.linePosition.x1 = position.x;
      this.linePosition.y = this.getNearestRow(position.y);
    },
    $selectLine: function (notationId) {
      //this.editStarted = true;
      let notation = this.getNotations()[notationId];

      this.linePosition.x1 = this.getNotationXposByCol(notation.fromCol);

      this.linePosition.x2 =
        this.linePosition.x1 +
        (notation.toCol - notation.fromCol) * this.matrixMixin_getRectSize();

      this.linePosition.y = this.getNotationYposByRow(notation.row);
      this.setActiveNotation(notation);
    },
    $setLine: function (position) {
      if (position < this.linePosition.x1) {
        this.linePosition.x1 = position;
      }
      if (position > this.linePosition.x1) {
        this.linePosition.x2 = position;
      }
    },
    $saveLine: function (row, fromCol, toCol) {
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
    $endDrawLine: function () {
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
        this.$saveLine(row, fromCol, toCol);
        this.$emit("drawLineEnded"); // signal parent
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
      if (e.buttons !== 1) {
        // ignore right button
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
            ? NotationType.FRACTION
            : NotationType.SQRT;

        this.startLineDrawing({ x: e.offsetX, y: e.offsetY });
      }

      let fraction = this.$findFractionLineAtClickedPosition(e);
      if (!!fraction) {
        //select existing fraction
        this.notationType = NotationType.FRACTION;
        this.$selectLine(fraction.id);
        return;
      }

      let sqrt = this.$findSqrtLineAtClickedPosition(e);
      if (!!sqrt) {
        //select existing sqrt
        this.notationType = NotationType.SQRT;
        this.$selectLine(sqrt.id);
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

      this.$setLine(e.offsetX);
    },
    handleMouseUp() {
      if (this.linePosition.x1 === 0 && this.linePosition.x2 === 0) {
        return;
      }
      if (!this.editStarted) {
        return;
      }

      this.$endDrawLine();
    },
    $findFractionLineAtClickedPosition(e) {
      return this.matrixMixin_findClickedObject(
        {
          x: e.clientX,
          y: e.clientY,
        },
        "foreignObject",
        "fraction"
      );
    },
    $findSqrtLineAtClickedPosition(e) {
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
