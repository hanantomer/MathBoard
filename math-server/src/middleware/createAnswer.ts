"use strict";
const dbUtil = require("../../../math-db/build/dbUtil");

export default {
    create: {
        write: {
            before: async (req: any, res: any, context: any) => {
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
