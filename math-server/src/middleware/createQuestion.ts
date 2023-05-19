"use strict";
const dbUtil = require("../../../math-db/build/dbUtil");

export default {
    create: {
        write: {
            after: async (req: any, res: any, context: any) => {
                context.instance.dataValues.Lesson = await dbUtil.getLesson(
                    context.instance.dataValues.LessonUUId
                );
                return context.continue;
            },
        },
    },
};
