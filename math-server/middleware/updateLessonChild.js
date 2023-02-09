"use strict";
const dbUtil = require("math-db/src/dbUtil");

module.exports = {
    update: {
        write: {
            // before save get AnswerId from AnswerUUId
            before: async (req, res, context) => {
                if (!!req.body.LessonUUId) {
                    req.body.LessonId = await dbUtil.getIdByUUID(
                        "Lesson",
                        req.body.LessonUUId
                    );
                }

                return context.continue;
            },
        },
    },
};
