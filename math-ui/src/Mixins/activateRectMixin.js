import { mapState } from "vuex";
import EditMode from "../Mixins/editMode";
export default {
  data: function () {
    return {
      activeRectColor: "lightcyan",
    };
  },
  computed: {
    ...mapState({
      activeRectArr: (state) => state.activeRectStore.activeRectArr,
    }),
  },
  watch: {
    activeRectArr: {
      handler(activeRectArr, prevActiveRectArr) {
        if (!!activeRectArr)
          this.$activateRectArr(activeRectArr, prevActiveRectArr);
      },
    },
  },
  methods: {
    // called via mouse click
    activateRectMixin_activateRect(e) {
      let clickedRect = this.$findRectAtClickedPosition(e);

      if (!!clickedRect) {
        let overlapTextNotation = this.$getOverlappedTextNotation(clickedRect);

        if (!!overlapTextNotation) {
          // activate multiple rects
          this.$activateTextNotationRects(overlapTextNotation);
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

    activateRectMixin_reset() {
      this.$store.dispatch("setActiveRectArr", []);
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
        let rectArr = [];
        for (let col = textNotation.fromCol; col <= textNotation.toCol; col++) {
          for (
            let row = textNotation.fromRow;
            row <= textNotation.toRow;
            row++
          ) {
            rectArr.push({ col: col, row: row });
          }
        }
        this.$updateStoreAndDispatch(rectArr);
      });
    },

    // called by store watcher
    $activateRectArr(activeRectArr, prevActiveRectArr) {
      this.$unselectPreviouslyActiveRectArr(prevActiveRectArr);

      activeRectArr.forEach((rect) => {
        let rectElm = document
          .querySelector(`svg[id="${this.svgId}"] g[row="${rect.row}"]`)
          .querySelector(`rect[col="${rect.col}"]`);

        rectElm.style.fill = this.activeRectColor;
      });
    },

    $unselectPreviouslyActiveRectArr(prevActiveRectArr) {
      if (!prevActiveRectArr) return;
      prevActiveRectArr.forEach((rect) => {
        this.matrixMixin_findRect(rect).style.fill = "";
      });
    },

    $updateStoreAndDispatch(rectArr) {
      this.$store.dispatch("setActiveRectArr", rectArr).then(() => {
        this.userOperationsMixin_syncOutgoingSelectedPosition(rectArr);
      });
    },
  },
};
