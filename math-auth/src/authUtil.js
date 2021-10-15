"use strict";
const db = require("math-db/src/models/index");
const jwt = require("jsonwebtoken");
const bcryptjs = require("bcryptjs");
const { OAuth2Client } = require("google-auth-library");
const clientSecretData = require("../client_secret.json");
const oAuth2client = new OAuth2Client(clientSecretData.web.client_id);

module.exports = {
    authByLocalPassword: async function (email, password, res) {
        let user = await db.sequelize.models["User"].findOne({
            where: { email: email },
        });
        if (!user) {
            // invalid user
            //res.status(401).json({});
            return;
        } else {
            // validate password
            let passwordMatched =
                !!user && (await bcryptjs.compare(password, user.password));
            if (passwordMatched) {
                user.token = jwt.sign(
                    { email: user.email },
                    clientSecretData.client_secret,
                    { expiresIn: 86400 * 30 }
                );
                //res.json({
                //    email: user.email,
                //    name: user.name,
                //    id: user.id,
                //    token: user.token,
                //});
                return user;
            } else {
                return;
                //res.status(401).json({});
            }
        }
    },
    authByLocalToken: async function (token) {
        let decodedToken = jwt.verify(token, clientSecretData.client_secret);
        // TODO - check expiration
        let user = await db.sequelize.models["User"].findOne({
            where: { email: decodedToken.email },
        });
        return user;
    },
    authByGoogleToken: async function (token) {
        const ticket = await oAuth2client
            .verifyIdToken({
                idToken: token.replace("Bearer ", ""),
                audience: clientSecretData.web.client_id,
            })
            .catch(console.error);
        if (!!ticket) {
            let user = await db.sequelize.models["User"].findOne({
                where: { email: ticket.payload.email },
            });
            return user;
        }
    },
};
