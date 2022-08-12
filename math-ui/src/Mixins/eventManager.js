import LineType from "./lineType";
import EditMode from "./editMode";
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
        lineType: LineType.NONE,
        startMousePosition: {},
        currentMousePosition: {},
        selectedLine: null,
        ended: false,
      },
    };
  },
  computed: {
    eventManager_getCurrentMode: function () {
      return this.currentMode;
    },
  },
  methods: {
    getSVGBoundingRect() {
      return document.getElementById("svg").getBoundingClientRect();
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
      this.drawLineRelay.lineType = LineType.FRACTION_LINE;
    },
    startSqrtMode() {
      this.reset();
      this.squareRootButtonActive = 0;
      this.setCurrentMode(EditMode.SQRT);
      this.drawLineRelay.lineType = LineType.SQRT_LINE;
    },
    startFractionDrawing(e) {
      this.drawLineRelay.lineType = LineType.FRACTION_LINE;
      this.drawLineRelay.startMousePosition = {
        x: e.clientX - this.getSVGBoundingRect().x,
        y: e.clientY - this.getSVGBoundingRect().y,
      };
    },
    startSqrtDrawing(e) {
      this.drawLineRelay.lineType = LineType.SQRT_LINE;
      this.drawLineRelay.startMousePosition = {
        x: e.clientX - this.getSVGBoundingRect().x,
        y: e.clientY - this.getSVGBoundingRect().y,
      };
    },

    // emit event from component
    eventManager_endDrawLine() {
      this.reset();
    },

    /*draw line*/

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
      this.drawLineRelay.lineType = LineType.NONE;
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
          x: e.clientX - this.getSVGBoundingRect().x,
          y: e.clientY - this.getSVGBoundingRect().y,
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

      if (
        this.currentMode === EditMode.SELECTLINE ||
        this.currentMode === EditMode.DRAWLINE
      ) {
        this.setCurrentMode(EditMode.ADD_SYMBOL);
        return;
      }

      // first check if fraction line is clicked
      let fractionLine = this.selectionMixin_findFractionLineAtClickedPosition(
        e
      );
      if (!!fractionLine) {
        this.setCurrentMode(EditMode.SELECTLINE);
        this.drawLineRelay.lineType = LineType.FRACTION_LINE;
        this.drawLineRelay.selectedLineId = fractionLine.id;
        return;
      }

      // next check if sqrt line is clicked
      let sqrtLine = this.selectionMixin_findSqrtLineAtClickedPosition(e);
      if (!!sqrtLine) {
        this.setCurrentMode(EditMode.SELECTLINE);
        this.drawLineRelay.lineType = LineType.SQRT_LINE;
        this.drawLineRelay.selectedLineId = sqrtLine.id;
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
        this.endMoveSelectionMode();
        return;
      }

      if (this.currentMode === EditMode.DELETING) {
        this.endDeleteMode();
        return;
      }

      if (
        this.currentMode === EditMode.FRACTION ||
        this.currentMode === EditMode.SQRT
      ) {
        this.drawLineRelay.ended = !this.drawLineRelay.ended;
        return;
      }
    },
    // start moving selection
    eventManager_selectionMouseDown(e) {
      this.startMoveMode();
    },
    // eventManager_lineHandleMouseDown(e) {
    //   this.startLineType();
    // },
    eventManager_mouseMove(e) {
      this.showFractionLineTooltip = false;
      this.showAccessTooltip = false;
      // left button is pressed
      if (e.buttons !== 1) {
        return;
      }

      if (this.currentMode === EditMode.SELECTING) {
        // during symbols selection
        this.selectionAreaRelay.currentPosition = {
          x: e.clientX - this.getSVGBoundingRect().x,
          y: e.clientY - this.getSVGBoundingRect().y,
        };
        e.stopPropagation();
        return;
      }

      if (
        this.currentMode === EditMode.FRACTION ||
        this.currentMode === EditMode.SQRT
      ) {
        this.drawLineRelay.currentMousePosition = {
          x: e.clientX - this.getSVGBoundingRect().x,
          y: e.clientX - this.getSVGBoundingRect().y,
        };
        return;
      }

      // during move selected symbols
      if (this.currentMode === EditMode.MOVESELECTION) {
        this.selectionAreaRelay.currentMovePosition = {
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
