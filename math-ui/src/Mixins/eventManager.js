import EditMode from "./editMode";
import { mapGetters } from "vuex";
import { mapActions } from "vuex";
export default {
  data: function () {
    return {
      //currentMode: EditMode.ADD_SYMBOL,
      // selectionAreaRelay: {
      //   initialPosition: { x: 0, y: 0 },
      //   currentPosition: { x: 0, y: 0 },
      //   currentMovePosition: { x: 0, y: 0 },
      //   ended: false,
      //   moveEnded: false,
      // },
      // drawLineRelay: {
      //   notationType: "",
      //   startMousePosition: {},
      //   currentMousePosition: {},
      //   ended: false,
      //   reset() {
      //     notationType: "";
      //     this.startMousePosition = {};
      //     this.currentMousePosition = {};
      //   },
      // },
    };
  },
  methods: {
    ...mapGetters({
      getCurrentEditMode: "getCurrentEditMode",
    }),
    ...mapActions({
      setCurrentEditMode: "setCurrentEditMode",
    }),
    toggleSelectionMode() {
      if (this.getCurrentEditMode() == EditMode.SELECT) {
        this.endSelectionMode();
      } else {
        this.startSelectionMode();
      }
    },
    async startFractionMode() {
      this.reset();
      this.fractionButtonActive = 0;
      await this.setCurrentEditMode(EditMode.FRACTION);
    },
    async startSqrtMode() {
      this.reset();
      this.squareRootButtonActive = 0;
      await this.setCurrentEditMode(EditMode.SQRT);
    },
    // emit event from component
    eventManager_endDrawLine() {
      this.reset();
    },
    toggleDeleteMode() {
      if (this.getCurrentEditMode() == EditMode.DELETE) {
        this.endDeleteMode();
      } else {
        this.startDeleteMode();
      }
    },
    togglePowerMode() {
      if (this.getCurrentEditMode() == EditMode.ADD_POWER) {
        this.endPowerMode();
      } else {
        this.startPowerMode();
      }
    },
    hideDeleteCursor() {
      //Array.from(document.getElementById(this.svgId)).forEach((e) =>
      //  e.classList.remove("deleteButtonActive")
      //);
      document
        .getElementById(this.svgId)
        .classList.remove("deleteButtonActive");
    },
    showDeleteCursor() {
      //Array.from(document.getElementById(this.svgId)).forEach((e) =>
      //  e.classList.add("deleteButtonActive")
      //);
      document.getElementById(this.svgId).classList.add("deleteButtonActive");
    },
    async reset() {
      this.$refs.editorToolbar.resetToggleButtons();
      this.hideDeleteCursor();
      await this.setCurrentEditMode(EditMode.ADD_SYMBOL);
    },
    async startDeleteMode() {
      this.reset();
      this.deleteButtonActive = 0;
      this.showDeleteCursor();
      await this.setCurrentEditMode(EditMode.DELETE);
    },
    endDeleteMode() {
      this.reset();
    },
    async startSelectionMode() {
      this.reset();
      this.selectionButtonActive = 0;
      await this.setCurrentEditMode(EditMode.SELECT);
    },
    async endSelectionMode() {
      this.$refs.editorToolbar.resetToggleButtons();
      await this.setCurrentEditMode(EditMode.ADD_SYMBOL);
    },
    async endMoveSelectionMode() {
      await this.setCurrentEditMode(EditMode.ADD_SYMBOL);
    },
    async startPowerMode() {
      this.reset();
      this.powerButtonActive = 0;
      await this.setCurrentEditMode(EditMode.ADD_POWER);
    },
    endPowerMode() {
      this.reset();
    },
    eventManager_selectionButtonPressed() {
      this.toggleSelectionMode();
    },
    eventManager_drawFractionLineButtonPressed() {
      this.startFractionMode();
    },
    eventManager_drawSqrtLineButtonPressed() {
      this.startSqrtMode();
    },
    eventManager_deleteButtonPressed() {
      this.toggleDeleteMode();
    },
    eventManager_powerButtonPressed() {
      this.togglePowerMode();
    },
    eventManager_symbolButtonPressed(e) {
      if (this.getCurrentEditMode() === EditMode.ADD_SYMBOL)
        this.symbolMixin_addSymbol(e.currentTarget.innerText, "symbol");
      else if (this.getCurrentEditMode() === EditMode.ADD_POWER) {
        this.symbolMixin_addSymbol(e.currentTarget.innerText, "power");
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
    eventManager_keyUp(e) {
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
