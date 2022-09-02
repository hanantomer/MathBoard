import { mapGetters } from "vuex";
import { mapState } from "vuex";
export default {
  data: function () {
    return {
      svgDimensions: () => {
        return this.svg.node().getBoundingClientRect();
      },
    };
  },
  computed: {
    ...mapState({
      selectedRect: (state) => state.selectedPositionStore.selectedRect,
    }),
  },
  watch: {
    selectedRect: {
      handler(selectedRect) {
        this.matrixMixin_selectRectByCoordinates(selectedRect);
      },
    },
  },
  methods: {
    ...mapGetters({
      getSelctedRect: "getSelctedRect",
    }),
    getHeaderHeight() {
      return document.getElementsByTagName("header")[0].getBoundingClientRect()
        .height;
    },
    selectionMixin_findFractionLineAtClickedPosition(e) {
      return this.matrixMixin_findClickedObject(
        {
          x: e.clientX,
          y: e.clientY,
        },
        "foreignObject",
        "fraction"
      );
    },
    selectionMixin_findSqrtLineAtClickedPosition(e) {
      return this.matrixMixin_findClickedObject(
        {
          x: e.clientX,
          y: e.clientY,
        },
        "foreignObject",
        "sqrt"
      );
    },

    selectionMixin_findRectAtClickedPosition(e) {
      return this.matrixMixin_findClickedObject(
        {
          x: e.clientX,
          y: e.clientY,
        },
        "rect"
      );
    },
    selectionMixin_selectRect(selectedRect) {
      let selectedPosition = {
        col: selectedRect.attributes.col.value,
        row: selectedRect.parentNode.attributes.row.value,
        type: "rect",
      };
      this.$store.dispatch("setSelectedRect", selectedPosition).then(() => {
        this.userOperationsMixin_syncOutgoingSelectedPosition(selectedPosition);
      });
    },
    selectionMixin_moveSelectionRight(numOfRects) {
      let selectedRect = this.getSelectedRect();
      if (!selectedRect) return;
    },
  },
};
