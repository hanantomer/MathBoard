import { mapState } from "vuex";
import EditMode from "./editMode";
export default {
  data: function () {
    return {
      activeCellColor: "lightcyan",
    };
  },
  computed: {
    ...mapState({
      activeCellArr: (state) => state.activeCellStore.activeCellArr,
    }),
  },
  watch: {
    activeCellArr: {
      handler(activeCellArr, prevActiveCellArr) {
        if (!!activeCellArr)
          this.$activateCellArr(activeCellArr, prevActiveCellArr);
      },
    },
  },
  methods: {
    // called via mouse click
    activateCellMixin_activateCell(e) {
      let clickedRect = this.$findRectAtClickedPosition(e);

      if (!!clickedRect) {
        let overlapTextNotation = this.$getOverlappedTextNotation(clickedRect);

        if (!!overlapTextNotation) {
          // activate multiple rects
          this.$activateTextNotationRects(overlapTextNotation);
          return;
        }

        // activate single rect
        this.setCurrentEditMode(EditMode.SYMBOL).then(() =>
          this.$updateStoreAndDispatch([
            {
              col: clickedRect.attributes.col.value,
              row: clickedRect.parentNode.attributes.row.value,
            },
          ])
        );
      }
    },

    activateCellMixin_reset() {
      this.$store.dispatch("setActiveCellArr", []);
    },

    $getOverlappedTextNotation(clickedRect) {
      return Object.values(this.getNotations()).find(
        (n) =>
          n.type === "text" &&
          clickedRect.attributes.col.value >= n.fromCol &&
          clickedRect.attributes.col.value <= n.toCol &&
          clickedRect.parentNode.attributes.row.value <= n.fromRow &&
          clickedRect.parentNode.attributes.row.value >= n.toRow
      );
    },

    $findRectAtClickedPosition(e) {
      return this.matrixMixin_findClickedObject(
        {
          x: e.clientX,
          y: e.clientY,
        },
        "rect"
      );
    },

    $activateTextNotationRects(textNotation) {
      this.setCurrentEditMode(EditMode.TEXT).then(() => {
        let cellArr = [];
        for (let col = textNotation.fromCol; col <= textNotation.toCol; col++) {
          for (
            let row = textNotation.fromRow;
            row <= textNotation.toRow;
            row++
          ) {
            cellArr.push({ col: col, row: row });
          }
        }
        this.$updateStoreAndDispatch(cellArr);
      });
    },

    // called by store watcher
    $activateCellArr(activeCellArr, prevActiveCellArr) {
      this.$unselectPreviouslyActiveCellArr(prevActiveCellArr);

      activeCellArr.forEach((rect) => {
        let rectElm = document
          .querySelector(`svg[id="${this.svgId}"] g[row="${rect.row}"]`)
          .querySelector(`rect[col="${rect.col}"]`);

        rectElm.style.fill = this.activeCellColor;
      });
    },

    $unselectPreviouslyActiveCellArr(prevActiveCellArr) {
      if (!prevActiveCellArr) return;
      prevActiveCellArr.forEach((rect) => {
        this.matrixMixin_findRect(rect).style.fill = "";
      });
    },

    $updateStoreAndDispatch(rectArr) {
      this.$store.dispatch("setActiveCellArr", rectArr).then(() => {
        this.userOperationsMixin_syncOutgoingSelectedPosition(rectArr);
      });
    },
  },
};
