import { mapState } from "vuex";
import { mapGetters } from "vuex";
import { mapActions } from "vuex";
import EditMode from "./editMode";
import NotationType from "./notationType";
import BoardType from "./boardType";
export default {
  data: function () {
    return {
      activeCellColor: "lightcyan",
    };
  },
  computed: {
    ...mapState({
      activeCell: (state) => state.notationStore.activeCell,
    }),
  },

  watch: {
    activeCell: {
      handler(activeCell, prevActiveCell) {
        this.$activateCell(activeCell, prevActiveCell);
      },
      activeNotation: {
        //        handler(activeCell, prevActiveCell) {
        //          this.$activateCell(activeCell, prevActiveCell);
      },
    },
  },
  methods: {
    ...mapActions({
      setActiveNotation: "setActiveNotation",
      setActiveCell: "setActiveCell",
      setCurrentEditMode: "setCurrentEditMode",
    }),

    ...mapGetters({
      getNotations: "getNotations",
      getParent: "getParent",
    }),

    // called via mouse click
    activateObjectMixin_activateClickedObject(e) {
      let clickedRect = this.$findCellAtClickedPosition(e);
      let clickedPoint = { x: e.clientX, y: e.clientY };

      if (!clickedRect) {
        return;
      }

      // activate notation
      let overlapRectNotation = this.$getOverlappedRectNotation(clickedPoint);
      if (!!overlapRectNotation) {
        this.setActiveNotation(overlapRectNotation).then(() => {
          if (overlapRectNotation.type === NotationType.TEXT) {
            this.setCurrentEditMode(EditMode.TEXT);
          }
        });
        return;
      }

      let overlapLineNotation = this.$getOverlappedLineNotation(clickedPoint);
      if (!!overlapLineNotation) {
        // selection of line is handled in LineDrawer.vue, here we just reset previous activated element
        return;
      }

      // no underlying elements found, activate single cell
      let cellToActivate = {
        col: clickedRect.attributes.col.value,
        row: clickedRect.parentNode.attributes.row.value,
      };

      this.setActiveCell(cellToActivate).then(() => {
        if (this.getParent().boardType === BoardType.LESSON) {
          this.userOperationsMixin_syncOutgoingActiveCell(cellToActivate);
        }
        this.setCurrentEditMode(EditMode.SYMBOL);
      });
    },

    activateObjectMixin_reset() {
      this.$store.dispatch("setActiveCell", {});
      this.$store.dispatch("setActiveNotation", {});
    },

    activateObjectMixin_unselectPreviouslyActiveCell(prevActiveCell) {
      if (!prevActiveCell?.col) return;
      this.matrixMixin_findRect(prevActiveCell).style.fill = "";
    },

    $getOverlappedRectNotation(clickedPoint) {
      let rectElement = this.$findTextAtClickedPosition(clickedPoint);
      if (!rectElement) return;

      return Object.values(this.getNotations()).find(
        (n) =>
          rectElement.attributes.fromCol?.value >= n.fromCol &&
          rectElement.attributes.toCol?.value <= n.toCol &&
          rectElement.attributes.fromRow?.value >= n.fromRow &&
          rectElement.attributes.fromRow?.value <= n.toRow
      );
    },

    $getOverlappedLineNotation(clickedPoint) {
      let fractionElement = this.$findFractionAtClickedPosition(clickedPoint);
      if (!fractionElement) return;

      return Object.values(this.getNotations()).find(
        (n) =>
          fractionElement.attributes.fromCol?.value >= n.fromCol &&
          fractionElement.attributes.toCol?.value <= n.toCol &&
          fractionElement.attributes.row?.value >= n.row &&
          fractionElement.attributes.row?.value <= n.row
      );
    },

    $findFractionAtClickedPosition(point) {
      return this.matrixMixin_findClickedObject(
        {
          x: point.x,
          y: point.y,
        },
        "foreignObject",
        "fraction"
      );
    },

    $findTextAtClickedPosition(point) {
      return this.matrixMixin_findClickedObject(
        {
          x: point.x,
          y: point.y,
        },
        "foreignObject",
        "text"
      );
    },

    $findCellAtClickedPosition(e) {
      return this.matrixMixin_findClickedObject(
        {
          x: e.clientX,
          y: e.clientY,
        },
        "rect"
      );
    },

    // called by store watcher
    $activateCell(activeCell, prevActiveCell) {
      this.activateObjectMixin_unselectPreviouslyActiveCell(prevActiveCell);
      if (!activeCell?.col) return;

      let rectElm = document
        .querySelector(`svg[id="${this.svgId}"] g[row="${activeCell.row}"]`)
        .querySelector(`rect[col="${activeCell.col}"]`);

      rectElm.style.fill = this.activeCellColor;
    },
  },
};
