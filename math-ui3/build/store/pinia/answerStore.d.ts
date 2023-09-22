import { AnswerAttributes } from "common/answerTypes";
export declare const useAnswerStore: import("pinia").StoreDefinition<"answer", import("pinia")._UnwrapAll<Pick<{
    getAnswers: () => Map<String, AnswerAttributes>;
    getCurrentAnswer: () => AnswerAttributes;
    loadAnswer: (answerUUId: string) => Promise<void>;
    loadAnswers: () => Promise<void>;
    addAnswer: () => Promise<void>;
    setCurrentAnswer: (answer: AnswerAttributes) => void;
    removeAnswer: (answer: AnswerAttributes) => void;
}, never>>, Pick<{
    getAnswers: () => Map<String, AnswerAttributes>;
    getCurrentAnswer: () => AnswerAttributes;
    loadAnswer: (answerUUId: string) => Promise<void>;
    loadAnswers: () => Promise<void>;
    addAnswer: () => Promise<void>;
    setCurrentAnswer: (answer: AnswerAttributes) => void;
    removeAnswer: (answer: AnswerAttributes) => void;
}, never>, Pick<{
    getAnswers: () => Map<String, AnswerAttributes>;
    getCurrentAnswer: () => AnswerAttributes;
    loadAnswer: (answerUUId: string) => Promise<void>;
    loadAnswers: () => Promise<void>;
    addAnswer: () => Promise<void>;
    setCurrentAnswer: (answer: AnswerAttributes) => void;
    removeAnswer: (answer: AnswerAttributes) => void;
}, "getAnswers" | "getCurrentAnswer" | "loadAnswer" | "loadAnswers" | "addAnswer" | "setCurrentAnswer" | "removeAnswer">>;
