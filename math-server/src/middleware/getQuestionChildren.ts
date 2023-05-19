"use strict";
const dbUtil = require("../../../math-db/build/dbUtil");

export default {
    list: {
        fetch: {
            before: async (req: any, res: any, context: any) => {
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
            after: async (req: any, res: any, context: any) => {
                context.instance.forEach(async (n: any) => {
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
