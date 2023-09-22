import { QuestionAttributes, QuestionCreateAttributes } from "common/questionTypes";
export declare const useQuestionStore: import("pinia").StoreDefinition<"answer", import("pinia")._UnwrapAll<Pick<{
    getQuestions: () => Map<String, QuestionAttributes>;
    getCurrentQuestion: () => QuestionAttributes;
    loadQuestions: () => Promise<void>;
    loadQuestion: (questionUUId: string) => Promise<void>;
    addQuestion: (question: QuestionCreateAttributes) => Promise<QuestionCreateAttributes>;
    setCurrentQuestion: (questionUUId: string) => void;
    removeQuestion: (question: QuestionAttributes) => void;
}, never>>, Pick<{
    getQuestions: () => Map<String, QuestionAttributes>;
    getCurrentQuestion: () => QuestionAttributes;
    loadQuestions: () => Promise<void>;
    loadQuestion: (questionUUId: string) => Promise<void>;
    addQuestion: (question: QuestionCreateAttributes) => Promise<QuestionCreateAttributes>;
    setCurrentQuestion: (questionUUId: string) => void;
    removeQuestion: (question: QuestionAttributes) => void;
}, never>, Pick<{
    getQuestions: () => Map<String, QuestionAttributes>;
    getCurrentQuestion: () => QuestionAttributes;
    loadQuestions: () => Promise<void>;
    loadQuestion: (questionUUId: string) => Promise<void>;
    addQuestion: (question: QuestionCreateAttributes) => Promise<QuestionCreateAttributes>;
    setCurrentQuestion: (questionUUId: string) => void;
    removeQuestion: (question: QuestionAttributes) => void;
}, "getQuestions" | "getCurrentQuestion" | "loadQuestions" | "loadQuestion" | "addQuestion" | "setCurrentQuestion" | "removeQuestion">>;
