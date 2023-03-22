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
                }

                return context.continue;
            },
            // replace id with AnswerUUId
            after: async (req, res, context) => {
                if (!!context.instance.dataValues.AnswerId) {
                    context.instance.dataValues.AnswerUUId =
                        await dbUtil.getUUIDById(
                            "Answer",
                            context.instance.dataValues.AnswerId
                        );
                }
                return context.continue;
            },

            after: async (req, res, context) => {
                context.instance.forEach(async (n) => {
                    n.dataValues.AnswerUUId = await dbUtil.getUUIDById(
                        "Answer",
                        n.dataValues.AnswerId
                    );
                });
                return context.continue;
            },
        },
    },
};
