import { Model } from "sequelize-typescript";
import User from "../../user.model";
import Question from "../../question/question.model";
import { QuestionPointAttributes, QuestionPointCreationAttributes } from "../../../../../math-common/build/questionTypes";
export default class QuestionSymbol extends Model<QuestionPointAttributes, QuestionPointCreationAttributes> {
    notationType: string;
    boardType: string;
    uuid: string;
    userId: number;
    user: User;
    questionId: number;
    question: Question;
    col: number;
    row: number;
    value: string;
}
