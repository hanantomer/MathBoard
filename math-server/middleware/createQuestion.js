"use strict";
const dbUtil = require("math-db/src/dbUtil");

module.exports = {
    create: {
        write: {
            // add lesson to result
            after: async (req, res, context) => {
                context.instance.dataValues.Lesson = await dbUtil.getLesson(
                    context.instance.dataValues.LessonUUId
                );

                return context.continue;
            },
        },
    },
};