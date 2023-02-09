"use strict";
const dbUtil = require("math-db/src/dbUtil");

module.exports = {
    list: {
        fetch: {
            before: async (req, res, context) => {
                if (!!req.query.AnswerUUId) {
                    req.query.AnswerId = await dbUtil.getIdByUUID(
                        "Answer",
                        req.query.AnswerUUId
                    );
                    delete req.query.AnswerUUId;
                }

                return context.continue;
            },
        },
    },
};
