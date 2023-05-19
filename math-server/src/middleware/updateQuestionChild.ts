"use strict";
const dbUtil = require("../../../math-db/build/dbUtil");

export default {
    update: {
        write: {
            // before save get QuestionId from QuestionUUId
            before: async (req: any, res: any, context: any) => {
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
