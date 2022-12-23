import { mapState } from "vuex";
import { mapGetters } from "vuex";
import { mapActions } from "vuex";
import EditMode from "./editMode";
import notationType from "./notationType";
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
    }),

    // called via mouse click
    activateObjectMixin_activateClickedObject(e) {
      let clickedRect = this.$findCellAtClickedPosition(e);

      if (!!clickedRect) {
        // activate notation
        let overlapRectNotation = this.$getOverlappedRectNotation(clickedRect);
        if (!!overlapRectNotation) {
          this.setActiveNotation(overlapRectNotation).then(() => {
            if (overlapRectNotation.type === notationType.TEXT) {
              this.setCurrentEditMode(EditMode.TEXT);
            }
          });
          return;
        }

        // activate single cell
        let cellToActivate = {
          col: clickedRect.attributes.col.value,
          row: clickedRect.parentNode.attributes.row.value,
        };

        this.setActiveCell(cellToActivate).then(() => {
          this.userOperationsMixin_syncOutgoingActiveCell(cellToActivate);
          this.setCurrentEditMode(EditMode.SYMBOL);
        });
      }
    },

    activateObjectMixin_reset() {
      this.$store.dispatch("setActiveCell", {});
      this.$store.dispatch("setActiveNotation", {});
    },

    $getOverlappedRectNotation(clickedRect) {
      return Object.values(this.getNotations()).find(
        (n) =>
          clickedRect.attributes.col.value >= n.fromCol &&
          clickedRect.attributes.col.value <= n.toCol &&
          clickedRect.parentNode.attributes.row.value >= n.fromRow &&
          clickedRect.parentNode.attributes.row.value <= n.toRow
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
      this.$unselectPreviouslyActiveCell(prevActiveCell);

      if (!!activeCell?.col) {
        let rectElm = document
          .querySelector(`svg[id="${this.svgId}"] g[row="${activeCell.row}"]`)
          .querySelector(`rect[col="${activeCell.col}"]`);

        rectElm.style.fill = this.activeCellColor;
      }
    },

    $unselectPreviouslyActiveCell(prevActiveCell) {
      if (!prevActiveCell.col) return;
      this.matrixMixin_findRect(prevActiveCell).style.fill = "";
    },
  },
};
