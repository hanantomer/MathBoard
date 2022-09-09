import EditMode from "./editMode";
import { mapGetters } from "vuex";
import { mapActions } from "vuex";
export default {
  data: function () {
    return {
      //currentMode: EditMode.ADD_SYMBOL,
      selectionAreaRelay: {
        initialPosition: { x: 0, y: 0 },
        currentPosition: { x: 0, y: 0 },
        currentMovePosition: { x: 0, y: 0 },
        ended: false,
        moveEnded: false,
      },
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
      tabsHeight: null,
      tabsLeft: null,
    };
  },
  methods: {
    ...mapGetters({
      getCurrentEditMode: "getCurrentEditMode",
    }),
    ...mapActions({
      setCurrentEditMode: "setCurrentEditMode",
    }),
    getTabsHeight: function () {
      if (!this.tabsHeight && document.getElementById("tabs")) {
        this.tabsHeight = document
          .getElementById("tabs")
          .getBoundingClientRect().height;
      }
      return this.tabsHeight;
    },
    getTabsLeft: function () {
      if (!this.tabsLeft && document.getElementById("tabs")) {
        this.tabsLeft = document
          .getElementById("tabs")
          .getBoundingClientRect().x;
      }
      return this.tabsHeight;
    },
    // setCurrentEditMode(newMode) {
    //   this.getCurrentEditMode() = newMode;
    //   console.debug("new mode:" + newMode);
    // },
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
      //      this.drawLineRelay.notationType = notationType.FRACTION;
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
      if (this.getCurrentEditMode() == EditMode.DELETING) {
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
      Array.from(document.getElementById(this.svgId)).forEach((e) =>
        e.classList.remove("deleteButtonActive")
      );
    },
    showDeleteCursor() {
      Array.from(document.getElementById(this.svgId)).forEach((e) =>
        e.classList.add("deleteButtonActive")
      );
    },
    async reset() {
      this.$refs.editoToolbar.resetToggleButtons();
      this.hideDeleteCursor();
      await this.setCurrentEditMode(EditMode.ADD_SYMBOL);
      //this.drawLineRelay.reset();
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
      this.selectionAreaRelay.ended = false;
      this.selectionAreaRelay.moveEnded = false;
      await this.setCurrentEditMode(EditMode.SELECT);
    },
    async endSelectionMode() {
      // don't fully reset here to allow moving selection
      this.$refs.editoToolbar.resetToggleButtons();
      await this.setCurrentEditMode(EditMode.MOVESELECTION);
      this.selectionAreaRelay.ended = true;
    },
    async endMoveSelectionMode() {
      await this.setCurrentEditMode(EditMode.ADD_SYMBOL);
      this.selectionAreaRelay.moveEnded = true;
    },
    async startPowerMode() {
      this.reset();
      this.powerButtonActive = 0;
      await this.setCurrentEditMode(EditMode.ADD_POWER);
    },
    endPowerMode() {
      this.reset();
    },
    async startMoveMode() {
      await this.setCurrentEditMode(EditMode.MOVESELECTION);
    },
    endMoveMode() {
      this.reset();
    },
    moveSelection(e) {
      //this.endMoveMode();
      this.notationMixin_moveSelection(e);
    },
    setSelectedNotations(e) {
      this.selectionMixin_endSelect(e);
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
        // this mouse down is handled by LineDrawer
        this.getCurrentEditMode() === EditMode.FRACTION ||
        this.getCurrentEditMode() === EditMode.SQRT
      ) {
        return;
      }

      if (this.getCurrentEditMode() === EditMode.SELECT) {
        await this.setCurrentEditMode(EditMode.SELECTING); //  show selectionArea component

        this.selectionAreaRelay.initialPosition = {
          x: e.oofsetX,
          y: e.offsetY,
        };
        return;
      }
      if (this.getCurrentEditMode() === EditMode.DELETE) {
        await this.setCurrentEditMode(EditMode.DELETING);
        return;
      }

      let selectedRect = this.selectionMixin_findRectAtClickedPosition(e);
      if (!!selectedRect) {
        await this.setCurrentEditMode(EditMode.ADD_SYMBOL);
        this.selectionMixin_selectRect(selectedRect);
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
      if (this.getCurrentEditMode() === EditMode.SELECTING) {
        this.endSelectionMode();
        return;
      }

      if (this.getCurrentEditMode() === EditMode.MOVESELECTION) {
        this.moveSelection(e);
        this.endMoveSelectionMode();
        return;
      }

      if (this.getCurrentEditMode() === EditMode.DELETING) {
        this.endDeleteMode();
        return;
      }

      // if (
      //   this.getCurrentEditMode() === EditMode.FRACTION ||
      //   this.getCurrentEditMode() === EditMode.SELECT_FRACTION ||
      //   this.getCurrentEditMode() === EditMode.SQRT ||
      //   this.getCurrentEditMode() === EditMode.SELECT_SQRT
      // ) {
      //   //this.drawLineRelay.ended = !this.drawLineRelay.ended;
      //   return;
      // }
    },
    // start moving selection
    eventManager_selectionMouseDown(e) {
      this.startMoveMode();
    },
    eventManager_mouseMove(e) {
      this.showFractionLineTooltip = false;
      this.showAccessTooltip = false;
      // left button is pressed
      if (e.buttons !== 1) {
        return;
      }

      // if (this.getCurrentEditMode() === EditMode.SELECT_FRACTION) {
      //   this.setCurrentEditMode(EditMode.FRACTION);
      // }

      // if (this.getCurrentEditMode() === EditMode.SELECT_SQRT) {
      //   this.setCurrentEditMode(EditMode.SQRT);
      // }

      // if (
      //   this.getCurrentEditMode() === EditMode.FRACTION ||
      //   this.getCurrentEditMode() === EditMode.SQRT
      // ) {
      //   this.drawLineRelay.currentMousePosition = {
      //     x: e.offsetX,
      //     y: e.offsetY,
      //   };
      //   return;
      // }

      // during selecting arae
      if (this.getCurrentEditMode() === EditMode.SELECTING) {
        this.selectionAreaRelay.currentPosition = {
          x: e.offsetX,
          y: e.offsetY,
        };
        return;
      }

      // during move selected symbols
      if (this.getCurrentEditMode() === EditMode.MOVESELECTION) {
        this.selectionAreaRelay.currentMovePosition = {
          x: e.offsetX,
          y: e.offsetY,
        };
        return;
      }

      if (this.getCurrentEditMode() === EditMode.DELETING) {
        this.notationMixin_removeNotationsAtMousePosition(e);
        return;
      }
    },
  },
};
