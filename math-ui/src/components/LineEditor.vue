<template>
  <div>
    <v-card
      id="lineLeftHandle"
      class="lineHandle"
      v-on:mousemove="leftLineHandleMouseMove"
      v-on:mouseup="endEditLine"
      v-bind:style="{
        left: lineLeftHandleLeft,
        top: lineHandleTop,
      }"
    ></v-card>
    <v-card
      id="lineRightHandle"
      class="lineHandle"
      v-on:mousemove="rightLineHandleMouseMove"
      v-on:mouseup="endEditLine"
      v-bind:style="{
        left: lineRightHandleLeft,
        top: lineHandleTop,
      }"
    ></v-card>
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
  name: "LineEditor",
  props: {
    svgId: { type: String },
    notationType: { type: String },
    currentMousePosition: { type: Object },
    selectedLineId: { type: String },
    ended: { type: Boolean },
  },
  watch: {
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
        this.endEditLine();
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
    lineLeftHandleLeft: function () {
      return Math.min(this.linePosition.x1, this.linePosition.x2) - 5 + "px";
    },
    lineRightHandleLeft: function () {
      return Math.max(this.linePosition.x1, this.linePosition.x2) - 5 + "px";
    },
    lineHandleTop: function () {
      return this.linePosition.y + this.getTabsHeight() - 5 + "px";
    },
  },
  methods: {
    ...mapGetters({
      getNotations: "getNotations",
    }),
    ///TODO move to global area
    getNearestRow: function (clickedYPos) {
      let clickedRow = Math.round(clickedYPos / this.matrixMixin_getRectSize());
      return clickedRow * this.matrixMixin_getRectSize();
    },
    // either fraction or sqrt
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
    startLineEditing: function (selectedLineId) {
      let storedNotation = this.getNotations()[selectedLineId];
      if (!storedNotation) {
        console.error(`selectedLineId: ${selectedLineId} not found `);
        return;
      }

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
    updateLineRightPosition: function (x) {
      console.debug("new right position:" + x);
      this.linePosition.x2 = x;
    },
    updateLineLeftPosition: function (x) {
      this.linePosition.x1 = x;
    },
    leftLineHandleMouseMove(e) {
      // left button is pressed
      if (e.buttons !== 1) {
        return;
      }
      this.updateLineLeftPosition(e.clientX);
    },
    rightLineHandleMouseMove(e) {
      // left button is pressed
      if (e.buttons !== 1) {
        return;
      }
      console.debug("rightLineHandleMouseMove");
      this.updateLineRightPosition(e.clientX);
    },
    reset: function () {
      this.linePosition.x1 = this.linePosition.x2 = this.linePosition.y = 0;
    },
    endEditLine: function () {
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
        console.log(
          "endEditLine, row:" + row + ",fromCol:" + fromCol + ",toCol:" + toCol
        );
        this.saveLine(row, fromCol, toCol);
        this.$emit("ended"); // signal parent
      }
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
</style>
