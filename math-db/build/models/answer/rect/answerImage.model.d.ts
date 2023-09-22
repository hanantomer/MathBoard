import { Model } from "sequelize-typescript";
import { NotationType, BoardType } from "../../../../../math-common/build/enum";
import User from "../../user.model";
import Answer from "../../answer/answer.model";
import { AnswerRectAttributes, AnswerRectCreationAttributes } from "../../../../../math-common/build/answerTypes";
export default class AnswerImage extends Model<AnswerRectAttributes, AnswerRectCreationAttributes> {
    notationType: NotationType;
    boardType: BoardType;
    uuid: string;
    userId: number;
    user: User;
    answerId: number;
    answer: Answer;
    toCol: number;
    fromRow: number;
    toRow: number;
    value: string;
}
