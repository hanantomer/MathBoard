"use strict";
const dbUtil = require("math-db/src/dbUtil");

module.exports = {
    create: {
        write: {
            // replace LessonUUId with id
            before: async (req, res, context) => {
                if (!!req.body.LessonUUId) {
                    req.body.LessonId = await dbUtil.getIdByUUID(
                        "Lesson",
                        req.body.LessonUUId
                    );
                }
                return context.continue;
            },
            // replace id with LessonUUId
            after: async (req, res, context) => {
                if (!!context.instance.dataValues.LessonId) {
                    context.instance.dataValues.LessonUUId =
                        await dbUtil.getUUIDById(
                            "Lesson",
                            context.instance.dataValues.LessonId
                        );
                    context.instance.dataValues.LessonId = null;
                }
                return context.continue;
            },
        },
    },
};
