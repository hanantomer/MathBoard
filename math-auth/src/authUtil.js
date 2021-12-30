"use strict";
const db = require("math-db/src/models/index");
const jwt = require("jsonwebtoken");
const bcryptjs = require("bcryptjs");
const { OAuth2Client } = require("google-auth-library");
const clientSecretData = require("../client_secret.json");
const oAuth2client = new OAuth2Client(clientSecretData.web.client_id);

const userCache = new Map();

module.exports = {
    authByLocalPassword: async function (email, password) {
        //TODO add caching
        let user = await db.sequelize.models["User"].findOne({
            where: { email: email },
        });
        if (!user) {
            return null;
        }
        // validate password
        let passwordMatched =
            !!user && (await bcryptjs.compare(password, user.password));
        if (passwordMatched) {
            let access_token = jwt.sign(
                { email: user.email },
                clientSecretData.client_secret,
                { expiresIn: 86400 * 30 }
            );
            user.access_token = access_token;
            return user;
        }
        return null;
    },
    authByLocalToken: async function (access_token) {
        let decodedToken = jwt.verify(
            access_token,
            clientSecretData.client_secret
        );
        //        console.debug(
        //            `authByLocalToken decodedToken:${JSON.stringify(decodedToken)}`
        //        );
        // TODO - check expiration
        if (!userCache[decodedToken.email]) {
            userCache[decodedToken.email] = await db.sequelize.models[
                "User"
            ].findOne({
                where: { email: decodedToken.email },
            });
        }
        return userCache[decodedToken.email];
    },
    authByGoogleToken: async function (access_token) {
        const ticket = await oAuth2client
            .verifyIdToken({
                idToken: access_token.replace("Bearer ", ""),
                audience: clientSecretData.web.client_id,
            })
            .catch(console.error); //TODO log error

        //        console.debug(`authByGoogleToken ticket:${ticket}`);
        if (!!ticket) {
            let user = await db.sequelize.models["User"].findOne({
                where: { email: ticket.payload.email },
            });
            return user;
        }
    },
};
