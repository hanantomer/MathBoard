"use strict";
const dbUtil = require("math-db/src/dbUtil");

module.exports = {
    create: {
        write: {
            // eagerly load student with answer after creation
            after: async (req, res, context) => {
                let questionId = await dbUtil.getIdByUUID(
                    "Question",
                    context.instance.dataValues.QuestionUUId
                );
                context.instance =
                    await dbUtil.getAnswersWithStudentQuestionAndLesson(
                        questionId
                    );
                if (context.instance.length > 0) {
                    delete context.instance[0].dataValues.QuestionId;
                    delete context.instance[0].dataValues.Question.id;
                }
                return context.continue;
            },
        },
    },
};
