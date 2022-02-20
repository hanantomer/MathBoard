const EditMode = Object.freeze({
  ADD_SYMBOL: "ADD_SYMBOL",
  DELETE: "DELETE",
  EDIT_FRACTION: "EDIT_FRACTION",
  SELECT: "SELECT",
  MOVE: "MOVE",
});

module.exports = {
  data: function () {
    return {
      currentMode: EditMode.ADD_SYMBOL,
    };
  },
  methods: {
    hideDeleteCursor() {
      Array.from(document.getElementsByTagName("svg")).forEach((e) =>
        e.classList.remove("deleteMode")
      );
    },
    showDeleteCursor() {
      Array.from(document.getElementsByTagName("svg")).forEach((e) =>
        e.classList.add("deleteMode")
      );
    },

    editManager_getCurrentMode: function () {
      return this.currentMode;
    },
    restoreEditMode: function () {
      this.toggleDeleteMode = 1;
      this.hideDeleteCursor();
      if (this.currentMode == EditMode.DELETE) {
        this.currentMode = EditMode.ADD_SYMBOL;
      }
    },
    editManager_deleteButtonPressed: function () {
      this.togglefractionPosition = 1;
      if (this.currentMode == EditMode.DELETE) {
        this.currentMode = EditMode.ADD_SYMBOL;
        this.hideDeleteCursor();
      } else {
        this.currentMode = EditMode.DELETE;
        this.showDeleteCursor();
      }
    },
    editManager_fractionButtonPressed: function () {
      this.restoreEditMode();
      if (this.currentMode == EditMode.EDIT_FRACTION) {
        this.currentMode = EditMode.ADD_SYMBOL;
      } else {
        this.currentMode = EditMode.EDIT_FRACTION;
      }
    },
    editManager_symbolButtonPressed: function (e) {
      this.restoreEditMode();
      if (this.currentMode === EditMode.ADD_SYMBOL) {
        this.symbolMixin_createSymbol(e.currentTarget.innerText);
      } else if (this.currentMode === EditMode.EDIT_FRACTION) {
        this.fractionMixin_saveFraction(e.currentTarget.innerText);
      }
    },
    editManager_mouseDown: function (e) {
      if (this.currentMode === EditMode.ADD_SYMBOL) {
        this.setCurrentRect(e);
      } else if (this.currentMode === EditMode.DELETE) {
        this.symbolMixin_removeSymbol(e);
      } else if (this.currentMode === EditMode.EDIT_FRACTION) {
        this.setCurrentFractionRect(e);
      }
      this.selectionMixin_resetSelection();
    },
    editManager_keyUp: function (e) {
      if ((this.currentMode = EditMode.ADD_SYMBOL)) {
        if (e.keyCode > 48 && !e.ctrlKey && !e.shiftKey && !e.altKey) {
          this.symbolMixin_createSymbol(e.key);
        }
      }
    },
    // start selection
    editManager_selectionMouseDown(e) {
      this.currentMode = EditMode.MOVE;
    },
    // end selection
    editManager_selectionMouseUp(e) {
      this.selectionMixin_endSelect(e);
      this.currentMode = EditMode.ADD_SYMBOL;
    },
    // end move
    editManager_svgMouseUp(e) {
      if (this.currentMode === EditMode.MOVE) {
        this.currentMode = EditMode.ADD_SYMBOL;
        this.symbolMixin_moveSelection(e);
      }
    },
    editManager_mouseMove: function (e) {
      // verify left button is pressed
      if (e.buttons !== 1) {
        return;
      }
      if (this.currentMode === EditMode.ADD_SYMBOL) {
        this.currentMode = EditMode.SELECT;
        this.selectionMixin_startSelection(e);
      }
      // during symbols selection
      else if (this.currentMode === EditMode.SELECT) {
        this.selectionMixinUpdateSelectionArea(e);
      }
      // during move selected symbols
      else if (this.currentMode === EditMode.MOVE) {
        this.selectionMixin_moveSelection(e);
      }
      // during line drawing
      else if (this.currentMode === EditMode.DRAW) {
        this.drawMixin_drawLine(e);
      }
    },
    setCurrentRect: function (e) {
      this.selectionMixin_setSelectedRect(e);
    },
    setCurrentFractionRect: function (e) {
      this.selectionMixin_setSelectedFractionRect(e);
    },
  },
};
