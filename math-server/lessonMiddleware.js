"use strict";
const dbUtil = require("math-db/src/dbUtil");

module.exports = {
    read: {
        send: {
            before: async (req, res, context) => {
                if (!!req.body.LessonId) {
                    delete req.body.LessonId;
                }
                if (!!res.data.QuestionId) {
                    delete req.body.QuestionId;
                }
                return context.continue;
            },
        },
    },
    create: {
        write: {
            before: async (req, res, context) => {
                if (!!req.body.LessonUUId) {
                    req.body.LessonId = await dbUtil.getIdByUUID(
                        "Lesson",
                        req.body.LessonUUId
                    );
                }
                if (!!req.body.QuestionUUId) {
                    req.body.QuestionId = await dbUtil.getIdByUUID(
                        "Question",
                        req.body.QuestionUUId
                    );
                }

                return context.continue;
            },
            after: async (req, res, context) => {
                if (!!context.instance.dataValues.LessonId) {
                    context.instance.dataValues.LessonId = null;
                }
                if (!!context.instance.dataValues.QuestionId) {
                    context.instance.dataValues.QuestionId = null;
                }
                return context.continue;
            },
        },
    },
    list: {
        fetch: {
            before: async (req, res, context) => {
                if (!!req.query.LessonUUId) {
                    req.query.lessonId = await dbUtil.getIdByUUID(
                        "Lesson",
                        req.query.LessonUUId
                    );
                    delete req.query.LessonUUId;
                }
                if (!!req.query.questionUUId) {
                    req.query.questionUUId = await dbUtil.getIdByUUID(
                        "Question",
                        req.query.questionUUId
                    );
                    delete req.query.LessonUUId;
                }
                return context.continue;
            },
        },
    },
};
