"use strict";
const dbUtil = require("../../../math-db/build/dbUtil");

export default {
    list: {
        fetch: {
            before: async (req: any, res: any, context: any) => {
                if (!!req.query.LessonUUId) {
                    req.query.LessonId = await dbUtil.getIdByUUID(
                        "Lesson",
                        req.query.LessonUUId
                    );
                }
                return context.continue;
            },
            // replace id with LessonUUId
            after: async (req: any, res: any, context: any) => {
                for (const i in context.instance) {
                    context.instance[i].dataValues.LessonUUId =
                        await dbUtil.getUUIDById(
                            "Lesson",
                            context.instance[i].dataValues.LessonId
                        );
                }
                return context.continue;
            },
        },
    },
};
