"use strict";
const dbUtil = require("../../../math-db/build/dbUtil");

export default {
    update: {
        write: {
            // before save get AnswerId from AnswerUUId
            before: async (req: any, res: any, context: any) => {
                if (!!req.body.LessonUUId) {
                    req.body.LessonId = await dbUtil.getIdByUUID(
                        "Lesson",
                        req.body.LessonUUId
                    );
                }

                return context.continue;
            },
        },
    },
};
