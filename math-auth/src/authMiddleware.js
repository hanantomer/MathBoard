/**
 * used in conjunction with finalle rest to authorize requests
 */
"use strict";
const authUtil = require("./authUtil");
var ForbiddenError = require("finale-rest").Errors.ForbiddenError;

module.exports = {
    list: {
        auth: async (req, res, context) => {
            let authorized = false;

            if (!!req.query.password) {
                context.token = await authUtil.authByLocalPassword(
                    req.query.email,
                    req.query.password,
                    context
                );
                authorized = !!context.token;
            } else if (
                !!req.headers.authorization &&
                req.headers.authorization.indexOf("Bearer") == 0
            ) {
                authorized = await authUtil.authByGoogleToken(
                    req.headers.authorization
                );
            } else if (!!req.headers.authorization) {
                authorized = await authUtil.authByLocalToken(
                    req.headers.authorization
                );
            }
            if (!authorized) {
                throw new ForbiddenError();
            }
            return context.continue();
        },
    },
};
