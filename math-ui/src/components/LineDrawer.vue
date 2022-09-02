<template>
  <div>
    <v-card
      id="lineLeftHandle"
      class="lineHandle"
      v-on:mousemove="handleMouseMove"
      v-on:mouseup="endDrawLine"
      v-bind:style="{
        left: lineLeft - 5 + 'px',
        top: lineTop + 'px',
      }"
    ></v-card>
    <v-card
      id="lineRightHandle"
      class="lineHandle"
      v-on:mousemove="handleMouseMove"
      v-on:mouseup="endDrawLine"
      v-bind:style="{
        left: lineRight + 'px',
        top: lineTop + 'px',
      }"
    ></v-card>
    <v-divider
      style="color: red; z-index: 9999; height: 10px"
      id="line"
      class="line"
      v-on:mouseup="lineMouseUp"
      v-bind:style="{
        left: lineLeft + 'px',
        top: lineTop + 'px',
        width: lineRight - lineLeft + 'px',
      }"
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
import matrixOverlayMixin from "../Mixins/matrixOverlayMixin";
import userOutgoingOperationsSyncMixin from "../Mixins/userOutgoingOperationsSyncMixin";
import eventManagerMixin from "../Mixins/eventManager";
import { mapGetters } from "vuex";
export default {
  mixins: [
    notationMixin,
    matrixOverlayMixin,
    userOutgoingOperationsSyncMixin,
    eventManagerMixin,
  ],
  name: "LineDrawer",
  props: {
    notationType: { type: String },
    startMouseDrawingPosition: { type: Object },
    currentMousePosition: { type: Object },
    selectedLineId: { type: String },
    ended: { type: Boolean },
  },
  watch: {
    startMouseDrawingPosition: {
      immediate: true,
      handler: function (position) {
        if (
          !!position &&
          typeof position.x === "number" &&
          isFinite(position.x)
        ) {
          this.startLineDrawing(position);
        }
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
          console.debug("right pos from watch:" + position.x);
          this.updateLine(position.x); ///TODO support update of left poistion too
        }
      },
    },
    ended: {
      immediate: true,
      handler: function () {
        if (!this.drawLineRelay.selectedLineId) {
          this.endDrawLine();
        }
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
    // lineLeftHandleLeft: function () {
    //   console.debug(
    //     "lineLeftHandleLeft:" +
    //       Math.min(this.linePosition.x1, this.linePosition.x2) +
    //       "px"
    //   );
    //   return Math.min(this.linePosition.x1, this.linePosition.x2);
    // },
    // lineRightHandleLeft: function () {
    //   console.debug(
    //     "lineRightHandleLeft" +
    //       Math.max(this.linePosition.x1, this.linePosition.x2) +
    //       "px"
    //   );
    //   return Math.max(this.linePosition.x1, this.linePosition.x2) ;
    // },
    // lineHandleTop: function () {
    //   console.debug(
    //     "lineHandleTop:" + this.linePosition.y + this.getTabsHeight() - 5 + "px"
    //   );
    //   return this.linePosition.y + this.getTabsHeight() - 5 + "px";
    // },
  },
  methods: {
    ...mapGetters({
      getNotations: "getNotations",
    }),
    /// TODO move to global
    getNearestRow: function (clickedYPos) {
      let clickedRow = Math.round(clickedYPos / this.matrixMixin_getRectSize());
      return clickedRow * this.matrixMixin_getRectSize();
    },
    // either fraction or sqrt
    setLine: function (row, fromCol, toCol) {
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
    startLineDrawing: function (position) {
      let y = this.getNearestRow(position.y);
      this.linePosition.x2 = this.linePosition.x1 = position.x;
      this.linePosition.y = y;
    },
    startLineEditing: function (selectedLineId) {
      let storedNotation = this.getNotations()[selectedLineId];
      if (!storedNotation) {
        console.error(`selectedLineId: ${selectedLineId} not found `);
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
        "startLineEditing: x1:" +
          this.linePosition.x1 +
          ",x2:" +
          this.linePosition.x2 +
          ",y:" +
          this.linePosition.y
      );
    },
    // updateLineRightPosition: function (x) {
    //   console.debug("updateLineRightPosition:" + x);
    //   this.linePosition.x2 = x;
    // },
    // updateLineLeftPosition: function (x) {
    //   this.linePosition.x1 = x;
    // },
    updateLine: function (position) {
      if (position < this.linePosition.x1) {
        this.linePosition.x1 = position;
      }
      if (position > this.linePosition.x1) {
        this.linePosition.x2 = position;
      }
    },

    lineMouseUp() {
      if (!this.selectedLineId) {
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
        console.log("endDrawLine");
        this.setLine(row, fromCol, toCol);
        this.$emit("ended"); // signal parent
      }
    },
    handleMouseMove(e) {
      // left button is pressed
      if (e.buttons !== 1) {
        return;
      }
      //this.updateLine(e.clientX);
    },
    // rightLineHandleMouseMove(e) {
    //   // left button is pressed
    //   if (e.buttons !== 1) {
    //     return;
    //   }
    //   console.debug("rightLineHandleMouseMove");
    //   this.updateLine(e.clientX - this.getTabsLeft());
    // },
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
