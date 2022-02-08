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
    editManager_getCurrentMode: function () {
      return this.currentMode;
    },
    restoreEditMode: function () {
      if (this.currentMode == EditMode.DELETE) {
        let canvas = document.getElementById("svg");
        this.currentMode = EditMode.EDIT;
        this.toggleDeleteMode = 1;
        canvas.classList.remove("deleteMode");
      }
    },
    editManager_deleteButtonPressed: function () {
      let canvas = document.getElementById("svg");
      if (this.currentMode == EditMode.DELETE) {
        this.currentMode = EditMode.EDIT;
        canvas.classList.remove("deleteMode");
      } else {
        this.currentMode = EditMode.DELETE;
        canvas.classList.add("deleteMode");
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
      this.$addSymbol(e.currentTarget.innerText);
    },
    editManager_keyPressed: function (key) {
      if ((this.currentMode = EditMode.EDIT)) {
      }
    },
    editManager_mouseDown: function (e) {
      if (this.currentMode === EditMode.EDIT) {
        this.symbolMixin_setCurrentRect(e);
      } else if (this.currentMode === EditMode.DELETE) {
        this.symbolMixin_removeSymbol(e);
      } else if (this.currentMode === EditMode.FRACTION) {
        //drawMixin_startDraw(e);
      }

      this.selectionMixin_resetSelection();
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
  },
};
