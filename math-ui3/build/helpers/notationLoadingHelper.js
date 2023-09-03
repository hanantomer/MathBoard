import useDbHelper from "./dbHelper";
import { useNotationStore } from "../store/pinia/notationStore";
import { useLessonStore } from "../store/pinia/lessonStore";
import { useQuestionStore } from "../store/pinia/questionStore";
import { useAnswerStore } from "../store/pinia/answerStore";
import { NotationType } from "../../../math-common/src/enum";
import { reactive } from "vue";
const notationStore = useNotationStore();
const lessonStore = useLessonStore();
const questionStore = useQuestionStore();
const answerStore = useAnswerStore();
const dbHelper = useDbHelper();
export default function notationLoadingHelper() {
    async function loadLessonNotations() {
        notationStore.setParent(lessonStore.currentLesson?.uuid, 0 /* BoardType.LESSON */);
        notationStore.notations = reactive(await loadNotationsByBoard());
    }
    async function loadQuestionNotations() {
        notationStore.setParent(questionStore.currentQuestion?.uuid, 1 /* BoardType.QUESTION */);
        notationStore.notations = reactive(await loadNotationsByBoard());
    }
    async function loadAnswerNotations() {
        notationStore.setParent(answerStore.currentAnswer?.uuid, 2 /* BoardType.ANSWER */);
        notationStore.notations = reactive(await loadNotationsByBoard());
    }
    // e.g get lesson notations
    async function loadNotationsByBoard() {
        let notationsMap = new Map();
        for (const nt in NotationType) {
            let notations = await loadNotationsByType(NotationType[nt]);
            notations.forEach((n) => {
                notationsMap.set(n.uuid, n);
            });
        }
        return notationsMap;
    }
    // e.g. load lesson symbols
    async function loadNotationsByType(notationType) {
        let boardType = notationStore.parent.type;
        let parentUUId = notationStore.parent.uuid;
        switch (notationType) {
            case NotationType.SYMBOL:
            case NotationType.SIGN:
            case NotationType.POWER:
                return await dbHelper.getNotations(notationType, boardType, parentUUId);
            case NotationType.FRACTION:
            case NotationType.SQRT:
                return await dbHelper.getNotations(notationType, boardType, parentUUId);
            case NotationType.GEO:
            case NotationType.IMAGE:
            case NotationType.TEXT:
                return await dbHelper.getNotations(notationType, boardType, parentUUId);
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
//# sourceMappingURL=notationLoadingHelper.js.map