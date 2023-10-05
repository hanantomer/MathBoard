import useDbHelper from "./dbHelper";
import { useNotationStore } from "../store/pinia/notationStore";
import { NotationType } from "common/enum";
const notationStore = useNotationStore();
const dbHelper = useDbHelper();
export default function notationLoadingHelper() {
    async function loadLessonNotations() {
        notationStore.setNotations(await loadNotationsByBoard());
    }
    async function loadQuestionNotations() {
        notationStore.setNotations(await loadNotationsByBoard());
    }
    async function loadAnswerNotations() {
        notationStore.setNotations(await loadNotationsByBoard());
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
        let boardType = notationStore.getParent().value.type;
        let parentUUId = notationStore.getParent().value.uuid;
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