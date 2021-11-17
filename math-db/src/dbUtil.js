"use strict";
const db = require("./models/index");
const { Op } = require("sequelize");

module.exports = {
    parseExerciseId: async function (exerciseId) {
        //TODO use cahce
        if (this.exerciseIdFromAccessLink(exerciseId)) {
            let accessLink = await this.getAccessLink(exerciseId);
            if (!accessLink) {
                console.error(
                    `accessLink for suffix:${exerciseId} not found,exerciseId unknown`
                );
                return;
            }
            exerciseId = accessLink.ExerciseId;
        }
        return exerciseId;
    },
    exerciseIdFromAccessLink: function (exerciseId) {
        return exerciseId.toString().indexOf("l_") === 0;
    },
    getAccessLink: function (exerciseLink) {
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
