"use strict";
const dbUtil = require("../../../math-db/build/dbUtil");

export default {
    update: {
        write: {
            // before save get AnswerId from AnswerUUId
            before: async (req: any, res: any, context: any) => {
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
