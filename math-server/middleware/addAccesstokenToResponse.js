"use strict";
const bcryptjs = require("bcryptjs");
module.exports = {
    list: {
        fetch: {
            after: function (req, res, context) {
                // return token produced during authorization
                context.instance = context.user;
                return context.continue;
            },
        },
    },
};
