import { Model } from "sequelize-typescript";
import { NotationType, BoardType } from "../../../../../math-common/build/enum";
import User from "../../user.model";
import Question from "../../question/question.model";
import { QuestionRectAttributes, QuestionRectCreationAttributes } from "../../../../../math-common/build/notationTypes";
export default class QuestionImage extends Model<QuestionRectAttributes, QuestionRectCreationAttributes> {
    notationType: NotationType;
    boardType: BoardType;
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
