import User from "../user";
import Lesson from "./lesson";
import { Model } from "sequelize-typescript";
export default class StudentLesson extends Model {
    lesson: Lesson;
    user: User;
}
