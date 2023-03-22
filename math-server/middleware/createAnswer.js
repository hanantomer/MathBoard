"use strict";
const dbUtil = require("math-db/src/dbUtil");

module.exports = {
    create: {
        write: {
            before: async (req, res, context) => {
                // check if exists
                let answer = await dbUtil.findUserAnswer(
                    req.body.UserId,
                    req.body.QuestionId
                );
                if (!!answer) {
                    context.instance = answer;
                    return context.skip;
                }

                return context.continue;
            },
            // eagerly load student with answer after creation
            // after: async (req, res, context) => {
            //     let questionId = await dbUtil.getIdByUUID(
            //         "Question",
            //         context.instance.dataValues.QuestionUUId
            //     );
            //     context.instance =
            //         await dbUtil.getAnswerWithStudentQuestionAndLesson(
            //             questionId
            //         );

            //     return context.continue;
            // },
        },
    },
};
