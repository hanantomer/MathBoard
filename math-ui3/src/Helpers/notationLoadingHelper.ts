import {
  Notation,
  PointNotation,
  LineNotation,
  RectNotation,
} from "../Helpers/responseTypes";
import useDbHelper from "./dbHelper";
import { useNotationStore } from "../store/pinia/notationStore";
import { useLessonStore } from "../store/pinia/lessonStore";
import { useQuestionStore } from "../store/pinia/questionStore";
import { useAnswerStore } from "../store/pinia/answerStore";
import { BoardType, NotationType } from "../../../math-common/src/enum";
import { reactive } from "vue";

const notationStore = useNotationStore();
const lessonStore = useLessonStore();
const questionStore = useQuestionStore();
const answerStore = useAnswerStore();
const dbHelper = useDbHelper();

export default function notationLoadingHelper() {

  async function loadLessonNotations() {
    notationStore.setParent(lessonStore.currentLesson?.uuid, BoardType.LESSON);
    notationStore.notations = reactive(await loadNotationsByBoard());
  }

  async function loadQuestionNotations() {
    notationStore.setParent(questionStore.currentQuestion?.uuid, BoardType.QUESTION);
    notationStore.notations = reactive(await loadNotationsByBoard());
  }

  async function loadAnswerNotations() {
    notationStore.setParent(answerStore.currentAnswer?.uuid, BoardType.ANSWER);
    notationStore.notations = reactive(await loadNotationsByBoard());
  }

  // e.g get lesson notations
  async function loadNotationsByBoard(): Promise<Map<string, Notation>> {

    let notationsMap = new Map<string, Notation>();

    for (const nt in NotationType) {
      let notations = await loadNotationsByType(NotationType[nt as keyof typeof NotationType]);
      notations.forEach((n) => {
        notationsMap.set(n.uuid, n);
      });
    }

    return notationsMap;
  }

  // e.g. load lesson symbols
  async function loadNotationsByType(
    notationType: NotationType
  ): Promise<Notation[]> {
    let boardType = notationStore.parent.type;
    let parentUUId = notationStore.parent.uuid;
    switch (notationType) {
      case NotationType.SYMBOL:
      case NotationType.SIGN:
      case NotationType.POWER:
        return await dbHelper.getNotations<PointNotation>(notationType, boardType, parentUUId);
      case NotationType.FRACTION:
      case NotationType.SQRT:
        return await dbHelper.getNotations<LineNotation>(
          notationType,
          boardType,
          parentUUId
        );
      case NotationType.GEO:
      case NotationType.IMAGE:
      case NotationType.TEXT:
        return await dbHelper.getNotations<RectNotation>(
          notationType,
          boardType,
          parentUUId
        );
      default:
        return [];
    }
  }

  return {
    loadAnswerNotations,
    loadLessonNotations,
    loadQuestionNotations
  };
}