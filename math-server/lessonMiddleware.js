"use strict";
const dbUtil = require("math-db/src/dbUtil");

module.exports = {
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
                    context.instance.dataValues.LessonUUId =
                        await dbUtil.getIdByUUID(
                            "Lesson",
                            context.instance.dataValues.LessonId
                        );

                    context.instance.dataValues.LessonId = null;
                }
                if (!!context.instance.dataValues.QuestionId) {
                    context.instance.dataValues.QuestionUUId =
                        await dbUtil.getIdByUUID(
                            "Question",
                            context.instance.dataValues.QuestionId
                        );

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
                    req.query.LessonId = await dbUtil.getIdByUUID(
                        "Lesson",
                        req.query.LessonUUId
                    );
                    delete req.query.LessonUUId;
                }
                if (!!req.query.QuestionUUId) {
                    req.query.QuestionUUId = await dbUtil.getIdByUUID(
                        "Question",
                        req.query.QuestionUUId
                    );
                    delete req.query.LessonUUId;
                }
                return context.continue;
            },
        },
    },
};
