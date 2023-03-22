"use strict";
const dbUtil = require("math-db/src/dbUtil");

module.exports = {
    list: {
        //fetch: {
        // eagerly load student and lesson name with answer
        // before: async (req, res, context) => {
        //     context.instance =
        //         await dbUtil.getAnswerWithStudentQuestionAndLesson(
        //             !!req.query.QuestionId
        //                 ? { QuestionId: req.query.QuestionId }
        //                 : !!req.query.uuid
        //                 ? { uuid: req.query.uuid }
        //                 : null
        //         );
        //     return context.skip;
        // },
        //},
    },
};
