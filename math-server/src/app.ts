import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import useAuthUtil  from "../../math-auth/build/authUtil";
import useDb from  "../../math-db/build/dbUtil"
import connection from "../../math-db/build/models/index";
import { /*BoardType,*/ NotationType } from "../../math-common/build/enum"

enum BoardType { // declaring local to allow iteration
  LESSON,
  QUESTION,
  ANSWER
};



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
    if (!req.headers.authentication) {
        res = res.status(401).json("unauthorized");
        return false;
    }
    const user = await authUtil.authByLocalToken(
        req.headers.authentication.toString()
    );
    if (!user) {
        res = res.status(401).json("invalid token");
    }
    
    //res.json(user);
    return true;
}

/*app.get(
    "/users",
    async (req: Request, res: Response): Promise<Response> => {
        // token already validate by interceptor. see validateHeaderAuthentication
        if (req.headers.token) {
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
);*/

app.get(
    "/api/users",
    async (req: Request, res: Response): Promise<Response> => {
        const { email, password } = req.query;
        const user = await authUtil.authByLocalPassword(email as string, password as string);
        if (!user) {
            return res.status(401);
        }
        return res.status(200).json(user);
    }
);



// lesson
app.get("/api/lessons", async (req: Request, res: Response): Promise<Response> => {
    const { userUUId } = req.query;
    return res.status(200).json(await db.getLessons(userUUId as string));
});

//app.get("/lessons/:uuid", async (req: Request, res: Response): Promise<Response> => {
//    return res.status(200).json(db.getLesson(req.params.uuid));
//});

app.post(
    "/lessons",
    async (req: Request, res: Response): Promise<Response> => {
        return res.status(200).json(await db.createLesson(req.body));
    }
);

// question

app.get("/questions/:lessonUUId", async (req: Request, res: Response): Promise<Response> => {
    return res.status(200).json(await db.getQuestions(req.params.lessonUUId));
});

app.get(
    "/questions/:uuid",
    async (req: Request, res: Response): Promise<Response> => {
        return res.status(200).json(await db.getQuestion(req.params.uuid));
    }
);


app.get(
    "/lessons/:uuid",
    async (req: Request, res: Response): Promise<Response> => {
        return res.status(200).json(await db.getLesson(req.params.uuid));
    }
);

app.post("/questions", async (req: Request, res: Response): Promise<Response> => {
    return res.status(200).json(await db.createQuestion(req.body));
});


// answer

app.get(
    "/answers/:uuid",
    async (req: Request, res: Response): Promise<Response> => {
        return res.status(200).json(await db.getAnswer(req.params.uuid));
    }
);

app.get(
    "/answers/:questionUUId",
    async (req: Request, res: Response): Promise<Response> => {
        return res.status(200).json(await db.getAnswers(req.params.uuid));
    }
);

app.post("/answers", async (req: Request, res: Response): Promise<Response> => {
    return res.status(200).json(await db.createAnswer(req.body));
});


// student lesson

app.get(
    "/api/studentlessons/:lessonUUId",
    async (req: Request, res: Response): Promise<Response> => {
        return res
            .status(200)
            .json(await db.getStudentLessons(req.params.lessonUUId));
    }
);

app.post(
    "/api/studentlessons",
    async (req: Request, res: Response): Promise<Response> => {
        return res.status(200).json(await db.createStudentLesson(req.body));
    }
);




// notations

for (const boardType in Object.keys(BoardType)) {
    //if (!Number.isNaN(Number(boardType))) continue; // typescript retuen a list of keys
    // then the values, we need to get values only
    for (const notationType in NotationType) {
        if (!Number.isNaN(Number(notationType))) continue;

        app.get(
            `/${boardType}${notationType}s`,
            async (req: Request, res: Response): Promise<Response> => {
                return res
                    .status(200)
                    .json(
                        await db.getNotations(
                            boardType,
                            notationType,
                            req.params.uuid
                        )
                    );
            }
        );

        app.post(
            `/${boardType}${notationType}s`,
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
    }
};    


// Resets the database and launches the express app on :8081
connection.sequelize.sync({ force: true }).then(() => {
    app.listen(8081, () => {
        console.log("listening to port localhost:8081");

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
    });
});
