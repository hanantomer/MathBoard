"use strict";
const dbUtil = require("math-db/src/dbUtil");

module.exports = {
    update: {
        write: {
            // before save get QuestionId from QuestionUUId
            before: async (req, res, context) => {
                if (!!req.body.QuestionUUId) {
                    req.body.QuestionId = await dbUtil.getIdByUUID(
                        "Question",
                        req.body.QuestionUUId
                    );
                }

                return context.continue;
            },
        },
    },
};
