import { Model } from "sequelize-typescript";
import User from "../../user.model";
import Answer from "../answer.model";
import { AnswerPointAttributes, AnswerPointCreationAttributes } from "../../../../../math-common/build/answerTypes";
export default class AnswerSign extends Model<AnswerPointAttributes, AnswerPointCreationAttributes> {
    notationType: string;
    boardType: string;
    uuid: string;
    userId: number;
    user: User;
    answerId: number;
    answer: Answer;
    col: number;
    row: number;
    value: string;
}