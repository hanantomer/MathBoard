"use strict";
const dbUtil = require("math-db/src/dbUtil");

function lessonIdFromAccessLink(lessonId) {
    return lessonId.indexOf("l_") === 0;
}

module.exports = {
    create: {
        write: {
            before: async (req, res, context) => {
                if (!!req.body.LessonId) {
                    req.body.LessonId = await dbUtil.parseLessonId(
                        req.body.LessonId
                    );
                }

                return context.continue;
            },
        },
    },
    list: {
        fetch: {
            before: async (req, res, context) => {
                //console.debug(
                //    `lessonMiddleware, req.query:${JSON.stringify(req.query)}`
                //);
                // replace link with actual lessonId
                if (!!req.query.lessonId) {
                    req.query.lessonId = await dbUtil.parseLessonId(
                        req.query.lessonId
                    );
                }
                if (!!req.query.id) {
                    // when coming from getLesson
                    req.query.id = await dbUtil.parseLessonId(req.query.id);
                }

                return context.continue;
            },
        },
    },
};
