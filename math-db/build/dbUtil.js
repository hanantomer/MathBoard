"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
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
exports.default = {
    isTeacher: function (userId, lessonId) {
        return __awaiter(this, void 0, void 0, function* () {
            let lessonModel = yield db.sequelize.models["Lesson"].findByPk(lessonId);
            return lessonModel && lessonModel.user.id === userId;
        });
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
    findUserAnswer(userId, questionId) {
        return __awaiter(this, void 0, void 0, function* () {
            let answer = yield db.sequelize.models["Answer"]
                .scope("existsScope")
                .findOne({
                where: {
                    UserId: userId,
                    QuestionId: questionId,
                },
            });
            return answer;
        });
    },
    getIdByUUID(model, uuid) {
        return __awaiter(this, void 0, void 0, function* () {
            let res = yield db.sequelize.models[model].findOne({
                attributes: {
                    include: ["id"],
                },
                where: {
                    uuid: uuid,
                },
            });
            return res === null || res === void 0 ? void 0 : res.id;
        });
    },
    getUUIDById(model, id) {
        return __awaiter(this, void 0, void 0, function* () {
            let res = yield db.sequelize.models[model].findOne({
                where: {
                    id: id,
                },
            });
            return res === null || res === void 0 ? void 0 : res.uuid;
        });
    },
    getLesson(lessonUUId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db.sequelize.models["Lesson"].findOne({
                where: {
                    uuid: lessonUUId,
                },
            });
        });
    },
    getNotation(id, url) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = Object.values(db.sequelize.models).find((m) => m.name.toLowerCase() == url.substring(1, url.length - 3));
            /// TODO : repale createdat with name
            let notation = yield db.sequelize.models[model.createdAt].findByPk(id);
            return notation;
        });
    },
};
//# sourceMappingURL=dbUtil.js.map