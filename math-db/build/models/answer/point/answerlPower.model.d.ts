import { Model } from "sequelize-typescript";
import User from "../../user.model";
import Answer from "../answer.model";
export default class AnswerPower extends Model {
    userId: number;
    user: User;
    answerId: number;
    answer: Answer;
    col: number;
    row: number;
    value: string;
}
