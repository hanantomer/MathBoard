const EditMode = Object.freeze({
  ADD_SYMBOL: "ADD_SYMBOL",
  ADD_POWER: "ADD_POWER",
  DRAWLINE: "DRAWLINE",
  DELETE: "DELETE", // after delete button pressed
  DELETING: "DELETING", // mouse clicked following delete button pressed
  SELECT: "SELECT", //  after select button pressed
  SELECTING: "SELECTING", // mouse clicked following select button pressed
  SELECTLINE: "SELECTLINE",
  MOVESELECTION: "MOVESELECTION",
});

const DrawLineMode = Object.freeze({
  FRACTION: "FRACTION",
  SQRT: "SQRT",
  NONE: "NONE",
});

module.exports = {
  data: function () {
    return {
      currentMode: EditMode.ADD_SYMBOL,
      currentDrawLineMode: DrawLineMode.NONE,
      selectionAreaAdapter: {
        initialPosition: { x: 0, y: 0 },
        currentPosition: { x: 0, y: 0 },
        currentMovePosition: { x: 0, y: 0 },
        ended: false,
      },
    };
  },
  computed: {
    eventManager_getCurrentMode: function () {
      return this.currentMode;
    },
    eventManager_getCurrentDrawLineMode: function () {
      return this.currentDrawLineMode;
    },
  },
  methods: {
    getSVGBoundingRect() {
      return document.getElementById("svg").getBoundingClientRect();
    },
    setCurrentMode(newMode) {
      this.currentMode = newMode;
    },
    setCurrentDrawLineMode(newMode) {
      this.currentDrawLineMode = newMode;
    },
    toggleSelectionMode() {
      if (this.currentMode == EditMode.SELECT) {
        this.endSelectionMode();
      } else {
        this.startSelectionMode();
      }
    },
    toggleDrawlineMode() {
      if (this.currentMode == EditMode.DRAWLINE) {
        this.endDrawlineMode();
        this.setCurrentDrawLineMode(DrawLineMode.NONE);
      } else {
        this.startDrawlineMode();
      }
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
      Array.from(document.getElementsByTagName("svg")).forEach((e) =>
        e.classList.remove("deleteButtonActive")
      );
    },
    showDeleteCursor() {
      Array.from(document.getElementsByTagName("svg")).forEach((e) =>
        e.classList.add("deleteButtonActive")
      );
    },

    reset() {
      this.$refs.editoToolbar.resetToggleButtons();
      this.hideDeleteCursor();
      this.setCurrentMode(EditMode.ADD_SYMBOL);
      this.setCurrentDrawLineMode(DrawLineMode.NONE);
      this.drawLine_reset();
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
      this.setCurrentMode(EditMode.SELECT);
    },
    endSelectionMode() {
      // don't fully reset here to allow moving selection
      this.$refs.editoToolbar.resetToggleButtons();
      this.setCurrentMode(EditMode.MOVESELECTION);
      this.selectionAreaAdapter.ended = true;
    },
    startDrawlineMode() {
      this.reset();
      this.drawlineButtonActive = 0;
      this.setCurrentMode(EditMode.DRAWLINE);
    },
    endDrawlineMode() {
      this.reset();
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
    setFractionLine() {
      this.drawLineMixin_endDrawLine("fractionLine");
      this.reset();
    },
    setSqrtLine() {
      this.drawLineMixin_endDrawLine("sqrtLine");
      this.reset();
    },
    eventManager_selectionButtonPressed() {
      this.toggleSelectionMode();
    },
    eventManager_drawFractionLineButtonPressed() {
      this.toggleDrawlineMode();
      this.setCurrentDrawLineMode(DrawLineMode.FRACTION);
    },
    eventManager_drawSqrtLineButtonPressed() {
      this.toggleDrawlineMode();
      this.setCurrentDrawLineMode(DrawLineMode.SQRT);
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

        this.selectionAreaAdapter.initialPosition = {
          x: e.clientX - this.getSVGBoundingRect().x,
          y: e.clientY - this.getSVGBoundingRect().y,
        };
        return;
      }

      if (this.currentMode === EditMode.DRAWLINE) {
        this.drawLineMixin_startLineDrawing(e);
        return;
      }

      if (this.currentMode === EditMode.DELETE) {
        this.setCurrentMode(EditMode.DELETING);
        return;
      }

      if (
        this.currentMode === EditMode.SELECTLINE ||
        this.currentMode === EditMode.DRAWLINE
      ) {
        this.setCurrentMode(EditMode.ADD_SYMBOL);
        return;
      }

      // first check if fraction line is clicked
      let selectedLine = this.selectionMixin_findFractionLineAtClickedPosition(
        e
      );
      if (!!selectedLine) {
        this.setCurrentMode(EditMode.SELECTLINE);
        this.setCurrentDrawLineMode(DrawLineMode.FRACTION);
        this.drawLineMixin_startLineEditing(selectedLine);
        return;
      }

      // check if sqrt line is clicked
      selectedLine = this.selectionMixin_findSqrtLineAtClickedPosition(e);
      if (!!selectedLine) {
        this.setCurrentMode(EditMode.SELECTLINE);
        this.setCurrentDrawLineMode(DrawLineMode.SQRT);
        this.drawLineMixin_startLineEditing(selectedLine);
        return;
      }

      // if not a line then a rect
      let selectedRect = this.selectionMixin_findRectAtClickedPosition(e);
      if (!!selectedRect) {
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
          e.code === "Period"
        )
      ) {
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
        return;
      }

      if (this.currentMode === EditMode.DELETING) {
        this.endDeleteMode();
        return;
      }

      if (
        this.currentMode === EditMode.DRAWLINE &&
        this.currentDrawLineMode == DrawLineMode.FRACTION
      ) {
        this.setFractionLine();
        return;
      }

      if (
        this.currentMode === EditMode.DRAWLINE &&
        this.currentDrawLineMode == DrawLineMode.SQRT
      ) {
        this.setSqrtLine();
        return;
      }
    },
    // start moving selection
    eventManager_selectionMouseDown(e) {
      this.startMoveMode();
    },
    eventManager_lineHandleMouseDown(e) {
      this.startDrawlineMode();
    },
    // end selection
    // eventManager_selectionMouseUp(e) {
    //   if (this.currentMode === EditMode.MOVE) {
    //     this.moveSelection(e);
    //   } else if (this.currentMode === EditMode.SELECTING) {
    //     this.setSelectedNotations(e);
    //   }
    // },
    eventManager_mouseMove(e) {
      this.showFractionLineTooltip = false;
      this.showAccessTooltip = false;
      if (e.buttons !== 1) {
        return;
      }
      // left button is pressed
      if (this.currentMode === EditMode.SELECTING) {
        // during symbols selection
        this.selectionAreaAdapter.currentPosition = {
          x: e.clientX - this.getSVGBoundingRect().x,
          y: e.clientY - this.getSVGBoundingRect().y,
        };
        e.stopPropagation();
        return;
      }

      if (this.currentMode === EditMode.DRAWLINE) {
        this.drawLineMixin_UpdateLineWidth(e);
        return;
      }

      // during move selected symbols
      if (this.currentMode === EditMode.MOVESELECTION) {
        this.selectionAreaAdapter.currentMovePosition = {
          x: e.clientX - this.getSVGBoundingRect().x,
          y: e.clientY - this.getSVGBoundingRect().y,
        };
        e.stopPropagation();
        return;
      }

      if (this.currentMode === EditMode.DELETING) {
        this.notationMixin_removeNotationsAtMousePosition(e);
        return;
      }
    },
  },
};
