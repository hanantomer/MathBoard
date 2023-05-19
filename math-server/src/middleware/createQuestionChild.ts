"use strict";
const dbUtil = require("../../../math-db/build/dbUtil");

export default {
    create: {
        write: {
            // replace QuestionUUId with id
            before: async (req: any, res: any, context: any) => {
                if (!!req.body.QuestionUUId) {
                    req.body.QuestionId = await dbUtil.getIdByUUID(
                        "Question",
                        req.body.QuestionUUId
                    );
                }

                return context.continue;
            },
            // replace id with QuestionUUId
            after: async (req: any, res: any, context: any) => {
                if (!!context.instance.dataValues.QuestionId) {
                    context.instance.dataValues.QuestionUUId =
                        await dbUtil.getUUIDById(
                            "Question",
                            context.instance.dataValues.QuestionId
                        );
                }
                return context.continue;
            },
        },
    },
};
