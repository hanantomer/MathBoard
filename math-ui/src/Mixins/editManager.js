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
    /*setCurrentMode(newMode) {
      switch (this.currentMode) {
        case EditMode.ADD_SYMBOL: {
          
        }
      }
      this.currentMode = newMode;
    },*/
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
    editManager_startFractionMode: function () {
      this.currentMode = EditMode.EDIT_FRACTION;
    },
    editManager_endFractionMode: function () {
      this.currentMode = EditMode.ADD_SYMBOL;
    },
    restoreEditMode: function () {
      this.toggleDeleteMode = 1;
      this.hideDeleteCursor();
      if (this.currentMode == EditMode.DELETE) {
        this.currentMode = EditMode.ADD_SYMBOL;
      }
    },
    editManager_selectionButtonPressed: function () {
      if (this.currentMode == EditMode.SELECT) {
        this.currentMode = EditMode.ADD_SYMBOL;
      } else {
        this.currentMode = EditMode.SELECT;
      }
    },
    editManager_deleteButtonPressed: function () {
      if (this.currentMode == EditMode.DELETE) {
        this.currentMode = EditMode.ADD_SYMBOL;
        this.hideDeleteCursor();
      } else {
        this.currentMode = EditMode.DELETE;
        this.showDeleteCursor();
      }
    },
    editManager_symbolButtonPressed: function (e) {
      this.symbolMixin_addSymbol(e.currentTarget.innerText);
    },
    editManager_mouseDown: function (e) {
      if (this.currentMode !== EditMode.SELECT) {
        this.selectionMixin_resetSelection();
      }
      if (this.currentMode === EditMode.SELECT) {
        this.selectionMixin_startSelection(e);
      } else if (this.currentMode === EditMode.DELETE) {
        this.notationMixin_removeNotation(e);
      } else {
        this.selectionMixin_setCurrentPosition(e);
      }
    },
    editManager_keyUp: function (e) {
      if (this.currentMode === EditMode.ADD_SYMBOL) {
        if (
          e.code.startsWith("Digit") ||
          e.code.startsWith("Key") ||
          e.code.startsWith("Numpad") ||
          e.code === "Minus" ||
          e.code === "Plus" ||
          e.code === "Equal"
        ) {
          this.symbolMixin_addSymbol(e.key);
        }
      }
    },
    // start moving selection
    editManager_selectionMouseDown(e) {
      this.currentMode = EditMode.MOVE;
    },
    // end selection
    editManager_selectionMouseUp(e) {
      if (this.currentMode === EditMode.MOVE) {
        this.notationMixin_moveSelection(e);
      } else if (this.currentMode === EditMode.SELECT) {
        this.selectionMixin_endSelect(e);
        this.toggleSelectionMode = 1;
      }

      this.currentMode = EditMode.ADD_SYMBOL;
    },
    editManager_mouseMove: function (e) {
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
      }
    },
  },
};
