import dbUtil from "../../../math-db/build/dbUtil";

export default {
    create: {
        write: {
            // replace LessonUUId with id
            before: async (req: any, res: any, context: any) => {
                if (!!req.body.LessonUUId) {
                    req.body.LessonId = await dbUtil.getIdByUUID(
                        "Lesson",
                        req.body.LessonUUId
                    );
                }
                return context.continue;
            },
            // replace id with LessonUUId
            after: async (req: any, res: any, context: any) => {
                if (!!context.instance.dataValues.LessonId) {
                    context.instance.dataValues.LessonUUId =
                        await dbUtil.getUUIDById(
                            "Lesson",
                            context.instance.dataValues.LessonId
                        );
                    context.instance.dataValues.LessonId = null;
                }
                return context.continue;
            },
        },
    },
};
