import EditMode from "./editMode";
import { mapGetters } from "vuex";
import { mapActions } from "vuex";
export default {
  mounted: function () {
    // emitted in  app.vue
    this.$root.$on("keyup", this.eventManager_keyUp);
  },
  beforeDestroy: function () {
    this.$root.$off("keyup", this.eventManager_keyUp);
  },

  methods: {
    ...mapGetters({
      getCurrentEditMode: "getCurrentEditMode",
    }),
    ...mapActions({
      setCurrentEditMode: "setCurrentEditMode", ///TODO might be eliminated
    }),

    async eventManager_keyUp(e) {
      if (e.ctrlKey || e.altKey) {
        return;
      }

      if (
        // in power mode allow digits only
        this.getCurrentEditMode() === EditMode.ADD_POWER &&
        e.code.startsWith("Digit")
      ) {
        this.symbolMixin_addSymbol(e.key, "power");
        return;
      }

      if (
        !(
          e.code.startsWith("Digit") ||
          e.code.startsWith("Key") ||
          e.code.startsWith("Numpad") ||
          e.code === "Minus" ||
          e.code === "Delete" ||
          e.code === "Backspace" ||
          e.code === "Plus" ||
          e.code === "Equal" ||
          e.code === "Period" ||
          e.code === "ArrowLeft" ||
          e.code === "ArrowRight" ||
          e.code === "ArrowUp" ||
          e.code === "ArrowDown"
        )
      ) {
        return;
      }

      if (e.code === "ArrowLeft") {
        this.matrixMixin_setNextRect(-1, 0);
        return;
      }

      if (e.code === "ArrowRight") {
        this.matrixMixin_setNextRect(1, 0);
        return;
      }

      if (e.code === "ArrowUp") {
        this.matrixMixin_setNextRect(0, -1);
        return;
      }

      if (e.code === "ArrowDown") {
        this.matrixMixin_setNextRect(0, 1);
        return;
      }

      if (e.code === "Backspace" || e.code === "Delete") {
        this.notationMixin_removeNotationAtSeletedPosition();
        return;
      }

      if (this.getCurrentEditMode() === EditMode.ADD_SYMBOL) {
        this.symbolMixin_addSymbol(e.key, "symbol");
      }
    },

    async eventManager_mouseDown(e) {
      if (
        this.getCurrentEditMode() === EditMode.FRACTION ||
        this.getCurrentEditMode() === EditMode.SQRT ||
        this.getCurrentEditMode() === EditMode.SELECT ||
        this.getCurrentEditMode() === EditMode.DELETE
      ) {
        return;
      }

      let activeRect = this.activateRectMixin_findRectAtClickedPosition(e);
      if (!!activeRect) {
        await this.setCurrentEditMode(EditMode.ADD_SYMBOL);
        this.activateRectMixin_activateRect(activeRect);
        return;
      }
    },

    eventManager_mouseUp(e) {
      if (this.getCurrentEditMode() === EditMode.DELETE) {
        this.endDeleteMode();
        return;
      }
    },

    eventManager_mouseMove(e) {
      this.showFractionLineTooltip = false;
      this.showAccessTooltip = false;
      // left button is pressed
      if (e.buttons !== 1) {
        return;
      }
      if (this.getCurrentEditMode() === EditMode.DELETE) {
        this.notationMixin_removeNotationsAtMousePosition(e);
        return;
      }
    },
  },
};
