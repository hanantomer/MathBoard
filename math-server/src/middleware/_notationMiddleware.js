"use strict";

const dbUtil = require("math-db/src/dbUtil");

export default {
    list: {
        fetch: {
            before: async (req: any, res: any, context: any) => {
                if (
                    !!req.query.boardType &&
                    !!req.query.id &&
                    !!req.query.fromCol &&
                    !!req.query.toCol &&
                    !!req.query.fromRow &&
                    !!req.query.toRow
                ) {
                    let ovelapedNotation =
                        await dbUtil.findRectOverlapsWithNewRect(
                            req.query.boardType,
                            req.query.id,
                            req.query.fromRow,
                            req.query.toRow,
                            req.query.fromCol,
                            req.query.toCol
                        );
                    res.status(200).json(ovelapedNotation);
                    return context.stop;
                }
                if (
                    !!req.query.boardType &&
                    !!req.query.id &&
                    !!req.query.fromCol &&
                    !!req.query.toCol
                ) {
                    let ovelapedNotation =
                        await dbUtil.findRectOverlapsWithNewLine(
                            req.query.boardType,
                            req.query.id,
                            req.query.fromRow,
                            req.query.toRow
                        );
                    res.status(200).json(ovelapedNotation);
                    return context.stop;
                }

                return context.continue;
            },
        },
    },
};
