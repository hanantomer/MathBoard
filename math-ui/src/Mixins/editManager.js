const EditMode = Object.freeze({
  ADD_SYMBOL: "ADD_SYMBOL",
  ADD_POWER: "ADD_POWER",
  DELETE: "DELETE", // after delete button pressed
  DELETING: "DELETING", // mouse clicked following delete button pressed
  SELECT: "SELECT", //  after select button pressed
  SELECTING: "SELECTING", // mouse clicked following select button pressed
  DRAWLINE: "DRAWLINE",
  MOVE: "MOVE",
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
    };
  },
  computed: {
    editManager_getCurrentMode: function () {
      return this.currentMode;
    },
    editManager_getCurrentDrawLineMode: function () {
      return this.currentDrawLineMode;
    },
  },
  methods: {
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
        this.DrawLineMode = DrawLineMode.NONE;
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
      // this.selectionMixin_resetSelection();
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
      this.setCurrentMode(EditMode.ADD_SYMBOL);
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
      this.setCurrentMode(EditMode.MOVE);
    },
    endMoveMode() {
      this.reset();
    },
    moveSelection(e) {
      this.endMoveMode();
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
    editManager_selectionButtonPressed() {
      this.toggleSelectionMode();
    },
    editManager_drawFractionLineButtonPressed() {
      this.toggleDrawlineMode();
      this.currentDrawLineMode = DrawLineMode.FRACTION;
    },
    editManager_drawSqrtLineButtonPressed() {
      this.toggleDrawlineMode();
      this.currentDrawLineMode = DrawLineMode.SQRT;
    },
    editManager_deleteButtonPressed() {
      this.toggleDeleteMode();
    },
    editManager_powerButtonPressed() {
      this.togglePowerMode();
    },

    editManager_symbolButtonPressed(e) {
      if (this.currentMode === EditMode.ADD_SYMBOL)
        this.symbolMixin_addSymbol(e.currentTarget.innerText, "symbol");
      else if (this.currentMode === EditMode.ADD_POWER) {
        this.symbolMixin_addSymbol(e.currentTarget.innerText, "power");
      }
    },
    editManager_mouseDown(e) {
      if (this.currentMode === EditMode.SELECT) {
        this.selectionMixin_startSelection(e);
        this.setCurrentMode(EditMode.SELECTING);
      } else if (this.currentMode === EditMode.SELECTING) {
        this.reset();
        this.selectionMixin_resetSelection();
      } else if (this.currentMode === EditMode.DRAWLINE) {
        this.drawLineMixin_startLineDrawing(e);
      } else if (this.currentMode === EditMode.DELETE) {
        this.setCurrentMode(EditMode.DELETING);
      } else {
        this.selectionMixin_setCurrentPosition(e);
      }
    },
    editManager_keyUp(e) {
      if (
        this.currentMode === EditMode.ADD_POWER &&
        e.code.startsWith("Digit")
      ) {
        this.symbolMixin_addSymbol(e.key, "power");
      }

      if (
        !e.code.startsWith("Digit") &&
        !e.code.startsWith("Key") &&
        !e.code.startsWith("Numpad") &&
        !e.code === "Minus" &&
        !e.code === "Plus" &&
        !e.code === "Equal" &&
        !e.code === "Period"
      ) {
        return;
      }

      if (this.currentMode === EditMode.ADD_SYMBOL) {
        this.symbolMixin_addSymbol(e.key, "symbol");
      }
    },
    editManager_mouseUp(e) {
      if (this.currentMode === EditMode.SELECTING) {
        this.setSelectedNotations(e);
      } else if (this.currentMode === EditMode.MOVE) {
        this.moveSelection(e);
      } else if (this.currentMode === EditMode.DELETING) {
        this.endDeleteMode();
      } else if (this.currentMode === EditMode.DRAWLINE) {
        if (this.currentDrawLineMode == DrawLineMode.FRACTION) {
          this.setFractionLine();
        } else if (this.currentDrawLineMode == DrawLineMode.SQRT) {
          this.setSqrtLine();
        }
      }
    },
    // start moving selection
    editManager_selectionMouseDown(e) {
      this.startMoveMode();
    },
    // end selection
    editManager_selectionMouseUp(e) {
      if (this.currentMode === EditMode.MOVE) {
        this.moveSelection(e);
      } else if (this.currentMode === EditMode.SELECTING) {
        this.setSelectedNotations(e);
      }
    },
    editManager_mouseMove(e) {
      this.showFractionLineTooltip = false;
      this.showAccessTooltip = false;
      // left button is pressed
      if (e.buttons !== 1) {
        return;
      }
      // during symbols selection
      else if (this.currentMode === EditMode.SELECTING) {
        this.selectionMixin_UpdateSelectionArea(e);
      } else if (this.currentMode === EditMode.DRAWLINE) {
        this.drawLineMixin_UpdateSelectionArea(e);
      }
      // during move selected symbols
      else if (this.currentMode === EditMode.MOVE) {
        this.selectionMixin_moveSelection(e);
      } else if (this.currentMode === EditMode.DELETING) {
        this.notationMixin_removeNotation(e);
      }
    },
  },
};
