"use strict";
const dbUtil = require("math-db/src/dbUtil");

function exerciseIdFromAccessLink(exerciseId) {
    return exerciseId.indexOf("l_") === 0;
}

module.exports = {
    create: {
        write: {
            before: async (req, res, context) => {
                if (!!req.body.ExerciseId) {
                    req.body.ExerciseId = await dbUtil.parseExerciseId(
                        req.body.ExerciseId
                    );
                }

                return context.continue;
            },
        },
    },
    list: {
        fetch: {
            before: async (req, res, context) => {
                console.debug(
                    `exerciseMiddleware, req.query:${JSON.stringify(req.query)}`
                );
                // replace link with actual exerciseId
                if (!!req.query.exerciseId) {
                    req.query.exerciseId = await dbUtil.parseExerciseId(
                        req.query.exerciseId
                    );
                }
                if (!!req.query.id) {
                    // when comiongfrom getExercise
                    req.query.id = await dbUtil.parseExerciseId(req.query.id);
                }

                return context.continue;
            },
        },
    },
};
