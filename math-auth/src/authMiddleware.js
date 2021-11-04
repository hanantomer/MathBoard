/**
 * used in conjunction with finalle rest to authorize requests
 */
"use strict";
const authUtil = require("./authUtil");
var ForbiddenError = require("finale-rest").Errors.ForbiddenError;

module.exports = {
    list: {
        auth: async (req, res, context) => {
            let user = null;

            if (!!req.query.password) {
                user = await authUtil.authByLocalPassword(
                    req.query.email,
                    req.query.password,
                    context
                );
            } else if (
                !!req.headers.authorization &&
                req.headers.authorization.indexOf("Bearer") == 0
            ) {
                user = await authUtil.authByGoogleToken(
                    req.headers.authorization
                );
                // set email for upcoming find
                req.query.email = user.email;
            } else if (!!req.headers.authorization) {
                user = await authUtil.authByLocalToken(
                    req.headers.authorization
                );
                // set email for upcoming find
                req.query.email = user.email;
            }
            if (!user) {
                throw new ForbiddenError();
            }
            context.token = user.token;
            return context.continue();
        },
    },
};
