import {
  BoardType,
  NotationType,
  EditMode,
} from "../../../math-common/src/enum";
import AnswerImage from "../../../math-db/src/models/answer/rect/answerImage.model";
import LessonImage from "../../../math-db/src/models/lesson/rect/lessonImage.model";
import QuestionImage from "../../../math-db/src/models/question/rect/questionImage.model";
import { Notation, RectNotation } from "./responseTypes";
import { useNotationStore } from "../store/pinia/notationStore";
import useAuthHelper from "./authHelper";

const notationStore = useNotationStore();
const authHelper = useAuthHelper();

export default function notationHelper() {

  // function addSpecialSymbol(notationType: NotationType) {
  //   addNotation("", notationType);
  // }

  function $addNotation(e: KeyboardEvent) {
    if (
      // in power mode allow digits only
      notationStore.editMode == EditMode.POWER.valueOf &&
      e.code.startsWith("Digit")
    ) {
      this.$addNotation(e.key, NotationType.POWER);
      return;
    }

    ///TODO check if still relevant
    if (
      notationStore.editMode === EditMode.SYMBOL.valueOf &&
      this.signList.indexOf(e.key) >= 0
    ) {
      this.$addNotation(e.key, NotationType.SIGN);
      return;
    }

    if (notationStore.editMode == EditMode.CHECKMARK.valueOf) {
      this.$addNotation("&#x2714", NotationType.SYMBOL);
      return;
    }

    if (notationStore.editMode == EditMode.SEMICHECKMARK.valueOf) {
      this.$addNotation("&#x237B;", NotationType.SYMBOL);
      return;
    }

    if (notationStore.editMode == EditMode.XMARK.valueOf) {
      this.$addNotation("&#x2718;", NotationType.SYMBOL);
      return;
    }

    if (notationStore.editMode == EditMode.SYMBOL.valueOf) {
      this.$addNotation(e.key, NotationType.SYMBOL);
      return;
    }
  }

  function removeNotationsAtMousePosition(e: MouseEvent) {
    let rectAtMousePosition = this.matrixMixin_findClickedObject(
      {
        x: e.clientX,
        y: e.clientY,
      },
      "rect"
    );
    if (!rectAtMousePosition) return;
    this.romoveNotations({
      row: rectAtMousePosition.parentNode.attributes.row.value,
      col: rectAtMousePosition.attributes.col.value,
    });
  }

  function removeActiveOrSelectedNotations() {
    if (notationStore.activeCell) {
      this.$removeActiveCellNotations();
    }
    if (!!this.getActiveNotation()) {
      this.$removeActiveNotation();
    }
    if (!!this.getSelectedNotations().length) {
      this.$removeSelectedNotations();
    }
  }

  async function removeActiveCellNotations() {
    if (!notationStore.activeCell) return;

    let notationsToDelete = await this.removeSymbolsByCell(
      notationStore.activeCell
    );
    if (!notationsToDelete) return;

    notationsToDelete.forEach((notation: Notation) => {
      this.userOperationsMixin_syncOutgoingRemoveNotation(notation);
    });
  }

  async function removeActiveNotation() {
    if (!authHelper.canEdit()) {
      return;
    }
    let deletedNotation = await this.removeActiveNotation();
    if (!deletedNotation) return;
    this.userOperationsMixin_syncOutgoingRemoveNotation(deletedNotation);
  }

  async function removeSelectedNotations() {
    if (!this.mixin_canEdit()) {
      return;
    }
    let deletedNotations = await this.removeSelectedNotations();
    if (!!deletedNotations) {
      deletedNotations.forEach((n: Notation) =>
        this.userOperationsMixin_syncOutgoingRemoveNotation(n)
      );
    }
    this.unselectAllNotations();
  }

  function addImageNotation(fromCol: number, toCol: number, fromRow: number, toRow: number, base64Value: string) {

    let notation: RectNotation;

    switch (notationStore.parent.type) {
      case BoardType.ANSWER: {
          notation = new AnswerImage();
          break;
      }

      case BoardType.LESSON: {
        notation = new LessonImage();
        break;
      }

      case BoardType.QUESTION: {
        notation = new QuestionImage();
      }
    }

    notation.fromCol = fromCol;
    notation.toCol = toCol;
    notation.fromRow = fromRow;
    notation.toRow = toRow;
    notation.value = base64Value;

    notationStore.addNotation(notation)
    .then(() => {
      if (notationStore.parent.type === BoardType.LESSON) {
        this.userOperationsMixin_syncOutgoingSaveNotation(notation);
      }
    })
    .catch((e) => {
      console.error(e);
    });

    notationStore.activeCell = { col: -1, row: -1 }; /// TODO encapsulate it within store
  }

  function addNotation(value: string, type: NotationType) {
    let symbol = {
      value: value,
      type: type,
      col: notationStore.activeCell.col,
      row: notationStore.activeCell.row
    };


    this.addNotation(symbol)
      .then((symbol: Notation) => {
        if (this.getParent().boardType === BoardType.LESSON) {
          this.userOperationsMixin_syncOutgoingSaveNotation(symbol);
        }
      })
      .then(() => {
        if (this.getCurrentEditMode() == EditMode.SYMBOL) {
          this.matrixMixin_setNextRect(1, 0);
        }
      })
      .catch((e: any) => {
        console.error(e);
      });
  }

  return { addImageNotation };
}
