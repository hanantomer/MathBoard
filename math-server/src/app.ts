import express, { Request, Response, NextFunction, json } from "express";
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
    if (!await validateHeaderAuthentication(req, res)) {
        return;
    }

    next();
}


/*verifies that authenitication header exists and the it denotes a valid user
if yes, set header userUUId
*/
async function validateHeaderAuthentication(req: Request, res: Response) : Promise<boolean>{
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
    
    return true;
}

app.get(
    "/api/users",
    async (req: Request, res: Response): Promise<Response> => {
        // token already validate by interceptor. see validateHeaderAuthentication
        if (req.headers.authorization) {
            return res.status(200);
        }
        // by email/password
        const { email, password } = req.query;

        if (!email || !password) {
            return res.status(401).json("missing user or password");
        }

        const user = await authUtil.authByLocalPassword(
            email as string,
            password as string
        );
        if (!user) {
            return res.status(401);
        }
        return res.status(200).json(user);
    }
);

app.post(
    "/api/users",
    async (req: Request, res: Response): Promise<Response> => {
        return res.status(200).json(await db.createUser(req.body));
    }
);



// lesson
app.get("/api/lessons", async (req: Request, res: Response): Promise<Response> => {
    const { userUUId } = req.query;
    return res.status(200).json(await db.getLessons(userUUId as string));
});


app.post(
    "/api/lessons",
    async (req: Request, res: Response): Promise<Response> => {
        return res.status(200).json(await db.createLesson(req.body));
    }
);

// question

app.get(
    "/api/questions",
    async (req: Request, res: Response): Promise<Response> => {
        const { lessonUUId } = req.query;
        return res
            .status(200)
            .json(await db.getQuestions(lessonUUId as string));
    }
);

app.post(
    "/api/questions",
    async (req: Request, res: Response): Promise<Response> => {
        return res.status(200).json(await db.createQuestion(req.body));
    }
);


// answer


app.get(
    "/api/answers",
    async (req: Request, res: Response): Promise<Response> => {
        const { questionUUId } = req.query;
        return res.status(200).json(await db.getAnswers(questionUUId as string));
    }
);

app.post(
    "/api/answers",
    async (req: Request, res: Response): Promise<Response> => {
        return res.status(200).json(await db.createAnswer(req.body));
    }
);


// student lesson

app.get(
    "/api/studentlessons",
    async (req: Request, res: Response): Promise<Response> => {
        const { lessonUUId } = req.query;
        return res
            .status(200)
            .json(await db.getStudentLessons(lessonUUId as string));
    }
);

app.post(
    "/api/studentlessons",
    async (req: Request, res: Response): Promise<Response> => {
        return res.status(200).json(await db.createStudentLesson(req.body));
    }
);




// notations
BoardTypeValues.forEach((boardType) => {
    NotationTypeValues.forEach((notationType) => {
        //console.debug(`/api/${boardType.toLowerCase()}${notationType.toLowerCase()}s`);
        app.get(
            `/api/${boardType.toLowerCase()}${notationType.toLowerCase()}s`,
            async (req: Request, res: Response): Promise<Response> => {
                const { uuid } = req.query;
                return res
                    .status(200)
                    .json(
                        await db.getNotations(
                            boardType,
                            notationType,
                            uuid as string
                        )
                    );
            }
        );

        app.post(
            `/api/${boardType.toLowerCase()}${notationType.toLowerCase()}s`,
            async (req: Request, res: Response): Promise<Response> => {
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
        );

        app.put(
            `/api/${boardType.toLowerCase()}${notationType.toLowerCase()}s`,
            async (req: Request, res: Response): Promise<Response> => {
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
        );

         app.delete(
             `/api/${boardType.toLowerCase()}${notationType.toLowerCase()}s`,
             async (req: Request, res: Response): Promise<Response> => {
                 await db.deleteNotation(
                     boardType,
                     notationType,
                     req.body.uuid,
                 );
                 return res.status(200).send();
             }
         );
    })
});
    


// Resets the database and launches the express app on :8081
connection.sequelize.sync({ force: true }).then(() => {
    app.listen(8081, () => {

        var spawn = require("child_process").spawn;
        var ls = spawn("cmd.exe", ["/c", "seed.bat"]);

        ls.stdout.on("data", function (data: any) {
            console.log("stdout: " + data);
        });

        ls.stderr.on("data", function (data: any) {
            console.log("stderr: " + data);
        });

        ls.on("exit", function (code: any) {
            console.log("child process exited with code " + code);
        });
        process.stdout.write("listening to port localhost:8081");
    });
});
