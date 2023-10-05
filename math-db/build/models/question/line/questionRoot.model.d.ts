import { Model } from "sequelize-typescript";
import { QuestionLineAttributes, QuestionLineCreationAttributes } from "../../../../../math-common/build/questionTypes";
import User from "../../user.model";
import Question from "../../question/question.model";
export default class QuestionRoot extends Model<QuestionLineAttributes, QuestionLineCreationAttributes> {
    notationType: string;
    boardType: string;
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
