"use strict";
const authType = {
    none: "none",
    localToken: "localToken",
    googleToken: "googleToken",
    localPassword: "localPassword",
};

const authUtil = require("./authUtil");

module.exports = {
    list: {
        fetch: {
            before: async (req, res, context) => {
                if (req.headers["auth-type"] == authType.googleToken) {
                    await authUtil.authByGoogleToken(req, res);
                    return context.stop;
                } else if (req.headers["auth-type"] == authType.localToken) {
                    authUtil.authByLocalToken(req, res);
                    return context.stop;
                } else if (req.headers["auth-type"] == authType.localPassword) {
                    await authUtil.authByLocalPassword(req, res);
                    return context.stop;
                } else if (req.headers["auth-type"] == authType.none) {
                    await authUtil.authByLocalPassword(req, res);
                    return context.stop;
                } else {
                    throw new Error(
                        `auth type ${req.headers.auth} is not supported`
                    );
                }
            },
        },
    },
};
