"use strict";
const bcryptjs = require("bcryptjs");
module.exports = {
    create: {
        write: {
            before: async (req, res, context) => {
                if (!!req.body.password) {
                    req.body.password = await bcryptjs.hash(
                        req.body.password,
                        8
                    );
                }
                return context.continue;
            },
        },
    },
    list: {
        fetch: {
            before: function (req, res, context) {
                if (!!req.query.password) {
                    // to allow get user without password in where clause
                    delete req.query.password;
                }
                return context.continue;
            },
            after: function (req, res, context) {
                // embed token produced during authorization
                // in order to return it to the client
                context.instance[0].access_token = context.user.access_token;
                delete context.instance[0].password;
                return context.continue;
            },
        },
    },
};
