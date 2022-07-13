"use strict";
const db = require("./models/index");
const { Op } = require("sequelize");

const accessLinkCache = new Map();

module.exports = {
    parseLessonId: async function (lessonId) {
        if (this.lessonIdFromAccessLink(lessonId)) {
            let accessLink = null;
            try {
                if (!accessLinkCache.has(lessonId)) {
                    accessLinkCache.set(
                        lessonId,
                        await this.getAccessLink(lessonId)
                    );
                }
                accessLink = accessLinkCache.get(lessonId);
            } catch (e) {
                console.debug(
                    `error parsing lesson id ${lessonId}, error:{e}`
                );
            }
            if (!accessLink) {
                console.error(
                    `accessLink for suffix:${lessonId} not found,lessonId unknown`
                );
                return;
            }
            return Number(accessLink.LessonId);
        }
        return Number(lessonId);
    },
    lessonIdFromAccessLink: function (lessonId) {
        return !!lessonId ? lessonId.toString().indexOf("l_") === 0 : null;
    },
    //TODO use cahce
    getAccessLink: function (lessonLink) {
        let accessLink = db.sequelize.models["AccessLink"].findOne({
            where: {
                link: { [Op.endsWith]: lessonLink },
            },
        });
        if (!accessLink) {
            console.debug(
                `lessonMiddleware, accessLink not found for:${lessonLink}`
            );
            return null;
        }

        return accessLink;
    },

    isAdmin: async function (userId, lessonId) {
        let lesson = await db.sequelize.models["Lesson"].findOne({
            where: {
                id: lessonId,
            },
        });

        return !!lesson && lesson.UserId === userId;
    },
};
