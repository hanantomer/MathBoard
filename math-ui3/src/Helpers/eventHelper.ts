import { BoardType, EditMode, NotationType } from "../../../math-common/src/enum";
import { useUserStore } from "../store/pinia/userStore"
import { useNotationStore } from "../store/pinia/notationStore"

import useMatrixHelper from "./matrixHelper";
import useNotationHelper from "./notationHelper";
import useAuthHelper from "./authHelper";
import useActivateObjectHelper from "./activateObjectHelper";
import useEventBus from "../Helpers/useEventBus";
import useUserOutgoingOperations from "./userOutgoingOperationsHelper";

const userStore = useUserStore();
const notationStore = useNotationStore();
const matrixHelper = useMatrixHelper();
const notationHelper = useNotationHelper();
const authHelper = useAuthHelper();
const eventBus = useEventBus();
const activateObjectHelper = useActivateObjectHelper();
const userOutgoingOperations = useUserOutgoingOperations();



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
        notationHelper.removeActiveOrSelectedNotations();
        matrixHelper.setNextRect(-1, 0);
        return;
      }

      if (e.code === "Delete") {
        notationHelper.removeActiveOrSelectedNotations();
        return;
      }

      if (e.code === "ArrowLeft") {
        matrixHelper.setNextRect(-1, 0);
        return;
      }

      if (e.code === "ArrowRight" || e.code === "Space") {
        matrixHelper.setNextRect(1, 0);
        return;
      }

      if (e.code === "ArrowUp") {
        matrixHelper.setNextRect(0, -1);
        return;
      }

      if (e.code === "ArrowDown") {
        matrixHelper.setNextRect(0, -1);
        return;
      }

      if (e.code === "Enter") {
        matrixHelper.setNextRect(0, -1);
        return;
      }

      if (!authHelper.canEdit) {
        return;
      }

      notationHelper.addSymbolNotation(e.key);
  };

  function mouseDown(e: MouseEvent) {
      if (
        notationStore.editMode === EditMode.FRACTION.valueOf ||
        notationStore.editMode === EditMode.SQRT.valueOf ||
        notationStore.editMode === EditMode.SELECT.valueOf
      ) {
        return;
      }

      let activeCell = activateObjectHelper.activateClickedObject(e);
      if (activeCell && notationStore.parent.type == BoardType.LESSON) {
          userOutgoingOperations.syncOutgoingActiveCell(activeCell);
      }

      if (
        notationStore.editMode === EditMode.CHECKMARK.valueOf ||
        notationStore.editMode === EditMode.SEMICHECKMARK.valueOf ||
        notationStore.editMode === EditMode.XMARK.valueOf
      ) {
        notationHelper.addMarkNotation();
        return;
      }
  };

  function lineDrawEnded() {
      // see toolbar.vue
    eventBus.emit("resetToolbarState");
    activateObjectHelper.reset();
    // activateObjectMixin_unselectPreviouslyActiveCell();
  };

  async function setActiveNotation(activeNotation: Notation | null) {
    notationHelper.setAc
    if (
      // disallow activation of question rows for student
      notationHelper.isNotationInQuestionArea(activeNotation)
    ) {
      return;
    }

    activeNotation = activeNotation;
  }

  return {paste, keyUp, mouseDown, lineDrawEnded}
};