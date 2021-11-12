"use strict";
const db = require("./models/index");
const { Op } = require("sequelize");

module.exports = {
    getExerciseId: function (exerciseLink) {
        let accessLink = db.sequelize.models["AccessLink"].findOne({
            where: {
                link: { [Op.endsWith]: exerciseLink },
            },
        });
        if (!accessLink) {
            console.debug(
                `symbolMiddleware, accessLink not found for:${req.query.exerciseId}`
            );
            return null;
        }

        return accessLink;
    },
};
