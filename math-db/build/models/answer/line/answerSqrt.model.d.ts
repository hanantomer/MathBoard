import { Model } from "sequelize-typescript";
import User from "../../user.model";
import Answer from "../../answer/answer.model";
import { AnswerLineAttributes, AnswerLineCreationAttributes } from "../../../../../math-common/build/answerTypes";
export default class AnswerSqrt extends Model<AnswerLineAttributes, AnswerLineCreationAttributes> {
    notationType: string;
    boardType: string;
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
