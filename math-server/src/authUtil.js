"use strict";
const db = require("./models/index.js");
const jwt = require("jsonwebtoken");
const bcryptjs = require("bcryptjs");
const env = process.env.NODE_ENV || "development";
const config = require("../server/config/config.json")[env];
const { OAuth2Client } = require("google-auth-library");
const clientSecretData = require("../client_secret.json");
const oAuth2client = new OAuth2Client(clientSecretData.web.client_id);

const authType = {
    localToken: "localToken",
    googleToken: "googleToken",
};

module.exports = {
    authByLocalPassword: async function (req, res) {
        let user = await db.User.findOne({ where: { email: req.query.email } });
        if (!user) {
            // invalid user
            res.status(401).json({});
        } else {
            // validate password
            let passwordMatched =
                !!user &&
                (await bcryptjs.compare(req.query.password, user.password));
            if (passwordMatched) {
                user.token = jwt.sign(
                    { email: user.email },
                    config.client_secret,
                    { expiresIn: 86400 * 30 }
                );
                res.status(200).json({
                    email: user.email,
                    name: user.name,
                    id: user.id,
                    token: user.token,
                });
            } else {
                res.status(401).json({});
            }
        }
    },
    authByLocalToken: async function (req, res) {
        let decodedToken = jwt.verify(
            req.headers.authorization,
            config.client_secret
        );
        // TODO - check expiration
        let user = await db.User.findOne({
            where: { email: decodedToken.email },
        });
        if (!!user) {
            res.status(200).json({ name: user.name, id: user.id });
        } else {
            res.status(401).json({});
        }
    },
    authByGoogleToken: async function (req, res) {
        const ticket = await oAuth2client
            .verifyIdToken({
                idToken: req.headers.authorization,
                audience: clientSecretData.web.client_id,
            })
            .catch(console.error);
        if (!!ticket) {
            let user = await db.User.findOne({
                where: { email: req.query.email },
            });
            if (!user) {
                res.status(401).json({});
            } else {
                res.status(200).json({ name: user.name, id: user.id });
            }
        }
    },
};
