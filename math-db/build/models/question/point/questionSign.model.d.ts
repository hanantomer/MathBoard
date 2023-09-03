import { Model } from "sequelize-typescript";
import { NotationType, BoardType } from "../../../../../math-common/build/enum";
import User from "../../user.model";
import Question from "../question.model";
import { QuestionPointAttributes, QuestionPointCreationAttributes } from "../../../../../math-common/build/notationTypes";
export default class QuestionSign extends Model<QuestionPointAttributes, QuestionPointCreationAttributes> {
    notationType: NotationType;
    boardType: BoardType;
    uuid: string;
    userId: number;
    user: User;
    questionId: number;
    question: Question;
    col: number;
    row: number;
    value: string;
}
