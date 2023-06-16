import { BoardType, EditMode, NotationType } from "../../../math-common/src/enum";
import { useUserStore } from "../store/pinia/userStore"

import useMatrixHelper from "./matrixHelper";
import useNotationHelper from "./notationHelper";

const userStore = useUserStore();
const matrixHelper = useMatrixHelper();
const notationHelper = useNotationHelper();

export default function eventHelper() {

  async function paste(e: ClipboardEvent) {
    // disallow adding image by student
    if (!userStore.isTeacher) return;

    const dT = e.clipboardData /*|| window.Clipboard*/;
    const item = dT?.items[0];

    var reader = new FileReader();
    var that = this;
    reader.addEventListener("load", () => {
      const base64data = reader.result;

      let image: any = new Image();
      image.src = base64data;
      image.onload = () => {
        if (!base64data) return;
        let fromCol = parseInt(that.getActiveCell().col);
        let fromRow = parseInt(that.getActiveCell().row);
        let toCol =
          Math.ceil(image.width / matrixHelper.rectSize) + fromCol;
        let toRow = Math.ceil(image.height / matrixHelper.rectSize) + fromRow;
        notationHelper.addImageNotation(fromCol, toCol, fromRow, toRow, base64data.toString());
      }
    });

    reader.readAsDataURL(item?.getAsFile() as Blob);
  };

  function keyUp(e: KeyboardEvent) {
      if (e.ctrlKey || e.altKey) {
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
          e.code === "ArrowDown" ||
          e.code === "Space"
        )
      ) {
        return;
      }

      if (e.code === "Backspace") {
        this.notationMixin_removeActiveOrSelectedNotations();
        this.matrixMixin_setNextRect(-1, 0);
        return;
      }

      if (e.code === "Delete") {
        this.notationMixin_removeActiveOrSelectedNotations();
        return;
      }

      if (e.code === "ArrowLeft") {
        this.matrixMixin_setNextRect(-1, 0);
        return;
      }

      if (e.code === "ArrowRight" || e.code === "Space") {
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

      if (e.code === "Enter") {
        this.matrixMixin_setNextRow(0, 1);
        return;
      }

      if (!this.mixin_canEdit()) {
        return;
      }

      this.notationMixin_addNotation(e);
  };

  function mouseDown(e: MouseEvent) {
      if (
        this.getCurrentEditMode() === EditMode.FRACTION ||
        this.getCurrentEditMode() === EditMode.SQRT ||
        this.getCurrentEditMode() === EditMode.SELECT
      ) {
        return;
      }

      let activeCell = this.activateObjectMixin_activateClickedObject(e);
      if (!!activeCell) {
        if (this.getParent().boardType === BoardType.LESSON) {
          this.userOperationsMixin_syncOutgoingActiveCell(activeCell);
        }
      }

      if (
        this.getCurrentEditMode() === EditMode.CHECKMARK ||
        this.getCurrentEditMode() === EditMode.SEMICHECKMARK ||
        this.getCurrentEditMode() === EditMode.XMARK
      ) {
        this.notationMixin_addNotation();
        return;
      }
  };

  function lineDrawEnded() {
      // see toolbar.vue
      this.$root.$emit("resetToolbarState");
      this.activateObjectMixin_unselectPreviouslyActiveCell();
  };

  return {paste, keyUp, mouseDown, lineDrawEnded}
};
