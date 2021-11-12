/**
 * used in conjunction with finalle rest to authorize requests
 */
"use strict";
const authUtil = require("./authUtil");
var ForbiddenError = require("finale-rest").Errors.ForbiddenError;

module.exports = {
    list: {
        auth: async (req, res, context) => {
            console.debug(`auth start`);
            let user = null;

            if (!!req.query.password) {
                console.debug(`auth password:${req.query.password}`);
                user = await authUtil.authByLocalPassword(
                    req.query.email,
                    req.query.password,
                    context
                );
            } else if (
                !!req.headers.authorization &&
                req.headers.authorization.indexOf("Bearer") == 0
            ) {
                console.debug(
                    `Bearer auth headers.authorization:${req.headers.authorization}`
                );
                user = await authUtil.authByGoogleToken(
                    req.headers.authorization
                );
                // set email for upcoming find
                req.query.email = user.email;
            } else if (!!req.headers.authorization) {
                console.debug(
                    `auth headers.authorization:${req.headers.authorization}`
                );
                user = await authUtil.authByLocalToken(
                    req.headers.authorization
                );
                console.debug(`auth headers.authorization user:${user}`);
                // set email for upcoming find
                req.query.email = user.email;
            }
            if (!user) {
                throw new ForbiddenError();
            }
            context.access_token = user.access_token;
            return context.continue();
        },
    },
};
