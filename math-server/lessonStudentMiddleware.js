"use strict";
const dbUtil = require("math-db/src/dbUtil");

module.exports = {
    read: {
        send: {
            before: async (req, res, context) => {
                context.instance = await dbUtil.getStudentLessons(
                    req.query.UserId
                );
                return context.continue;
            },
        },
    },
};
