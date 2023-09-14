import { Model } from "sequelize-typescript";
import { NotationType, BoardType } from "../../../../../math-common/build/enum";
import User from "../../user.model";
import Answer from "../../answer/answer.model";
import { AnswerLineAttributes, AnswerLineCreationAttributes } from "../../../../../math-common/build/notationTypes";
export default class AnswerRoot extends Model<AnswerLineAttributes, AnswerLineCreationAttributes> {
    notationType: NotationType;
    boardType: BoardType;
    value: null;
    uuid: string;
    userId: number;
    user: User;
    answerId: number;
    answer: Answer;
    fromCol: number;
    toCol: number;
    row: number;
}
