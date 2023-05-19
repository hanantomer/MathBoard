"use strict";
const bcryptjs = require("bcryptjs");

export default {
    create: {
        write: {
            before: async (req: any, res: any, context: any) => {
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
