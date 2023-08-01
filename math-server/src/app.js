"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var cors = require("cors");
var bodyParser = require("body-parser");
var finale = require("finale-rest");
var index_1 = require("../../math-db/build/models/index");
var authMiddleware_1 = require("../../math-auth/build/authMiddleware");
var addAccessTokenToResponse_1 = require("./middleware/addAccessTokenToResponse");
var createLessonChild_1 = require("./middleware/createLessonChild");
var getLessonChildren_1 = require("./middleware/getLessonChildren");
var updateLessonChild_1 = require("./middleware/updateLessonChild");
var createQuestionChild_1 = require("./middleware/createQuestionChild");
var getQuestionChildren_1 = require("./middleware/getQuestionChildren");
var updateQuestionChild_1 = require("./middleware/updateQuestionChild");
var createAnswerChild_1 = require("./middleware/createAnswerChild");
var createAnswer_1 = require("./middleware/createAnswer");
var updateAnswerChild_1 = require("./middleware/updateAnswerChild");
var createQuestion_1 = require("./middleware/createQuestion");
var enum_1 = require("../../math-common/build/enum");
var utils_1 = require("../../math-common/build/utils");
var boardTypesMilddleware = new Map();
boardTypesMilddleware.set(enum_1.BoardType.lesson.toString(), [
    [
        createLessonChild_1.default,
        updateLessonChild_1.default,
        getLessonChildren_1.default
    ]
]);
boardTypesMilddleware.set(enum_1.BoardType.question.toString(), [
    [
        createQuestionChild_1.default,
        updateQuestionChild_1.default,
        getQuestionChildren_1.default,
    ]
]);
boardTypesMilddleware.set(enum_1.BoardType.answer.toString(), [
    [
        createAnswerChild_1.default,
        updateAnswerChild_1.default,
    ]
]);
var app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({
    limit: "10mb",
    extended: true,
    parameterLimit: 5000,
}));
finale.initialize({
    app: app,
    sequelize: index_1.default.sequelize,
});
// user
var userResource = finale.resource({
    model: index_1.default.sequelize.models["User"],
    endpoints: ["/users", "/users/:id"],
});
userResource.use(authMiddleware_1.default);
userResource.use(addAccessTokenToResponse_1.default);
// lesson
var lessonResource = finale.resource({
    model: index_1.default.sequelize.models["Lesson"],
    endpoints: ["/lessons", "/lessons/:uuid"],
});
lessonResource.use(authMiddleware_1.default);
// question
var questionResource = finale.resource({
    model: index_1.default.sequelize.models["Question"],
    endpoints: ["/questions", "/questions/:uuid"],
});
questionResource.use(authMiddleware_1.default);
questionResource.use(createLessonChild_1.default);
questionResource.use(getLessonChildren_1.default);
questionResource.use(createQuestion_1.default);
// answer
var answerResource = finale.resource({
    model: index_1.default.sequelize.models["Answer"],
    endpoints: ["/answers", "/answers/:uuid"],
});
answerResource.use(authMiddleware_1.default);
answerResource.use(createQuestionChild_1.default);
answerResource.use(getQuestionChildren_1.default);
answerResource.use(createAnswer_1.default);
// notations
for (var boardType in enum_1.BoardType) {
    if (!Number.isNaN(Number(boardType)))
        continue; // typescript retuen a list of keys 
    // then the values so we need to get values only
    for (var notationType in enum_1.NotationType) {
        if (!Number.isNaN(Number(notationType)))
            continue;
        var resource = finale.resource({
            model: index_1.default.sequelize.models[(0, utils_1.capitalize)(boardType) +
                (0, utils_1.capitalize)(notationType)],
            endpoints: [
                "/".concat(boardType).concat(notationType, "s"),
                "/".concat(boardType).concat(notationType, "s/:id"),
            ],
        });
        resource.use(authMiddleware_1.default);
        for (var middleware in boardTypesMilddleware.get(boardType)) {
            resource.use(middleware);
        }
    }
}
;
// student lessons relation
var studentsLessonResource = finale.resource({
    model: index_1.default.sequelize.models["StudentLesson"],
    endpoints: ["/studentlessons", "/studentlessons/:id"],
});
studentsLessonResource.use(authMiddleware_1.default);
studentsLessonResource.use(createLessonChild_1.default);
// Resets the database and launches the express app on :8081
index_1.default.sequelize.sync({ force: true }).then(function () {
    app.listen(8081, function () {
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
