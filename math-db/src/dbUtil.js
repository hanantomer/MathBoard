"use strict";
const db = require("./models/index");
const { Op } = require("sequelize");

module.exports = {
    parseExerciseId: async function (exerciseId) {
        //TODO use cahce
        if (this.exerciseIdFromAccessLink(exerciseId)) {
            let accessLink = null;
            try {
                accessLink = await this.getAccessLink(exerciseId);
            } catch (e) {
                console.debug(
                    `error parsing exercise id ${exerciseId}, error:{e}`
                );
            }
            if (!accessLink) {
                console.error(
                    `accessLink for suffix:${exerciseId} not found,exerciseId unknown`
                );
                return;
            }
            return accessLink.ExerciseId;
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
                `exerciseMiddleware, accessLink not found for:${exerciseLink}`
            );
            return null;
        }

        return accessLink;
    },

    deleteMultipleSymbols: function (ids) {
        db.sequelize.models["Symbol"].destroy({
            where: {
                id: {
                    [Op.in]: ids.split(","),
                },
            },
        });
    },
};