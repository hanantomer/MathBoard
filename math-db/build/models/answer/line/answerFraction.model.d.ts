import { Model } from "sequelize-typescript";
import User from "../../user.model";
import Answer from "../answer.model";
export default class AnswerFraction extends Model {
    userId: number;
    user: User;
    answerId: number;
    answer: Answer;
    fromCol: number;
    toCol: number;
    row: number;
}
