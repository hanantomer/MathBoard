const EditMode = Object.freeze({
  ADD_SYMBOL: "ADD_SYMBOL",
  DELETE: "DELETE",
  SELECT: "SELECT",
  DRAWLINE: "DRAWLINE",
  MOVE: "MOVE",
});

module.exports = {
  data: function () {
    return {
      currentMode: EditMode.ADD_SYMBOL,
    };
  },
  computed: {
    editManager_getCurrentMode: function () {
      return this.currentMode;
    },
  },
  methods: {
    setCurrentMode(newMode) {
      this.currentMode = newMode;
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
      } else {
        this.startDrawlineMode();
      }
    },
    toggleDeleteMode() {
      if (this.currentMode == EditMode.DELETE) {
        this.endDeleteMode();
      } else {
        this.startDeleteMode();
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
      this.selectionMixin_resetSelection();
      this.fractionLine_reset();
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
    setFractionLine(e) {
      this.fractionLineMixin_endDrawLine(e);
      this.reset();
    },
    editManager_selectionButtonPressed() {
      this.toggleSelectionMode();
    },
    editManager_drawlineButtonPressed() {
      this.toggleDrawlineMode();
    },

    editManager_deleteButtonPressed() {
      this.toggleDeleteMode();
    },
    editManager_symbolButtonPressed(e) {
      this.symbolMixin_addSymbol(e.currentTarget.innerText);
    },
    editManager_mouseDown(e) {
      if (this.currentMode !== EditMode.SELECT) {
        this.selectionMixin_resetSelection();
      }

      if (this.currentMode === EditMode.SELECT) {
        this.selectionMixin_startSelection(e);
      } else if (this.currentMode === EditMode.DRAWLINE) {
        this.fractionLineMixin_startLineDrawing(e);
      } else {
        this.selectionMixin_setCurrentPosition(e);
      }
    },
    editManager_keyUp(e) {
      if (this.currentMode === EditMode.ADD_SYMBOL) {
        if (
          e.code.startsWith("Digit") ||
          e.code.startsWith("Key") ||
          e.code.startsWith("Numpad") ||
          e.code === "Minus" ||
          e.code === "Plus" ||
          e.code === "Equal" ||
          e.code === "Period"
        ) {
          this.symbolMixin_addSymbol(e.key);
        }
      }
    },
    editManager_mouseUp(e) {
      if (this.currentMode === EditMode.SELECT) {
        this.setSelectedNotations(e);
      } else if (this.currentMode === EditMode.MOVE) {
        this.moveSelection(e);
      } else if (this.currentMode === EditMode.DELETE) {
        this.endDeleteMode();
      } else if (this.currentMode === EditMode.DRAWLINE) {
        this.setFractionLine();
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
      } else if (this.currentMode === EditMode.SELECT) {
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
      else if (this.currentMode === EditMode.SELECT) {
        this.selectionMixin_UpdateSelectionArea(e);
      } else if (this.currentMode === EditMode.DRAWLINE) {
        this.fractionLineMixin_UpdateSelectionArea(e);
      }
      // during move selected symbols
      else if (this.currentMode === EditMode.MOVE) {
        this.selectionMixin_moveSelection(e);
      } else if (this.currentMode === EditMode.DELETE) {
        this.notationMixin_removeNotation(e);
      }
    },
  },
};
