import { QuestionAttributes, QuestionCreateAttributes } from "common/notationTypes";
export declare const useQuestionStore: import("pinia").StoreDefinition<"answer", import("pinia")._UnwrapAll<Pick<{
    questions: Map<String, QuestionAttributes>;
    currentQuestion: QuestionAttributes;
    loadQuestions: () => Promise<void>;
    loadQuestion: (questionUUId: string) => Promise<void>;
    addQuestion: (question: QuestionCreateAttributes) => Promise<QuestionCreateAttributes>;
    setCurrentQuestion: (questionUUId: string) => void;
    removeQuestion: (question: QuestionAttributes) => void;
}, "questions" | "currentQuestion">>, Pick<{
    questions: Map<String, QuestionAttributes>;
    currentQuestion: QuestionAttributes;
    loadQuestions: () => Promise<void>;
    loadQuestion: (questionUUId: string) => Promise<void>;
    addQuestion: (question: QuestionCreateAttributes) => Promise<QuestionCreateAttributes>;
    setCurrentQuestion: (questionUUId: string) => void;
    removeQuestion: (question: QuestionAttributes) => void;
}, never>, Pick<{
    questions: Map<String, QuestionAttributes>;
    currentQuestion: QuestionAttributes;
    loadQuestions: () => Promise<void>;
    loadQuestion: (questionUUId: string) => Promise<void>;
    addQuestion: (question: QuestionCreateAttributes) => Promise<QuestionCreateAttributes>;
    setCurrentQuestion: (questionUUId: string) => void;
    removeQuestion: (question: QuestionAttributes) => void;
}, "loadQuestions" | "loadQuestion" | "addQuestion" | "setCurrentQuestion" | "removeQuestion">>;
