import EditMode from "./editMode";
import notationType from "./notationType";
export default {
  data: function () {
    return {
      currentMode: EditMode.ADD_SYMBOL,
      selectionAreaRelay: {
        initialPosition: { x: 0, y: 0 },
        currentPosition: { x: 0, y: 0 },
        currentMovePosition: { x: 0, y: 0 },
        ended: false,
        moveEnded: false,
      },
      drawLineRelay: {
        notationType: "",
        startMousePosition: {},
        currentMousePosition: {},
        ended: false,
        reset() {
          notationType: "";
          this.startMousePosition = {};
          this.currentMousePosition = {};
        },
      },
      tabsHeight: null,
      tabsLeft: null,
    };
  },
  computed: {
    eventManager_getCurrentMode: function () {
      return this.currentMode;
    },
  },
  methods: {
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
    setCurrentMode(newMode) {
      this.currentMode = newMode;
      console.debug("new mode:" + newMode);
    },
    toggleSelectionMode() {
      if (this.currentMode == EditMode.SELECT) {
        this.endSelectionMode();
      } else {
        this.startSelectionMode();
      }
    },
    startFractionMode() {
      this.reset();
      this.fractionButtonActive = 0;
      this.setCurrentMode(EditMode.FRACTION);
      this.drawLineRelay.notationType = notationType.FRACTION;
    },
    startSqrtMode() {
      this.reset();
      this.squareRootButtonActive = 0;
      this.setCurrentMode(EditMode.SQRT);
      this.drawLineRelay.notationType = notationType.SQRT;
    },
    startFractionDrawing(e) {
      this.drawLineRelay.selectedLineId = null;
      this.drawLineRelay.currentMousePosition = this.drawLineRelay.startMousePosition = {
        x: e.offsetX,
        y: e.offsetY,
      };
    },
    startFractionEditing(selectedFractionId) {
      this.setCurrentMode(EditMode.SELECT_FRACTION);
      this.drawLineRelay.selectedLineId = selectedFractionId;
      this.drawLineRelay.notationType = notationType.FRACTION;
    },
    startSqrtDrawing(e) {
      this.drawLineRelay.selectedLineId = null;
      this.drawLineRelay.currentMousePosition = this.drawLineRelay.startMousePosition = {
        x: e.offsetX,
        y: e.offsetY,
      };
    },
    startSqrtEditing(selectedSqrtId) {
      this.setCurrentMode(EditMode.SELECT_SQRT);
      this.drawLineRelay.selectedLineId = selectedSqrtId;
      this.drawLineRelay.notationType = notationType.SQRT;
    },
    // emit event from component
    eventManager_endDrawLine() {
      this.reset();
    },
    toggleDeleteMode() {
      if (this.currentMode == EditMode.DELETING) {
        this.endDeleteMode();
      } else {
        this.startDeleteMode();
      }
    },
    togglePowerMode() {
      if (this.currentMode == EditMode.ADD_POWER) {
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
    reset() {
      this.$refs.editoToolbar.resetToggleButtons();
      this.hideDeleteCursor();
      this.setCurrentMode(EditMode.ADD_SYMBOL);
      this.drawLineRelay.reset();
    },
    startDeleteMode() {
      this.reset();
      this.deleteButtonActive = 0;
      this.showDeleteCursor();
      this.setCurrentMode(EditMode.DELETE);
    },
    endDeleteMode() {
      this.reset();
    },
    startSelectionMode() {
      this.reset();
      this.selectionButtonActive = 0;
      this.selectionAreaRelay.ended = false;
      this.selectionAreaRelay.moveEnded = false;
      this.setCurrentMode(EditMode.SELECT);
    },
    endSelectionMode() {
      // don't fully reset here to allow moving selection
      this.$refs.editoToolbar.resetToggleButtons();
      this.setCurrentMode(EditMode.MOVESELECTION);
      this.selectionAreaRelay.ended = true;
    },
    endMoveSelectionMode() {
      this.setCurrentMode(EditMode.ADD_SYMBOL);
      this.selectionAreaRelay.moveEnded = true;
    },
    startPowerMode() {
      this.reset();
      this.powerButtonActive = 0;
      this.setCurrentMode(EditMode.ADD_POWER);
    },
    endPowerMode() {
      this.reset();
    },
    startMoveMode() {
      this.setCurrentMode(EditMode.MOVESELECTION);
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
      if (this.currentMode === EditMode.ADD_SYMBOL)
        this.symbolMixin_addSymbol(e.currentTarget.innerText, "symbol");
      else if (this.currentMode === EditMode.ADD_POWER) {
        this.symbolMixin_addSymbol(e.currentTarget.innerText, "power");
      }
    },
    eventManager_mouseDown(e) {
      if (this.currentMode === EditMode.SELECT) {
        this.setCurrentMode(EditMode.SELECTING); //  show selectionArea component

        this.selectionAreaRelay.initialPosition = {
          x: e.oofsetX,
          y: e.offsetY,
        };
        return;
      }

      if (this.currentMode === EditMode.FRACTION) {
        this.startFractionDrawing(e);
        return;
      }

      if (this.currentMode === EditMode.SQRT) {
        this.startSqrtDrawing(e);
        return;
      }

      if (this.currentMode === EditMode.DELETE) {
        this.setCurrentMode(EditMode.DELETING);
        return;
      }

      // first check if fraction is clicked
      let fraction = this.selectionMixin_findFractionLineAtClickedPosition(e);
      if (!!fraction) {
        this.startFractionEditing(fraction.id);
        return;
      }

      // next check if sqrt is clicked
      let sqrt = this.selectionMixin_findSqrtLineAtClickedPosition(e);
      if (!!sqrt) {
        this.startSqrtEditing(sqrt.id);
        return;
      }

      // if neither then a rect
      let selectedRect = this.selectionMixin_findRectAtClickedPosition(e);
      if (!!selectedRect) {
        this.setCurrentMode(EditMode.ADD_SYMBOL);
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
        this.currentMode === EditMode.ADD_POWER &&
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

      if (this.currentMode === EditMode.ADD_SYMBOL) {
        this.symbolMixin_addSymbol(e.key, "symbol");
      }
    },
    eventManager_mouseUp(e) {
      if (this.currentMode === EditMode.SELECTING) {
        this.endSelectionMode();
        return;
      }

      if (this.currentMode === EditMode.MOVESELECTION) {
        this.moveSelection(e);
        this.endMoveSelectionMode();
        return;
      }

      if (this.currentMode === EditMode.DELETING) {
        this.endDeleteMode();
        return;
      }

      if (
        this.currentMode === EditMode.FRACTION ||
        this.currentMode === EditMode.SELECT_FRACTION ||
        this.currentMode === EditMode.SQRT ||
        this.currentMode === EditMode.SELECT_SQRT
      ) {
        this.drawLineRelay.ended = !this.drawLineRelay.ended;
        return;
      }
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

      if (this.currentMode === EditMode.SELECT_FRACTION) {
        this.setCurrentMode(EditMode.FRACTION);
      }

      if (this.currentMode === EditMode.SELECT_SQRT) {
        this.setCurrentMode(EditMode.SQRT);
      }

      if (
        this.currentMode === EditMode.FRACTION ||
        this.currentMode === EditMode.SQRT
      ) {
        this.drawLineRelay.currentMousePosition = {
          x: e.offsetX,
          y: e.offsetY,
        };
        return;
      }

      // during selecting arae
      if (this.currentMode === EditMode.SELECTING) {
        this.selectionAreaRelay.currentPosition = {
          x: e.offsetX,
          y: e.offsetY,
        };
        return;
      }

      // during move selected symbols
      if (this.currentMode === EditMode.MOVESELECTION) {
        this.selectionAreaRelay.currentMovePosition = {
          x: e.offsetX,
          y: e.offsetY,
        };
        return;
      }

      if (this.currentMode === EditMode.DELETING) {
        this.notationMixin_removeNotationsAtMousePosition(e);
        return;
      }
    },
  },
};
