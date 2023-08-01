import * as express from "express";
import * as cors from "cors";
import * as bodyParser from "body-parser";
import * as finale from "finale-rest";
import db from "../../math-db/build/models/index";
import authMiddleware from "../../math-auth/build/authMiddleware";
import addAccessTokenToResponseMiddleware from "./middleware/addAccessTokenToResponse";
import createLessonChildMiddleware from "./middleware/createLessonChild";
import getLessonChildrenMiddleware from "./middleware/getLessonChildren";
import updateLessonChildMiddleware from "./middleware/updateLessonChild";
import createQuestionChildMiddleware from "./middleware/createQuestionChild";
import getQuestionChildrenMiddleware from "./middleware/getQuestionChildren";
import updateQuestionChildMiddleware from "./middleware/updateQuestionChild";
import createAnswerChildMiddleware from "./middleware/createAnswerChild";
import createAnswerMiddleware from "./middleware/createAnswer";
import updateAnswerChildMiddleware from "./middleware/updateAnswerChild";
import createQuestionMiddleware from "./middleware/createQuestion";
import { BoardType, NotationType } from "../../math-common/build/enum"
import { capitalize } from "../../math-common/build/utils"



const boardTypesMilddleware = new Map<String, [Object[]]>() 

boardTypesMilddleware.set(BoardType.lesson.toString(), [
    [
        createLessonChildMiddleware,
        updateLessonChildMiddleware,
        getLessonChildrenMiddleware
    ]
]);

boardTypesMilddleware.set(BoardType.question.toString(), [
    [
       createQuestionChildMiddleware,
       updateQuestionChildMiddleware,
       getQuestionChildrenMiddleware,
    ]
]);

boardTypesMilddleware.set(BoardType.answer.toString(), [
    [
        createAnswerChildMiddleware,
        updateAnswerChildMiddleware,
    ]
]);


let app = express();

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

finale.initialize({
    app: app,
    sequelize: db.sequelize,
});

// user

let userResource = finale.resource({
    model: db.sequelize.models["User"],
    endpoints: ["/users", "/users/:id"],
});
userResource.use(authMiddleware);
userResource.use(addAccessTokenToResponseMiddleware);

// lesson

let lessonResource = finale.resource({
    model: db.sequelize.models["Lesson"],
    endpoints: ["/lessons", "/lessons/:uuid"],
});
lessonResource.use(authMiddleware);

// question

let questionResource = finale.resource({
    model: db.sequelize.models["Question"],
    endpoints: ["/questions", "/questions/:uuid"],
});
questionResource.use(authMiddleware);
questionResource.use(createLessonChildMiddleware);
questionResource.use(getLessonChildrenMiddleware);
questionResource.use(createQuestionMiddleware);

// answer

let answerResource = finale.resource({
    model: db.sequelize.models["Answer"],
    endpoints: ["/answers", "/answers/:uuid"],
});
answerResource.use(authMiddleware);
answerResource.use(createQuestionChildMiddleware);
answerResource.use(getQuestionChildrenMiddleware);
answerResource.use(createAnswerMiddleware);

// notations



for (const boardType in BoardType) {    

    if (!Number.isNaN(Number(boardType))) continue; // typescript retuen a list of keys 
                                                    // then the values so we need to get values only
    for (const notationType in NotationType) {

        if (!Number.isNaN(Number(notationType))) continue;

        let resource = finale.resource({
            model: db.sequelize.models[
                capitalize(boardType) +
                    capitalize(notationType)
            ],
            endpoints: [
                `/${boardType}${notationType}s`,
                `/${boardType}${notationType}s/:id`,
            ],
        });
        resource.use(authMiddleware);

        for (const middleware in boardTypesMilddleware.get(boardType)) {
            resource.use(middleware);
        }
    }
};    

// student lessons relation
let studentsLessonResource = finale.resource({
    model: db.sequelize.models["StudentLesson"],
    endpoints: ["/studentlessons", "/studentlessons/:id"],
});
studentsLessonResource.use(authMiddleware);
studentsLessonResource.use(createLessonChildMiddleware);

// Resets the database and launches the express app on :8081
db.sequelize.sync({ force: true }).then(() => {
    app.listen(8081, () => {
        console.log("listening to port localhost:8081");

        var spawn = require("child_process").spawn;
        var ls = spawn("cmd.exe", [
            "/c",
            "C:/dev/MathBoard/math-db/seeders/seed.bat",
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
