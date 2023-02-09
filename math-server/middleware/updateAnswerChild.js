"use strict";
const dbUtil = require("math-db/src/dbUtil");

module.exports = {
    update: {
        write: {
            // before save get AnswerId from AnswerUUId
            before: async (req, res, context) => {
                if (!!req.body.AnswerUUId) {
                    req.body.AnswerId = await dbUtil.getIdByUUID(
                        "Answer",
                        req.body.AnswerUUId
                    );
                }

                return context.continue;
            },
        },
    },
};
