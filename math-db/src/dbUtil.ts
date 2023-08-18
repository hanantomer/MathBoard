import "reflect-metadata";
import { Model } from "sequelize-typescript";
import Lesson from "./models/lesson/lesson.model"
import Question from "./models/question/question.model";
import Answer from "./models/answer/answer.model";
import User from "./models/user.model";

import db from "./models/index";


const boardType = Object.freeze({
    LESSON: "lesson",
    QUESTION: "question",
    ANSWER: "answer",
    NONE: "none",
});

Object.defineProperty(String.prototype, "capitalize", {
    value: function () {
        return this.charAt(0).toUpperCase() + this.slice(1);
    },
    enumerable: false,
});

export default {
    getIdByUUId: async function (
        model: string,
        uuid: string
    ): Promise<number | null> {
        let res = await db.sequelize.models[model].findOne({
            attributes: {
                include: ["id"],
            },
            where: {
                uuid: uuid,
            },
        });

        return res?.get("id") as number;
    },

    isTeacher: async function (
        userUUId: string,
        lessonUUId: string
    ): Promise<boolean> {
        let lessonId = await this.getIdByUUId("Lesson", lessonUUId);
        if (!lessonId) return false;

        let userId = await this.getIdByUUId("User", userUUId);
        if (!userId) return false;

        let lesson = await Lesson.findByPk(lessonId);

        return lesson?.user.id === userId;
    },

    getUser: async function (
        userUUId: string,
    
    ): Promise<User | null> {
        let userId = await this.getIdByUUId("User",userUUId);
        if (!userId) return null;

        return await User.findByPk(userId);
    },

    getUserByEmailAndPassword: async function (
        email: string,
        password: string
    ): Promise<User | null> {
        
        const user = User.findOne({
            where: {
                email: email
            }
        })
    },
        

    getUserAnswer: async function (
        userUUId: string,
        questionUUId: string
    ): Promise<Answer | null> {
        let questionId = await this.getIdByUUId("Question", questionUUId);
        if (!questionId) return null;

        let userId = await this.getIdByUUId("User", userUUId);
        if (!userId) return null;

        return await Answer.findOne({
            where: {
                userId: userId,
                questionId: questionId,
            },
        });
    },
    
    async getLesson(lessonUUId: string): Promise<Lesson | null>{
        let lessonId = await this.getIdByUUId("Lesson", lessonUUId);
        if (!lessonId) return null;

        return await Lesson.findByPk(lessonId),
    },

    // async getUUIDById(model: string, id: number) {
    //     let res = await db.sequelize.models[model].findOne({
    //         where: {
    //             id: id,
    //         },
    //     });

    //     return res?.uuid;
    // },

    async getNotation(id: number, url: string) {
        const model = Object.values(db.sequelize.models).find(
            (m: any) => m.name.toLowerCase() == url.substring(1, url.length - 3)
        ) as Model;

        /// TODO : repale createdat with name
        let notation = await db.sequelize.models[model.createdAt].findByPk(id);
        return notation;
    },
};


    // findRectOverlapsWithNewRect(
    //     boardType,
    //     parentId,
    //     fromRow,
    //     toRow,
    //     fromCol,
    //     toCol
    // ) {
    //     Object.getOwnPropertyNames(NotationType.prototype).forEach(
    //         (notationType) => {
    //             let model =
    //                 boardType.toLowerCase().capitalize() +
    //                 notationType.capitalize();
    //             let parentFieldName = boardType + "Id";
    //             let res = this.findRectOverlappingWithRect(
    //                 model,
    //                 parentFieldName,
    //                 parentId,
    //                 fromRow,
    //                 toRow,
    //                 fromCol,
    //                 toCol
    //             );
    //             if (!!res) return res;
    //         }
    //     );

    //     return null;
    // },

    // findRectOverlapsWithNewLine(
    //     boardType,
    //     parentId,
    //     fromRow,
    //     toRow,
    //     fromCol,
    //     toCol
    // ) {
    //     Object.getOwnPropertyNames(NotationType.prototype).forEach(
    //         (notationType) => {
    //             let model =
    //                 boardType.toLowerCase().capitalize() +
    //                 notationType.capitalize();
    //             let parentFieldName = boardType + "Id";
    //             let res = this.findRectOverlappingWithLine(
    //                 model,
    //                 parentFieldName,
    //                 parentId,
    //                 fromRow,
    //                 toRow,
    //                 fromCol,
    //                 toCol
    //             );
    //             if (!!res) return res;
    //         }
    //     );

    //     return null;
    // },

    /*Point*/
    // async findPointOverlappingWithPoint(
    //     model,
    //     parentFieldName,
    //     parentId,
    //     row,
    //     col
    // ) {
    //     return await db.sequelize.models[model].findOne({
    //         where: {
    //             [parentFieldName]: parentId,
    //             row: row,
    //             col: col,
    //         },
    //     });
    // },

    // async findPointOverlappingWithLine(
    //     model,
    //     parentFieldName,
    //     parentId,
    //     row,
    //     fromCol,
    //     toCol
    // ) {
    //     return await db.sequelize.models[model].findOne({
    //         where: {
    //             [parentFieldName]: parentId,
    //             row: row,
    //             col: { [Op.between]: [parseInt(fromCol), parseInt(toCol)] },
    //         },
    //     });
    // },

    // async findPointOverlappingWithRect(
    //     model,
    //     parentFieldName,
    //     parentId,
    //     fromRow,
    //     toRow,
    //     fromCol,
    //     toCol
    // ) {
    //     return await db.sequelize.models[model].findOne({
    //         where: {
    //             [parentFieldName]: parentId,
    //             col: { [Op.between]: [parseInt(fromCol), parseInt(toCol)] },
    //             row: { [Op.between]: [parseInt(fromRow), parseInt(toRow)] },
    //         },
    //     });
    // },

    // /*Line*/
    // async findLineOverlappingWithPoint(
    //     model,
    //     parentFieldName,
    //     parentId,
    //     row,
    //     col
    // ) {
    //     return await db.sequelize.models[model].findOne({
    //         where: {
    //             [parentFieldName]: parentId,
    //             row: row,
    //             [Op.gte]: { fromCol: fromCol },
    //             [Op.lte]: { toCol: toCol },
    //         },
    //     });
    // },

    // async findLineOverlappingWithLine(
    //     model,
    //     parentFieldName,
    //     parentId,
    //     row,
    //     fromCol,
    //     toCol
    // ) {
    //     return await db.sequelize.models[model].findOne({
    //         where: {
    //             [parentFieldName]: parentId,
    //             row: row,
    //             [Op.and]: {
    //                 [Op.or]: [
    //                     {
    //                         fromCol: {
    //                             [Op.between]: [
    //                                 parseInt(fromCol),
    //                                 parseInt(toCol),
    //                             ],
    //                         },
    //                     },
    //                     {
    //                         toCol: {
    //                             [Op.between]: [
    //                                 parseInt(fromCol),
    //                                 parseInt(toCol),
    //                             ],
    //                         },
    //                     },
    //                 ],
    //             },
    //         },
    //     });
    // },

    // async findLineOverlappingWithRect(
    //     model,
    //     parentFieldName,
    //     parentId,
    //     fromRow,
    //     toRow,
    //     fromCol,
    //     toCol
    // ) {
    //     await db.sequelize.models[model].findOne({
    //         where: {
    //             [parentFieldName]: parentId,
    //             row: { [Op.between]: [parseInt(fromRow), parseInt(toRow)] },
    //             [Op.and]: {
    //                 [Op.or]: [
    //                     {
    //                         fromCol: {
    //                             [Op.between]: [
    //                                 parseInt(fromCol),
    //                                 parseInt(toCol),
    //                             ],
    //                         },
    //                     },
    //                     {
    //                         toCol: {
    //                             [Op.between]: [
    //                                 parseInt(fromCol),
    //                                 parseInt(toCol),
    //                             ],
    //                         },
    //                     },
    //                 ],
    //             },
    //         },
    //     });
    // },

    // /*Rect*/
    // async findRectOverlappingWithPoint(
    //     model,
    //     parentFieldName,
    //     parentId,
    //     row,
    //     fromCol,
    //     toCol
    // ) {
    //     return await db.sequelize.models[model].findOne({
    //         where: {
    //             [parentFieldName]: parentId,
    //             [Op.gte]: { fromRow: row },
    //             [Op.lte]: { toRow: row },
    //             [Op.gte]: { fromCol: fromCol },
    //             [Op.lte]: { toCol: toCol },
    //         },
    //     });
    // },

    // async findRectOverlappingWithLine(
    //     model,
    //     parentFieldName,
    //     parentId,
    //     row,
    //     fromCol,
    //     toCol
    // ) {
    //     return await db.sequelize.models[model].findOne({
    //         where: {
    //             [parentFieldName]: parentId,
    //             [Op.gte]: { fromRow: row },
    //             [Op.lte]: { toRow: row },
    //             [Op.and]: {
    //                 [Op.or]: [
    //                     {
    //                         fromCol: {
    //                             [Op.between]: [
    //                                 parseInt(fromCol),
    //                                 parseInt(toCol),
    //                             ],
    //                         },
    //                     },
    //                     {
    //                         toCol: {
    //                             [Op.between]: [
    //                                 parseInt(fromCol),
    //                                 parseInt(toCol),
    //                             ],
    //                         },
    //                     },
    //                 ],
    //             },
    //         },
    //     });
    // },

    // async findRectOverlappingWithRect(
    //     model,
    //     parentFieldName,
    //     parentId,
    //     fromRow,
    //     toRow,
    //     fromCol,
    //     toCol
    // ) {
    //     await db.sequelize.models[model].findOne({
    //         where: {
    //             [parentFieldName]: parentId,
    //             [Op.or]: [
    //                 {
    //                     fromRow: {
    //                         [Op.between]: [parseInt(fromRow), parseInt(toRow)],
    //                     },
    //                 },
    //                 {
    //                     toRow: {
    //                         [Op.between]: [parseInt(fromRow), parseInt(toRow)],
    //                     },
    //                 },
    //             ],
    //             [Op.and]: {
    //                 [Op.or]: [
    //                     {
    //                         fromCol: {
    //                             [Op.between]: [
    //                                 parseInt(fromCol),
    //                                 parseInt(toCol),
    //                             ],
    //                         },
    //                     },
    //                     {
    //                         toCol: {
    //                             [Op.between]: [
    //                                 parseInt(fromCol),
    //                                 parseInt(toCol),
    //                             ],
    //                         },
    //                     },
    //                 ],
    //             },
    //         },
    //     });
    // },
