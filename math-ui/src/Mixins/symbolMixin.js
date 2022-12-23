import { mapGetters } from "vuex";
import { mapActions } from "vuex";
import NotationType from "./notationType";
import EditMode from "./editMode";

export default {
  methods: {
    ...mapGetters({
      getActiveCell: "getActiveCell",
      getCurrentEditMode: "getCurrentEditMode",
    }),

    ...mapActions({
      addNotation: "addNotation",
    }),

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
      let symbol = {
        value: value,
        type: type,
      };
      symbol.col = this.getActiveCell().col;
      symbol.row = this.getActiveCell().row;

      this.addNotation(symbol)
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
