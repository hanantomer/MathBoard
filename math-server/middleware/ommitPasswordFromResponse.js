"use strict";
const bcryptjs = require("bcryptjs");
module.exports = {
    list: {
        fetch: {
            before: function (req, res, context) {
                if (!!req.query.password) {
                    // ommit password from where clause when user logs in
                    delete req.query.password;
                }
                return context.continue;
            },
        },
    },
};
