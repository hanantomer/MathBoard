import {
    Model
} from "sequelize-typescript";
const db = require("./models/index");
const { Op } = require("sequelize");

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

module.exports = {
    isTeacher: async function (userId, lessonId) {
        let lesson = await db.sequelize.models["Lesson"].findByPk(lessonId);
        return !!lesson && lesson.UserId === userId;
    },

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

    async findUserAnswer(userId: number, questionId: number) {
        let answer = await db.sequelize.models["Answer"]
            .scope("existsScope")
            .findOne({
                where: {
                    UserId: userId,
                    QuestionId: questionId,
                },
            });
        return answer;
    },

    async getIdByUUID(model, uuid) {
        let res = await db.sequelize.models[model].findOne({
            attributes: {
                include: ["id"],
            },
            where: {
                uuid: uuid,
            },
        });

        return res?.id;
    },
    async getUUIDById(model, id) {
        let res = await db.sequelize.models[model].findOne({
            where: {
                id: id,
            },
        });

        return res?.uuid;
    },

    async getLesson(lessonUUId: string) {
        return await db.sequelize.models["Lesson"].findOne({
            where: {
                uuid: lessonUUId,
            },
        });
    },

    async getNotation(id: number, url: string) {
        
        let modelName = Object.values(db.sequelize.models).find(
            (m: any) => m.name.toLowerCase() == url.substring(1, url.length - 3)
        ).name;

        let notation = await db.sequelize.models[modelName].findByPk(id);
        return notation;
    },
};
