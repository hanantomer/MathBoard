import { Model } from "sequelize-typescript";
import User from "../../user.model";
import Question from "../question.model";
import { QuestionLineAttributes, QuestionLineCreationAttributes } from "../../../../../math-common/build/questionTypes";
export default class QuestionSqrt extends Model<QuestionLineAttributes, QuestionLineCreationAttributes> {
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
