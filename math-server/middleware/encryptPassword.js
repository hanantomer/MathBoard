"use strict";
const bcryptjs = require("bcryptjs");
module.exports = {
    create: {
        write: {
            before: async (req, res, context) => {
                if (!!req.body.password) {
                    // encrypt the password
                    req.body.password = await bcryptjs.hash(
                        req.body.password,
                        8
                    );
                }
                return context.continue;
            },
        },
    },
};
