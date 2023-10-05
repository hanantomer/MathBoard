import { useUserStore } from "../store/pinia/userStore"
import { useNotationStore } from "../store/pinia/notationStore"

import useMatrixHelper from "./matrixHelper";
import useNotationMutationHelper from "./notationMutateHelper";
import useAuthHelper from "./authHelper";
import useActivateObjectHelper from "./activateObjectHelper";
import useEventBus from "../helpers/eventBus";
import useUserOutgoingOperations from "./userOutgoingOperationsHelper";

const userStore = useUserStore();
const notationStore = useNotationStore();
const matrixHelper = useMatrixHelper();
const notationMutationHelper = useNotationMutationHelper();
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
        notationMutationHelper.addImageNotation(fromCol, toCol, fromRow, toRow, base64data.toString());
      }
    });

    reader.readAsDataURL(item?.getAsFile() as Blob);
  };

  function keyUp(e: KeyboardEvent[]) {
    const { ctrlKey, altKey, code, key } = e[0];
      if (ctrlKey || altKey) {
        return;
      }

      if (
        !(
          code.startsWith("Digit") ||
          code.startsWith("Key") ||
          code.startsWith("Numpad") ||
          code === "Minus" ||
          code === "Delete" ||
          code === "Backspace" ||
          code === "Plus" ||
          code === "Equal" ||
          code === "Period" ||
          code === "ArrowLeft" ||
          code === "ArrowRight" ||
          code === "ArrowUp" ||
          code === "ArrowDown" ||
          code === "Space"
        )
      ) {
        return;
      }

      if (code === "Backspace") {
        notationMutationHelper.removeActiveOrSelectedNotations();
        matrixHelper.setNextRect(-1, 0);
        return;
      }

      if (code === "Delete") {
        notationMutationHelper.removeActiveOrSelectedNotations();
        return;
      }

      if (code === "ArrowLeft") {
        matrixHelper.setNextRect(-1, 0);
        return;
      }

      if (code === "ArrowRight" || code === "Space") {
        matrixHelper.setNextRect(1, 0);
        return;
      }

      if (code === "ArrowUp") {
        matrixHelper.setNextRect(0, -1);
        return;
      }

      if (code === "ArrowDown") {
        matrixHelper.setNextRect(0, 1);
        return;
      }

      if (code === "Enter") {
        matrixHelper.setNextRect(0, -1);
        return;
      }

      if (!authHelper.canEdit) {
        return;
      }

      notationMutationHelper.addSymbolNotation(key);
  };

  function mouseDown(e: MouseEvent) {
      if (
        notationStore.getEditMode().value === "FRACTION" ||
        notationStore.getEditMode().value === "SQRT" ||
        notationStore.getEditMode().value === "SELECT"
      ) {
        return;
      }

      let activeCell = activateObjectHelper.activateClickedObject(e);
      if (
        activeCell &&
        notationStore.getParent().value.type == "LESSON"
      ) {
        //TODO: uncheck        userOutgoingOperations.syncOutgoingActiveCell(activeCell);
      }

      if (
        notationStore.getEditMode().value === "CHECKMARK" ||
        notationStore.getEditMode().value === "SEMICHECKMARK" ||
        notationStore.getEditMode().value === "XMARK"
      ) {
        notationMutationHelper.addMarkNotation();
        return;
      }
  };

  function lineDrawEnded() {
      // see toolbar.vue
    eventBus.emit("resetToolbarState");
    activateObjectHelper.reset();
    // activateObjectMixin_unselectPreviouslyActiveCell();
  };

  // async function setActiveNotation(activeNotation: Notation | null) {
  //   notationMutationHelper.setAc
  //   if (
  //     // disallow activation of question rows for student
  //     notationMutationHelper.isNotationInQuestionArea(activeNotation)
  //   ) {
  //     return;
  //   }

  //   activeNotation = activeNotation;
  // }

  return {paste, keyUp, mouseDown, lineDrawEnded}
};
