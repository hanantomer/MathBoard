"use strict";
const bcryptjs = require("bcryptjs");
module.exports = {
    list: {
        fetch: {
            after: function (req, res, context) {
                // return token produced during authorization
                context.instance[0].access_token = context.user.access_token;
                delete context.instance[0].password;
                return context.continue;
            },
        },
    },
};
