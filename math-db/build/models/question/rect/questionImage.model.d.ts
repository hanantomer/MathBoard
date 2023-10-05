import { Model } from "sequelize-typescript";
import User from "../../user.model";
import Question from "../../question/question.model";
import { QuestionRectAttributes, QuestionRectCreationAttributes } from "../../../../../math-common/build/questionTypes";
export default class QuestionImage extends Model<QuestionRectAttributes, QuestionRectCreationAttributes> {
    notationType: string;
    boardType: string;
    selected: boolean;
    uuid: string;
    userId: number;
    user: User;
    questionId: number;
    question: Question;
    fromCol: number;
    toCol: number;
    fromRow: number;
    toRow: number;
    value: string;
}
