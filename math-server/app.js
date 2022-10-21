const express = require("express");
const cors = require("cors");
const finale = require("finale-rest");
const db = require("math-db/src/models/index");
const authMiddleware = require("math-auth/src/authMiddleware");
const userMiddleware = require("./userMiddleware");
const lessonMiddleware = require("./lessonMiddleware");

let app = express();
app.use(cors());
app.use(express.json());

finale.initialize({
    app: app,
    sequelize: db.sequelize,
});

// user

let userResource = finale.resource({
    model: db.sequelize.models["User"],
    endpoints: ["/users", "/users/:id"],
});
userResource.use(userMiddleware);
userResource.use(authMiddleware);

// lesson

let lessonResource = finale.resource({
    model: db.sequelize.models["Lesson"],
    endpoints: ["/lessons", "/lessons/:id"],
});
lessonResource.use(authMiddleware);
lessonResource.use(lessonMiddleware);

let lessonSymbolResource = finale.resource({
    model: db.sequelize.models["LessonSymbol"],
    endpoints: ["/lessonsymbols", "/lessonsymbols/:id"],
});
lessonSymbolResource.use(authMiddleware);
lessonSymbolResource.use(lessonMiddleware);

let lessonPowerResource = finale.resource({
    model: db.sequelize.models["LessonPower"],
    endpoints: ["/lessonpowers", "/lessonpowers/:id"],
});
lessonPowerResource.use(authMiddleware);
lessonPowerResource.use(lessonMiddleware);

let lessonFractionResource = finale.resource({
    model: db.sequelize.models["LessonFraction"],
    endpoints: ["/lessonfractions", "/lessonfractions/:id"],
});
lessonFractionResource.use(authMiddleware);
lessonFractionResource.use(lessonMiddleware);

let lessonSqrtResource = finale.resource({
    model: db.sequelize.models["LessonSqrt"],
    endpoints: ["/lessonsqrts", "/lessonsqrts/:id"],
});
lessonSqrtResource.use(authMiddleware);
lessonSqrtResource.use(lessonMiddleware);

let lessonTextResource = finale.resource({
    model: db.sequelize.models["LessonText"],
    endpoints: ["/lessontexts", "/lessontexts/:id"],
});
lessonTextResource.use(authMiddleware);
lessonTextResource.use(lessonMiddleware);

// question

let questionResource = finale.resource({
    model: db.sequelize.models["Question"],
    endpoints: ["/questions", "/questions/:id"],
});
questionResource.use(authMiddleware);

let questionSymbolResource = finale.resource({
    model: db.sequelize.models["QuestionSymbol"],
    endpoints: ["/questionsymbols", "/questionsymbols/:id"],
});
questionSymbolResource.use(authMiddleware);

let questionPowerResource = finale.resource({
    model: db.sequelize.models["QuestionPower"],
    endpoints: ["/questionpowers", "/questionpowers/:id"],
});
questionPowerResource.use(authMiddleware);

let questionFractionResource = finale.resource({
    model: db.sequelize.models["QuestionFraction"],
    endpoints: ["/questionfractions", "/questionfractions/:id"],
});
questionFractionResource.use(authMiddleware);

let questionSqrtResource = finale.resource({
    model: db.sequelize.models["QuestionSqrt"],
    endpoints: ["/questionsqrts", "/questionsqrts/:id"],
});
questionSqrtResource.use(authMiddleware);

// access link

finale.resource({
    model: db.sequelize.models["AccessLink"],
    endpoints: ["/accessLink", "/accessLink/:id"],
});

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
