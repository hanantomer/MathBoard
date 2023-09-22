import { Model } from "sequelize-typescript";
import User from "../user.model";
import Question from "../question/question.model";
import { AnswerAttributes, AnswerCreateAttributes } from "../../../../math-common/build/answerTypes";
export default class Answer extends Model<AnswerAttributes, AnswerCreateAttributes> {
    userId: number;
    user: User;
    questionId: number;
    question: Question;
    uuid: string;
    name: string;
}
