import EditMode from "./editMode";
import { mapGetters } from "vuex";
export default {
  mounted: function () {
    // emitted in  app.vue
    this.$root.$on("keyup", this.eventManager_keyUp);
    this.$root.$on("paste", this.eventManager_paste);
  },
  beforeDestroy: function () {
    this.$root.$off("keyup", this.eventManager_keyUp);
    this.$root.$off("paste", this.eventManager_paste);
  },

  data: function () {
    return {
      signList: ["=", "+", "-", "*", "/", "\\", "(", ")", "[", "]"],
    };
  },

  methods: {
    ...mapGetters({
      getCurrentEditMode: "getCurrentEditMode",
      getLastNotation: "getLastNotation",
    }),

    async eventManager_paste(e) {
      const dT = e.clipboardData || window.clipboardData;
      const file = dT.items[0].getAsFile(); //dT.files[0];
      if (!file) {
        return;
      }
      const data = await fetch(file);
      const blob = await data.blob();
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        const base64data = reader.result;
      };
    },
    eventManager_keyUp(e) {
      if (e.ctrlKey || e.altKey) {
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
          e.code === "ArrowDown" ||
          e.code === "Space"
        )
      ) {
        return;
      }

      if (e.code === "Backspace") {
        this.notationMixin_removeNotationAtSeletedPosition();
        this.matrixMixin_setNextRect(-1, 0);
        return;
      }

      if (e.code === "Delete") {
        this.notationMixin_removeNotationAtSeletedPosition();
        return;
      }

      if (e.code === "ArrowLeft") {
        this.matrixMixin_setNextRect(-1, 0);
        return;
      }

      if (e.code === "ArrowRight" || e.code === "Space") {
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

      this.symbolMixin_addSymbol(e);
    },

    eventManager_mouseDown(e) {
      if (
        this.getCurrentEditMode() === EditMode.FRACTION ||
        this.getCurrentEditMode() === EditMode.SQRT ||
        this.getCurrentEditMode() === EditMode.SELECT
      ) {
        return;
      }

      this.activateCellMixin_activateCell(e);
    },
  },
};
