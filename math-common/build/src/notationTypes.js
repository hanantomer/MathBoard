"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionRectNotation = exports.QuestionLineNotation = exports.QuestionPointNotation = exports.AnswerRectNotation = exports.AnswerLineNotation = exports.AnswerPointNotation = exports.LessonRectNotation = exports.LessonLineNotation = exports.LessonPointNotation = exports.RectAttributes = exports.LineAttributes = exports.PointAttributes = exports.Notation = void 0;
// we dont have a notation model
class Notation {
    constructor(id, uuid, type, boardType, selected, userId, value = "", background_color = "") {
        this.id = id;
        this.uuid = uuid;
        this.type = type;
        this.boardType = boardType;
        this.selected = selected;
        this.userId = userId;
        this.value = value;
        this.background_color = background_color;
    }
}
exports.Notation = Notation;
;
class PointAttributes extends Notation {
    constructor(id, uuid, type, boardType, selected, userId, col, row) {
        super(id, uuid, type, boardType, selected, userId);
        this.col = col;
        this.row = row;
    }
}
exports.PointAttributes = PointAttributes;
;
class LineAttributes extends Notation {
    constructor(id, uuid, type, boardType, selected, userId, fromCol, toCol, row) {
        super(id, uuid, type, boardType, selected, userId);
        this.fromCol = fromCol;
        this.toCol = toCol;
        this.row = row;
    }
}
exports.LineAttributes = LineAttributes;
;
class RectAttributes extends Notation {
    constructor(id, uuid, type, boardType, selected, userId, fromCol, toCol, fromRow, toRow) {
        super(id, uuid, type, boardType, selected, userId);
        this.fromCol = fromCol;
        this.toCol = toCol;
        this.fromRow = fromRow;
        this.toRow = toRow;
    }
}
exports.RectAttributes = RectAttributes;
;
class LessonPointNotation extends PointAttributes {
    constructor(id, uuid, type, boardType, selected, userId, col, row) {
        super(id, uuid, type, boardType, selected, userId, col, row);
    }
}
exports.LessonPointNotation = LessonPointNotation;
;
class LessonLineNotation extends LineAttributes {
    constructor(id, uuid, type, boardType, selected, userId, lessonUUId, fromCol, toCol, row) {
        super(id, uuid, type, boardType, selected, userId, fromCol, toCol, row);
        this.lessonUUId = lessonUUId;
    }
}
exports.LessonLineNotation = LessonLineNotation;
;
class LessonRectNotation extends RectAttributes {
    constructor(id, uuid, type, boardType, selected, userId, lessonUUId, fromCol, toCol, fromRow, toRow) {
        super(id, uuid, type, boardType, selected, userId, fromCol, toCol, fromRow, toRow);
        this.lessonUUId = lessonUUId;
    }
}
exports.LessonRectNotation = LessonRectNotation;
;
class AnswerPointNotation extends PointAttributes {
    constructor(id, uuid, type, boardType, selected, userId, answerUUId, col, row) {
        super(id, uuid, type, boardType, selected, userId, col, row);
        this.answerUUId = answerUUId;
    }
}
exports.AnswerPointNotation = AnswerPointNotation;
;
class AnswerLineNotation extends LineAttributes {
    constructor(id, uuid, type, boardType, selected, userId, answerUUId, fromCol, toCol, row) {
        super(id, uuid, type, boardType, selected, userId, fromCol, toCol, row);
        this.answerUUId = answerUUId;
    }
}
exports.AnswerLineNotation = AnswerLineNotation;
;
class AnswerRectNotation extends RectAttributes {
    constructor(id, uuid, type, boardType, selected, userId, answerUUId, fromCol, toCol, fromRow, toRow) {
        super(id, uuid, type, boardType, selected, userId, fromCol, toCol, fromRow, toRow);
        this.answerUUId = answerUUId;
    }
}
exports.AnswerRectNotation = AnswerRectNotation;
;
class QuestionPointNotation extends PointAttributes {
    constructor(id, uuid, type, boardType, selected, userId, questionUUId, col, row) {
        super(id, uuid, type, boardType, selected, userId, col, row);
        this.questionUUId = questionUUId;
    }
}
exports.QuestionPointNotation = QuestionPointNotation;
;
class QuestionLineNotation extends LineAttributes {
    constructor(id, uuid, type, boardType, selected, userId, questionUUId, fromCol, toCol, row) {
        super(id, uuid, type, boardType, selected, userId, fromCol, toCol, row);
        this.questionUUId = questionUUId;
    }
}
exports.QuestionLineNotation = QuestionLineNotation;
;
class QuestionRectNotation extends RectAttributes {
    constructor(id, uuid, type, boardType, selected, userId, questionUUId, fromCol, toCol, fromRow, toRow) {
        super(id, uuid, type, boardType, selected, userId, fromCol, toCol, fromRow, toRow);
        this.questionUUId = questionUUId;
    }
}
exports.QuestionRectNotation = QuestionRectNotation;
;
//# sourceMappingURL=notationTypes.js.map