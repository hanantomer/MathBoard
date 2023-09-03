import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import useAuthUtil  from "../../math-auth/build/authUtil";
import useDb from "../../math-db/build/dbUtil"
import connection from "../../math-db/build/models/index";
import { BoardType, NotationType } from "../../math-common/build/enum"


const authUtil = useAuthUtil();
const db = useDb();
let app = express();

async function auth(req: Request, res: Response, next: NextFunction) {
    // omit authorization enforcement, when signing in.
    if (req.url.indexOf("/users/") > 0) {
        next();
    }

    // verify authorization
    if (!await validateHeaderAuthentication(req, res)) {
        return;
    }

    next();
}

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
    
    req.headers.userUUId = user?.uuid;
    return true;
}

app.get(
    "/users",
    async (req: Request, res: Response): Promise<Response> => {
        const  uuid  = req.headers.userUUId;
        const user = db.getUser(uuid as string);
        return res.status(200).json(user);
    }
);

app.get(
    "/users/:email/:password",
    async (req: Request, res: Response): Promise<Response> => {
        const { email, password } = req.params;
        const user = authUtil.authByLocalPassword(email, password);
        if (!user) {
            return res.status(401).json("invalid user or passord");
        }
        return res.status(200).json(user);
    }
);



// lesson
app.get("/lessons", async (req: Request, res: Response): Promise<Response> => {
    return res.status(200).json(db.getLessons(req.params.userUUId));
});

app.get("/lessons/:uuid", async (req: Request, res: Response): Promise<Response> => {
    return res.status(200).json(db.getLesson(req.params.uuid));
});

app.post(
    "/lessons",
    async (req: Request, res: Response): Promise<Response> => {
        return res.status(200).json(db.createLesson(req.body));
    }
);

// question

app.get("/questions/:lessonUUId", async (req: Request, res: Response): Promise<Response> => {
    return res.status(200).json(db.getQuestions (req.params.lessonUUId));
});

app.get(
    "/questions/:uuid",
    async (req: Request, res: Response): Promise<Response> => {
        return res.status(200).json(db.getQuestion(req.params.uuid));
    }
);


app.get(
    "/lessons/:uuid",
    async (req: Request, res: Response): Promise<Response> => {
        return res.status(200).json(db.getLesson(req.params.uuid));
    }
);

app.post("/questions", async (req: Request, res: Response): Promise<Response> => {
    return res.status(200).json(db.createQuestion(req.body));
});


// answer

app.get(
    "/answers/:uuid",
    async (req: Request, res: Response): Promise<Response> => {
        return res.status(200).json(db.getAnswer(req.params.uuid));
    }
);

app.get(
    "/answers/:questionUUId",
    async (req: Request, res: Response): Promise<Response> => {
        return res.status(200).json(db.getAnswers(req.params.uuid));
    }
);

app.post("/answers", async (req: Request, res: Response): Promise<Response> => {
    return res.status(200).json(db.createAnswer(req.body));
});


// student lesson

app.get(
    "/studentlessons/:lessonUUId",
    async (req: Request, res: Response): Promise<Response> => {
        return res
            .status(200)
            .json(db.getStudentLessons(req.params.lessonUUId));
    }
);

app.post(
    "/studentlessons",
    async (req: Request, res: Response): Promise<Response> => {
        return res.status(200).json(db.createStudentLesson(req.body));
    }
);




// notations


for (const boardType in BoardType) {    

    if (!Number.isNaN(Number(boardType))) continue; // typescript retuen a list of keys 
                                                    // then the values, we need to get values only
    for (const notationType in NotationType) {

        if (!Number.isNaN(Number(notationType))) continue;

        app.get(
            `/${boardType}${notationType}s`,
            async (req: Request, res: Response): Promise<Response> => {
                return res.status(200).json(db.getNotations(boardType, notationType, req.params.uuid));
            }
        );

        app.post(
            `/${boardType}${notationType}s`,
            async (req: Request, res: Response): Promise<Response> => {
                return res
                    .status(200)
                    .json(
                        db.createNotation(
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
        var ls = spawn("cmd.exe", [
            "/c",
            "../math-db/seeders/seed.bat",
        ]);

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
