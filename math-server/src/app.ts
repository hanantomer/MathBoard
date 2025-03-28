import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import useAuthUtil  from "../../math-auth/build/authUtil";
import useDb from "../../math-db/build/dbUtil"
import connection from "../../math-db/build/models/index";
const { exec } = require("child_process");
import { BoardTypeValues, NotationTypeValues } from "../../math-common/build/unions"
import { createTransport } from "nodemailer";

var transporter = createTransport({
    service: "gmail",
    auth: {
        user: "mathboard16@gmail.com",
        pass: "uhte keto xhzb fiuz",
    },
});




const authUtil = useAuthUtil();
const db = useDb();
let app = express();
app.use(auth);
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(bodyParser.json({ limit: 52428800 }));
app.use(
    bodyParser.urlencoded({
        limit: "500kb",
    })
);



async function auth(req: Request, res: Response, next: NextFunction) {
    // omit authorization enforcement when signing in
    if (req.method === "POST" && req.url.indexOf("/api/auth") == 0) {
        next();
    }

    // omit authorization enforcement when registering
    else if (req.method === "POST" && req.url.indexOf("/api/users") == 0) {
        next();
    }

    // omit authorization enforcement for contact us
    else if (req.method === "POST" && req.url.indexOf("/api/contactus") == 0) {
        next();
    }

    // verify authorization
    else if (!(await validateHeaderAuthentication(req, res, next))) {
        return;
    } else {
        next();
    }
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
        return false;
    }
    
    if (req.url.indexOf("/api/auth") == 0) {
        res.status(200).json(user);
    }

    req.headers.userId = user?.id?.toString();
    
    return true;
}

app.post(
    "/api/contactus",
    async (req: Request, res: Response, next: NextFunction) => {
        let mailOptions = {
            from: req.body.email,
            to: "mathboard16@gmail.com",
            subject: "Message from:" + req.body.name + ":" + req.body.email,
            text: req.body.message,
        };
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
                return res.status(500);
            } else {
                console.log("Email sent: " + info.response);
                return res.status(200);
            }
        });
    });


app.post(
    "/api/auth",
    async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | undefined> => {
        // by token - already validated by auth interceptor
        if (req.headers.userId) {
            return;
        }

        // by email/password
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(401).json("missing user or password");
        }

        try {
            const user = await authUtil.authByLocalPassword(
                email as string,
                password as string
            );
            if (!user) {
                return res.status(401).json("invalid user or password");
            }
            return res.status(200).json(user);
        } catch (err) {
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
            req.body.password = authUtil.encryptPasssword(req.body.password);
            return res.status(200).json(await db.createUser(req.body));
        } catch (error) {
            next(error);
        }
    }
);

app.get(
    "/api/auth",
    async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | undefined> => {
        try {
            return res.status(200).json(res.get("user"));
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
                        req.body
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
    console.error("unhandled error:" + err.message);
    console.error(err.cause);
    console.error(err.stack);
    res.status(500).send({ errors: [{ message: err.message + err.cause }] });  /// TODO: log instaed 
};

app.use(errorHandler);

let forceDbCreate =
    process.env.NODE_ENV === "test" || process.env.NODE_ENV === "development";
//forceDbCreate = true;
console.log("re create db =" + forceDbCreate);

connection.sequelize.sync({ force: forceDbCreate }).then(() => {
    const port = Number(process.env.API_PORT) || 17030;
    app.listen(port, () => {
        console.log("listening to port localhost:" + port);
    }).on("error", (e) => {
        console.log("Error: ", e.message);
    });
    if (forceDbCreate) {
        exec(
            "C:/dev/MathBoard/math-db/seeders/seed.bat",
            (err: any, stdout: any, stderr: any) => {
                if (err) {
                    console.log(err);
                    // node couldn't execute the command
                    return;
                }

                // the *entire* stdout and stderr (buffered)
                console.log(`stdout: ${stdout}`);
                console.log(`stderr: ${stderr}`);
            }
        );
    }
});
