/**
 * used in conjunction with finalle rest to authorize requests
 */
"use strict";
const authUtil = require("./authUtil");
var ForbiddenError = require("finale-rest").Errors.ForbiddenError;

module.exports = {
    create: {
        auth: async (req, res, context) => {
            console.debug(`auth start`);
            let user = null;
            if (
                !!req.headers.authorization &&
                req.headers.authorization.indexOf("Bearer") == 0
            ) {
                user = await authBearer(req);
            } else if (!!req.headers.authorization) {
                user = await authLocal(req);
            }
            if (!user) {
                throw new ForbiddenError();
            }
            req.body.UserId = user.id;
            return context.continue();
        },
    },
    list: {
        auth: async (req, res, context) => {
            console.debug(`auth start`);
            let user = null;

            if (!!req.query.password) {
                user = await authPassword(req);
            } else if (
                !!req.headers.authorization &&
                req.headers.authorization.indexOf("Bearer") == 0
            ) {
                user = await authByBearer(req, user);
            } else if (!!req.headers.authorization) {
                user = await authLocal(req);
            }
            if (!user) {
                throw new ForbiddenError();
            }
            context.user = user;
            return context.continue();
        },
    },
};
async function authLocal(req) {
    console.debug(`auth headers.authorization:${req.headers.authorization}`);
    let user = await authUtil.authByLocalToken(req.headers.authorization);
    console.debug(`auth headers.authorization user:${user}`);
    // set email for upcoming find
    req.query.email = user.email;
    return user;
}

async function authBearer(req) {
    console.debug(
        `Bearer auth headers.authorization:${req.headers.authorization}`
    );
    let user = await authUtil.authByGoogleToken(req.headers.authorization);
    // set email for upcoming find
    req.query.email = user.email;
    return user;
}

async function authPassword(req) {
    console.debug(`auth password:${req.query.password}`);
    return await authUtil.authByLocalPassword(
        req.query.email,
        req.query.password
    );
}
