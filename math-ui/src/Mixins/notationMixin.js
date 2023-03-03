import { mapGetters, mapActions } from "vuex";
import NotationType from "./notationType";
import BoardType from "../Mixins/boardType";
import EditMode from "./editMode";

export default {
  methods: {
    ...mapGetters({
      getActiveCell: "getActiveCell",
      getCurrentEditMode: "getCurrentEditMode",
      getParent: "getParent",
    }),

    ...mapActions({
      removeSymbolsByCell: "removeSymbolsByCell",
      removeActiveNotation: "removeActiveNotation",
      removeSelectedNotations: "removeSelectedNotations",
      unselectAllNotations: "unselectAllNotations",
      addNotation: "addNotation",
    }),

    notationMixin_addNotation(e) {
      if (
        // in power mode allow digits only
        this.getCurrentEditMode() === EditMode.POWER &&
        e.code.startsWith("Digit")
      ) {
        this.$addNotation(e.key, NotationType.POWER);
        return;
      }

      if (
        this.getCurrentEditMode() === EditMode.SYMBOL &&
        this.signList.indexOf(e.key) >= 0
      ) {
        this.$addNotation(e.key, NotationType.SIGN);
        return;
      }

      if (this.getCurrentEditMode() === EditMode.SYMBOL) {
        this.$addNotation(e.key, NotationType.SYMBOL);
        return;
      }
    },

    notationMixin_removeNotationsAtMousePosition: function (e) {
      let rectAtMousePosition = this.matrixMixin_findClickedObject(
        {
          x: e.clientX,
          y: e.clientY,
        },
        "rect"
      );
      if (!rectAtMousePosition) return;
      this.romoveNotations({
        row: rectAtMousePosition.parentNode.attributes.row.value,
        col: rectAtMousePosition.attributes.col.value,
      });
    },
    notationMixin_removeActiveOrSelectedNotations() {
      this.$removeActiveCellNotations();
      this.$removeActiveNotation();
      this.$removeSelectedNotations();
    },

    async $removeActiveCellNotations() {
      let cell = this.getActiveCell();
      if (!cell) return;

      let notationsToDelete = await this.removeSymbolsByCell(cell);
      if (!notationsToDelete) return;

      notationsToDelete.forEach((notation) => {
        if (notation.NotationType === NotationType.SYMBOL)
          this.userOperationsMixin_syncOutgoingRemoveNotation(notation);
      });
    },

    async $removeActiveNotation() {
      let deletedNotation = await this.removeActiveNotation();
      if (!deletedNotation) return;
      this.userOperationsMixin_syncOutgoingRemoveNotation(deletedNotation);
    },

    async $removeSelectedNotations() {
      let deletedNotations = await this.removeSelectedNotations();
      if (!!deletedNotations) {
        deletedNotations.forEach((n) =>
          this.userOperationsMixin_syncOutgoingRemoveNotation(n)
        );
      }
      this.unselectAllNotations();
    },

    $addNotation(value, type) {
      let symbol = {
        value: value,
        type: type,
      };
      symbol.col = this.getActiveCell().col;
      symbol.row = this.getActiveCell().row;

      this.addNotation(symbol)
        .then((symbol) => {
          if (this.getParent().boardType === BoardType.LESSON) {
            this.userOperationsMixin_syncOutgoingSaveNotation(symbol);
          }
        })
        .then(() => {
          this.matrixMixin_setNextRect(1, 0);
        })
        .catch((e) => {
          console.error(e);
        });
    },
  },
};
