import { Model } from "sequelize-typescript";
import { NotationType, BoardType } from "../../../../../math-common/build/enum";
import { QuestionLineAttributes, QuestionLineCreationAttributes } from "../../../../../math-common/build/notationTypes";
import User from "../../user.model";
import Question from "../../question/question.model";
export default class QuestionRoot extends Model<QuestionLineAttributes, QuestionLineCreationAttributes> {
    notationType: NotationType;
    boardType: BoardType;
    value: null;
    uuid: string;
    userId: number;
    user: User;
    questionId: number;
    question: Question;
    fromCol: number;
    toCol: number;
    row: number;
}
