"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const finale_rest_1 = __importDefault(require("finale-rest"));
const index_1 = __importDefault(require("../../math-db/build/models/index"));
const authMiddleware_1 = __importDefault(require("../../math-auth/build/authMiddleware"));
const addAccesstokenToResponse_1 = __importDefault(require("./middleware/addAccesstokenToResponse"));
const createLessonChild_1 = __importDefault(require("./middleware/createLessonChild"));
const getLessonChildren_1 = __importDefault(require("./middleware/getLessonChildren"));
const updateLessonChild_1 = __importDefault(require("./middleware/updateLessonChild"));
const createQuestionChild_1 = __importDefault(require("./middleware/createQuestionChild"));
const getQuestionChildren_1 = __importDefault(require("./middleware/getQuestionChildren"));
const updateQuestionChild_1 = __importDefault(require("./middleware/updateQuestionChild"));
const createAnswerChild_1 = __importDefault(require("./middleware/createAnswerChild"));
const createAnswer_1 = __importDefault(require("./middleware/createAnswer"));
const updateAnswerChild_1 = __importDefault(require("./middleware/updateAnswerChild"));
const createQuestion_1 = __importDefault(require("./middleware/createQuestion"));
const enum_1 = require("../../math-common/build/enum");
const utils_1 = require("../../math-common/build/utils");
const boardTypesMilddleware = new Map();
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
let app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(body_parser_1.default.json({ limit: "10mb" }));
app.use(body_parser_1.default.urlencoded({
    limit: "10mb",
    extended: true,
    parameterLimit: 5000,
}));
finale_rest_1.default.initialize({
    app: app,
    sequelize: index_1.default.sequelize,
});
// user
let userResource = finale_rest_1.default.resource({
    model: index_1.default.sequelize.models["User"],
    endpoints: ["/users", "/users/:id"],
});
userResource.use(authMiddleware_1.default);
userResource.use(addAccesstokenToResponse_1.default);
// lesson
let lessonResource = finale_rest_1.default.resource({
    model: index_1.default.sequelize.models["Lesson"],
    endpoints: ["/lessons", "/lessons/:uuid"],
});
lessonResource.use(authMiddleware_1.default);
// question
let questionResource = finale_rest_1.default.resource({
    model: index_1.default.sequelize.models["Question"],
    endpoints: ["/questions", "/questions/:uuid"],
});
questionResource.use(authMiddleware_1.default);
questionResource.use(createLessonChild_1.default);
questionResource.use(getLessonChildren_1.default);
questionResource.use(createQuestion_1.default);
// answer
let answerResource = finale_rest_1.default.resource({
    model: index_1.default.sequelize.models["Answer"],
    endpoints: ["/answers", "/answers/:uuid"],
});
answerResource.use(authMiddleware_1.default);
answerResource.use(createQuestionChild_1.default);
answerResource.use(getQuestionChildren_1.default);
answerResource.use(createAnswer_1.default);
// notations
for (const boardType in enum_1.BoardType) {
    if (!Number.isNaN(Number(boardType)))
        continue; // typescript retuen a list of keys 
    // then the values so we need to get values only
    for (const notationType in enum_1.NotationType) {
        if (!Number.isNaN(Number(notationType)))
            continue;
        let resource = finale_rest_1.default.resource({
            model: index_1.default.sequelize.models[(0, utils_1.capitalize)(boardType) +
                (0, utils_1.capitalize)(notationType)],
            endpoints: [
                `/${boardType}${notationType}s`,
                `/${boardType}${notationType}s/:id`,
            ],
        });
        resource.use(authMiddleware_1.default);
        for (const middleware in boardTypesMilddleware.get(boardType)) {
            resource.use(middleware);
        }
    }
}
;
// student lessons relation
let studentsLessonResource = finale_rest_1.default.resource({
    model: index_1.default.sequelize.models["StudentLesson"],
    endpoints: ["/studentlessons", "/studentlessons/:id"],
});
studentsLessonResource.use(authMiddleware_1.default);
studentsLessonResource.use(createLessonChild_1.default);
// Resets the database and launches the express app on :8081
index_1.default.sequelize.sync({ force: true }).then(() => {
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
//# sourceMappingURL=app.js.map