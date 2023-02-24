const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const finale = require("finale-rest");
const db = require("math-db/src/models/index");
const authMiddleware = require("math-auth/src/authMiddleware");
const addAccesstokenToResponseMiddleware = require("./middleware/addAccesstokenToResponse");

const createLessonChildMiddleware = require("./middleware/createLessonChild");
const getLessonChildrenMiddleware = require("./middleware/getLessonChildren");
const updateLessonChildMiddleware = require("./middleware/updateLessonChild");

const createQuestionChildMiddleware = require("./middleware/createQuestionChild");
const getQuestionChildrenMiddleware = require("./middleware/getQuestionChildren");
const updateQuestionChildMiddleware = require("./middleware/updateQuestionChild");

const createAnswerChildMiddleware = require("./middleware/createAnswerChild");
const getAnswerChildrenMiddleware = require("./middleware/getAnswerChildren");

const getAnswersMiddleware = require("./middleware/getAnswers");
const createAnswerMiddleware = require("./middleware/createAnswer");
const updateAnswerChildMiddleware = require("./middleware/updateAnswerChild");

const getStudentLessonsMiddleware = require("./middleware/getStudentLessons");
const ommitPasswordFromResponseMiddleware = require("./middleware/ommitPasswordFromResponse");
const getQuestions = require("./middleware/getQuestions");
const createQuestion = require("./middleware/createQuestion");

const notationTypes = [
    "symbol",
    "sign",
    "power",
    "fraction",
    "sqrt",
    "text",
    "image",
];

const boardTypes = [
    {
        name: "lesson",
        middleware: [
            createLessonChildMiddleware,
            updateLessonChildMiddleware,
            getLessonChildrenMiddleware,
        ],
    },
    {
        name: "question",
        middleware: [
            createQuestionChildMiddleware,
            updateQuestionChildMiddleware,
            getQuestionChildrenMiddleware,
        ],
    },
    {
        name: "answer",
        middleware: [
            createAnswerChildMiddleware,
            updateAnswerChildMiddleware,
            getAnswerChildrenMiddleware,
        ],
    },
];

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
userResource.use(addAccesstokenToResponseMiddleware);
userResource.use(ommitPasswordFromResponseMiddleware);

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
questionResource.use(getQuestions);
questionResource.use(createQuestion);

// answer

let answerResource = finale.resource({
    model: db.sequelize.models["Answer"],
    endpoints: ["/answers", "/answers/:uuid"],
});
answerResource.use(authMiddleware);
answerResource.use(createQuestionChildMiddleware);
answerResource.use(getQuestionChildrenMiddleware);
answerResource.use(getAnswersMiddleware);
answerResource.use(createAnswerMiddleware);

// notations
boardTypes.forEach((b) => {
    notationTypes.forEach((n) => {
        let resource = finale.resource({
            model: db.sequelize.models[b.name.capitalize() + n.capitalize()],
            endpoints: [`/${b.name}${n}s`, `/${b.name}${n}s/:id`],
        });
        resource.use(authMiddleware);
        b.middleware.forEach((m) => {
            resource.use(m);
        });
    });
});

// student lessons relation
let studentsLessonResource = finale.resource({
    model: db.sequelize.models["StudentLesson"],
    endpoints: ["/studentlessons", "/studentlessons/:id"],
});
studentsLessonResource.use(authMiddleware);
studentsLessonResource.use(getStudentLessonsMiddleware);
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

        ls.stdout.on("data", function (data) {
            console.log("stdout: " + data);
        });

        ls.stderr.on("data", function (data) {
            console.log("stderr: " + data);
        });

        ls.on("exit", function (code) {
            console.log("child process exited with code " + code);
        });
    });
});
