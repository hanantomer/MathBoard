"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const authUtil_1 = __importDefault(require("../../math-auth/build/authUtil"));
const dbUtil_1 = __importDefault(require("../../math-db/build/dbUtil"));
const index_1 = __importDefault(require("../../math-db/build/models/index"));
const enum_1 = require("../../math-common/build/enum");
const authUtil = (0, authUtil_1.default)();
const db = (0, dbUtil_1.default)();
let app = (0, express_1.default)();
function auth(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        // omit authorization enforcement, when signing in.
        if (req.url.indexOf("/users/") > 0) {
            next();
        }
        // verify authorization
        if (!(yield validateHeaderAuthentication(req, res))) {
            return;
        }
        next();
    });
}
app.use(auth);
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(body_parser_1.default.json({ limit: "10mb" }));
app.use(body_parser_1.default.urlencoded({
    limit: "10mb",
    extended: true,
    parameterLimit: 5000,
}));
/*verifies that authenitication header exists and the it denotes a valid user
if yes, set header userUUId
*/
function validateHeaderAuthentication(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!req.headers.authentication) {
            res = res.status(401).json("unauthorized");
            return false;
        }
        const user = yield authUtil.authByLocalToken(req.headers.authentication.toString());
        if (!user) {
            res = res.status(401).json("invalid token");
        }
        req.headers.userUUId = user === null || user === void 0 ? void 0 : user.uuid;
        return true;
    });
}
app.get("/users", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const uuid = req.headers.userUUId;
    const user = db.getUser(uuid);
    return res.status(200).json(user);
}));
app.get("/users/:email/:password", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.params;
    const user = authUtil.authByLocalPassword(email, password);
    if (!user) {
        return res.status(401).json("invalid user or passord");
    }
    return res.status(200).json(user);
}));
// lesson
app.get("/lessons", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    return res.status(200).json(db.getLessons(req.params.userUUId));
}));
app.get("/lessons/:uuid", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    return res.status(200).json(db.getLesson(req.params.uuid));
}));
app.post("/lessons", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    return res.status(200).json(db.createLesson(req.body));
}));
// question
app.get("/questions/:lessonUUId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    return res.status(200).json(db.getQuestions(req.params.lessonUUId));
}));
app.get("/questions/:uuid", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    return res.status(200).json(db.getQuestion(req.params.uuid));
}));
app.get("/lessons/:uuid", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    return res.status(200).json(db.getLesson(req.params.uuid));
}));
app.post("/questions", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    return res.status(200).json(db.createQuestion(req.body));
}));
// answer
app.get("/answers/:uuid", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    return res.status(200).json(db.getAnswer(req.params.uuid));
}));
app.get("/answers/:questionUUId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    return res.status(200).json(db.getAnswers(req.params.uuid));
}));
app.post("/answers", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    return res.status(200).json(db.createAnswer(req.body));
}));
// student lesson
app.get("/studentlessons/:lessonUUId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    return res
        .status(200)
        .json(db.getStudentLessons(req.params.lessonUUId));
}));
app.post("/studentlessons", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    return res.status(200).json(db.createStudentLesson(req.body));
}));
// notations
for (const boardType in enum_1.BoardType) {
    if (!Number.isNaN(Number(boardType)))
        continue; // typescript retuen a list of keys 
    // then the values, we need to get values only
    for (const notationType in enum_1.NotationType) {
        if (!Number.isNaN(Number(notationType)))
            continue;
        app.get(`/${boardType}${notationType}s`, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
            return res.status(200).json(db.getNotations(boardType, notationType, req.params.uuid));
        }));
        app.post(`/${boardType}${notationType}s`, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
            return res
                .status(200)
                .json(db.createNotation(boardType, notationType, req.body));
        }));
    }
}
;
// Resets the database and launches the express app on :8081
index_1.default.sequelize.sync({ force: true }).then(() => {
    app.listen(8081, () => {
        console.log("listening to port localhost:8081");
        var spawn = require("child_process").spawn;
        var ls = spawn("cmd.exe", [
            "/c",
            "../math-db/seeders/seed.bat",
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