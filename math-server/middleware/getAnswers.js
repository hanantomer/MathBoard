"use strict";
const dbUtil = require("math-db/src/dbUtil");

module.exports = {
    list: {
        fetch: {
            // eagerly load student and lesson name with answer
            before: async (req, res, context) => {
                context.instance =
                    await dbUtil.getAnswersWithStudentQuestionAndLesson(
                        !!req.query.QuestionId
                            ? { QuestionId: req.query.QuestionId }
                            : null
                    );

                context.instance.forEach(async (a) => {
                    a.QuestionUUId = req.query.QuestionUUId;
                    delete a.QuestionId;
                    delete a.LessonId;
                });

                return context.skip;
            },
        },
    },
};
