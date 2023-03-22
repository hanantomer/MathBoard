"use strict";
const dbUtil = require("math-db/src/dbUtil");

module.exports = {
    create: {
        write: {
            // replace QuestionUUId with id
            before: async (req, res, context) => {
                if (!!req.body.QuestionUUId) {
                    req.body.QuestionId = await dbUtil.getIdByUUID(
                        "Question",
                        req.body.QuestionUUId
                    );
                }

                return context.continue;
            },
            // replace id with QuestionUUId
            after: async (req, res, context) => {
                if (!!context.instance.dataValues.QuestionId) {
                    context.instance.dataValues.QuestionUUId =
                        await dbUtil.getUUIDById(
                            "Question",
                            context.instance.dataValues.QuestionId
                        );
                }
                return context.continue;
            },
        },
    },
};
