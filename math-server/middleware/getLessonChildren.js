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
                    delete req.query.LessonUUId;
                }
                return context.continue;
            },
        },
    },
};
