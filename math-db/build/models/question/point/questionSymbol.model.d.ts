import { Model } from "sequelize-typescript";
import User from "../../user.model";
import Question from "../question.model";
export default class QuestionSymbol extends Model {
    userId: number;
    user: User;
    questionId: number;
    question: Question;
    col: number;
    row: number;
    value: string;
}
