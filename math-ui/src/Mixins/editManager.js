const EditMode = Object.freeze({
  EDIT: "EDIT",
  DELETE: "DELETE",
  FRACTION: "FRACTION",
  SELECT: "SELECT",
  MOVE: "MOVE",
});

module.exports = {
  data: function () {
    return {
      currentMode: EditMode.EDIT,
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
      if (this.currentMode == EditMode.DELETE) {
        this.currentMode = EditMode.EDIT;
        this.toggleDeleteMode = 1;
        this.hideDeleteCursor();
      }
    },
    editManager_deleteButtonPressed: function () {
      if (this.currentMode == EditMode.DELETE) {
        this.currentMode = EditMode.EDIT;
        this.hideDeleteCursor();
      } else {
        this.currentMode = EditMode.DELETE;
        this.showDeleteCursor();
      }
    },
    editManager_fractionButtonPressed: function () {
      if (this.currentMode == EditMode.FRACTION) {
        this.currentMode = EditMode.EDIT;
      } else {
        this.currentMode = EditMode.FRACTION;
      }
    },
    editManager_symbolButtonPressed: function (e) {
      this.restoreEditMode();
      this.symbolMixin_upsertSymbol(e.currentTarget.innerText);
    },
    editManager_mouseDown: function (e) {
      if (this.currentMode === EditMode.EDIT) {
        this.setCurrentRect(e);
      } else if (this.currentMode === EditMode.DELETE) {
        this.symbolMixin_removeSymbol(e);
      } else if (this.currentMode === EditMode.FRACTION) {
        this.setCurrentFractionRect(e);
      }
      this.selectionMixin_resetSelection();
    },
    editManager_keyUp: function (e) {
      if ((this.currentMode = EditMode.EDIT)) {
        if (e.keyCode > 48 && !e.ctrlKey && !e.shiftKey && !e.altKey) {
          this.symbolMixin_upsertSymbol(e.key);
        }
      }
    },
    editManager_selectionMouseDown(e) {
      this.currentMode = EditMode.MOVE;
    },
    // end selection
    editManager_selectionMouseUp(e) {
      this.selectionMixin_endSelect(e);
      this.currentMode = EditMode.EDIT;
    },
    // end move
    editManager_svgMouseUp(e) {
      if (this.currentMode === EditMode.MOVE) {
        this.selectionMixin_endMoveSelection(e);
        this.currentMode = EditMode.EDIT;
      }
    },
    editManager_mouseMove: function (e) {
      // left button is pressed
      if (e.buttons !== 1) {
        return;
      }
      if (this.currentMode === EditMode.EDIT) {
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
      this.symbolMixin_setSelectedRect(e);
      //this.mixin_syncOutgoingSelectedRect(selectedRect);
    },
    setCurrentFractionRect: function (e) {
      let selectedFractionRect = this.mixin_getFractionRectByClickedPosition({
        x: e.clientX,
        y: e.clientY,
      });
      this.mixin_syncOutgoingSelectedRect(selectedFractionRect);
    },
  },
};
