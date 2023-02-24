import EditMode from "./editMode";
import NotationType from "./notationType";
import { mapGetters, mapActions } from "vuex";
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
      getParent: "getParent",
    }),

    ...mapActions({
      setActiveNotation: "setActiveNotation",
    }),

    async eventManager_paste(e) {
      // disallow adding image by student
      if (!this.isTeacher()) return;

      const dT = e.clipboardData || window.clipboardData;
      const item = dT.items[0]; //dT.files[0];

      var reader = new FileReader();
      var that = this;
      reader.addEventListener("load", () => {
        const base64data = reader.result;

        let image = new Image();
        image.src = base64data;
        image.onload = () => {
          let fromCol = parseInt(that.getActiveCell().col);
          let fromRow = parseInt(that.getActiveCell().row);
          let toCol =
            Math.ceil(image.width / that.matrixMixin_getRectSize()) + fromCol;
          let toRow =
            Math.ceil(image.height / that.matrixMixin_getRectSize()) + fromRow;

          let notation = {
            type: NotationType.IMAGE,
            fromCol: fromCol,
            toCol: toCol,
            fromRow: fromRow,
            toRow: toRow,
            value: base64data,
          };
          that.$store
            .dispatch("addNotation", notation)
            .then((text) => {
              if (this.getParent().boardType === BoardType.LESSON) {
                this.userOperationsMixin_syncOutgoingSaveNotation(notation);
              }
            })
            .catch((e) => {
              console.error(e);
            });

          that.$store.dispatch("setActiveCell", {});
        };
      });

      reader.readAsDataURL(item.getAsFile());
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
        this.notationMixin_removeActiveOrSelectedNotations();
        this.matrixMixin_setNextRect(-1, 0);
        return;
      }

      if (e.code === "Delete") {
        this.notationMixin_removeActiveOrSelectedNotations();
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

      if (e.code === "Enter") {
        this.matrixMixin_setNextRow(0, 1);
        return;
      }

      this.notationMixin_addNotation(e);
    },

    eventManager_mouseDown(e) {
      if (
        this.getCurrentEditMode() === EditMode.FRACTION ||
        this.getCurrentEditMode() === EditMode.SQRT ||
        this.getCurrentEditMode() === EditMode.SELECT
      ) {
        return;
      }

      this.activateObjectMixin_activateClickedObject(e);
    },
    eventManager_lineDrawEnded() {
      // see toolbar.vue
      this.$root.$emit("resetToolbarState");
      this.activateObjectMixin_unselectPreviouslyActiveCell();
    },
    eventManager_lineSelected(line) {
      //this.activateObjectMixin_unselectPreviouslyActiveCell();
      this.setActiveNotation(line);
    },
  },
};
