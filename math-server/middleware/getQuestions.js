"use strict";
const dbUtil = require("math-db/src/dbUtil");

module.exports = {
    list: {
        fetch: {
            // eagerly load lesson name with question
            // before: async (req, res, context) => {
            //     context.instance = await dbUtil.getQuestionsWithLesson(
            //         !!req.query.LessonId
            //             ? { LessonId: req.query.LessonId }
            //             : null
            //     );
            //     context.instance.forEach(async (a) => {
            //         delete a.LessonId;
            //     });
            //     return context.skip;
            // },
        },
    },
};
