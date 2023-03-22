"use strict";
const dbUtil = require("math-db/src/dbUtil");

module.exports = {
    list: {
        fetch: {
            before: async (req, res, context) => {
                if (!!req.query.LessonUUId) {
                    req.query.LessonId = await dbUtil.getIdByUUID(
                        "Lesson",
                        req.query.LessonUUId
                    );
                }
                return context.continue;
            },
            // replace id with LessonUUId
            after: async (req, res, context) => {
                for (const i in context.instance) {
                    context.instance[i].dataValues.LessonUUId =
                        await dbUtil.getUUIDById(
                            "Lesson",
                            context.instance[i].dataValues.LessonId
                        );
                }
                return context.continue;
            },
        },
    },
};
