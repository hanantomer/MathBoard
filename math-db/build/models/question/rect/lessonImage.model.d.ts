import { Model } from "sequelize-typescript";
import User from "../../user.model";
import Question from "../question.model";
export default class QuestionImage extends Model {
    userId: number;
    user: User;
    questionId: number;
    question: Question;
    fromCol: number;
    toCol: number;
    fromRow: number;
    toRow: number;
}
