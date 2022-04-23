const EditMode = Object.freeze({
  ADD_SYMBOL: "ADD_SYMBOL",
  DELETE: "DELETE",
  SELECT: "SELECT",
  MOVE: "MOVE",
  EDIT_FRACTION: "EDIT_FRACTION",
});

module.exports = {
  data: function () {
    return {
      currentMode: EditMode.ADD_SYMBOL,
    };
  },
  methods: {
    toggleSelectionMode() {
      if (this.currentMode == EditMode.SELECT) {
        this.endSelectionMode();
      } else {
        this.startSelectionMode();
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
    startFractionMode() {
      this.currentMode = EditMode.EDIT_FRACTION;
    },
    endFractionMode() {
      this.currentMode = EditMode.ADD_SYMBOL;
    },
    startDeleteMode() {
      this.deleteButtonActive = 0;
      this.showDeleteCursor();
      this.currentMode = EditMode.DELETE;
    },
    endDeleteMode() {
      this.currentMode = EditMode.ADD_SYMBOL;
      this.hideDeleteCursor();
      this.deleteButtonActive = 1;
    },
    startSelectionMode() {
      this.selectionButtonActive = 0;
      this.currentMode = EditMode.SELECT;
    },
    endSelectionMode() {
      this.selectionButtonActive = 1;
      this.currentMode = EditMode.ADD_SYMBOL;
    },
    startMoveMode() {
      this.currentMode = EditMode.MOVE;
    },
    endMoveMode() {
      this.currentMode = EditMode.ADD_SYMBOL;
      this.selectionMixin_resetSelection();
    },
    moveSelection(e) {
      this.endMoveMode();
      this.notationMixin_moveSelection(e);
    },
    setSelectedNotations(e) {
      this.endSelectionMode();
      this.selectionMixin_endSelect(e);
    },
    editManager_getCurrentMode: function () {
      return this.currentMode;
    },
    editManager_fractionDialogOpened() {
      this.startFractionMode();
    },
    editManager_saveFractionClicked() {
      this.endFractionMode();
    },
    editManager_selectionButtonPressed() {
      this.toggleSelectionMode();
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
      this.showFractionTooltip = false;
      this.showAccessTooltip = false;
      // left button is pressed
      if (e.buttons !== 1) {
        return;
      }
      // during symbols selection
      else if (this.currentMode === EditMode.SELECT) {
        this.selectionMixinUpdateSelectionArea(e);
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
