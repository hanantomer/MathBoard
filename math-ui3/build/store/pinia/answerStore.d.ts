import { AnswerAttributes } from "common/notationTypes";
export declare const useAnswerStore: import("pinia").StoreDefinition<"answer", import("pinia")._UnwrapAll<Pick<{
    answers: Map<String, AnswerAttributes>;
    currentAnswer: AnswerAttributes;
    loadAnswer: (answerUUId: string) => Promise<void>;
    loadAnswers: () => Promise<void>;
    addAnswer: () => Promise<void>;
    setCurrentAnswer: (answer: AnswerAttributes) => void;
    removeAnswer: (answer: AnswerAttributes) => void;
}, "answers" | "currentAnswer">>, Pick<{
    answers: Map<String, AnswerAttributes>;
    currentAnswer: AnswerAttributes;
    loadAnswer: (answerUUId: string) => Promise<void>;
    loadAnswers: () => Promise<void>;
    addAnswer: () => Promise<void>;
    setCurrentAnswer: (answer: AnswerAttributes) => void;
    removeAnswer: (answer: AnswerAttributes) => void;
}, never>, Pick<{
    answers: Map<String, AnswerAttributes>;
    currentAnswer: AnswerAttributes;
    loadAnswer: (answerUUId: string) => Promise<void>;
    loadAnswers: () => Promise<void>;
    addAnswer: () => Promise<void>;
    setCurrentAnswer: (answer: AnswerAttributes) => void;
    removeAnswer: (answer: AnswerAttributes) => void;
}, "loadAnswer" | "loadAnswers" | "addAnswer" | "setCurrentAnswer" | "removeAnswer">>;
