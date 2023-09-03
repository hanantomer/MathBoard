import { BoardType, EditMode } from "../../../math-common/src/enum";
import { useUserStore } from "../store/pinia/userStore";
import { useNotationStore } from "../store/pinia/notationStore";
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
    async function paste(e) {
        // disallow adding image by student
        if (!userStore.isTeacher)
            return;
        const dT = e.clipboardData /*|| window.Clipboard*/;
        const item = dT?.items[0];
        var reader = new FileReader();
        var that = this;
        reader.addEventListener("load", () => {
            const base64data = reader.result;
            let image = new Image();
            image.src = base64data;
            image.onload = () => {
                if (!base64data)
                    return;
                let fromCol = parseInt(that.getActiveCell().col);
                let fromRow = parseInt(that.getActiveCell().row);
                let toCol = Math.ceil(image.width / matrixHelper.rectSize) + fromCol;
                let toRow = Math.ceil(image.height / matrixHelper.rectSize) + fromRow;
                notationMutationHelper.addImageNotation(fromCol, toCol, fromRow, toRow, base64data.toString());
            };
        });
        reader.readAsDataURL(item?.getAsFile());
    }
    ;
    function keyUp(e) {
        if (e.ctrlKey || e.altKey) {
            return;
        }
        if (!(e.code.startsWith("Digit") ||
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
            e.code === "Space")) {
            return;
        }
        if (e.code === "Backspace") {
            notationMutationHelper.removeActiveOrSelectedNotations();
            matrixHelper.setNextRect(-1, 0);
            return;
        }
        if (e.code === "Delete") {
            notationMutationHelper.removeActiveOrSelectedNotations();
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
        notationMutationHelper.addSymbolNotation(e.key);
    }
    ;
    function mouseDown(e) {
        if (notationStore.editMode === EditMode.FRACTION ||
            notationStore.editMode === EditMode.SQRT ||
            notationStore.editMode === EditMode.SELECT) {
            return;
        }
        let activeCell = activateObjectHelper.activateClickedObject(e);
        if (activeCell && notationStore.parent.type == BoardType.LESSON) {
            userOutgoingOperations.syncOutgoingActiveCell(activeCell);
        }
        if (notationStore.editMode === EditMode.CHECKMARK ||
            notationStore.editMode === EditMode.SEMICHECKMARK ||
            notationStore.editMode === EditMode.XMARK) {
            notationMutationHelper.addMarkNotation();
            return;
        }
    }
    ;
    function lineDrawEnded() {
        // see toolbar.vue
        eventBus.emit("resetToolbarState");
        activateObjectHelper.reset();
        // activateObjectMixin_unselectPreviouslyActiveCell();
    }
    ;
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
    return { paste, keyUp, mouseDown, lineDrawEnded };
}
;
//# sourceMappingURL=eventHelper.js.map
