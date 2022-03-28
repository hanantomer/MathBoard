import { mapGetters } from "vuex";
import { mapState } from "vuex";
export default {
  data: function () {
    return {
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
    ...mapState({
      currentRect: (state) => state.currentPositionStore.currentRect,
      currentFraction: (state) => state.currentPositionStore.currentFraction,
    }),
  },
  watch: {
    currentRect: {
      handler(currentRect) {
        this.matrixMixin_selectRectByCoordinates(currentRect);
      },
    },
    currentFraction: {
      handler(currentFraction) {
        this.matrixMixin_selectFractionByCoordinates(currentFraction);
      },
    },
  },
  methods: {
    ...mapGetters({
      getcurrentRect: "getcurrentRect",
    }),
    selectionMixin_setCurrentPosition(e) {
      let currentRect = this.matrixMixin_findClickedObject(
        {
          x: e.clientX,
          y: e.clientY,
        },
        "rect"
      );
      if (!!currentRect) {
        return this.userOperationsMixin_syncOutgoingCurrentPosition({
          col: currentRect.attributes.col.value,
          row: currentRect.parentNode.attributes.row.value,
          type: "rect",
        });
      }

      let currentFraction = this.matrixMixin_findClickedObject(
        {
          x: e.clientX,
          y: e.clientY,
          type: "fraction",
        },
        "foreignObject"
      );
      if (!!currentFraction)
        return this.userOperationsMixin_syncOutgoingCurrentPosition({
          col: currentFraction.attributes.col.value,
          row: currentFraction.attributes.row.value,
          type: "fraction",
        });
    },

    // extend or shrink selection area
    selectionMixinUpdateSelectionArea: function (e) {
      this.selectionPosition.x2 = e.clientX;
      this.selectionPosition.y2 = e.clientY - 50;
    },
    //move selection area
    selectionMixin_moveSelection: function (e) {
      let rectSize = this.matrixMixin_getRectSize();
      if (this.dragPostion.x === 0) {
        this.dragPostion.x = e.clientX;
        this.dragPostion.y = e.clientY;
      } else {
        const rectDeltaX = Math.round(
          (e.clientX - this.dragPostion.x) / rectSize
        );
        const rectDeltaY = Math.round(
          (e.clientY - this.dragPostion.y) / rectSize
        );

        // consider meaningfull move only
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
      }
    },
    selectionMixin_resetSelection: function () {
      this.selectionPosition.x1 = this.selectionPosition.x2 = this.selectionPosition.y1 = this.selectionPosition.y2 = 0;
      this.$store.dispatch("unselectAllNotations");
    },
    selectionMixin_startSelection: function (e) {
      this.selectionPosition.x2 = this.selectionPosition.x1 = e.clientX;
      this.selectionPosition.y2 = this.selectionPosition.y1 = e.clientY - 50;
      this.$store.dispatch("unselectAllNotations");
    },
    selectionMixin_endMoveSelection: function (e) {
      this.dragPostion.x = 0;
      this.dragPostion.y = 0;
    },
    selectionMixin_endSelect: function (e) {
      if (this.selectionPosition.x2 != this.selectionPosition.x1) {
        var p1 = {
          x: this.selectionPosition.x1,
          y: this.selectionPosition.y1,
        }; /*this.positionMixin_getSVGCoordinates(
          this.selectionPosition.x1,
          this.selectionPosition.y1
        );*/
        var p2 = {
          x: this.selectionPosition.x2,
          y: this.selectionPosition.y2,
        }; /*this.positionMixin_getSVGCoordinates(
          this.selectionPosition.x2,
          this.selectionPosition.y2
        );*/

        this.svg.selectAll("foreignObject").each((datum) => {
          if (
            !!datum.id &&
            this.getNotationXposByCol(datum.col) +
              this.svg.node().getBoundingClientRect().x >
              p1.x &&
            this.getNotationXposByCol(datum.col) +
              this.svg.node().getBoundingClientRect().x <
              p2.x &&
            this.getNotationYposByRow(datum.row) +
              this.svg.node().getBoundingClientRect().y >
              p1.y &&
            this.getNotationYposByRow(datum.row) +
              this.svg.node().getBoundingClientRect().y <
              p2.y + 50
          ) {
            this.$store.dispatch("selectNotation", datum.id);
          }
        });
      }
    },
  },
};
