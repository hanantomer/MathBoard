/**
 * used in conjunction with finalle rest to authorize requests
 */
"use strict";
const authUtil = require("./authUtil");

async function auth(token, res, context, callback) {
    let authResult = await callback(token, res);
    if (!authResult) {
        context.stop();
        throw new Error("forebidden");
    }
    context.continue();
    return authResult;
}

module.exports = {
    list: {
        auth: async (req, res, context) => {
            let user = null;
            if (
                !!req.headers.authorization &&
                req.headers.authorization.indexOf("Bearer") == 0
            ) {
                user = await auth(
                    req.headers.authorization,
                    res,
                    context,
                    authUtil.authByGoogleToken
                );
            } else if (!!req.headers.authorization) {
                user = await auth(
                    req.headers.authorization,
                    res,
                    context,
                    authUtil.authByLocalToken
                );
            } else if (!!req.query.password) {
                user = await authUtil.authByLocalPassword(
                    req.query.email,
                    req.query.password,
                    res,
                    context
                );
            } else {
                throw new Error("Unauthorized");
            }

            if (!!user) {
                res.json(user);
            } else {
                res.status(401).json({});
            }
            return context.continue();
        },
    },
};
