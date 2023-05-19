"use strict";
const dbUtil = require("../../../math-db/build/dbUtil");

export default {
    list: {
        fetch: {
            before: async (req: any, res: any, context: any) => {
                if (!!req.query.AnswerUUId) {
                    req.query.AnswerId = await dbUtil.getIdByUUID(
                        "Answer",
                        req.query.AnswerUUId
                    );
                }

                return context.continue;
            },
            // replace id with AnswerUUId
            // after: async (req: any, res: any, context: any) => {
            //     if (!!context.instance.dataValues.AnswerId) {
            //         context.instance.dataValues.AnswerUUId =
            //             await dbUtil.getUUIDById(
            //                 "Answer",
            //                 context.instance.dataValues.AnswerId
            //             );
            //     }
            //     return context.continue;
            // },

            after: async (req: any, res: any, context: any) => {
                context.instance.forEach(async (n: any) => {
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
