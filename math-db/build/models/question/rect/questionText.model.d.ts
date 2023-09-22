import { Model } from "sequelize-typescript";
import { NotationType, BoardType } from "../../../../../math-common/build/enum";
import { QuestionRectAttributes, QuestionRectCreationAttributes } from "../../../../../math-common/build/questionTypes";
import User from "../../user.model";
import Question from "../question.model";
export default class QuestionText extends Model<QuestionRectAttributes, QuestionRectCreationAttributes> {
    notationType: NotationType;
    boardType: BoardType;
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
