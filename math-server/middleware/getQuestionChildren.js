"use strict";
const dbUtil = require("math-db/src/dbUtil");

module.exports = {
    list: {
        fetch: {
            before: async (req, res, context) => {
                if (!!req.query.QuestionUUId) {
                    req.query.QuestionId = await dbUtil.getIdByUUID(
                        "Question",
                        req.query.QuestionUUId
                    );
                    delete req.query.QuestionUUId;
                }

                return context.continue;
            },
            // replace id with QuestionUUId
            after: async (req, res, context) => {
                context.instance.forEach(async (n) => {
                    n.dataValues.QuestionUUId = await dbUtil.getUUIDById(
                        "Question",
                        n.dataValues.QuestionId
                    );
                    n.QuestionId = null;
                });
                return context.continue;
            },
        },
    },
};