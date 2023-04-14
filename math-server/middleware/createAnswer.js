"use strict";
const dbUtil = require("math-db/src/dbUtil");

module.exports = {
    create: {
        write: {
            before: async (req, res, context) => {
                // check if exists
                let answer = await dbUtil.findUserAnswer(
                    context.user.id,
                    req.body.QuestionId
                );
                if (!!answer) {
                    context.instance = answer;
                    return context.skip;
                }

                return context.continue;
            },
        },
    },
};
