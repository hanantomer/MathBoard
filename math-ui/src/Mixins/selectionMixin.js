import { mapGetters } from "vuex";
import { mapState } from "vuex";
export default {
  data: function () {
    return {
      svgDimensions: () => {
        return this.svg.node().getBoundingClientRect();
      },
      selectionPosition: {
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 0,
      },
      dragPostion: {
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
    ...mapState({
      currentRect: (state) => state.currentPositionStore.currentRect,
    }),
  },
  watch: {
    currentRect: {
      handler(currentRect) {
        this.matrixMixin_selectRectByCoordinates(currentRect);
      },
    },
  },
  methods: {
    ...mapGetters({
      getcurrentRect: "getcurrentRect",
    }),
    getSvgOffset() {
      const rect = document.getElementById("svg").getBoundingClientRect();
      return {
        left: rect.left + window.scrollX,
        top: rect.top + window.scrollY,
      };
    },
    getHeaderHeight() {
      return document.getElementsByTagName("header")[0].getBoundingClientRect()
        .height;
    },
    selectionMixin_setCurrentPosition(e) {
      let currentRect = this.matrixMixin_findClickedObject(
        {
          x: e.clientX,
          y: e.clientY,
        },
        "rect"
      );
      if (!!currentRect) {
        let currentPosition = {
          col: currentRect.attributes.col.value,
          row: currentRect.parentNode.attributes.row.value,
          type: "rect",
        };
        this.$store.dispatch("setCurrentRect", currentPosition).then(() => {
          this.userOperationsMixin_syncOutgoingCurrentPosition(currentPosition);
        });
      }
    },
    selectionMixin_startSelection(e) {
      let x = e.clientX;
      let y = e.clientY - this.getHeaderHeight();
      this.selectionPosition.x2 = this.selectionPosition.x1 = x;
      this.selectionPosition.y2 = this.selectionPosition.y1 = y;
      this.$store.dispatch("unselectAllNotations");
    },
    // extend or shrink selection area
    selectionMixin_UpdateSelectionArea(e) {
      this.selectionPosition.x2 = e.clientX;
      this.selectionPosition.y2 = e.clientY - this.getHeaderHeight();
    },
    selectionMixin_endSelect: function (e) {
      let svgOffset = this.getSvgOffset();
      if (this.selectionPosition.x2 != this.selectionPosition.x1) {
        this.svg.selectAll("foreignObject").each((datum) => {
          if (
            !!datum.col &&
            !!datum.row &&
            this.getNotationXposByCol(datum.col) + svgOffset.left >
              this.selectionPosition.x1 &&
            this.getNotationXposByCol(datum.col) + svgOffset.left <
              this.selectionPosition.x2 &&
            this.getNotationYposByRow(datum.row) +
              svgOffset.top -
              this.getHeaderHeight() >
              this.selectionPosition.y1 &&
            this.getNotationYposByRow(datum.row) +
              svgOffset.top -
              this.getHeaderHeight() <
              this.selectionPosition.y2
          ) {
            this.$store.dispatch("selectNotation", {
              col: datum.col,
              row: datum.row,
            });
          }
        });
      }
    },
    //move selection area
    selectionMixin_moveSelection(e) {
      let rectSize = this.matrixMixin_getRectSize();
      if (this.dragPostion.x === 0) {
        this.dragPostion.x = e.clientX;
        this.dragPostion.y = e.clientY;
        return;
      }

      const rectDeltaX = Math.round(
        (e.clientX - this.dragPostion.x) / rectSize
      );
      const rectDeltaY = Math.round(
        (e.clientY - this.dragPostion.y) / rectSize
      );

      if (rectDeltaX != 0 || rectDeltaY != 0) {
        this.$store
          .dispatch("moveSelectedNotations", {
            rectDeltaX,
            rectDeltaY,
            rectSize,
          })
          .then(() => {
            this.selectionPosition.x1 += rectDeltaX * rectSize;
            this.selectionPosition.y1 += rectDeltaY * rectSize;
            this.selectionPosition.x2 += rectDeltaX * rectSize;
            this.selectionPosition.y2 += rectDeltaY * rectSize;
            this.dragPostion.x = e.clientX;
            this.dragPostion.y = e.clientY;
          });
      }
    },
    selectionMixin_endMoveSelection(e) {
      this.dragPostion.x = 0;
      this.dragPostion.y = 0;
    },
    selectionMixin_resetSelection() {
      this.selectionPosition.x1 = this.selectionPosition.x2 = this.selectionPosition.y1 = this.selectionPosition.y2 = 0;
      this.$store.dispatch("unselectAllNotations");
    },
  },
};
