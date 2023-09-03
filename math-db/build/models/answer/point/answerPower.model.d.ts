import { Model } from "sequelize-typescript";
import { NotationType, BoardType } from "../../../../../math-common/build/enum";
import User from "../../user.model";
import Answer from "../../answer/answer.model";
import { AnswerPointAttributes, AnswerPointCreationAttributes } from "../../../../../math-common/build/notationTypes";
export default class AnswerPower extends Model<AnswerPointAttributes, AnswerPointCreationAttributes> {
    notationType: NotationType;
    boardType: BoardType;
    uuid: string;
    userId: number;
    user: User;
    answerId: number;
    answer: Answer;
    col: number;
    row: number;
    value: string;
}
