import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import useAuthUtil  from "../../math-auth/build/authUtil";
import useDb from  "../../math-db/build/dbUtil"
import connection from "../../math-db/build/models/index";
import { BoardTypeValues, NotationTypeValues } from "../../math-common/build/unions"


const authUtil = useAuthUtil();
const db = useDb();
let app = express();
app.use(auth);
app.use(cors());
app.use(express.json());
app.use(bodyParser.json({ limit: "10mb" }));
app.use(
    bodyParser.urlencoded({
        limit: "10mb",
        extended: true,
        parameterLimit: 5000,
    })
);




async function auth(req: Request, res: Response, next: NextFunction) {
    // omit authorization enforcement, when signing in.
    if (req.url.indexOf("/api/users?email") == 0) {
        next();
        return;
    }

    // verify authorization
    if (!await validateHeaderAuthentication(req, res, next)) {
        return;
    }

    next();
}


/*verifies that authenitication header exists and  denotes a valid user
if yes, set header userUUId
*/
async function validateHeaderAuthentication(req: Request, res: Response, next: NextFunction) : Promise<boolean>{
    if (!req.headers.authorization) {
        res = res.status(401).json("unauthorized");
        return false;
    }
    const user = await authUtil.authByLocalToken(
        req.headers.authorization.toString()
    );
    if (!user) {
        res = res.status(401).json("invalid token");
    }
    
    if (req.url.indexOf("/api/users") == 0) {
        res.json(user);
    }

    req.headers.userId = user?.id?.toString();
    return true;
}

app.get(
    "/api/users",
    async (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> => {
        // token already validate by interceptor. see validateHeaderAuthentication
        if (req.headers.authorization) {
            return res.status(200);
        }
        // by email/password
        const { email, password } = req.query;

        if (!email || !password) {
            return res.status(401).json("missing user or password");
        }

        try {
            const user = await authUtil.authByLocalPassword(
                email as string,
                password as string
            );
            if (!user) {
                return res.status(401);
            }
            return res.status(200).json(user);
        }
        catch (err) {
            next(err);
        }
        
    }
);

app.post(
    "/api/users",
    async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | undefined> => {
        try {
            return res.status(200).json(await db.createUser(req.body));
        } catch (error) {
            next(error);
        }
    }
);

// student
app.get("/api/students", async (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> => {
    try {
        const { uuid } = req.query;
 
        if (!uuid) throw new Error("invalid arguments user uuid  must be supplied");
    
        return res.status(200).json(await db.getUser(uuid as string));
    }
    catch (err) {
        next(err);
    }
});

// lesson
app.get(
    "/api/lessons",
    async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | undefined> => {
        try {
            const { userUUId, lessonUUId } = req.query;
            if (userUUId)
                return res
                    .status(200)
                    .json(await db.getLessons(userUUId as string));
            if (lessonUUId)
                return res
                    .status(200)
                    .json(await db.getLesson(lessonUUId as string));

            throw new Error(
                "invalid arguments either userUUId or lessonUUId must be supplied"
            );
        }
        catch (err) {
            next(err);
        }
    }
);

app.post(
    "/api/lessons",
    async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | undefined> => {
        try {
            return res.status(200).json(await db.createLesson(req.body));
        }
        catch (err) {
            next(err);
        }
    }
);

// question

app.get(
    "/api/questions",
    async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | undefined> => {
        try {
            const { uuid, lessonUUId } = req.query;
            if (lessonUUId)
                return res
                    .status(200)
                    .json(await db.getQuestions(lessonUUId as string));
            if (uuid)
                return res.status(200).json(await db.getQuestion(uuid as string));

            throw new Error("either lessonUUId or questionUUId must be supplied");
        }
        catch (err) {
            next(err);
        }
    }
);

app.post(
    "/api/questions",
    async (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> => {
        try {
            return res.status(200).json(await db.createQuestion(req.body));
        }
        catch (err) {
            next(err);
        }
    }
);


// answer


app.get(
    "/api/answers",
    async (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> => {

        try {
            const { uuid, questionUUId } = req.query;
            if (questionUUId)
                return res
                    .status(200)
                    .json(await db.getAnswers(questionUUId as string));
        
            if (uuid)
                return res.status(200).json(await db.getAnswer(uuid as string));

            throw new Error("either uuid or questionUUId must be supplied");
        }
        catch (err) {
            next(err);
        }
    }
);

app.post(
    "/api/answers",
    async (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> => {
        try {
            return res.status(200).json(await db.createAnswer(req.body));
        }
        catch (err) {
            next(err);
        }
    }
);


// student lesson

app.get(
    "/api/studentlessons",
    async (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> => {

        try {
            const { userUUId, lessonUUId } = req.query;

            if ((lessonUUId))
                return res
                    .status(200)
                    .json(await db.getStudentLesson(userUUId as string, lessonUUId as string));
        
            return res
                .status(200)
                .json(await db.getStudentLessons(userUUId as string));
        }
        catch (err) {
            next(err);
        }
    }
);

app.post(
    "/api/studentlessons",
    async (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> => {
        try {
            return res.status(200).json(await db.createStudentLesson(req.body));
        }
        catch (err) {
            next(err);
        }
    }
);




// notations
BoardTypeValues.forEach((boardType) => {
    NotationTypeValues.forEach((notationType) => {
        app.get(
            `/api/${boardType.toLowerCase()}${notationType.toLowerCase()}s`,
            async (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> => {
                try {
                    const { uuid } = req.query;

                    if (!uuid) {
                        next("invlid uuid:" + uuid);
                        return;
                    }

                    let notations: any = "";

                    notations = await db.getNotations(
                        boardType,
                        notationType,
                        uuid as string
                    );

                    return res.status(200).json(notations);
                } catch (err) {
                    next(err);
                    return;
                }
               
            }
        );

        app.post(
            `/api/${boardType.toLowerCase()}${notationType.toLowerCase()}s`,
            async (
                req: Request,
                res: Response,
                next: NextFunction
            ): Promise<Response | undefined> => {
                try {
                    return res
                        .status(200)
                        .json(
                            await db.createNotation(
                                boardType,
                                notationType,
                                req.body
                            )
                        );
                }
                catch (err) {
                    next(err);
                }
            }
        );

        app.put(
            `/api/${boardType.toLowerCase()}${notationType.toLowerCase()}s`,
            async (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> => {
                try {
                    await db.updateNotation(
                        boardType,
                        notationType,
                        req.body.uuid,
                        // all keys but uuid
                        Object.fromEntries(
                            Object.entries(req.body).filter(
                                (o) => o[0] != "uuid"
                            )
                        )
                    );
                    return res.status(200).send();
                }
                catch (err) {
                    next(err);
                }
            }
        );

         app.delete(
             `/api/${boardType.toLowerCase()}${notationType.toLowerCase()}s`,
             async (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> => {
                 try {
                     await db.deleteNotation(
                         boardType,
                         notationType,
                         req.body.uuid,
                     );
                     return res.status(200).send();
                 }
                 catch (err) {
                     next(err);
                 }
             }
         );
    })
});

const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error(err);
    res.status(500).send({ errors: [{ message: "Something went wrong" }] });
};

app.use(errorHandler);

const forceDbCreate = process.env.NODE_ENV === "test";
process.stdout.write("re create db =" + forceDbCreate);
connection.sequelize.sync({ force: forceDbCreate }).then(() => {
    const port = process.env.API_PORT;
    app.listen(port, () => {
        process.stdout.write("listening to port localhost:" + port);
    }).on("error", (e) => {
        console.log("Error: ", e.message);
    });
});
