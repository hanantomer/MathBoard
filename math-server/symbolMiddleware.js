"use strict";
const dbUtil = require("math-db/src/dbUtil");
module.exports = {
    create: {
        write: {
            before: async (req, res, context) => {
                if (
                    !!req.body.exerciseId &&
                    req.body.exerciseId.indexOf("l_") === 0
                ) {
                    let accessLink = await dbUtil.getExerciseId(
                        req.query.exerciseId
                    );

                    if (!!accessLink) {
                        req.body.exerciseId = accessLink.ExerciseId;
                    }
                }

                return context.continue;
            },
        },
    },
    list: {
        fetch: {
            before: async (req, res, context) => {
                console.debug(
                    `symbolMiddleware, req.query:${JSON.stringify(req.query)}`
                );
                // replace link with actual exerciseId
                if (
                    !!req.query.exerciseId &&
                    req.query.exerciseId.indexOf("l_") === 0
                ) {
                    let accessLink = await dbUtil.getExerciseId(
                        req.query.exerciseId
                    );

                    if (!!accessLink) {
                        req.query.exerciseId = accessLink.ExerciseId;
                    }
                }
                return context.continue;
            },
        },
    },
};
