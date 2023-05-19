"use strict";
const dbUtil = require("../../../math-db/build/dbUtil");

export default {
    create: {
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
            // after save replace result id with uuid
            after: async (req: any, res: any, context: any) => {
                if (!!context.instance.dataValues.AnswerId) {
                    context.instance.dataValues.AnswerUUId =
                        await dbUtil.getUUIDById(
                            "Answer",
                            context.instance.dataValues.AnswerId
                        );

                    context.instance.dataValues.AnswerId = null;
                }

                return context.continue;
            },
        },
    },
};
