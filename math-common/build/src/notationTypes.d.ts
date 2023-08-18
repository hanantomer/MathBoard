import { BoardType, NotationType } from "./enum";
export declare abstract class Notation {
    id: number;
    uuid: string;
    type: NotationType;
    boardType: BoardType;
    selected: boolean;
    userId: number;
    value: string;
    background_color: string;
    constructor(id: number, uuid: string, type: NotationType, boardType: BoardType, selected: boolean, userId: number, value?: string, background_color?: string);
}
export type Point = {
    col: number;
    row: number;
};
export type Line = {
    fromCol: number;
    toCol: number;
    row: number;
};
export type Rect = {
    fromCol: number;
    fromRow: number;
    toCol: number;
    toRow: number;
};
export declare class PointAttributes extends Notation implements Point {
    col: number;
    row: number;
    constructor(id: number, uuid: string, type: NotationType, boardType: BoardType, selected: boolean, userId: number, col: number, row: number);
}
export declare class LineAttributes extends Notation implements Line {
    fromCol: number;
    toCol: number;
    row: number;
    constructor(id: number, uuid: string, type: NotationType, boardType: BoardType, selected: boolean, userId: number, fromCol: number, toCol: number, row: number);
}
export declare class RectAttributes extends Notation implements Rect {
    fromCol: number;
    toCol: number;
    fromRow: number;
    toRow: number;
    constructor(id: number, uuid: string, type: NotationType, boardType: BoardType, selected: boolean, userId: number, fromCol: number, toCol: number, fromRow: number, toRow: number);
}
export declare class LessonPointNotation extends PointAttributes {
    constructor(id: number, uuid: string, type: NotationType, boardType: BoardType, selected: boolean, userId: number, col: number, row: number);
}
export declare class LessonLineNotation extends LineAttributes {
    lessonUUId: string;
    constructor(id: number, uuid: string, type: NotationType, boardType: BoardType, selected: boolean, userId: number, lessonUUId: string, fromCol: number, toCol: number, row: number);
}
export declare class LessonRectNotation extends RectAttributes {
    lessonUUId: string;
    constructor(id: number, uuid: string, type: NotationType, boardType: BoardType, selected: boolean, userId: number, lessonUUId: string, fromCol: number, toCol: number, fromRow: number, toRow: number);
}
export declare class AnswerPointNotation extends PointAttributes {
    answerUUId: string;
    constructor(id: number, uuid: string, type: NotationType, boardType: BoardType, selected: boolean, userId: number, answerUUId: string, col: number, row: number);
}
export declare class AnswerLineNotation extends LineAttributes {
    answerUUId: string;
    constructor(id: number, uuid: string, type: NotationType, boardType: BoardType, selected: boolean, userId: number, answerUUId: string, fromCol: number, toCol: number, row: number);
}
export declare class AnswerRectNotation extends RectAttributes {
    answerUUId: string;
    constructor(id: number, uuid: string, type: NotationType, boardType: BoardType, selected: boolean, userId: number, answerUUId: string, fromCol: number, toCol: number, fromRow: number, toRow: number);
}
export declare class QuestionPointNotation extends PointAttributes {
    questionUUId: string;
    constructor(id: number, uuid: string, type: NotationType, boardType: BoardType, selected: boolean, userId: number, questionUUId: string, col: number, row: number);
}
export declare class QuestionLineNotation extends LineAttributes {
    questionUUId: string;
    constructor(id: number, uuid: string, type: NotationType, boardType: BoardType, selected: boolean, userId: number, questionUUId: string, fromCol: number, toCol: number, row: number);
}
export declare class QuestionRectNotation extends RectAttributes {
    questionUUId: string;
    constructor(id: number, uuid: string, type: NotationType, boardType: BoardType, selected: boolean, userId: number, questionUUId: string, fromCol: number, toCol: number, fromRow: number, toRow: number);
}
