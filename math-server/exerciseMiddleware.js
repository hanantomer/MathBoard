"use strict";
const db = require("math-db/src/models/index");
module.exports = {
    list: {
        fetch: {
            before: async (req, res, context) => {
                // replace link with actual exerciseId
                if (req.body.exerciseId.indexOf("l_") === 0) {
                    req.body.exerciseId = await db.sequelize.models[
                        "AccessLink"
                    ].findOne({
                        where: { link: req.body.exerciseId },
                    }).exerciseId;
                }
                return context.continue;
            },
        },
    },
};
