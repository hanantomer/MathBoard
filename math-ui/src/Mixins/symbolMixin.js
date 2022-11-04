import { mapGetters } from "vuex";
import NotationType from "./notationType";
import EditMode from "./editMode";

export default {
  methods: {
    ...mapGetters({
      getActiveCellArr: "getActiveCellArr",
      getCurrentEditMode: "getCurrentEditMode",
      getLastActiveCell: "getLastActiveCell",
      getLastNotation: "getLastNotation",
      lastNotationIsSingular: "lastNotationIsSingular",
    }),

    // isScalarAdjacentToLetter(key) {
    //   if (!Object.keys(this.getNotations()).length) {
    //     return false;
    //   }

    //   let lastNotation = this.getLastNotation();
    //   if (this.getLastActiveCell()?.col != lastNotation.col + 1) {
    //     return false;
    //   }

    //   let lastNotaionIsLetter =
    //     lastNotation.type == NotationType.SYMBOL &&
    //     /[a-zA-Z]/.test(lastNotation.value);

    //   let lastNotaionIsScalar =
    //     lastNotation.type == NotationType.SYMBOL &&
    //     /[0-9]/.test(lastNotation.value);

    //   if (!isNaN(key) && lastNotaionIsLetter) return true;

    //   if (isNaN(key) && lastNotaionIsScalar) return true;

    //   return false;
    // },

    symbolMixin_addSymbol(e) {
      if (
        // in power mode allow digits only
        this.getCurrentEditMode() === EditMode.POWER &&
        e.code.startsWith("Digit")
      ) {
        this.addSymbol(e.key, NotationType.POWER);
        return;
      }

      if (
        this.getCurrentEditMode() === EditMode.SYMBOL &&
        this.signList.indexOf(e.key) >= 0
      ) {
        this.addSymbol(e.key, NotationType.SIGN);
        return;
      }

      if (this.getCurrentEditMode() === EditMode.SYMBOL) {
        this.addSymbol(e.key, NotationType.SYMBOL);
        return;
      }
    },

    addSymbol(value, type) {
      let activeCell = this.getActiveCellArr()[0];
      let symbol = {
        value: value,
        type: type,
      };
      symbol.col = activeCell.col;
      symbol.row = activeCell.row;

      this.$store
        .dispatch("addNotation", symbol)
        .then((symbol) => {
          this.userOperationsMixin_syncOutgoingSaveNotation(symbol);
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
