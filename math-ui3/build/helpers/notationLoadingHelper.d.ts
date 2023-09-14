export default function notationLoadingHelper(): {
    loadAnswerNotations: () => Promise<void>;
    loadLessonNotations: () => Promise<void>;
    loadQuestionNotations: () => Promise<void>;
};
