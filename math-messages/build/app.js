"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const feathers_1 = __importDefault(require("@feathersjs/feathers"));
const socketio_1 = __importDefault(require("@feathersjs/socketio"));
const constants_1 = __importDefault(require("./constants"));
const app = feathers_1.default.feathers();
app.configure((0, socketio_1.default)());
const authorizationService_1 = __importDefault(require("./authorizationService"));
const authenticationService_1 = __importDefault(require("./authenticationService"));
const heartbeatService_1 = __importDefault(require("./heartbeatService"));
const activeCellSyncService_1 = __importDefault(require("./activeCellSyncService"));
const notationSyncService_1 = __importDefault(require("./notationSyncService"));
app.use("authorization", new authorizationService_1.default(app));
app.use("authentication", new authenticationService_1.default(app));
app.use("heartbeat", new heartbeatService_1.default(app));
app.use("activeCell", new activeCellSyncService_1.default(app));
app.use("notationSync", new notationSyncService_1.default(app));
app.service("authorization").publish("updated", (authorization, ctx) => {
    return [
        app.channel(constants_1.default.LESSON_CHANNEL_PREFIX +
            authorization.LessonUUId +
            constants_1.default.USER_CHANNEL_PREFIX +
            authorization.UserId),
    ];
});
app.service("authentication").on("created", (authentication, ctx) => {
    return [
        app.channel(constants_1.default.LESSON_CHANNEL_PREFIX +
            authentication.LessonUUId +
            constants_1.default.USER_CHANNEL_PREFIX +
            authentication.userId),
    ];
});
app.service("heartbeat").publish("updated", (heartbeat, ctx) => {
    return [
        app.channel(constants_1.default.LESSON_CHANNEL_PREFIX +
            heartbeat.LessonUUId +
            constants_1.default.USER_CHANNEL_PREFIX +
            heartbeat.userId),
    ];
});
app.service("activeCell").on("updated", (position, ctx) => {
    return [app.channel(constants_1.default.LESSON_CHANNEL_PREFIX + position.LessonUUId)];
});
app.service("notationSync").publish("created", (notation, ctx) => {
    return [app.channel(constants_1.default.LESSON_CHANNEL_PREFIX + notation.LessonUUId)];
});
app.service("notationSync").publish("updated", (notation, ctx) => {
    return [app.channel(constants_1.default.LESSON_CHANNEL_PREFIX + notation.LessonUUId)];
});
app.service("notationSync").publish("removed", (notation, ctx) => {
    return [app.channel(constants_1.default.LESSON_CHANNEL_PREFIX + notation.LessonUUId)];
});
const PORT = Number(process.env.PORT) || 3030;
//app.on("listening", () => {
//  console.log(`server running on port ${PORT}`)
//});
app.listen(PORT);
console.log(`server running on port ${PORT}`);
//# sourceMappingURL=app.js.map