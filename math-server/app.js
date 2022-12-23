const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const finale = require("finale-rest");
const db = require("math-db/src/models/index");
const authMiddleware = require("math-auth/src/authMiddleware");
const userMiddleware = require("./userMiddleware");
const lessonMiddleware = require("./lessonMiddleware");

const notationTypes = [
    "symbol",
    "sign",
    "power",
    "fraction",
    "sqrt",
    "text",
    "image",
];

const boardTypes = ["lesson", "question", "answer"];

let app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(
    bodyParser.urlencoded({
        limit: "50mb",
        extended: true,
        parameterLimit: 50000,
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
userResource.use(userMiddleware);
userResource.use(authMiddleware);

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
questionResource.use(lessonMiddleware);

// notations
boardTypes.forEach((b) => {
    notationTypes.forEach((n) => {
        let resource = finale.resource({
            model: db.sequelize.models[b.capitalize() + n.capitalize()],
            endpoints: [`/${b}${n}s`, `/${b}${n}s/:id`],
        });
        resource.use(authMiddleware);
        resource.use(lessonMiddleware);
    });
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
